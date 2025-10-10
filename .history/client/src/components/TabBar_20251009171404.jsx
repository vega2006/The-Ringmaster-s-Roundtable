import { useState, useEffect } from "react";
import { useTrip } from "../contexts/TripContext";
import axios from "axios";

export default function RightSidebar({ userId }) {
  const { activeTab, setActiveTab, isResultAvailable } = useTrip();
  const [tabs, setTabs] = useState([]);
  const [newTabName, setNewTabName] = useState("");
  const [prompt, setPrompt] = useState("");

  // Fetch tabs from backend on mount
  useEffect(() => {
    async function fetchTabs() {
      try {
        const response = await axios.get("/api/tabs", { params: { userId } });
        setTabs(response.data); // assuming backend returns [{ tabId, name }]
      } catch (err) {
        console.error("Error fetching tabs:", err);
      }
    }
    fetchTabs();
  }, [userId]);

  // Handle clicking on a tab
  const handleTabClick = async (tab) => {
    setActiveTab(tab.name);
    try {
      await axios.post("/api/tabSelect", { tabId: tab.tabId, userId });
    } catch (err) {
      console.error("Error sending tab selection:", err);
    }
  };

  // Handle sending prompt
  const handleSendPrompt = async () => {
    if (!activeTab) return alert("Select a tab first!");
    try {
      await axios.post("/api/sendPrompt", { userId, tabName: activeTab, prompt });
      setPrompt(""); // clear input after sending
    } catch (err) {
      console.error("Error sending prompt:", err);
    }
  };

  // Handle creating a new tab
  const handleCreateNewTab = async () => {
    if (!newTabName.trim()) return;
    try {
      const response = await axios.post("/api/createTab", { userId, name: newTabName });
      setTabs((prev) => [...prev, response.data]); // add new tab to list
      setNewTabName("");
    } catch (err) {
      console.error("Error creating new tab:", err);
    }
  };

  return (
    <aside className="bg-sky-50 border-l border-sky-200 py-6 px-4 w-80 flex-shrink-0 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-sky-700">🗂 Your Tabs</h2>

      <div className="flex flex-col space-y-2 mb-4 overflow-y-auto">
        {/* {tabs.length!==0&&tabs.map((tab) => (
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
        ))} */}
      </div>

      {/* Create New Tab */}
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

      {/* Prompt Input */}
      <div className="mt-auto">
        <textarea
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-24 px-3 py-2 rounded border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400 mb-2 resize-none"
        />
        <button
          onClick={handleSendPrompt}
          className="w-full px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition"
        >
          Send Prompt
        </button>
      </div>
    </aside>
  );
}
