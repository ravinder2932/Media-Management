import React from 'react';
import { Code2, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="w-[95%] md:w-[85%] mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-center">
            <Code2 className="h-5 w-5 text-blue-600" />
            <span className="text-gray-600">Made with</span>
            <Heart className="h-5 w-5 text-red-500 animate-pulse" />
            <span className="text-gray-600">by</span>
            <a 
              href="https://qodeyard.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Qodeyard Team
            </a>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}