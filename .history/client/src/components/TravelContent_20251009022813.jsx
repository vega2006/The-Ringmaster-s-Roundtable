import { useTrip } from "../contexts/TripContext";

export default function TravelContent() {
  const { manualRoute } = useTrip();

  if (!manualRoute) return <p className="text-gray-500">No route details yet.</p>;

  const { origin, destination, routes } = manualRoute;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-sky-700">🚗 Travel Routes</h2>
      <p><strong>Origin:</strong> {origin}</p>
      <p><strong>Destination:</strong> {destination}</p>

      {routes && Object.keys(routes).map((mode) => (
        <div key={mode} className="p-4 bg-sky-50 rounded-lg shadow-sm">
          <p><strong>Mode:</strong> {mode}</p>
          {routes[mode].error ? (
            <p className="text-red-500">Error fetching route: {routes[mode].error}</p>
          ) : (
            <>
              <p><strong>Distance:</strong> {routes[mode].distance}</p>
              <p><strong>Duration:</strong> {routes[mode].duration}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
