import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-1.5 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <span className="text-gray-600 text-sm font-medium font-display">
              © 2025 Dollar App
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <Link 
              to="/privacy-policy" 
              className="hover:text-primary-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <span>|</span>
            <Link 
              to="/terms-of-use" 
              className="hover:text-primary-600 transition-colors"
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