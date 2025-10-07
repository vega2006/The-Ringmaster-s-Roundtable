import { useEffect, useState, useMemo } from "react";
import { useTrip } from "../contexts/TripContext";
import { getEvents } from "../api/api";

export default function EventsContent() {
  const { destination, startTravelDate, endTravelDate, eventsCache, setEventsCache } = useTrip();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentKey = useMemo(() => {
    if (!destination || !startTravelDate || !endTravelDate) return "";
    return `${destination.toLowerCase().trim()}-${startTravelDate}-${endTravelDate}`;
  }, [destination, startTravelDate, endTravelDate]);

  useEffect(() => {
    if (!currentKey) return;

   
    if (eventsCache[currentKey]) {
      console.log("✅ Using cached events");
      setEvents(eventsCache[currentKey]);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getEvents(destination, startTravelDate, endTravelDate);
        const fetched = response.data?.length ? response.data : [];
        setEvents(fetched);

        setEventsCache((prev) => ({ ...prev, [currentKey]: fetched }));
      } catch (err) {
        console.error("❌ Error fetching events:", err);
        setError("Failed to fetch events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentKey, destination, startTravelDate, endTravelDate, eventsCache, setEventsCache]);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!events.length) return <p>No events found for this date range.</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-sky-700">🎉 Events in {destination}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event) => (
          <div key={event.id} className="border rounded-lg p-4 bg-sky-50 hover:shadow-lg transition-all">
            <h3 className="font-semibold text-lg text-sky-700">{event.name}</h3>
            <p className="text-sm text-gray-600">{event.date}</p>
            <p className="mt-2 text-gray-700">{event.venue}</p>
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sky-600 hover:underline"
            >
              View Details →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
