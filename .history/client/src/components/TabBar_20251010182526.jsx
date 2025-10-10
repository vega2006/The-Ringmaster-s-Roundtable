import { useState, useEffect } from "react";
import { useTrip } from "../contexts/TripContext";

export default function RightSidebar() {
  const { 
    activeTab, setActiveTab,
    manualRoute, origin,
    events, setEvents,
    setOrigin, destination,
    setDestination, setManualRoute,
    manualWeather, setManualWeather,
    AIResult, setAIResult,
    itinerary, setItinerary,
    setTabId
  } = useTrip();

  const [tabs, setTabs] = useState([]);
  const [newTabName, setNewTabName] = useState("");
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user-info"));
  const userId = userData?.userId;

  // Fetch tabs
  useEffect(() => {
    async function fetchTabs() {
      try {
        const response = await fetch("http://localhost:4000/api/tabs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();
        setTabs(data);
      } catch (err) {
        console.error("Error fetching tabs:", err);
      }
    }
    if (userId) fetchTabs();
  }, [userId]);

  const handleTabClick = async (tab) => {
    setTabId(tab.tabId);
    try {
      const response = await fetch("http://localhost:4000/api/mcp-server/tripDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tripId: tab.tabId }),
      });

      const data = await response.json();
      console.log("data", data);

      setOrigin(data.trip.origin);
      setDestination(data.trip.destination);
      setManualWeather(data.trip.weather);
      setItinerary(data.trip.itinerary);
      setManualRoute({
        origin: data.trip.origin,
        destination: data.trip.destination,
        routes: data.trip.route,
      });
      setActiveTab("Weather");
      setEvents(data.trip.events);
      console.log("result", data.trip.finalResponse);
      setAIResult(data.trip.finalResponse.content);
    } catch (err) {
      console.error("Error generating trip plan:", err);
      alert("Failed to load trip details. Please try again.");
    }
  };

  const handleCreateNewTab = async () => {
    if (!newTabName.trim()) return;
    try {
      await fetch("http://localhost:4000/api/tabs/createTab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tabName: newTabName }),
      });
      setNewTabName("");
      // Re-fetch tabs
      const updated = await fetch("http://localhost:4000/api/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setTabs(await updated.json());
    } catch (err) {
      console.error("Error creating new tab:", err);
    }
  };

  const handleDeleteTab = async (tabId) => {
    if (!window.confirm("Are you sure you want to delete this tab?")) return;
    setLoading(true);
    try {
      await fetch("http://localhost:4000/api/tabs/deleteTab", {
        method: "POST", // Change to DELETE if your backend supports it
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tabId }),
      });

      // Update local state
      setTabs((prev) => prev.filter((t) => t.tabId !== tabId));
      if (activeTab === tabId) {
        setActiveTab(null);
      }
    } catch (err) {
      console.error("Error deleting tab:", err);
      alert("Failed to delete tab. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="bg-sky-50 border-l border-sky-200 py-6 px-2 w-60 flex-shrink-0 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-sky-700">🗂 Your Tabs</h2>

      <div className="flex flex-col space-y-2 mb-4 overflow-y-auto">
        {tabs.map((tab) => (
          <div
            key={tab.tabId}
            className={`flex items-center justify-between px-2 py-1 rounded-lg transition-all ${
              activeTab === tab.name ? "bg-sky-100" : "hover:bg-sky-50"
            }`}
          >
            <button
              onClick={() => handleTabClick(tab)}
              className="flex-1 text-left px-2 py-1 font-medium text-sky-800 truncate"
            >
              {tab.name}
            </button>

            <button
              onClick={() => handleDeleteTab(tab.tabId)}
              disabled={loading}
              className="text-red-500 hover:text-red-700 px-2 py-1 text-sm transition"
              title="Delete Tab"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="New Tab Name"
          value={newTabName}
          onChange={(e) => setNewTabName(e.target.value)}
          className="w-full px-3 py-2 rounded border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 mb-2"
        />
        <button
          onClick={handleCreateNewTab}
          className="w-full px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition"
        >
          + Create Tab
        </button>
      </div>
    </aside>
  );
}
