import { useTrip } from "../contexts/TripContext";
import { TABS } from "../utils/PromptBasedConstants";
import { useState } from "react";

export default function PromptBasedSidebar({ userId }) {
  const { activeTab, setActiveTab, isResultAvailable } = useTrip();
  const [activeTabId, setActiveTabId] = useState(null);
  const [prompt, setPrompt] = useState("");

  const tabIds = ["Trip 1", "Trip 2", "Trip 3"];
  const tripIds = {
    "Trip 1": "trip_001",
    "Trip 2": "trip_002",
    "Trip 3": "trip_003",
  };

  const handlePlan = async () => {
    if (!activeTabId || !prompt) return;

    const tripId = tripIds[activeTabId];

    try {
      const res = await fetch("/api/trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, tripId, prompt }),
      });

      const data = await res.json();
      console.log("Backend response:", data);
    } catch (err) {
      console.error("Error sending plan:", err);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left sidebar: Tab IDs */}
      <aside className="w-36 bg-white shadow-md border-r border-gray-200 py-6 px-3">
        <h2 className="text-lg font-bold mb-4 text-sky-700 flex items-center gap-2">
          <span>📁</span> Trips
        </h2>
        <nav className="flex flex-col space-y-2">
          {tabIds.map((tabId) => (
            <button
              key={tabId}
              onClick={() => setActiveTabId(tabId)}
              className={`px-3 py-2 text-left rounded-lg font-medium transition-all duration-200
                ${activeTabId === tabId ? "bg-sky-500 text-white shadow-lg" : "hover:bg-sky-100 text-sky-800"}
              `}
            >
              {tabId}
            </button>
          ))}
        </nav>
      </aside>

      {/* Right sidebar: TABS */}
      <aside className="flex-1 bg-gray-50 py-6 px-6">
        <h2 className="text-xl font-bold mb-4 text-sky-700 flex items-center gap-2">
          <span>📌</span> Actions
        </h2>
        <nav className="flex flex-col space-y-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              disabled={tab !== "Plan" && !isResultAvailable}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "Plan") handlePlan();
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200
                ${activeTab === tab ? "bg-sky-500 text-white shadow-md" : "hover:bg-sky-100 text-sky-800"}
                ${tab !== "Plan" && !isResultAvailable ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Prompt Input */}
        <div className="mt-6">
          <label className="block mb-2 font-medium text-gray-700">Your Trip Plan Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your dream trip..."
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
            rows={5}
          />
          <button
            onClick={handlePlan}
            className="mt-4 px-6 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-all duration-200 shadow-md"
          >
            ✨ Generate Trip Plan
          </button>
        </div>
      </aside>
    </div>
  );
}
