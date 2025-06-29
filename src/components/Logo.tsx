import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { DollarSign, Globe } from 'lucide-react';

const Logo: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col items-start space-y-3">
      {/* Logo */}
      <Link 
        to="/" 
        className="group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-3"
      >
        <div className="relative">
          <DollarSign className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="group flex items-center justify-center w-14 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
      >
        <div className="flex items-center space-x-1">
          <Globe className="h-3 w-3 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
          <span className="text-xs font-bold text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
            {language.toUpperCase()}
          </span>
        </div>
        
        {/* Hover indicator */}
        <div className="absolute inset-0 rounded-xl bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      {/* Language indicator tooltip */}
      <div className="absolute left-16 top-16 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        {language === 'en' ? 'Español' : 'English'}
      </div>
    </div>
  );
};

export default Logo;