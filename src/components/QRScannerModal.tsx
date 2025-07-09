import React, { useRef, useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';
import { X, Camera, AlertCircle, CheckCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error('No camera found on this device');
      }

      // Create QR scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code scanned:', result.data);
          onScanSuccess(result.data);
          stopScanner();
          onClose();
        },
        {
          onDecodeError: (error) => {
            // Ignore decode errors - they happen when no QR code is in view
            console.debug('Decode error (normal):', error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      );

      // Start scanning
      await qrScannerRef.current.start();
      setHasPermission(true);
      setIsScanning(true);

    } catch (err: any) {
      console.error('Scanner error:', err);
      setHasPermission(false);
      setIsScanning(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported on this device.');
      } else {
        setError(err.message || 'Failed to start camera. Please try again.');
      }
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <Camera className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Scan QR Code</h2>
          </div>
          <p className="text-blue-100">Position the QR code within the camera frame</p>
        </div>

        {/* Scanner Content */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <div className="bg-red-50 p-6 rounded-xl border border-red-200 mb-4">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Camera Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={startScanner}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Camera View */}
              <div className="relative bg-black rounded-xl overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white rounded-lg w-48 h-48 relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500 animate-pulse"></div>
                    </div>
                  </div>
                )}
                
                {/* Loading State */}
                {!isScanning && hasPermission === null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              {isScanning && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">
                      Camera active - Point at QR code to scan
                    </p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Scanning Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Hold your device steady</li>
                  <li>• Ensure good lighting</li>
                  <li>• Position QR code within the frame</li>
                  <li>• Keep QR code flat and unobstructed</li>
                </ul>
              </div>

              {/* Cancel Button */}
              <button
                onClick={handleClose}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel Scanning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;