import { useTrip } from "../contexts/TripContext";

// Helper function to get the current date in YYYY-MM-DD format (required for HTML date input min)
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

  // 1. Get today's date
  const today = getTodayDate();
  
  // 2. Determine the minimum end date
  // It must be at least one day after the start date, or today if no start date is selected.
  const minEndDate = startTravelDate ? startTravelDate : today;

  // --- Logic to ensure End Date is cleared if it becomes invalid ---
  const handleStartDateChange = (e) => {
      const newStartDate = e.target.value;
      setStartTravelDate(newStartDate);
      
      // If the currently selected end date is *before* the new start date, clear the end date.
      if (endTravelDate && newStartDate > endTravelDate) {
          setEndTravelDate('');
      }
  };

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
          {/* START DATE LOGIC */}
          <input
            type="date"
            value={startTravelDate}
            onChange={handleStartDateChange} // Use the custom handler
            className="p-3 border rounded-lg focus:ring-2 focus:ring-sky-400"
            placeholder="Start Date"
            // Rule 1: Only dates *after* the current date can be chosen
            min={today} 
          />
          {/* END DATE LOGIC */}
          <input
            type="date"
            value={endTravelDate}
            onChange={(e) => setEndTravelDate(e.target.value)}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-sky-400"
            placeholder="End Date"
            // Rule 2: Only dates *after* the start date can be chosen
            min={minEndDate} 
            // Disable until a start date is picked for better UX
            disabled={!startTravelDate}
          />
        </div>
      </div>

      {/* ... (rest of your component) */}
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