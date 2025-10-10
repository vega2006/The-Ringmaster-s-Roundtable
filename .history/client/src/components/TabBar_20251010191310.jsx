import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
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
  const [selectedTabId, setSelectedTabId] = useState(null); // ✅ For UI highlight

  const userData = JSON.parse(localStorage.getItem("user-info"));
  const userId = userData?.userId;

  // Fetch all tabs
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
    setSelectedTabId(tab.tabId); // ✅ Reflect in UI
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
      setActiveTab("Plan");
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
      const res=await fetch("http://localhost:4000/api/tabs/createTab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tabName: newTabName }),
      });
      const data=await res.json();
      console.log("tab",data);
      setTabId(data.tabId);
      setSelectedTabId(data.tabId);
         setNewTabName("");
          setActiveTab("Plan");
      setItinerary([]);
      setManualRoute([]);
      setManualWeather(null);
      setDestination("");
      setOrigin("");
      setEvents([]);
      setAIResult(""); 
       
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tabId }),
      });

      setTabs((prev) => prev.filter((t) => t.tabId !== tabId));
      if (selectedTabId === tabId) setSelectedTabId(null);
    } catch (err) {
      console.error("Error deleting tab:", err);
      alert("Failed to delete tab. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="bg-sky-50 border-l border-sky-200 py-6 px-3 w-64 flex-shrink-0 flex flex-col shadow-md transition-all">
      <h2 className="text-xl font-semibold mb-4 text-sky-700 text-center">🗂 Your Tabs</h2>

      <div className="flex flex-col space-y-2 mb-4 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-sky-200">
        {tabs.map((tab) => (
          <div
            key={tab.tabId}
            onClick={() => handleTabClick(tab)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group ${
              selectedTabId === tab.tabId
                ? "bg-sky-100 border border-sky-300 shadow-sm ring-2 ring-sky-400"
                : "hover:bg-sky-100 hover:shadow-sm"
            }`}
          >
            <span className="flex-1 text-left font-medium text-sky-800 truncate group-hover:text-sky-900">
              {tab.name}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTab(tab.tabId);
              }}
              disabled={loading}
              className="text-sky-400 hover:text-red-500 opacity-80 hover:opacity-100 transition-all duration-200 p-1 rounded-full hover:bg-red-50 hover:scale-110"
              title="Delete Tab"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto mb-4">
        <input
          type="text"
          placeholder="New Tab Name"
          value={newTabName}
          onChange={(e) => setNewTabName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 mb-2"
        />
        <button
          onClick={handleCreateNewTab}
          className="w-full px-4 py-2 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 transition-all duration-200"
        >
          + Create Tab
        </button>
      </div>
    </aside>
  );
}
