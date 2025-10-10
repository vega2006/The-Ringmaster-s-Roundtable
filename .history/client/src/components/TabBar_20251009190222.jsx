import { useState, useEffect } from "react";
import { useTrip } from "../contexts/TripContext";

export default function RightSidebar() {
  const { activeTab, setActiveTab,
    manualRoute,origin,
       events,setEvents,
        setOrigin,
        destination,
        setDestination,
        setManualRoute,manualWeather,setManualWeather,AIResult,setAIResult,itinerary,setItinerary, setTabId } = useTrip();
  const [tabs, setTabs] = useState([]);
  const [newTabName, setNewTabName] = useState("");

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

  const handleTabClick = async(tab) => {
    
    try {
        await setTabId(tab.tabId); 
      const response = await fetch("http://localhost:4000/api/mcp-server/tabDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({userId,tabId }),
      });

      const data = await response.json();
     await  setOrigin(data.trip.origin);
      await setDestination(data.trip.destination);
      setManualWeather(data.trip.weather);
      setItinerary(data.trip.itinerary);
    setManualRoute({
  origin,
  destination,
  routes: data.trip.route// entire object returned from backend
});
      setActiveTab("Weather");
      setEvents(data.trip.events);
    } catch (err) {
      console.error("Error generating trip plan:", err);
      alert("Failed to generate trip plan. Please try again.");
    } finally {
      setIsLoading(false);
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
    } catch (err) {
      console.error("Error creating new tab:", err);
    }
  };

  return (
    <aside className="bg-sky-50 border-l border-sky-200 py-6 px-2 w-60 flex-shrink-0 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-sky-700">🗂 Your Tabs</h2>

      <div className="flex flex-col space-y-2 mb-4 overflow-y-auto">
        {tabs.map((tab) => (
          <button
            key={tab.tabId}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 text-left rounded-lg font-medium transition-all ${
              activeTab === tab.name
                ? "bg-sky-500 text-white shadow"
                : "hover:bg-sky-100 text-sky-800"
            }`}
          >
            {tab.name}
          </button>
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
