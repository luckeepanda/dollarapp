import React, { useState } from 'react';
import { User, Trophy, X, AlertCircle } from 'lucide-react';

interface NicknameModalProps {
  isOpen: boolean;
  score: number;
  onSubmit: (nickname: string) => void;
  onSkip: () => void;
  isSubmitting?: boolean;
}

const NicknameModal: React.FC<NicknameModalProps> = ({ 
  isOpen, 
  score, 
  onSubmit, 
  onSkip,
  isSubmitting = false 
}) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedNickname = nickname.trim();
    
    if (!trimmedNickname) {
      setError('Please enter a nickname');
      return;
    }
    
    if (trimmedNickname.length < 2) {
      setError('Nickname must be at least 2 characters');
      return;
    }
    
    if (trimmedNickname.length > 20) {
      setError('Nickname must be 20 characters or less');
      return;
    }
    
    // Check for inappropriate content (basic filter)
    const inappropriateWords = ['admin', 'moderator', 'system', 'bot'];
    if (inappropriateWords.some(word => trimmedNickname.toLowerCase().includes(word))) {
      setError('Please choose a different nickname');
      return;
    }
    
    setError('');
    onSubmit(trimmedNickname);
  };

  const handleSkip = () => {
    setNickname('');
    setError('');
    onSkip();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-steel-blue-600 to-royal-blue-600 p-6 text-white relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-300" />
            <h2 className="text-2xl font-bold">Great Score!</h2>
          </div>
          <p className="text-steel-blue-100">You scored {score} points!</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-steel-blue-100 to-royal-blue-100 p-4 rounded-xl mb-4">
              <Trophy className="h-12 w-12 text-steel-blue-600 mx-auto mb-2" />
              <p className="text-gray-700">
                Save your score to the all-time leaderboard!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a nickname for the leaderboard
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-steel-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your nickname"
                  maxLength={20}
                  disabled={isSubmitting}
                />
              </div>
              {error && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                2-20 characters, will be visible to all players
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || !nickname.trim()}
                className="flex-1 bg-gradient-to-r from-steel-blue-600 to-royal-blue-600 text-white py-3 rounded-xl font-semibold hover:from-steel-blue-700 hover:to-royal-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    <span>Save to Leaderboard</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Skip
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NicknameModal;