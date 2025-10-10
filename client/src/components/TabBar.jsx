import { useState, useEffect } from "react";
import { Trash2, FolderPlus } from "lucide-react";
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
    setTabId,
  } = useTrip();

  const [tabs, setTabs] = useState([]);
  const [newTabName, setNewTabName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user-info"));
  const userId = userData?.userId;

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
    setSelectedTabId(tab.tabId);
    try {
      const response = await fetch("http://localhost:4000/api/mcp-server/tripDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tripId: tab.tabId }),
      });

      const data = await response.json();

      setOrigin(data?.trip?.origin || "");
      setDestination(data?.trip?.destination || "");
      setManualWeather(data?.trip?.weather || "");
      setItinerary(data?.trip?.itinerary || []);
      setManualRoute({
        origin: data?.trip?.origin || "",
        destination: data?.trip?.destination || "",
        routes: data?.trip?.route || [],
      });
      setActiveTab("Plan");
      setEvents(data?.trip?.events || []);
      setAIResult(data?.trip?.finalResponse?.content || "");
    } catch (err) {
      console.error("Error generating trip plan:", err);
      alert("Failed to load trip details. Please try again.");
    }
  };

  const handleCreateNewTab = async () => {
    if (!newTabName.trim()) return;
    try {
      const res = await fetch("http://localhost:4000/api/tabs/createTab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tabName: newTabName }),
      });
      const data = await res.json();
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
    <aside className="bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] border-l border-sky-700 py-6 px-3 w-64 flex-shrink-0 flex flex-col shadow-lg overflow-hidden">
      {/* Header */}
      <h2 className="text-2xl font-semibold mb-4 text-center bg-gradient-to-r from-green-300 via-sky-400 to-pink-400 bg-clip-text text-transparent">
        🗂 Your Trips
      </h2>

      {/* Tabs List */}
      <div className="flex flex-col space-y-2 mb-4 overflow-y-auto overflow-x-hidden max-h-[60vh] scrollbar-thin scrollbar-thumb-sky-600">
        {tabs.map((tab) => (
          <div
            key={tab.tabId}
            onClick={() => handleTabClick(tab)}
            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group transition-all duration-200 ${
              selectedTabId === tab.tabId
                ? "bg-gradient-to-r from-sky-600 via-pink-500 to-green-500 text-white shadow-md scale-[1.02]"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
          >
            <span className="flex-1 truncate font-medium group-hover:text-white transition-colors duration-150">
              {tab.name}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTab(tab.tabId);
              }}
              disabled={loading}
              className="text-slate-400 hover:text-red-400 transition-all duration-200 p-1 rounded-full hover:bg-slate-700"
              title="Delete Tab"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Create Tab Section */}
      <div className="mt-auto mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="New Trip Name"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 text-slate-100 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-400"
          />
          <FolderPlus
            size={18}
            className="absolute right-3 top-2.5 text-slate-400"
          />
        </div>
        <button
          onClick={handleCreateNewTab}
          className="mt-3 w-full py-2 bg-gradient-to-r from-sky-500 via-pink-500 to-green-500 text-white font-semibold rounded-lg hover:scale-[1.03] active:scale-95 transition-all duration-200 shadow-md"
        >
          + Create Trip
        </button>
      </div>
    </aside>
  );
}
