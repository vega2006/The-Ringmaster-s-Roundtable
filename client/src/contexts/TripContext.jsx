import { createContext, useContext, useState, useMemo } from "react";
import { getWeather, getRoute } from "../api/api";
import { API_URL, RESPONSE_SCHEMA } from "../utils/constants";

const TripContext = createContext(null);

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error("useTrip must be used within a TripProvider");
  return context;
};

export const TripProvider = ({ children }) => {
  const [prompt, setPrompt] = useState("");
  const [tripPlan, setTripPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [city, setCity] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");

  const [activeTab, setActiveTab] = useState("Plan");
  const [manualWeather, setManualWeather] = useState(null);
  const [manualRoute, setManualRoute] = useState(null);

  const isLLMPlanning = useMemo(() => prompt.trim().length > 0, [prompt]);
  const isManualLookup = useMemo(
    () => !isLLMPlanning && (city || (origin && destination)),
    [isLLMPlanning, city, origin, destination]
  );
  const isResultAvailable = tripPlan || manualWeather || manualRoute;

  const generateTripPlan = async () => {
    if (!isLLMPlanning && !isManualLookup) {
      setError("Please enter a detailed prompt OR fill out the City/Route fields.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTripPlan(null);
    setManualWeather(null);
    setManualRoute(null);

    if (isLLMPlanning) {
      setActiveTab("Itinerary");
      let fullPrompt = prompt;
      if (city) fullPrompt += ` (Focus City: ${city})`;
      if (origin && destination) fullPrompt += ` (Route: ${origin} to ${destination})`;
      if (travelDate) fullPrompt += ` (Starting Date: ${travelDate})`;

      const payload = {
        contents: [{ parts: [{ text: fullPrompt }] }],
        systemInstruction: { parts: [{ text: "Generate a structured trip plan." }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
        tools: [{ google_search: {} }],
      };

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        setTripPlan(jsonText ? JSON.parse(jsonText) : null);
      } catch (err) {
        setError(`Failed to process the plan: ${err.message}`);
      }
    } else {
      setActiveTab("Weather");
      if (city && getWeather) setManualWeather(getWeather(city));
      if (origin && destination && travelDate) setManualRoute(getRoute(origin, destination));
    }

    setIsLoading(false);
  };

  return (
    <TripContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isLoading,
        error,
        isResultAvailable,
        prompt,
        setPrompt,
        city,
        setCity,
        origin,
        setOrigin,
        destination,
        setDestination,
        travelDate,
        setTravelDate,
        tripPlan,
        manualWeather,
        manualRoute,
        generateTripPlan,
        isLLMPlanning,
        isManualLookup,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
