import { Sun, Cloud } from "lucide-react";

export const mockGetForecast = (city,travelDate) => ({
  city,
  forecast: [
    { date: "Day 1", temp: 24, condition: "Sunny", icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { date: "Day 2", temp: 22, condition: "Partly Cloudy", icon: <Cloud className="w-5 h-5 text-gray-400" /> },
    { date: "Day 3", temp: 18, condition: "Light Rain", icon: <Cloud className="w-5 h-5 text-blue-500" /> },
  ],
});

export const mockGetRoute = (origin, destination, travelDate) => ({
  origin,
  destination,
  distance: "450 km",
  duration: "4 hours 30 mins",
  transport: "Driving",
});
