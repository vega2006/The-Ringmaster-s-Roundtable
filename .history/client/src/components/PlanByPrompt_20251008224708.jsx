import { useState } from "react";
import ReactMarkdown from "react-markdown";

import { useTrip } from "../contexts/TripContext";


export default function PlanByPrompt() {
  const {
    prompt, setPrompt,
    city, setCity,
    origin, setOrigin,
    destination, setDestination,
  } = useTrip();
   const [isLoading,setIsLoading]=useState(false);

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
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      setResult(data.finalResponse.kwargs.content);
      setCity(data.weather.city);
      
    } catch (err) {
      console.error("Error generating trip plan:", err);
      alert("Failed to generate trip plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-10 border border-sky-100">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-sky-700 text-center mb-6">
          🧭 Smart Trip Planner
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Describe your dream trip, and we’ll plan it for you ✈️
        </p>

        {/* Prompt Input */}
        <textarea
          placeholder="Example: 5-day trip to Goa with beaches and cafes"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="5"
          className="w-full p-4 border-2 border-sky-300 rounded-2xl shadow-inner focus:ring-2 focus:ring-sky-500 outline-none text-lg resize-none transition-all duration-200"
        />

        {/* Generate Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={generate}
            disabled={isLoading}
            className={`px-8 py-3 text-lg font-semibold text-white rounded-xl shadow-lg transition-all duration-300 ${
              isLoading
                ? "bg-sky-400 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
            }`}
          >
            {isLoading ? "Planning..." : "✨ Generate Trip Plan"}
          </button>
        </div>

       {/* Result Display */}
{result && !isLoading && (
  <div className="mt-10 p-6 bg-gradient-to-br from-white via-sky-50 to-blue-50 border border-sky-200 rounded-2xl shadow-inner max-h-[400px] overflow-y-auto transition-all duration-300">
    <h2 className="text-2xl font-bold text-sky-700 mb-4 text-center">
      🗺️ Your Trip Plan
    </h2>
    <div className="prose prose-sky max-w-none text-gray-800 leading-relaxed">
      <ReactMarkdown>{result}</ReactMarkdown>
    </div>
  </div>
)}
      </div>
    </div>
  );
}
