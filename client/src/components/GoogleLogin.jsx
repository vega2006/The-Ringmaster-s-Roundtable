import {useState} from "react";
import { useGoogleLogin } from "@react-oauth/google";
import {useNavigate} from 'react-router-dom';
import { googleAuth } from "../api/api";
    
const GoolgeLogin = (props) => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();
	const responseGoogle = async (authResult) => {
		try {
			if (authResult["code"]) {
				const result = await googleAuth(authResult.code);
				const {email, name, image} = result.data.user;
				const token = result.data.token;
				const obj = {email,name, token, image};
				localStorage.setItem('user-info',JSON.stringify(obj));
				navigate('/dashboard');
			} else {
				console.log(authResult);
				throw new Error(authResult);
			}
		} catch (e) {
			console.log('Error while Google Login...', e);
		}
	};

	const googleLogin = useGoogleLogin({
		onSuccess: responseGoogle,
		onError: responseGoogle,
		flow: "auth-code",
	});

	const RingIcon = (props) => (
        <svg 
            className={props.className} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2.5" />
            <path 
                d="M12 2V6M22 12H18M12 22V18M2 12H6" 
                stroke="#FCD34D" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M16 8L18 6M8 16L6 18M16 16L18 18M8 8L6 6" 
                stroke="#FCD34D" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );

	return (
		 <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white font-inter">
            
           
            <div className="w-full max-w-lg p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl border-4 border-amber-600/50 transform transition duration-500 hover:shadow-amber-500/30">
                
          
                <div className="text-center space-y-2">
                    <RingIcon className="mx-auto w-16 h-16 text-amber-500 animate-pulse-slow" />
                    <h1 className="text-5xl font-extrabold tracking-tight text-amber-500 uppercase font-serif">
                        The Ringmaster's
                    </h1>
                    <h2 className="text-3xl font-bold text-gray-200">
                        Roundtable
                    </h2>
                    <p className="text-amber-300 pt-2 text-lg italic">
                        start planning your trip
                    </p>
                </div>

        
                <div className="pt-6">
                    <button 
                        onClick={googleLogin}
                        
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-bold text-gray-900 
                                   bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 
                                   transition duration-300 transform active:scale-95 ease-in-out uppercase 
                                   hover:shadow-xl hover:shadow-amber-500/40"
                        aria-label="Sign in with Google"
                    >
              
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            className="w-6 h-6 mr-3"
                        >
                            <path fillRule="evenodd" d="M10.788 3.212c.404-1.152 1.77-1.152 2.176 0l2.42 6.908a1.5 1.5 0 001.278.96h7.288c1.233 0 1.731 1.637.78 2.316l-5.969 4.332a1.5 1.5 0 00-.54 1.656l2.08 6.55c.394 1.24-.954 2.235-2.062 1.517l-6.837-4.708a1.5 1.5 0 00-1.724 0l-6.836 4.708c-1.108.718-2.456-.277-2.063-1.517l2.08-6.55a1.5 1.5 0 00-.54-1.656L.778 13.488c-.95-0.679-.452-2.316.78-2.316h7.288a1.5 1.5 0 001.278-.96l2.42-6.908z" clipRule="evenodd" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>

        
                <p className="text-center text-sm text-gray-500 pt-4">
                    <span className="text-amber-600 font-semibold">Security first.</span> No lions, tigers, or bears. Just safe sign-in.
                </p>

            </div>
        </div>
	);
};

export default GoolgeLogin;