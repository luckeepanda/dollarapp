import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { QrCode, Copy, CheckCircle, Trophy, Calendar, Gift } from 'lucide-react';

interface PlayerQRCode {
  id: string;
  code: string;
  source: 'tournament' | 'restaurant_game';
  amount?: number;
  game_name?: string;
  created_at: string;
  redeemed: boolean;
}

const PlayerQRCodes: React.FC = () => {
  const { user } = useAuth();
  const [qrCodes, setQrCodes] = useState<PlayerQRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPlayerQRCodes();
    }
  }, [user]);

  const loadPlayerQRCodes = async () => {
    if (!user) return;
    
    try {
      // For now, we'll simulate QR codes since the tournament system generates them
      // In a real implementation, you'd fetch from a player_qr_codes table
      const mockQRCodes: PlayerQRCode[] = [];
      
      // Check localStorage for any tournament wins (temporary solution)
      const tournamentWins = localStorage.getItem(`tournament_wins_${user.id}`);
      if (tournamentWins) {
        const wins = JSON.parse(tournamentWins);
        wins.forEach((win: any) => {
          mockQRCodes.push({
            id: `tournament_${win.timestamp}`,
            code: win.qr_code || `TOURNAMENT-${user.id}-${win.timestamp}`,
            source: 'tournament',
            amount: win.amount || 5.00,
            game_name: win.game_name || 'Taco Flyer Tournament',
            created_at: win.created_at || new Date(win.timestamp).toISOString(),
            redeemed: false
          });
        });
      }
      
      setQrCodes(mockQRCodes);
    } catch (error) {
      console.error('Failed to load QR codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCodeDataURL = (text: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    canvas.width = 150;
    canvas.height = 150;
    
    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 150, 150);
    
    // Create a simple pattern for the QR code
    ctx.fillStyle = '#000000';
    const cellSize = 8;
    const padding = 15;
    
    // Generate a deterministic pattern based on the text
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        const hash = text.charCodeAt((x + y * 15) % text.length);
        if (hash % 3 === 0) {
          ctx.fillRect(
            padding + x * cellSize,
            padding + y * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
    
    // Add corner markers
    const markerSize = 24;
    // Top-left
    ctx.fillRect(padding, padding, markerSize, markerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(padding + 4, padding + 4, markerSize - 8, markerSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(padding + 8, padding + 8, markerSize - 16, markerSize - 16);
    
    // Top-right
    ctx.fillStyle = '#000000';
    ctx.fillRect(150 - padding - markerSize, padding, markerSize, markerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(150 - padding - markerSize + 4, padding + 4, markerSize - 8, markerSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(150 - padding - markerSize + 8, padding + 8, markerSize - 16, markerSize - 16);
    
    // Bottom-left
    ctx.fillStyle = '#000000';
    ctx.fillRect(padding, 150 - padding - markerSize, markerSize, markerSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(padding + 4, 150 - padding - markerSize + 4, markerSize - 8, markerSize - 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(padding + 8, 150 - padding - markerSize + 8, markerSize - 16, markerSize - 16);
    
    return canvas.toDataURL();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-white mb-2">No QR Codes Yet</h3>
        <p className="text-gray-300 mb-4">Win tournaments or restaurant games to earn QR codes!</p>
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
            qrCode.redeemed ? 'opacity-60' : ''
          }`}
        >
          {/* QR Code Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span className="font-semibold text-sm">
                  {qrCode.source === 'tournament' ? 'Tournament Win' : 'Restaurant Game'}
                </span>
              </div>
              {qrCode.redeemed ? (
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium">
                  Redeemed
                </span>
              ) : (
                <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            <h3 className="font-bold">{qrCode.game_name}</h3>
            {qrCode.amount && (
              <p className="text-yellow-100 text-sm">Prize Value: ${qrCode.amount.toFixed(2)}</p>
            )}
          </div>

          {/* QR Code Display */}
          <div className="p-6">
            <div className="bg-white p-4 rounded-xl mb-4 text-center">
              <img 
                src={generateQRCodeDataURL(qrCode.code)} 
                alt="QR Code"
                className="w-24 h-24 mx-auto mb-2"
              />
              <p className="text-xs text-gray-600 font-mono break-all">{qrCode.code}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Created:</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-white">{formatDate(qrCode.created_at)}</span>
                </div>
              </div>

              <button
                onClick={() => copyQRCode(qrCode.code)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
              >
                {copiedCode === qrCode.code ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              {!qrCode.redeemed && (
                <div className="bg-green-500/20 p-3 rounded-xl border border-green-400/30">
                  <div className="flex items-center space-x-2">
                    <Gift className="h-4 w-4 text-green-400" />
                    <p className="text-sm text-green-300 font-medium">
                      Ready to redeem at participating restaurants!
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