import { useState } from "react";
import { useTrip } from "../contexts/TripContext";
import { motion } from "framer-motion";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function PlanByPrompt() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { 
    setActiveTab, 
    setOrigin, 
    setDestination, 
    setManualWeather, 
    setItinerary, 
    setManualRoute, 
    setEvents, 
    setAIResult, 
    tabId 
  } = useTrip();

  const userData = JSON.parse(localStorage.getItem("user-info"));
  const userId = userData?.userId;

  const generate = async () => {
    if (!prompt.trim()) {
      alert("Please describe your trip before generating!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/mcp-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userId, tripId: tabId }),
      });

      const data = await response.json();
      setOrigin(data.trip.origin);
      setDestination(data.trip.destination);
      setManualWeather(data.trip.weather);
      setItinerary(data.trip.itinerary);
      setManualRoute({
        origin: data.trip.origin,
        destination: data.trip.destination,
        routes: data.trip.route,
      });
      setEvents(data.trip.events);
      setAIResult(data.trip.finalResponse.kwargs.content);
      setActiveTab("Result");
    } catch (err) {
      console.error("Error generating trip plan:", err);
      alert("Failed to generate trip plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-cyan-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-3xl rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-sky-200 p-10"
      >
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-sky-700 text-center mb-3">
          🌍 AI Trip Planner
        </h1>
        <p className="text-gray-600 text-center mb-8 text-lg">
          Describe your trip idea — we’ll handle the planning ✈️
        </p>

        {/* Prompt Box */}
        <motion.textarea
          whileFocus={{ scale: 1.02 }}
          placeholder="e.g., A 3-day trip to Manali with adventure and scenic spots"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="5"
          className="w-full p-4 rounded-2xl border-2 border-sky-300 shadow-inner focus:ring-2 focus:ring-sky-500 outline-none text-lg resize-none bg-white/60 transition-all duration-200 placeholder-gray-400"
        />

        {/* Generate Button */}
        <div className="flex justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={generate}
            disabled={isLoading}
            className={`px-10 py-3.5 text-lg font-semibold text-white rounded-2xl shadow-md transition-all duration-300 
              ${
                isLoading
                  ? "bg-sky-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-sky-500 to-cyan-500 hover:shadow-sky-300 hover:shadow-lg"
              }`}
          >
            {isLoading ? "Planning your adventure..." : "✨ Generate My Trip"}
          </motion.button>
        </div>

        {/* Decorative Glow */}
        <div className="absolute -z-10 inset-0 rounded-3xl blur-3xl opacity-50 bg-gradient-to-r from-sky-200 to-cyan-200"></div>
      </motion.div>
    </div>
  );
}
