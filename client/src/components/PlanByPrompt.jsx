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
    tabId ,
    setImages
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
      console.log("data",data.images);
      setImages(data.images);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-3xl rounded-3xl shadow-2xl bg-gradient-to-br from-blue-900 via-pink-900 to-green-900/80 border border-blue-700 p-10 backdrop-blur-md"
      >
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-center mb-3 text-blue-400">
          🌍 AI Trip Planner
        </h1>
        <p className="text-gray-300 text-center mb-8 text-lg">
          Describe your trip idea — we’ll handle the planning ✈️
        </p>

        {/* Prompt Box */}
        <motion.textarea
          whileFocus={{ scale: 1.02 }}
          placeholder="e.g., A 3-day trip to Manali with adventure and scenic spots"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="5"
          className="w-full p-4 rounded-2xl border-2 border-pink-500 shadow-inner focus:ring-2 focus:ring-green-400 outline-none text-lg resize-none bg-gray-800/60 text-white placeholder-pink-300 transition-all duration-200"
        />

        {/* Generate Button */}
        <div className="flex justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={generate}
            disabled={isLoading}
            className={`px-10 py-3.5 text-lg font-semibold rounded-2xl shadow-md transition-all duration-300 
              ${
                isLoading
                  ? "bg-green-600 cursor-not-allowed text-gray-200"
                  : "bg-gradient-to-r from-blue-500 via-pink-500 to-green-500 text-white hover:shadow-lg"
              }`}
          >
            {isLoading ? "Planning your adventure..." : "✨ Generate My Trip"}
          </motion.button>
        </div>

        {/* Decorative Glow */}
        <div className="absolute -z-10 inset-0 rounded-3xl blur-3xl opacity-50 bg-gradient-to-r from-blue-700 via-pink-700 to-green-700"></div>
      </motion.div>
    </div>
  );
}
