import { useTrip } from "../contexts/TripContext";
import { TABS } from "../utils/PromptBasedConstants";
import { useState } from "react";

export default function PromptBasedSidebar({ userId }) {
  const { activeTab, setActiveTab, isResultAvailable } = useTrip();
  const [activeTabId, setActiveTabId] = useState(null); // left sidebar selection
  const [prompt, setPrompt] = useState("");

  const tabIds = ["Trip 1", "Trip 2", "Trip 3"]; // example tabIds
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
    <div className="flex h-full">
      {/* Left sidebar: Tab IDs */}
      <aside className="w-32 bg-sky-100 border-r border-sky-200 py-6 px-2">
        <h2 className="text-lg font-semibold mb-4 text-sky-700">🗂 Trips</h2>
        <nav className="flex flex-col space-y-2">
          {tabIds.map((tabId) => (
            <button
              key={tabId}
              onClick={() => setActiveTabId(tabId)}
              className={`px-2 py-1 text-left rounded-md font-medium transition-all ${
                activeTabId === tabId
                  ? "bg-sky-500 text-white shadow"
                  : "hover:bg-sky-200 text-sky-800"
              }`}
            >
              {tabId}
            </button>
          ))}
        </nav>
      </aside>

      {/* Right sidebar: TABS */}
      <aside className="w-48 bg-sky-50 border-r border-sky-200 py-6 px-4">
        <h2 className="text-xl font-semibold mb-4 text-sky-700">📍 Actions</h2>
        <nav className="flex flex-col space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              disabled={tab !== "Plan" && !isResultAvailable}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "Plan") handlePlan();
              }}
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

        {/* Optional prompt input */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your plan prompt..."
          className="mt-4 w-full p-2 border border-sky-200 rounded-md resize-none"
          rows={4}
        />
      </aside>
    </div>
  );
}
