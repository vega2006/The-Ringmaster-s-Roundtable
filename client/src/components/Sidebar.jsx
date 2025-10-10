import { useTrip } from "../contexts/TripContext";
import { TABS } from "../utils/constants";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { activeTab, setActiveTab, isResultAvailable } = useTrip();
  const navigate = useNavigate(); // ✅ Needed for navigation

  return (
    <aside className="bg-sky-50 border-r border-sky-200 py-6 px-4 flex flex-col justify-between h-full">
      {/* Tabs Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-sky-700">📍 Navigation</h2>
        <nav className="flex flex-col space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              disabled={tab !== "Plan" && !isResultAvailable}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-left rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? "bg-sky-500 text-white shadow"
                  : "hover:bg-sky-100 text-sky-800"
              } ${tab !== "Plan" && !isResultAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6 flex flex-col space-y-3">
  <button
    onClick={() => navigate("/comparetwodestination")}
    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-sky-400 to-sky-600 
               text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200"
  >
    <span>🗺️</span>
    <span>Compare Two Destinations</span>
  </button>

  <button
    onClick={() => navigate("/prompt")}
    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-sky-400 to-sky-600 
               text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200"
  >
    <span>💡</span>
    <span>Plan Trip with Prompt</span>
  </button>
</div>

    </aside>
  );
}
