import React from "react";

export default function PromptBasedEvents() {
  const { events } = useTrip(); // Assuming events is the array you shared

  return (
    <div>
      {events && events.length > 0 && (
        <div className="mt-10 p-6 bg-gradient-to-br from-white via-sky-50 to-blue-50 border border-sky-200 rounded-2xl shadow-inner max-h-[500px] overflow-y-auto transition-all duration-300">
          <h2 className="text-2xl font-bold text-sky-700 mb-4 text-center">
            🎫 Upcoming Events
          </h2>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-xl shadow-sm border border-sky-100 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-sky-700">
                  {event.name}
                </h3>
                <p className="text-gray-600">
                  📅 {event.date} ⏰ {event.time}
                </p>
                <p className="text-gray-600">📍 {event.venue}</p>
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 hover:underline"
                >
                  Buy Tickets
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
