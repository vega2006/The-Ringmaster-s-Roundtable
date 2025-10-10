import { useTrip } from "../contexts/TripContext";
import { TABS } from "../utils/PromptBasedConstants";

export default function PromptBasedSidebar() {
  const { activeTab, setActiveTab, isResultAvailable } = useTrip();

  return (
    <aside className="bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0f172a] border-r border-gray-800 py-6 px-4 w-64 flex flex-col shadow-xl overflow-y-auto scrollbar-thin scrollbar-thumb-sky-600 scrollbar-track-sky-900">
      <h2 className="text-2xl font-semibold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-pink-400 to-green-400">
        ✨ Navigation
      </h2>

      <nav className="flex flex-col space-y-3">
        {TABS.map((tab) => {
          const isDisabled = tab !== "Plan" && !isResultAvailable;
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              disabled={isDisabled}
              onClick={() => !isDisabled && setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-medium text-left transition-all duration-300 shadow-md
                ${
                  isActive
                    ? "bg-gradient-to-r from-sky-500 via-pink-500 to-green-500 text-white shadow-lg scale-[1.02]"
                    : "bg-gray-800 text-gray-300 hover:bg-gradient-to-r hover:from-sky-900 hover:via-pink-900 hover:to-green-900 hover:text-white"
                }
                ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {tab}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
