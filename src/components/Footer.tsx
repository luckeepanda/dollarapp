import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-steel-blue-900 to-royal-blue-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 p-1.5 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <span className="text-steel-blue-200 text-sm font-medium">
              © 2025 Dollar App
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-steel-blue-300">
            <Link 
              to="/privacy-policy" 
              className="hover:text-steel-blue-200 transition-colors"
            >
              Privacy Policy
            </Link>
            <span>|</span>
            <Link 
              to="/terms-of-use" 
              className="hover:text-steel-blue-200 transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;