import React from "react";
import ReactMarkdown from "react-markdown";
import { useTrip } from "../contexts/TripContext";

export default function PromptBasedEvents() {
  const { events } = useTrip();

  return (
    <div>
      {/* Result Display */}
      {events && events.length > 0 && (
        <div className="mt-10 p-6 bg-gradient-to-br from-white via-sky-50 to-blue-50 border border-sky-200 rounded-2xl shadow-inner max-h-[400px] overflow-y-auto transition-all duration-300">
          <h2 className="text-2xl font-bold text-sky-700 mb-4 text-center">
            🗺️ Your Trip Plan
          </h2>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={index}
                className="prose prose-sky max-w-none text-gray-800 leading-relaxed p-2 bg-white rounded-lg shadow-sm"
              >
                {/* If each event is a string */}
                <ReactMarkdown>{event}</ReactMarkdown>

                {/* If each event is an object with properties like { day, morning, afternoon } */}
                {/* <p><strong>Day {event.day}</strong></p>
                <p>Morning: {event.morning}</p>
                <p>Afternoon: {event.afternoon}</p>
                <p>Evening: {event.evening}</p> */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
