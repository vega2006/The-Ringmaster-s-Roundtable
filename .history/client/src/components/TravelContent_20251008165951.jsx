import { useTrip } from "../contexts/TripContext";

export default function TravelContent() {
  const { manualRoute } = useTrip();

  if (!manualRoute) return <p className="text-gray-500">No route details yet.</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold mb-4 text-sky-700">🚗 Travel Route</h2>
      <p><strong>Origin:</strong> {manualRoute.origin}</p>
      <p><strong>Destination:</strong> {manualRoute.destination}</p>
      <p><strong>Distance:</strong> {manualRoute.distance}</p>
      <p><strong>Duration:</strong> {manualRoute.duration}</p>
      <p><strong>Mode:</strong> {manualRoute.transport}</p>
    </div>
  );
}
