import { useTrip } from "../contexts/TripContext";
import { TABS } from "../utils/PromptBasedConstants";

export default function Sidebar() {
  const { activeTab, setActiveTab, isResultAvailable } = useTrip();

  return (
    <aside className="bg-sky-50 border-r border-sky-200 py-6 px-4">
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
    </aside>
  );
}
