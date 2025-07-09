import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import QRScannerModal from '../components/QRScannerModal';
import { useAuth } from '../contexts/AuthContext';
import { restaurantGameService } from '../services/restaurantGameService';
import { 
  ArrowLeft, 
  QrCode, 
  Camera, 
  Check, 
  X, 
  AlertCircle,
  DollarSign,
  User,
  Calendar
} from 'lucide-react';

const QRScanner: React.FC = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannedCode, setScannedCode] = useState<any>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [scanHistory, setScanHistory] = useState([
    {
      id: 1,
      code: 'QR-ABC123',
      amount: 25.50,
      customer: 'Player123',
      date: '2024-01-15 14:30',
      status: 'redeemed'
    },
    {
      id: 2,
      code: 'QR-DEF456',
      amount: 45.00,
      customer: 'GameWinner',
      date: '2024-01-15 12:15',
      status: 'redeemed'
    },
    {
      id: 3,
      code: 'QR-GHI789',
      amount: 12.75,
      customer: 'FoodLover',
      date: '2024-01-14 18:45',
      status: 'redeemed'
    }
  ]);

  const startScanning = () => {
    setShowScannerModal(true);
  };

  const handleScanSuccess = (qrData: string) => {
    console.log('QR Code scanned:', qrData);
    
    // Process the scanned QR code
    processScannedCode(qrData);
    setShowScannerModal(false);
  };

  const processScannedCode = (qrData: string) => {
    // Parse the QR code data and create mock data structure
    // In a real app, you'd validate this against your backend
    let parsedData;
    
    try {
      // Try to parse as JSON first (for structured QR codes)
      parsedData = JSON.parse(qrData);
    } catch {
      // If not JSON, treat as a simple code string
      parsedData = { code: qrData };
    }

    // Determine if it's a restaurant game QR code based on format
    const isRestaurantGame = qrData.startsWith('RG-') || parsedData.type === 'restaurant_game';
    
    const mockQRData = {
      code: parsedData.code || qrData,
      amount: parsedData.amount || (Math.random() * 20 + 5).toFixed(2),
      customer: parsedData.customer || `Player${Math.floor(Math.random() * 1000)}`,
      gameId: parsedData.gameId || Math.floor(Math.random() * 100),
      isValid: parsedData.isValid !== false, // Default to valid unless explicitly false
      isRestaurantGame: isRestaurantGame
    };
    
    setScannedCode(mockQRData);
  };

  const handleRedemption = async (approved: boolean) => {
    if (approved && scannedCode && user) {
      setIsRedeeming(true);
      
      try {
        if (scannedCode.isRestaurantGame) {
          // Handle restaurant game QR redemption
          const result = await restaurantGameService.redeemQR(scannedCode.code, user.id);
          
          if (result.success) {
            const newRedemption = {
              id: Date.now(),
              code: scannedCode.code,
              amount: result.amount,
              customer: scannedCode.customer,
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              status: 'redeemed' as const
            };
            
            setScanHistory([newRedemption, ...scanHistory]);
            alert(`Successfully redeemed $${result.amount} from restaurant game: ${result.game_name}!`);
          } else {
            alert(result.message || 'Failed to redeem QR code');
          }
        } else {
          // Handle regular QR code (existing logic)
          const newRedemption = {
            id: Date.now(),
            code: scannedCode.code,
            amount: parseFloat(scannedCode.amount),
            customer: scannedCode.customer,
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            status: 'redeemed' as const
          };
          
          setScanHistory([newRedemption, ...scanHistory]);
          alert(`Successfully redeemed $${scannedCode.amount} from ${scannedCode.customer}!`);
        }
      } catch (error: any) {
        console.error('Redemption failed:', error);
        alert(error.message || 'Failed to redeem QR code');
      } finally {
        setIsRedeeming(false);
      }
    }
    
    setScannedCode(null);
  };

  const handleRedemptionOld = (approved: boolean) => {
    if (approved && scannedCode) {
      const newRedemption = {
        id: Date.now(),
        code: scannedCode.code,
        amount: parseFloat(scannedCode.amount),
        customer: scannedCode.customer,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        status: 'redeemed' as const
      };
      
      setScanHistory([newRedemption, ...scanHistory]);
      alert(`Successfully redeemed $${scannedCode.amount} from ${scannedCode.customer}!`);
    }
    
    setScannedCode(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link 
            to="/restaurant/dashboard"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
            <p className="text-gray-600">Scan customer QR codes to process redemptions</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Scanner Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              {!isScanning && !scannedCode && (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-2xl mb-6 max-w-md mx-auto">
                    <QrCode className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Scan</h2>
                    <p className="text-gray-600 mb-6">
                      Use your device's camera to scan customer QR codes
                    </p>
                    <button
                      onClick={startScanning}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Camera className="h-5 w-5" />
                      <span>Start Camera Scanner</span>
                    </button>
                  </div>
                </div>
              )}

              {scannedCode && (
                <div className="py-8">
                  <div className={`p-6 rounded-2xl border-2 ${
                    scannedCode.isValid 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center space-x-3 mb-4">
                      {scannedCode.isValid ? (
                        <Check className="h-8 w-8 text-green-600" />
                      ) : (
                        <X className="h-8 w-8 text-red-600" />
                      )}
                      <div>
                        <h3 className={`text-xl font-semibold ${
                          scannedCode.isValid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {scannedCode.isValid ? 'Valid QR Code' : 'Invalid QR Code'}
                        </h3>
                        <p className={`text-sm ${
                          scannedCode.isValid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {scannedCode.isRestaurantGame ? 'Restaurant Game' : 'Standard'} Code: {scannedCode.code}
                        </p>
                      </div>
                    </div>

                    {scannedCode.isValid ? (
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Amount</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${scannedCode.amount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Customer</span>
                          <span className="font-semibold">{scannedCode.customer}</span>
                        </div>
                        {scannedCode.isRestaurantGame ? (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Type</span>
                            <span className="font-semibold text-orange-600">Restaurant Game Prize</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Game ID</span>
                            <span className="font-semibold">#{scannedCode.gameId}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className="flex items-center space-x-2 text-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">
                            This QR code has already been used or is not valid.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      {scannedCode.isValid && (
                        <button
                          onClick={() => handleRedemption(true)}
                          disabled={isRedeeming}
                          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {isRedeeming ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            'Approve Redemption'
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleRedemption(false)}
                        disabled={isRedeeming}
                        className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        {scannedCode.isValid ? 'Reject' : 'Try Again'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Scanning Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Hold your device steady and position the QR code in the center</li>
                <li>• Ensure good lighting for accurate scanning</li>
                <li>• The code will be automatically detected and verified</li>
                <li>• Always verify the amount and customer before approving</li>
                <li>• Restaurant game QR codes can only be redeemed by the creating restaurant</li>
              </ul>
            </div>
          </div>

          {/* Scan History */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
              
              <div className="space-y-4">
                {scanHistory.slice(0, 5).map((scan) => (
                  <div key={scan.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-green-600">
                        ${scan.amount}
                      </span>
                      <span className="text-xs text-gray-500">
                        {scan.date}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span>{scan.customer}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <QrCode className="h-3 w-3" />
                        <span>{scan.code}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link 
                  to="/restaurant/dashboard"
                  className="text-blue-600 font-medium hover:text-blue-700 text-sm"
                >
                  View Full History
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default QRScanner;