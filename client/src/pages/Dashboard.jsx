// import AppHeader from "./components/AppHeader";
// import Sidebar from "./components/Sidebar";
// import MainContent from "./components/MainContent";
// import ContentRouter from "./components/ContentRouter";
// import { TripProvider } from "./contexts/TripContext";

import {TripProvider } from "../contexts/TripContext";
import AppHeader from "../components/AppHeader";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import ContentRouter from "../components/ContentRouter";
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

     const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(()=>{
        const data = localStorage.getItem('user-info');
        const userData = JSON.parse(data);
        setUserInfo(userData);
    },[])

    const handleLogout = ()=>{
        localStorage.removeItem('user-info');
        navigate('/login');
    }


  return (
    <div>

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

     <h1>Welcome {userInfo?.name}</h1>
            <h3>{userInfo?.email}</h3>
            <img src={userInfo?.image} alt={userInfo?.name}/>
            <button onClick={handleLogout}
            >Logout
            </button>

    </div>
  )
}
export default Dashboard


// import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom';

// const Dashboard = () => {
    // const [userInfo, setUserInfo] = useState(null);
    // const navigate = useNavigate();

    // useEffect(()=>{
    //     const data = localStorage.getItem('user-info');
    //     const userData = JSON.parse(data);
    //     setUserInfo(userData);
    // },[])

    // const handleLogout = ()=>{
    //     localStorage.removeItem('user-info');
    //     navigate('/login');
    // }

//     return (
//         <>
            // <h1>Welcome {userInfo?.name}</h1>
            // <h3>{userInfo?.email}</h3>
            // <img src={userInfo?.image} alt={userInfo?.name}/>
            // <button onClick={handleLogout}
            // >Logout
            // </button>
//         </>
//     )
// }

// export default Dashboard