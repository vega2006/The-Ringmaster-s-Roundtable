
import { Link, useNavigate } from "react-router-dom";

const Home = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  const handleStartPlanning = (e) => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-white to-amber-100">
      <h1 className="text-5xl font-extrabold text-sky-700 mb-4 drop-shadow-lg">
        The Ringmaster's Roundtable
      </h1>
      <p className="text-xl text-gray-600 mb-8">Your Personal AI-powered Adventure Planner</p>
      <div className="flex gap-4">
       
        <Link to="/login" className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg shadow-md hover:bg-emerald-600 transition-colors">
          Sign In
        </Link>

        <button
          onClick={handleStartPlanning}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
        >
          Start Planning Your Trip
        </button>
      </div>
    </div>
  );
};

export default Home;