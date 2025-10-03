// import { useState, useMemo, createContext, useContext } from "react";
// import { Smile, Globe, Compass, Sun, DollarSign, ListChecks, MapPin, Clock, Calendar, Check, AlertTriangle, Plane, Hotel, Cloud, Send, Loader2 } from 'lucide-react';

// // --- Configuration and Mock Data (MCP/Gemini API Setup) ---
// const API_KEY = "" // API Key is typically handled by the environment (Canvas)
// const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

// // Updated TABS array to reflect the Sidebar navigation structure
// const TABS = ['Plan', 'Itinerary', 'Budget', 'Travel', 'Weather', 'Events'];

// // Define the required structured output for the LLM (MCP)
// const RESPONSE_SCHEMA = {
//     type: "OBJECT",
//     properties: {
//         destination: { type: "STRING", description: "The main city/region for the trip." },
//         duration_days: { type: "NUMBER", description: "Total number of days in the trip." },
//         summary: { type: "STRING", description: "A one-sentence cheerful summary of the proposed plan." },
        
//         itinerary: { 
//             type: "ARRAY",
//             items: {
//                 type: "OBJECT",
//                 properties: {
//                     day: { type: "NUMBER" },
//                     date: { type: "STRING", description: "Formatted date (e.g., Oct 5th)" },
//                     activities: { 
//                         type: "ARRAY",
//                         items: { type: "STRING" },
//                         description: "A list of 3-5 activities, including travel and key meals."
//                     }
//                 }
//             }
//         },
        
//         budget_estimate: { 
//             type: "OBJECT",
//             properties: {
//                 flights: { type: "NUMBER", description: "Estimated cost in USD for transport (flights/trains)." },
//                 accommodation: { type: "NUMBER", description: "Estimated cost in USD for lodging." },
//                 activities: { type: "NUMBER", description: "Estimated cost in USD for events/tours." },
//                 food_per_day: { type: "NUMBER", description: "Estimated food cost per person per day in USD." }
//             }
//         },
        
//         travel_options: {
//             type: "OBJECT",
//             properties: {
//                 best_transport: { type: "STRING", description: "Detailed recommendation: Flights vs Train vs Car." },
//                 flight_summary: { type: "STRING", description: "Example flight/train deal overview or cost." },
//                 hotel_suggestion: { type: "STRING", description: "Name/type of a suggested, suitable hotel deal." }
//             }
//         },
        
//         events_and_notes: {
//             type: "ARRAY",
//             items: { type: "STRING" },
//             description: "A list of 2-3 key local events, festivals, or important travel notes for the trip dates."
//         }
//     }
// };

// // --- Mock API Functions for Simple Manual Lookups ---

// const mockGetForecast = (city) => {
//     return {
//         city: city || "Global Weather",
//         forecast: [
//             { date: "Day 1", temp: 24, condition: "Sunny", icon: <Sun className="w-5 h-5 text-yellow-500" /> },
//             { date: "Day 2", temp: 22, condition: "Partly Cloudy", icon: <Cloud className="w-5 h-5 text-gray-400" /> },
//             { date: "Day 3", temp: 18, condition: "Light Rain", icon: <Cloud className="w-5 h-5 text-blue-500" /> },
//         ]
//     };
// };

// const mockGetRoute = (origin, destination) => {
//     return {
//         origin: origin,
//         destination: destination,
//         distance: "450 km",
//         duration: "4 hours 30 mins",
//         transport: "Driving",
//     };
// };


// // --- 1. Context Setup ---

// const TripContext = createContext(null);

// const useTrip = () => {
//     const context = useContext(TripContext);
//     if (!context) {
//         throw new Error('useTrip must be used within a TripProvider');
//     }
//     return context;
// };


// // --- Reusable Components ---

// const Card = ({ children, title, icon }) => (
//     <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border-b-4 border-amber-300 w-full min-h-[500px]">
//         <h2 className="text-2xl sm:text-3xl font-bold text-sky-600 mb-6 flex items-center">
//             {icon}
//             <span className="ml-3">{title}</span>
//         </h2>
//         {children}
//     </div>
// );

