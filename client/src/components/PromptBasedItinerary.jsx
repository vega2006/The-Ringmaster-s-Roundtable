import { useTrip } from "../contexts/TripContext";
import React from "react";

export default function PromptBasedItinerary() {
  const { itinerary } = useTrip(); // Assuming itinerary comes from context

  if (!itinerary || !itinerary.itinerary || itinerary.itinerary.length === 0) {
    return <p className="text-gray-500">No itinerary available yet.</p>;
  }

  return (
    <div className="mt-10 p-6 bg-gradient-to-br from-white via-sky-50 to-blue-50 border border-sky-200 rounded-2xl shadow-inner max-h-[500px] overflow-y-auto transition-all duration-300">
      <h2 className="text-2xl font-bold text-sky-700 mb-4 text-center">
        🗺️ Trip Itinerary - {itinerary.destination}
      </h2>
      <div className="space-y-4">
        {itinerary.itinerary.map((dayPlan) => (
          <div
            key={dayPlan.day}
            className="p-4 bg-white rounded-xl shadow-sm border border-sky-100 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-sky-700">
              Day {dayPlan.day}
            </h3>
            <p className="text-gray-600">🌅 Morning: {dayPlan.morning}</p>
            <p className="text-gray-600">☀️ Afternoon: {dayPlan.afternoon}</p>
            <p className="text-gray-600">🌙 Evening: {dayPlan.evening}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
