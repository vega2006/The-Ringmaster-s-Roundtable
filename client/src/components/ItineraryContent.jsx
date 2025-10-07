// src/components/Itinerary.jsx
import React, { useState } from "react";
import axios from "axios";
import { useTrip } from "../contexts/TripContext";
import { getItinerary } from "../api/api";

export default function Itinerary() {
  const { destination, startTravelDate, endTravelDate } = useTrip();
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateItinerary = async () => {
    if (!destination || !startTravelDate || !endTravelDate) {
      setError("Please fill destination and both travel dates first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setItinerary([]);

      const res = await getItinerary(destination, startTravelDate, endTravelDate);

      setItinerary(res.data.itinerary || []);
    } catch (err) {
      console.error(err);
      setError("Failed to generate itinerary. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📅 Day-by-Day Itinerary</h2>

      <div className="flex items-center gap-4 mb-6">
        <p>
          <strong>Destination:</strong> {destination || "—"}
        </p>
        <p>
          <strong>From:</strong> {startTravelDate || "—"}
        </p>
        <p>
          <strong>To:</strong> {endTravelDate || "—"}
        </p>
      </div>

      <button
        onClick={handleGenerateItinerary}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Itinerary"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {itinerary.length > 0 && (
        <div className="mt-6 space-y-4">
          {itinerary.map((day) => (
            <div
              key={day.day}
              className="p-4 border rounded-lg shadow bg-white hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-2">Day {day.day}</h3>
              <ul className="space-y-1">
                <li>🌅 <strong>Morning:</strong> {day.morning}</li>
                <li>🌞 <strong>Afternoon:</strong> {day.afternoon}</li>
                <li>🌙 <strong>Evening:</strong> {day.evening}</li>
              </ul>
            </div>
          ))}
        </div>
      )}

      {!loading && itinerary.length === 0 && !error && (
        <p className="mt-6 text-gray-600">
          👆 Click <strong>Generate Itinerary</strong> to plan your trip day by day.
        </p>
      )}
    </div>
  );
}
