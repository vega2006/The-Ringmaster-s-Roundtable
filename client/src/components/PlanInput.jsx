import { useTrip } from "../contexts/TripContext";

export default function PlanInput() {
  const {
    prompt, setPrompt,
    city, setCity,
    origin, setOrigin,
    destination, setDestination,
    startTravelDate, setStartTravelDate,
    endTravelDate, setEndTravelDate,
    generateTripPlan,
    isLoading, error,
    numPeople, setNumPeople  
  } = useTrip();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-700">🧭 Create Your Trip Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="City (for weather)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-sky-400"
        />
        <div className="flex space-x-2">
          <input
            type="date"
            value={startTravelDate}
            onChange={(e) => setStartTravelDate(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-sky-400"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={endTravelDate}
            onChange={(e) => setEndTravelDate(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-sky-400"
            placeholder="End Date"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-sky-400"
        />
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-sky-400"
        />
        <input
          type="number"
          min="1"
          value={numPeople}
          onChange={(e) => setNumPeople(e.target.value)}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-sky-400"
          placeholder="Number of People"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={generateTripPlan}
        disabled={isLoading}
        className="bg-sky-500 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-sky-600 transition-all"
      >
        {isLoading ? "Planning..." : "Generate Trip Plan"}
      </button>
    </div>
  );
}
