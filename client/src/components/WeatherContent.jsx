import { useTrip } from "../contexts/TripContext";

export default function WeatherContent() {
  const { manualWeather } = useTrip();

  if (!manualWeather || !manualWeather.forecast) {
    return <p className="text-gray-500">No weather data available yet.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-sky-700">
        ☀️ Weather Forecast - {manualWeather.city}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {manualWeather.forecast.map((f, i) => (
          <div key={i} className="bg-sky-50 p-4 rounded-lg shadow hover:shadow-md transition-all">
            <div className="flex items-center space-x-2 text-sky-600 mb-2">
              {f.icon}
              <span className="font-semibold">{f.date}</span>
            </div>
            <p className="text-lg font-medium">{f.temp}°C</p>
            <p className="text-sm text-gray-600">{f.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}