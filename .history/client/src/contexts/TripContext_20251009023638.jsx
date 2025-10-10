import { createContext, useContext, useState, useMemo } from "react";
import { getWeather, getRoute, getTripBudget } from "../api/api";
import { API_URL, RESPONSE_SCHEMA } from "../utils/constants";

const TripContext = createContext(null);

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error("useTrip must be used within a TripProvider");
  return context;
};
const calculateDuration = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(start + "T00:00:00Z");
  const endDate = new Date(end + "T00:00:00Z");

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;

  const timeDifference = endDate.getTime() - startDate.getTime();

  const dayDifference = Math.round(timeDifference / (1000 * 3600 * 24));

  return Math.max(1, dayDifference + 1);
};
export const TripProvider = ({ children }) => {
  const [events,setEvents]=useState([]);
  const [AIResult,setAIResult]=useState("");
  const [prompt, setPrompt] = useState("");
  const [tripPlan, setTripPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [city, setCity] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startTravelDate, setStartTravelDate] = useState("");
  const [endTravelDate, setEndTravelDate] = useState("");

  const [activeTab, setActiveTab] = useState("Plan");
  const [manualWeather, setManualWeather] = useState(null);
  const [manualRoute, setManualRoute] = useState([]);

  const [eventsCache, setEventsCache] = useState({});
  const [budgetEstimate, setBudgetEstimate] = useState(null);
  const [numPeople, setNumPeople] = useState(1);  

  const isLLMPlanning = useMemo(() => prompt.trim().length > 0, [prompt]);
  const isManualLookup = useMemo(
    () => !isLLMPlanning && (city || (origin && destination)),
    [isLLMPlanning, city, origin, destination]
  );
  const isResultAvailable = tripPlan || manualWeather || manualRoute;

  const generateTripPlan = async () => {
    if (!isLLMPlanning && !isManualLookup) {
      setError(
        "Please enter a detailed prompt OR fill out the City/Route fields."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setTripPlan(null);
    setManualWeather(null);
    setManualRoute(null);

    if (isLLMPlanning) {
      // setActiveTab("Itinerary");
      // let fullPrompt = prompt;
      // if (city) fullPrompt += ` (Focus City: ${city})`;
      // if (origin && destination)
      //   fullPrompt += ` (Route: ${origin} to ${destination})`;
      // if (startTravelDate) fullPrompt += ` (Starting Date: ${startTravelDate})`;

      // const payload = {
      //   contents: [{ parts: [{ text: fullPrompt }] }],
      //   systemInstruction: {
      //     parts: [{ text: "Generate a structured trip plan." }],
      //   },
      //   generationConfig: {
      //     responseMimeType: "application/json",
      //     responseSchema: RESPONSE_SCHEMA,
      //   },
      //   tools: [{ google_search: {} }],
      // };

      // try {
      //   const res = await fetch(API_URL, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(payload),
      //   });

      //   const result = await res.json();
      //   const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      //   setTripPlan(jsonText ? JSON.parse(jsonText) : null);
      // } catch (err) {
      //   setError(`Failed to process the plan: ${err.message}`);
      // }
    } else {
      setActiveTab("Weather");
      const tripDuration = calculateDuration(startTravelDate, endTravelDate);
      setTripPlan({ ...tripPlan, duration_days: tripDuration });
      if (city && startTravelDate) {
        const weatherRes = await getWeather(city, startTravelDate);
        setManualWeather(weatherRes.data);
        // console.log(weatherRes.data);
      }
      if (origin && destination && startTravelDate) {
        const routeRes = await getRoute(origin, destination, startTravelDate);
        setManualRoute({
          
          origin,
          destination,
          routes:routeRes.data,
        });
      }
      if (origin && destination && startTravelDate && endTravelDate) {
            try {
                const tripData = {
                    origin,
                    destination,
                    startTravelDate,
                    endTravelDate,
                   
                    numPeople: numPeople, 
                };
                
               
                const budgetRes = await getTripBudget(tripData);
                // console.log(budgetRes.data);
                
                
                setBudgetEstimate(budgetRes.data); 
                // console.log(budgetEstimate);
                
                setActiveTab("Budget"); 

            } catch (err) {
                console.error("Budget estimation failed:", err);
                setError("Failed to calculate budget. Please check server connection.");
            }
        }
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
        startTravelDate,
        setStartTravelDate,
        endTravelDate,
        setEndTravelDate,
        tripPlan,
        manualWeather,
        setManualWeather,
        manualRoute,
        setManualRoute,
        generateTripPlan,
        isLLMPlanning,
        isManualLookup,
        eventsCache,
        setEventsCache,
        numPeople,
        setNumPeople,
        budgetEstimate,
        setBudgetEstimate,
        events,
        setEvents,
        AIResult,
        setAIResult,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};
