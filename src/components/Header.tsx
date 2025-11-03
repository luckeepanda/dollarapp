import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, LogOut, User, Zap } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-dark-900 shadow-lg border-b border-dark-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-green-500 to-vivid-orange-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-neon-green-500 to-vivid-orange-500 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-dark-950 font-black" />
              </div>
            </div>
            <span className="text-xl font-black gaming-text-gradient tracking-tight">
              DOLLAR APP
            </span>
          </Link>

          {user && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-dark-800 border border-dark-400 rounded-lg">
                <User className="h-4 w-4 text-dark-200" />
                <span className="text-sm font-medium text-white">{user.username}</span>
                <span className="px-2 py-1 bg-gradient-to-r from-neon-green-500/20 to-vivid-orange-500/20 border border-neon-green-500/30 text-neon-green-400 rounded-full text-xs font-bold uppercase tracking-wide">
                  {user.accountType}
                </span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-neon-green-500/10 to-neon-green-600/10 border border-neon-green-500/30 rounded-lg">
                <DollarSign className="h-4 w-4 text-neon-green-400" />
                <span className="text-lg font-black text-neon-green-400">
                  {user.balance.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-dark-200 hover:text-vivid-orange-400 transition-colors duration-200 rounded-lg hover:bg-dark-800"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
