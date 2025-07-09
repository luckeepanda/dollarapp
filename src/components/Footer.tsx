import React from 'react';
import { DollarSign } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-steel-blue-900 to-royal-blue-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="bg-gradient-to-r from-royal-blue-500 to-steel-blue-500 p-1.5 rounded-lg">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <span className="text-steel-blue-200 text-sm font-medium">
            © 2025 Dollar App
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;