// const BudgetRow = ({ label, value, color }) => (
//     <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg">
//         <span className={`font-medium ${color}`}>{label}</span>
//         <span className="text-lg font-semibold text-gray-800">${value.toLocaleString()}</span>
//     </div>
// );

// // --- Component Implementations using Context ---

// const AppHeader = () => (
//     <div className="w-full max-w-6xl text-center pt-8 pb-4">
//         <h1 className="text-4xl sm:text-5xl font-extrabold text-sky-700 drop-shadow-lg leading-tight">
//             <Globe className="inline-block w-8 h-8 sm:w-10 sm:h-10 mr-4 text-amber-500" />
//             The Ringmaster's Roundtable
//         </h1>
//         <p className="text-lg sm:text-xl text-gray-600 mt-2">Your AI powered personalised Adventure Planner.</p>
//     </div>
// );

// const Sidebar = () => {
//     const { activeTab, setActiveTab, isResultAvailable, isLoading } = useTrip();

//     const getIcon = (tab) => {
//         switch (tab) {
//             case 'Plan': return <Send className="w-5 h-5" />;
//             case 'Itinerary': return <ListChecks className="w-5 h-5" />;
//             case 'Budget': return <DollarSign className="w-5 h-5" />;
//             case 'Travel': return <Plane className="w-5 h-5" />;
//             case 'Weather': return <Sun className="w-5 h-5" />;
//             case 'Events': return <MapPin className="w-5 h-5" />;
//             default: return <Smile className="w-5 h-5" />;
//         }
//     };

//     return (
//         <div className="w-full md:w-auto p-4 md:p-6 bg-sky-800 md:bg-sky-700 rounded-b-xl md:rounded-l-2xl md:rounded-r-none shadow-xl flex md:flex-col justify-around md:justify-start overflow-x-auto space-x-2 md:space-x-0 md:space-y-4">
//             {TABS.map((tab) => {
//                 const isDisabled = tab !== 'Plan' && !isResultAvailable;
                
//                 return (
//                     <button
//                         key={tab}
//                         onClick={() => !isDisabled && setActiveTab(tab)}
//                         disabled={isDisabled || isLoading}
//                         className={`flex items-center justify-center md:justify-start w-auto md:w-full py-2 px-3 rounded-lg transition-all text-sm whitespace-nowrap 
//                             ${activeTab === tab 
//                                 ? 'bg-amber-400 text-sky-900 font-bold shadow-md' 
//                                 : 'text-sky-100 hover:bg-sky-600 md:hover:bg-sky-600'
//                             }
//                             ${(isDisabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
//                         `}
//                     >
//                         {getIcon(tab)}
//                         <span className="hidden md:inline ml-3">{tab}</span>
//                     </button>
//                 );
//             })}
//         </div>
//     );
// };

// const MainContent = ({ children }) => (
//     <div className="p-4 sm:p-8 bg-white overflow-y-auto">
//         <div className="w-full max-w-3xl mx-auto">
//             {children}
//         </div>
//     </div>
// );

// const PlanInput = () => {
//     const { 
//         prompt, setPrompt, city, setCity, origin, setOrigin, destination, 
//         setDestination, travelDate, setTravelDate, generateTripPlan, 
//         isLoading, error, isLLMPlanning 
//     } = useTrip();

//     return (
//         <Card title="Start Your Journey" icon={<Clock className="w-8 h-8"/>}>
//             {error && (
//                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex items-center rounded-lg" role="alert">
//                     <AlertTriangle className="w-5 h-5 mr-3"/>
//                     <p className="font-semibold">Error: {error}</p>
//                 </div>
//             )}
            
