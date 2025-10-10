import { useState, useEffect } from "react";
export default function PlanByPrompt() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [formattedForecast, setFormattedForecast] = useState([]);

  // ✅ Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
        },
        (error) => {
          console.error("Error getting location:", error);
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please allow location access to use this feature.");
          }
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

  // ✅ Generate trip plan
  const generate = async () => {
    if (!prompt.trim()) {
      alert("Please describe your trip before generating!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/mcp-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, location }),
      });

      const data = await response.json();
      setMapData(data);

      const forecastData = data.weather || [];
      const formatted = forecastData.map((item) => ({
        datetime: item.dt_txt,
        weather: item.weather[0]?.description || "N/A",
        wind: `${item.wind.speed} m/s, ${item.wind.deg}°`,
        visibility: `${item.visibility} m`,
        humidity: `${item.main.humidity}%`,
        clouds: `${item.clouds.all}%`,
        temp: `${item.main.temp}°C`,
      }));

      setFormattedForecast(formatted);
    } catch (err) {
      console.error("Error generating trip plan:", err);
      alert("Failed to generate trip plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 p-8 flex flex-col items-center">
      {/* CENTERED PROMPT SECTION */}
      {!mapData && (
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mt-20">
          <h2 className="text-4xl font-bold text-sky-700 mb-6">
            🧭 Smart Trip Planner
          </h2>

          <textarea
            placeholder="Describe your trip... (e.g., 5-day trip to Goa with beaches and cafes)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 border-2 border-sky-300 rounded-2xl shadow-md resize-none focus:ring-2 focus:ring-sky-500 transition-all text-lg"
            rows="5"
          />

          <button
            onClick={generate}
            disabled={isLoading}
            className="mt-6 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-cyan-600 transition-all"
          >
            {isLoading ? "Planning..." : "✨ Generate Trip Plan"}
          </button>
        </div>
      )}
    </div>
  );
}
