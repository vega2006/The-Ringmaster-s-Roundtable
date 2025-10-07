
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from "./components/GoogleLogin";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';
import RefreshHandler from './components/RefreshHandler';
import NotFound from './components/NotFound';
import Dashboard from "./pages/Dashboard"; 
import Home from "./pages/Home";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const GoogleWrapper = () => (
    <GoogleOAuthProvider clientId="1054190178825-cc3eg87b9uvh9hfn384ge5sqe5hq9l5v.apps.googleusercontent.com">
      <GoogleLogin />
    </GoogleOAuthProvider>
  );

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        
        <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />

     
        <Route path="/login" element={<GoogleWrapper />} />

        <Route path='/dashboard' element={<PrivateRoute element={<Dashboard />} />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}