import React from 'react';
import { Globe } from 'lucide-react';

const AppHeader = () => (
    <div className="w-full max-w-6xl text-center pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-sky-700 drop-shadow-lg leading-tight flex items-center justify-center">
            <Globe className="w-8 h-8 sm:w-10 sm:h-10 mr-4 text-amber-500" />
            The Ringmaster's Roundtable
        </h1>
        <p className="text-center text-lg sm:text-xl text-gray-600 mt-2">Your Personal AI powered adventure planner</p>
    </div>
);

export default AppHeader;