//             {/* MANUAL MODE */}
//             <h3 className="text-lg font-bold text-sky-700 mb-2 mt-4 border-b-2 border-sky-100 pb-1">1. Manual Lookups (Quick Weather & Route)</h3>
//              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//                 <input
//                     type="text"
//                     placeholder="City for Weather/Destination"
//                     value={city}
//                     onChange={(e) => setCity(e.target.value)}
//                     className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all placeholder:text-gray-400 text-lg"
//                 />
//                 <input
//                     type="date"
//                     placeholder="Travel Start Date"
//                     value={travelDate}
//                     onChange={(e) => setTravelDate(e.target.value)}
//                     className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all placeholder:text-gray-400 text-lg"
//                 />
//                 <input
//                     type="text"
//                     placeholder="Travel Origin (for Route)"
//                     value={origin}
//                     onChange={(e) => setOrigin(e.target.value)}
//                     className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all placeholder:text-gray-400 text-lg"
//                 />
//                 <input
//                     type="text"
//                     placeholder="Travel Destination (for Route)"
//                     value={destination}
//                     onChange={(e) => setDestination(e.target.value)}
//                     className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all placeholder:text-gray-400 text-lg"
//                 />
//             </div>
            
//             {/* PROMPT MODE */}
//             <h3 className="text-lg font-bold text-sky-700 mb-2 mt-4 border-b-2 border-sky-100 pb-1">2. Prompt Mode (Full Trip Planning using MCP)</h3>
//             <textarea
//                 placeholder="Example: Plan a 4-day trip to Kyoto in November for two people, focusing on temples and authentic local food. Budget around $2000."
//                 value={prompt}
//                 onChange={(e) => setPrompt(e.target.value)}
//                 rows="4"
//                 className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all placeholder:text-gray-400 text-lg resize-none"
//             />
//             <button
//                 onClick={generateTripPlan}
//                 disabled={isLoading}
//                 className={`w-full mt-4 py-4 rounded-xl font-bold text-xl active:scale-[0.98] transition-all shadow-lg hover:shadow-xl 
//                     ${isLoading 
//                         ? 'bg-gray-400 text-white cursor-not-allowed' 
//                         : 'bg-emerald-500 text-white hover:bg-emerald-600'
//                     }`}
//             >
//                 <Smile className="inline-block w-6 h-6 mr-2" />
//                 {isLLMPlanning ? 'Generate Full Trip Plan (MCP)' : 'Perform Quick Lookup'}
//             </button>
//         </Card>
//     );
// };

// const WeatherContent = () => {
//     const { tripPlan, manualWeather } = useTrip();

//     // Determine which data to show: LLM (tripPlan) or Manual (manualWeather)
//     const weatherData = tripPlan ? mockGetForecast(tripPlan.destination) : manualWeather;
    
//     if (!weatherData) return <div className="text-center text-gray-500 p-8">No weather data available. Enter a city in the Plan tab.</div>;

//     return (
//         <Card title={`Forecast for ${weatherData.city}`} icon={<Sun className="w-8 h-8"/>}>
//             <div className="space-y-3">
//                 {weatherData.forecast.map((f, i) => (
//                     <div
//                         key={i}
//                         className="flex justify-between items-center bg-sky-50 p-4 rounded-xl border-l-4 border-sky-400 text-gray-700"
//                     >
//                         <span className="font-semibold flex items-center">
//                             {f.icon}
//                             <span className="ml-2">{f.date}</span>
//                         </span>
//                         <div className="flex items-center space-x-4">
//                             <span className="text-xl font-bold text-sky-800">{f.temp}°C</span>
//                             <span className="text-gray-500 hidden sm:inline">{f.condition}</span>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </Card>
//     );
// };

// const TravelContent = () => {
//     const { tripPlan, manualRoute } = useTrip();

//     if (!tripPlan && !manualRoute) return <div className="text-center text-gray-500 p-8">No travel/route information generated yet.</div>;
    
//     const travelOptions = tripPlan?.travel_options;
//     let routeData;
    
//     if (tripPlan) {
//          routeData = { 
//             summary: travelOptions.best_transport, 
//             flight: travelOptions.flight_summary, 
//             hotel: travelOptions.hotel_suggestion 
//         };
//     } else if (manualRoute) {
//          routeData = { 
//             summary: `Route from ${manualRoute.origin} to ${manualRoute.destination}: ${manualRoute.duration} via ${manualRoute.transport}`, 
//             flight: null, 
//             hotel: null 
//         };
//     } else {
//         return <div className="text-center text-gray-500 p-8">No travel/route information generated yet.</div>;
//     }

//     return (
//         <Card title="Travel Options & Deals" icon={<Plane className="w-8 h-8"/>}>
            
//             <h3 className="text-xl font-extrabold text-sky-600 flex items-center mb-3 border-b pb-2 border-amber-100">
//                 <Compass className="w-5 h-5 mr-3"/>
//                 Transportation Recommendation (Route/Mode)
//             </h3>
//             <p className="text-gray-700 mb-6 bg-sky-50 p-3 rounded-lg border-l-4 border-sky-400">
//                 {routeData.summary}
//             </p>

//             {routeData.flight && (
//                 <div className="mb-6">
//                     <h3 className="text-xl font-extrabold text-amber-600 flex items-center mb-3">
//                         <Plane className="w-5 h-5 mr-3"/>
//                         Flight/Train Overview
//                     </h3>
//                     <p className="text-gray-700">{routeData.flight}</p>
//                 </div>
//             )}
            
//             {routeData.hotel && (
//                 <div>
//                     <h3 className="text-xl font-extrabold text-amber-600 flex items-center mb-3">
//                         <Hotel className="w-5 h-5 mr-3"/>
//                         Suggested Accommodation Deal
//                     </h3>
//                     <p className="text-gray-700">{routeData.hotel}</p>
//                 </div>
//             )}
//         </Card>
//     );
// };

// const ItineraryContent = () => {
//     const { tripPlan } = useTrip();

//     if (!tripPlan || !tripPlan.itinerary) return <div className="text-center text-gray-500 p-8">No itinerary generated yet. Please use the Prompt field in the Plan tab.</div>;

//     return (
//         <Card title={`Itinerary: ${tripPlan.destination} (${tripPlan.duration_days} Days)`} icon={<ListChecks className="w-8 h-8"/>}>
//             <p className="text-gray-600 italic mb-6">
//                 "{tripPlan.summary}"
//             </p>
//             {tripPlan.itinerary.map((day, index) => (
//                 <div key={index} className="mb-6 p-4 border-b border-sky-100 last:border-b-0">
//                     <h3 className="text-xl font-extrabold text-amber-600 flex items-center mb-3">
//                         <Calendar className="w-5 h-5 mr-3"/>
//                         Day {day.day}: {day.date}
//                     </h3>
//                     <ul className="list-none space-y-2 pl-0">
//                         {day.activities.map((activity, aIndex) => (
//                             <li key={aIndex} className="flex items-start text-gray-700">
//                                 <Check className="w-4 h-4 mt-1 mr-3 text-emerald-500 flex-shrink-0" />
//                                 <span>{activity}</span>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             ))}
//         </Card>
//     );
// };

// const EventsContent = () => {
//     const { tripPlan } = useTrip();
    
//     if (!tripPlan || !tripPlan.events_and_notes) return <div className="text-center text-gray-500 p-8">No key events or notes generated yet. Please use the Prompt field in the Plan tab.</div>;
    
//     return (
//         <Card title={`Key Events & Local Notes for ${tripPlan.destination}`} icon={<MapPin className="w-8 h-8"/>}>
//             <h4 className="text-lg font-bold mt-2 text-sky-700 flex items-center border-b pb-2 border-amber-100">
//                 <MapPin className="w-5 h-5 mr-2" />
//                 Important Things Happening During Your Trip
//             </h4>
//             <ul className="list-disc list-inside space-y-3 text-gray-700 mt-4 text-lg">
//                 {tripPlan.events_and_notes.map((note, i) => (
//                     <li key={i}>{note}</li>
//                 ))}
//             </ul>
//             <p className="mt-6 text-sm text-gray-500 italic">
//                 *Event information is generated using **MCP/Google Search** and should be verified before booking.*
//             </p>
//         </Card>
//     );
// };

// const BudgetContent = () => {
//     const { tripPlan } = useTrip();

//     if (!tripPlan || !tripPlan.budget_estimate) return <div className="text-center text-gray-500 p-8">No budget generated yet. Please use the Prompt field in the Plan tab.</div>;

//     const budget = tripPlan.budget_estimate;
//     const totalEstimate = budget.flights + budget.accommodation + budget.activities + (budget.food_per_day * tripPlan.duration_days);

//     return (
//         <Card title="Budget Estimate (USD)" icon={<DollarSign className="w-8 h-8"/>}>
//             <div className="space-y-3">
//                 <BudgetRow label="✈️ Flights/Transport" value={budget.flights} color="text-sky-700" />
//                 <BudgetRow label="🏠 Accommodation" value={budget.accommodation} color="text-sky-700" />
//                 <BudgetRow label="🎟️ Activities/Tours" value={budget.activities} color="text-sky-700" />
//                 <BudgetRow label="🍔 Food (Per Day)" value={budget.food_per_day} color="text-sky-700" />
//             </div>
//             <div className="mt-6 pt-4 border-t-2 border-amber-300 flex justify-between items-center">
//                 <span className="text-xl font-extrabold text-sky-800">Total Estimated Trip Cost ({tripPlan.duration_days} days)</span>
//                 <span className="text-2xl font-extrabold text-emerald-600">${totalEstimate.toLocaleString()}</span>
//             </div>
//         </Card>
//     );
// };

// // --- 2. Trip Provider (Global State Logic) ---

// const TripProvider = ({ children }) => {
//     // LLM State
//     const [prompt, setPrompt] = useState("");
//     const [tripPlan, setTripPlan] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
    
//     // Manual Input State
//     const [city, setCity] = useState("");
//     const [origin, setOrigin] = useState("");
//     const [destination, setDestination] = useState("");
//     const [travelDate, setTravelDate] = useState("");
    
//     // UI State
//     const [activeTab, setActiveTab] = useState('Plan');
    
//     // State for simple manual API results
//     const [manualWeather, setManualWeather] = useState(null);
//     const [manualRoute, setManualRoute] = useState(null);
    
//     // Derived States
//     const isLLMPlanning = useMemo(() => prompt.trim().length > 0, [prompt]);
//     const isManualLookup = useMemo(() => !isLLMPlanning && (city || (origin && destination)), [isLLMPlanning, city, origin, destination]);
//     const isResultAvailable = tripPlan || manualWeather || manualRoute;
    
//     // System Instruction for the LLM
//     const systemInstruction = `You are a world-class, cheerful trip planner AI (MCP). Given the user's prompt, destination, and dates, generate a detailed, structured trip plan. If the user does not specify the duration, **assume 3 days**. Use the Google Search tool for current events and realistic travel/budget estimates. Provide costs in USD.`;

//     const generateTripPlan = async () => {
//         if (!isLLMPlanning && !isManualLookup) {
//             setError("Please enter a detailed prompt OR fill out the City/Route fields.");
//             return;
//         }

//         setIsLoading(true);
//         setError(null);
//         setTripPlan(null);
//         setManualWeather(null);
//         setManualRoute(null);
        
//         // --- Case 1: Complex Planning via LLM (MCP) ---
//         if (isLLMPlanning) {
//             setActiveTab('Itinerary'); // Switch to a primary results tab
            
//             // Augment the prompt with manual inputs for better grounding
//             let fullPrompt = prompt;
//             if (city) fullPrompt += ` (Focus City: ${city})`;
//             if (origin && destination) fullPrompt += ` (Route: ${origin} to ${destination})`;
//             if (travelDate) fullPrompt += ` (Starting Date: ${travelDate})`;
            
//             const payload = {
//                 contents: [{ parts: [{ text: fullPrompt }] }],
//                 systemInstruction: { parts: [{ text: systemInstruction }] },
//                 generationConfig: {
//                     responseMimeType: "application/json",
//                     responseSchema: RESPONSE_SCHEMA
//                 },
//                 tools: [{ "google_search": {} }], 
//             };

//             try {
//                 const response = await fetch(API_URL, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(payload)
//                 });

//                 if (!response.ok) {
//                     throw new Error(`API call failed: ${response.statusText}`);
//                 }

//                 const result = await response.json();
//                 const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
                
//                 if (jsonText) {
//                     const parsedJson = JSON.parse(jsonText);
//                     setTripPlan(parsedJson);
//                 } else {
//                     setError("Failed to generate the structured plan. The response format was incorrect.");
//                 }

//             } catch (err) {
//                 console.error("Fetch error:", err);
//                 setError(`Failed to process the plan (MCP Error): ${err.message}.`);
//             }
        
//         // --- Case 2: Simple Manual Lookup (No LLM needed) ---
//         } else if (isManualLookup) {
//             setActiveTab('Weather'); // Default to weather for simple lookups
            
//             // Run simplified mock API logic
//             if (city) {
//                 setManualWeather(mockGetForecast(city));
//             }
//             if (origin && destination) {
//                 setManualRoute(mockGetRoute(origin, destination));
//             }
//         }
        
//         setIsLoading(false);
//     };

//     const contextValue = {
//         // UI & Status
//         activeTab, setActiveTab, isLoading, error, isResultAvailable,
//         // Inputs
//         prompt, setPrompt, city, setCity, origin, setOrigin, destination, 
//         setDestination, travelDate, setTravelDate,
//         // Results & Actions
//         tripPlan, manualWeather, manualRoute, generateTripPlan,
//         isLLMPlanning, isManualLookup
//     };

//     return (
//         <TripContext.Provider value={contextValue}>
//             {children}
//         </TripContext.Provider>
//     );
// };


// // --- 3. Main Application Structure (uses Provider) ---

// const ContentRouter = () => {
//     const { activeTab, isLoading } = useTrip();

//     if (isLoading) {
//         return (
//             <div className="text-center p-12 text-sky-600">
//                 <Loader2 className="animate-spin h-10 w-10 mx-auto mb-4"/>
//                 <p className="text-lg font-semibold">Generating plan using **MCP/Gemini API**...</p>
//             </div>
//         );
//     }
    
//     switch (activeTab) {
//         case 'Plan':
//             return <PlanInput />;
//         case 'Weather':
//             return <WeatherContent />;
//         case 'Itinerary':
//             return <ItineraryContent />;
//         case 'Budget':
//             return <BudgetContent />;
//         case 'Travel':
//             return <TravelContent />;
//         case 'Events':
//             return <EventsContent />;
//         default:
//             return null;
//     }
// };

// const App = () => {
//     return (
//         <TripProvider>
//             <div className="min-h-screen p-0 sm:p-6 bg-gradient-to-br from-sky-100 via-white to-amber-100 flex flex-col items-center justify-start font-inter">
//                 {/* Ensures the Inter font is loaded */}
//                 <style dangerouslySetInnerHTML={{__html: `
//                     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
//                     .font-inter { font-family: 'Inter', sans-serif; }
//                 `}} />
                
//                 {/* Header Component */}
//                 <AppHeader />

//                 {/* Main Layout: Sidebar + Content */}
//                 <div className="w-full max-w-6xl flex-grow grid grid-cols-1 md:grid-cols-[240px_1fr] rounded-2xl shadow-2xl overflow-hidden bg-white mt-4 mb-8">
                    
//                     {/* Sidebar Component */}
//                     <Sidebar />

//                     {/* Main Content Component */}
//                     <MainContent>
//                         <ContentRouter />
//                     </MainContent>
                    
//                 </div>
//             </div>
//         </TripProvider>
//     );
// };

// export default App;


import AppHeader from "./components/AppHeader";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import ContentRouter from "./components/ContentRouter";
import { TripProvider } from "./contexts/TripContext";

export default function App() {
  return (
    <TripProvider>
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-amber-100 font-inter">
        <AppHeader />
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] bg-white shadow-2xl rounded-2xl overflow-hidden mt-4 mb-8">
          <Sidebar />
          <MainContent>
            <ContentRouter />
          </MainContent>
        </div>
      </div>
    </TripProvider>
  );
}
