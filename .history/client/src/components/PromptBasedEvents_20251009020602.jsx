import { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { useTrip } from "../contexts/TripContext";


export default function AIresult() {
  const { events,setEvents} = useTrip();

  return (
    <div>
           {/* Result Display */}
{events && (
  <div className="mt-10 p-6 bg-gradient-to-br from-white via-sky-50 to-blue-50 border border-sky-200 rounded-2xl shadow-inner max-h-[400px] overflow-y-auto transition-all duration-300">
    <h2 className="text-2xl font-bold text-sky-700 mb-4 text-center">
      🗺️ Your Trip Plan
    </h2>
    <div className="prose prose-sky max-w-none text-gray-800 leading-relaxed">
      <ReactMarkdown>{events}</ReactMarkdown>
    </div>
  </div>
)}
    </div>
  );
}
