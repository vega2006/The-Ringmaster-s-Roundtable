import React from 'react'
import { useNavigate } from 'react-router-dom'

function NotFound() {
   const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white font-inter text-center">
        
   
        <div className="space-y-4">
            <p className="text-8xl sm:text-9xl font-extrabold text-amber-500 tracking-wider animate-pulse">
                404
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 uppercase">
                Curtain Call Interrupted
            </h1>
            <p className="text-xl text-gray-400 max-w-lg mx-auto">
                It seems this performance has been cancelled. The page you requested could not be found backstage.
            </p>
        </div>

       
        <button 
            onClick={() => navigate('/')}
            className="mt-10 px-8 py-3 bg-amber-600 text-gray-900 font-bold rounded-full shadow-lg hover:bg-amber-500 
                       transition duration-300 transform hover:scale-105 active:scale-95 
                       focus:outline-none focus:ring-4 focus:ring-amber-300 uppercase tracking-wider"
            aria-label="Go to Login Page"
        >
            Return to the Main Tent
        </button>
    </div>
  )
}

export default NotFound