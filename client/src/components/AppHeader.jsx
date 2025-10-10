import React from 'react';
import { Globe } from 'lucide-react';

const AppHeader = () => (
  <div className="w-full max-w-6xl text-center pt-12 pb-6 bg-gradient-to-br from-indigo-900 via-pink-900 to-green-900 rounded-b-3xl shadow-lg">
    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 drop-shadow-lg flex items-center justify-center mx-auto">
      <Globe className="w-8 h-8 sm:w-10 sm:h-10 mr-4 text-pink-300 animate-bounce" />
      The Ringmaster's Roundtable
    </h1>
    <p className="text-center text-lg sm:text-xl text-gray-300 mt-2">
      Your Personal AI-powered adventure planner
    </p>
  </div>
);

export default AppHeader;
