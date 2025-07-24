import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { playerQRService } from '../services/playerQRService';
import { QrCode, Copy, CheckCircle, Trophy, Calendar, Gift, Download, AlertCircle, X } from 'lucide-react';
import QRCode from 'qrcode';
import type { PlayerQRCode } from '../lib/supabase';

const PlayerQRCodes: React.FC = () => {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState<PlayerQRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [qrImages, setQrImages] = useState<{ [key: string]: string }>({});
  const [qrImageErrors, setQrImageErrors] = useState<{ [key: string]: boolean }>({});
  const [removingCodes, setRemovingCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadPlayerQRCodes();
    }
  }, [user]);

  const loadPlayerQRCodes = async () => {
    if (!user) return;
    
    try {
      const codes = await playerQRService.getPlayerQRCodes(user.id);
      setQrCodes(codes);
      
      // Generate QR code images for each code
      const images: { [key: string]: string } = {};
      const errors: { [key: string]: boolean } = {};
      
      for (const qrCode of codes) {
        try {
          const qrDataURL = await QRCode.toDataURL(qrCode.code, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          images[qrCode.code] = qrDataURL;
        } catch (error) {
          console.error('Error generating QR code image for', qrCode.code, ':', error);
          errors[qrCode.code] = true;
        }
      }
      
      setQrImages(images);
      setQrImageErrors(errors);
    } catch (error) {
      console.error('Failed to load QR codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyQRCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy QR code:', err);
    }
  };

  const downloadQRCode = (code: string, gameName: string) => {
    const qrImage = qrImages[code];
    if (!qrImage) return;

    const link = document.createElement('a');
    link.download = `${gameName.replace(/\s+/g, '_')}_QR_${code}.png`;
    link.href = qrImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeRejectedQRCode = async (qrCode: PlayerQRCode) => {
    if (!user) return;
    
    if (!window.confirm(`Are you sure you want to remove this rejected QR code? This action cannot be undone.`)) {
      return;
    }
    
    setRemovingCodes(prev => new Set(prev).add(qrCode.code));
    
    try {
      const success = await playerQRService.removeRejectedQRCode(qrCode.code, user.id);
      
      if (success) {
        // Remove from local state
        setQrCodes(prev => prev.filter(code => code.id !== qrCode.id));
        alert('Rejected QR code has been removed.');
      } else {
        alert('Failed to remove QR code. It may not be rejected or may not belong to you.');
      }
    } catch (error) {
      console.error('Failed to remove rejected QR code:', error);
      alert('Failed to remove QR code. Please try again.');
    } finally {
      setRemovingCodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(qrCode.code);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQRStatus = (qrCode: PlayerQRCode) => {
    if (qrCode.is_redeemed) {
      return { status: 'redeemed', color: 'green', label: 'Redeemed' };
    } else if (qrCode.rejected_at) {
      return { status: 'rejected', color: 'red', label: 'Rejected' };
    } else {
      return { status: 'active', color: 'blue', label: 'Active' };
    }
  };
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'tournament':
        return '🏆';
      case 'restaurant_game':
        return '🍽️';
      default:
        return '🎮';
    }
  };

  const getSourceLabel = (sourceType: string) => {
    switch (sourceType) {
      case 'tournament':
        return 'Tournament Win';
      case 'restaurant_game':
        return 'Restaurant Game';
      default:
        return 'Game Win';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-8">
        <QrCode className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No QR Codes Yet</h3>
        <p className="text-gray-600 mb-4">Win tournaments or restaurant games to earn QR codes!</p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/restaurant-games"
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105"
          >
            Browse Games
          </Link>
          <Link
            to="/free-play"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
          >
            Practice Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {qrCodes.map((qrCode) => (
        <div
          key={qrCode.id}
          className={`bg-white/5 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 overflow-hidden ${
            qrCode.is_redeemed || qrCode.rejected_at ? 'opacity-60' : ''
          }`}
        >
          {/* QR Code Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getSourceIcon(qrCode.source_type)}</span>
                <span className="font-semibold text-sm">
                  {getSourceLabel(qrCode.source_type)}
                </span>
              </div>
              {(() => {
                const statusInfo = getQRStatus(qrCode);
                return (
                  <span className={`px-2 py-1 text-white text-xs rounded-full font-medium ${
                    statusInfo.color === 'green' ? 'bg-green-600' :
                    statusInfo.color === 'red' ? 'bg-red-600' :
                    'bg-white/20'
                  }`}>
                    {statusInfo.label}
                  </span>
                );
              })()}
            </div>
            <h3 className="font-bold">{qrCode.game_name}</h3>
            <p className="text-yellow-100 text-sm">Prize Value: ${qrCode.prize_amount.toFixed(2)}</p>
            
            {/* Show rejection reason if rejected */}
            {qrCode.rejected_at && qrCode.rejection_reason && (
              <div className="mt-2 p-2 bg-red-500/20 rounded-lg border border-red-400/30">
                <p className="text-red-100 text-xs">
                  <strong>Rejection Reason:</strong> {qrCode.rejection_reason}
                </p>
              </div>
            )}
          </div>

          {/* QR Code Display */}
          <div className="p-6">
            {/* Only show QR code details if not rejected */}
            {!qrCode.rejected_at && (
              <>
                {/* Alphanumeric Code */}
                <div className="bg-white/10 p-4 rounded-xl mb-4">
                  <p className="text-xs text-gray-300 mb-2">QR Code:</p>
                  <p className="text-lg font-mono text-white break-all text-center">{qrCode.code}</p>
                </div>

                {/* Scannable QR Code */}
                <div className="bg-white p-6 rounded-xl mb-4 text-center">
                  <p className="text-sm font-medium text-gray-800 mb-4">Scannable QR Code:</p>
                  {qrImages[qrCode.code] ? (
                    <img 
                      src={qrImages[qrCode.code]} 
                      alt={`QR Code for ${qrCode.code}`}
                      className="w-60 h-60 mx-auto border-2 border-gray-300 rounded-lg shadow-sm"
                    />
                  ) : qrImageErrors[qrCode.code] ? (
                    <div className="w-60 h-60 mx-auto bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                      <p className="text-sm text-red-600 text-center px-4">
                        Failed to generate QR code
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-xs text-red-500 underline hover:text-red-700"
                      >
                        Refresh page to retry
                      </button>
                    </div>
                  ) : (
                    <div className="w-60 h-60 mx-auto bg-gray-100 border-2 border-gray-200 rounded-lg flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                      <p className="text-sm text-gray-600">Generating QR code...</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Status and Action Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Created:</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-white">{formatDate(qrCode.created_at)}</span>
                </div>
              </div>

              {qrCode.is_redeemed && qrCode.redeemed_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Redeemed:</span>
                  <span className="text-green-400">{formatDate(qrCode.redeemed_at)}</span>
                </div>
              )}

              {qrCode.rejected_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Rejected:</span>
                  <span className="text-red-400">{formatDate(qrCode.rejected_at)}</span>
                </div>
              )}

              {/* Action Buttons */}
              {qrCode.rejected_at ? (
                // Show remove button for rejected codes
                <button
                  onClick={() => removeRejectedQRCode(qrCode)}
                  disabled={removingCodes.has(qrCode.code)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {removingCodes.has(qrCode.code) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span>Remove Rejected Code</span>
                    </>
                  )}
                </button>
              ) : !qrCode.is_redeemed ? (
                // Show normal action buttons for active codes
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyQRCode(qrCode.code)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                  >
                    {copiedCode === qrCode.code ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {qrImages[qrCode.code] && (
                    <button
                      onClick={() => downloadQRCode(qrCode.code, qrCode.game_name)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : null}

              {/* Status Messages */}
              {!qrCode.is_redeemed && !qrCode.rejected_at && (
                <div className="bg-green-500/20 p-3 rounded-xl border border-green-400/30">
                  <div className="flex items-center space-x-2">
                    <Gift className="h-4 w-4 text-green-400" />
                    <p className="text-sm text-green-300 font-medium">
                      Ready to redeem at participating restaurants!
                    </p>
                  </div>
                </div>
              )}

              {qrCode.rejected_at && (
                <div className="bg-red-500/20 p-3 rounded-xl border border-red-400/30">
                  <div className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-red-400" />
                    <p className="text-sm text-red-300 font-medium">
                      This QR code was rejected by the restaurant. You can remove it from your list.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerQRCodes;