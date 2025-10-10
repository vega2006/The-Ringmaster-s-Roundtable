import { TripProvider } from "../contexts/TripContext";
import AppHeader from "../components/AppHeader";
import PromptBasedSidebar from "../components/PromptBasedSideBar";
import MainContent from "../components/MainContent";
import AIContentRouter from "../components/AIContentRouter";
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import RightSidebar from "../components/TabBar";
const AIDashboard = () => {

  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('user-info');
    const userData = JSON.parse(data);
    setUserInfo(userData);
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user-info');
    navigate('/login');
  }


  return (
    <div>
      <div className="sticky top-0 z-10 bg-white shadow-lg p-3 sm:p-4 border-b-4 border-amber-600/70">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* User Info Display */}
          <div className="flex items-center space-x-4">
            <img
              className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-amber-500"
              src={userInfo?.image}
              alt={userInfo?.name || 'User'}
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/FFC107/333?text=?" }}
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Welcome, {userInfo?.name || 'Guest'}</h1>
              <h3 className="text-sm text-gray-500">{userInfo?.email || 'Please login'}</h3>
            </div>
            <div className="sm:hidden text-lg font-bold text-gray-900">
              {userInfo?.name ? `Hello, ${userInfo.name.split(' ')[0]}!` : 'Hello!'}
            </div>
          </div>

          {/* Logout Button (Stylized and positioned on the right) */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 
                                   transition duration-150 transform hover:scale-[1.02] active:scale-95 
                                   focus:outline-none focus:ring-4 focus:ring-red-300 uppercase text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      <TripProvider>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-pink-900 to-green-900 font-inter text-white">
  <AppHeader />

  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr_240px] 
                  bg-gradient-to-br from-pink-800 via-blue-800 to-green-800 
                  shadow-2xl rounded-3xl overflow-hidden mt-6 mb-8">
    
    {/* Left Sidebar */}
    <div className="bg-gradient-to-b from-pink-700 to-blue-700 p-4">
      <PromptBasedSidebar />
    </div>

    {/* Main Content */}
    <MainContent>
      <AIContentRouter />
    </MainContent>

    {/* Right Sidebar */}
    <div className="bg-gradient-to-b from-blue-700 to-green-700 p-4">
      <RightSidebar userId={userInfo?.id} />
    </div>

  </div>
</div>

export default AIDashboard


