
import {TripProvider } from "../contexts/TripContext";
import AppHeader from "../components/AppHeader";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import ContentRouter from "../components/ContentRouter";
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const MOCK_USER_INFO = {
    name: "Acrobat A.",
    email: "acrobat@circus.com",
    image: "https://placehold.co/48x48/FFC107/333?text=AA",
    preferences: ["Concerts", "Theater"] // Added mock preferences
};


const PREFERENCE_ENUM = ['Sports', 'Concerts', 'Movies', 'PoliticalEvents', 'ArtGallery', 'Museum', 'Theater', 'Workshops', 'TechEvents', 'FoodFest'];

// Profile Modal Component
const ProfileModal = ({ userInfo, isModalOpen, closeModal, onSave }) => {

    // Initialize temporary state with current user info
    const [tempName, setTempName] = useState(userInfo?.name || '');
    const [tempImage, setTempImage] = useState(userInfo?.image || '');
    const [tempPrefs, setTempPrefs] = useState(userInfo?.preferences || []);

    if (!isModalOpen) return null;

    const handlePreferenceToggle = (pref) => {
        setTempPrefs(prev => 
            prev.includes(pref) 
                ? prev.filter(p => p !== pref) 
                : [...prev, pref]
        );
    };

    const handleSave = () => {
        onSave({ 
            ...userInfo, 
            name: tempName, 
            image: tempImage, 
            preferences: tempPrefs 
        });
        closeModal();
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-sky-100 via-white to-amber-100 bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all overflow-y-auto max-h-[90vh]">
                <h2 className="text-3xl font-bold text-sky-700 drop-shadow-lg mb-6 border-b-2 border-sky-300 pb-2">Edit Ringmaster Profile</h2>
                
                <div className="space-y-6">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="profileName">Name</label>
                        <input 
                            id="profileName"
                            type="text" 
                            value={tempName} 
                            onChange={(e) => setTempName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-150"
                            placeholder="Enter your dazzling stage name"
                        />
                    </div>

                    {/* Image URL Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="profileImage">Image URL</label>
                        <input 
                            id="profileImage"
                            type="text" 
                            value={tempImage} 
                            onChange={(e) => setTempImage(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 transition duration-150"
                            placeholder="Link to your profile picture"
                        />
                        <div className="mt-2 flex items-center space-x-3">
                            <img 
                                src={tempImage} 
                                alt="Preview" 
                                className="w-10 h-10 rounded-full object-cover border border-sky-500"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/FFC107/333?text=?" }}
                            />
                            <span className="text-xs text-gray-500">Image Preview</span>
                        </div>
                    </div>

                    {/* Preferences Checkboxes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Preferences (Select all that apply)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {PREFERENCE_ENUM.map(pref => (
                                <button
                                    key={pref}
                                    onClick={() => handlePreferenceToggle(pref)}
                                    className={`p-3 text-sm rounded-xl font-semibold transition duration-150 shadow-md ${
                                        tempPrefs.includes(pref)
                                            ? 'bg-sky-600 text-white hover:bg-sky-700'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
                                    }`}
                                >
                                    {pref}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-8 pt-6 border-t flex justify-end space-x-4">
                    <button 
                        onClick={closeModal}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 transition duration-150"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-full hover:bg-sky-700 transition duration-150"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {

    const [userInfo, setUserInfo] = useState(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        const data = localStorage.getItem('user-info');
        if (data) {
            let userData = JSON.parse(data);
            // Ensure preferences array exists for consistency
            if (!userData.preferences) {
                userData.preferences = [];
            }
            setUserInfo(userData);
        } else {
            // For demo purposes, use mock user info if none is found
            setUserInfo(MOCK_USER_INFO);
        }
    }, []);

    const handleLogout = ()=>{
        localStorage.removeItem('user-info');
        navigate('/login');
    }

    const handleProfileUpdate = async (updatedUser) => {
    try {
        const response = await fetch("http://localhost:4000/api/user/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update user");
        }

        setUserInfo(data.user);
        localStorage.setItem("user-info", JSON.stringify(data.user));
        console.log("✅ Profile updated:", data.user);
    } catch (error) {
        console.error("Update failed:", error);
        alert("Failed to save profile changes. Please try again.");
    }
};



    

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white shadow-lg p-3 sm:p-4 border-b-4 border-amber-600/70">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    
                   
                    <div className="flex items-center space-x-4">
                        <img 
                            className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-sky-500" 
                            src={userInfo?.image} 
                            alt={userInfo?.name || 'User'}
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/FFC107/333?text=?" }}
                        />
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Welcome, {userInfo?.name || 'Guest'}</h1>
                            <h3 className="text-sm text-gray-500">{userInfo?.email || 'Please login'}</h3>
                        </div>
                        <div className="sm:hidden text-lg font-bold text-gray-900">
                           {userInfo?.name ? `Hello, ${userInfo.name.split(' ')[0]}!` : 'Hello!'}
                        </div>
                    </div>

              
                    {/* Right Section: Edit Profile and Logout Button */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        
                        {/* Edit Profile Button (New) */}
                        <button
                            onClick={() => userInfo && setIsProfileModalOpen(true)}
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 
                                       transition duration-150 transform hover:scale-[1.02] active:scale-95 
                                       focus:outline-none focus:ring-4 focus:ring-blue-300 text-xs sm:text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5l4 4L7.5 19.5l-4 1 1-4z"/></svg>
                            <span className="hidden sm:inline">Edit Profile</span>
                        </button>

                        {/* Logout Button */}
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
            </div>

      <TripProvider>
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-amber-100 font-inter">
          <AppHeader />
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] bg-white shadow-2xl rounded-2xl overflow-hidden mt-4 mb-8">
            <Sidebar />
            <MainContent>
              <ContentRouter />
            </MainContent>
          </div>
        </div>
    </TripProvider>

    {/* Profile Editing Modal */}
            {userInfo && (
                <ProfileModal
                    userInfo={userInfo}
                    isModalOpen={isProfileModalOpen}
                    closeModal={() => setIsProfileModalOpen(false)}
                    onSave={handleProfileUpdate}
                />
            )}

    </div>
  )
}
export default Dashboard
