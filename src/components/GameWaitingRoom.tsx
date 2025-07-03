import React, { useState, useEffect } from 'react';
import { Users, Clock, Trophy, DollarSign, Loader } from 'lucide-react';
import { gameSessionService, type GameSession, type GameParticipant } from '../services/gameSessionService';

interface GameWaitingRoomProps {
  sessionId: string;
  onGameStart: () => void;
  onLeaveSession: () => void;
}

const GameWaitingRoom: React.FC<GameWaitingRoomProps> = ({
  sessionId,
  onGameStart,
  onLeaveSession
}) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessionData();
    
    // Subscribe to real-time updates
    const sessionSubscription = gameSessionService.subscribeToSession(sessionId, (updatedSession) => {
      setSession(updatedSession);
      
      // Start game when session becomes active
      if (updatedSession.status === 'active') {
        onGameStart();
      }
    });

    const participantsSubscription = gameSessionService.subscribeToParticipants(sessionId, (updatedParticipants) => {
      setParticipants(updatedParticipants);
    });

    return () => {
      supabase.removeChannel(sessionSubscription);
      supabase.removeChannel(participantsSubscription);
    };
  }, [sessionId, onGameStart]);

  const loadSessionData = async () => {
    try {
      const { session: sessionData, participants: participantsData } = await gameSessionService.getSessionDetails(sessionId);
      setSession(sessionData);
      setParticipants(participantsData);
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading game session...</p>
        </div>
      </div>
    );
  }

  const playersNeeded = session.max_players - session.current_players;

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue-900 to-steel-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Waiting Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white text-center">
            <div className="text-4xl mb-2">🌮</div>
            <h2 className="text-2xl font-bold mb-1">Taco Flyer Challenge</h2>
            <p className="text-orange-100">Waiting for players...</p>
          </div>

          {/* Game Info */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="bg-green-500/20 p-3 rounded-xl mb-2">
                  <DollarSign className="h-6 w-6 text-green-400 mx-auto" />
                </div>
                <p className="text-sm text-royal-blue-200">Prize Pool</p>
                <p className="text-xl font-bold text-green-400">${session.prize_pool.toFixed(2)}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-royal-blue-500/20 p-3 rounded-xl mb-2">
                  <Trophy className="h-6 w-6 text-royal-blue-300 mx-auto" />
                </div>
                <p className="text-sm text-royal-blue-200">Min Score</p>
                <p className="text-xl font-bold text-royal-blue-300">{session.min_score}</p>
              </div>
            </div>

            {/* Player Count */}
            <div className="text-center mb-6">
              <div className="bg-white/10 p-4 rounded-xl">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="h-6 w-6 text-white" />
                  <span className="text-2xl font-bold text-white">
                    {session.current_players}/{session.max_players}
                  </span>
                </div>
                <p className="text-royal-blue-200">
                  {playersNeeded > 0 
                    ? `Waiting for ${playersNeeded} more player${playersNeeded > 1 ? 's' : ''}...`
                    : 'Game starting soon!'
                  }
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-royal-blue-200">Players Joined</span>
                <span className="text-sm font-medium text-white">
                  {Math.round((session.current_players / session.max_players) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(session.current_players / session.max_players) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Participants List */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Players in Game:</h3>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div key={participant.id} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg">
                    <div className="w-8 h-8 bg-royal-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-white font-medium">
                      {participant.profiles?.username || 'Player'}
                    </span>
                    <div className="flex-1"></div>
                    <Clock className="h-4 w-4 text-royal-blue-300" />
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: playersNeeded }).map((_, index) => (
                  <div key={`empty-${index}`} className="flex items-center space-x-3 bg-white/5 p-3 rounded-lg opacity-50">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white/60 font-bold text-sm">{session.current_players + index + 1}</span>
                    </div>
                    <span className="text-white/60 font-medium">Waiting for player...</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-white/5 p-4 rounded-xl mb-6">
              <h4 className="text-white font-semibold mb-2">Game Rules:</h4>
              <ul className="text-sm text-royal-blue-200 space-y-1">
                <li>• Score at least {session.min_score} points to qualify</li>
                <li>• Qualified players split the ${session.prize_pool.toFixed(2)} prize pool</li>
                <li>• Game starts automatically when full</li>
              </ul>
            </div>

            {/* Leave Button */}
            <button
              onClick={onLeaveSession}
              className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Leave Game
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Waiting for players...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameWaitingRoom;