// // import { useState } from "react";
// import { getWeather, getRoute } from "../api/api";
// import { useState, useEffect } from "react";
// import { Smile, Sun, Map, Globe, Clock, Compass } from "lucide-react";

// const Card = ({ children, title, icon }) => (
//   <div className="bg-white p-8 rounded-3xl shadow-2xl border-b-4 border-amber-300 transform transition duration-300 hover:scale-[1.02] active:shadow-xl w-full max-w-xl mx-auto mb-8">
//     <h2 className="text-3xl font-bold text-sky-600 mb-6 flex items-center">
//       {icon}
//       <span className="ml-3">{title}</span>
//     </h2>
//     {children}
//   </div>
// );

// const App = () => {
//   const [city, setCity] = useState("");
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [weather, setWeather] = useState(null);
//   const [route, setRoute] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [travelDate, setTravelDate] = useState("");

//   const fetchData = async () => {
    

//     setIsLoading(true);
//     setWeather(null);
//     setRoute(null);

//     try {
//       if (city) {
//         const weatherRes = await getWeather(city);
//         setWeather(weatherRes.data);
//       }
//       if (origin && destination && travelDate) {
//         // console.log("sdfsd");
        
//     const routeRes = await getRoute(origin, destination, travelDate);
//     setRoute(routeRes.data);
//     // console.log(origin + destination + travelDate);
    
//   }
//     } catch (error) {
//       console.error("Failed to fetch data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gradient-to-br from-sky-100 via-white to-amber-100 flex flex-col items-center justify-center font-inter">
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
//         .font-inter { font-family: 'Inter', sans-serif; }
//       `,
//         }}
//       />

//       <div className="text-center mb-12">
//         <h1 className="text-6xl font-extrabold text-sky-700 drop-shadow-lg leading-tight">
//           <Globe className="inline-block w-12 h-12 mr-4 text-amber-500" />
//           The Ringmaster's Roundtable
//         </h1>
//         <p className="text-xl text-gray-600 mt-2">
//           Your personalized adventure planner.
//         </p>
//       </div>

//       <div className="w-full max-w-3xl flex flex-col items-center">
//         {/* Input Card */}
//         <Card title="Plan Your Journey" icon={<Compass className="w-8 h-8" />}>
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <input
//                 type="text"
//                 placeholder="From"
//                 value={origin}
//                 onChange={(e) => setOrigin(e.target.value)}
//                 className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all placeholder:text-gray-400 text-lg"
//               />
//               <input
//                 type="text"
//                 placeholder="To"
//                 value={destination}
//                 onChange={(e) => {setDestination(e.target.value); setCity(e.target.value);}}
//                 className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all placeholder:text-gray-400 text-lg"
//               />
//               <input
//                 type="date"
//                 value={travelDate}
//                 onChange={(e) => setTravelDate(e.target.value)}
//                 className="w-full px-4 py-3 rounded-xl border-2 border-amber-300 focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all text-lg"
//               />
//             </div>

//             <button
//               onClick={fetchData}
//               disabled={isLoading}
//               className={`w-full py-4 rounded-xl font-bold text-xl active:scale-[0.98] transition-all shadow-lg hover:shadow-xl 
//                         ${
//                           isLoading
//                             ? "bg-gray-400 text-white cursor-not-allowed"
//                             : "bg-emerald-500 text-white hover:bg-emerald-600"
//                         }`}
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Searching...
//                 </span>
//               ) : (
//                 <span>
//                   <Smile className="inline-block w-6 h-6 mr-2" />
//                   Let's Go!
//                 </span>
//               )}
//             </button>
//           </div>
//         </Card>

//         {/* Weather Card */}
//         {weather && (
//           <Card
//             title={`Weather in ${weather.city}`}
//             icon={<Sun className="w-8 h-8" />}
//           >
//             <div className="space-y-3">
//               {weather.forecast.map((f, i) => (
//                 <div
//                   key={i}
//                   className="flex justify-between items-center bg-sky-50 px-5 py-3 rounded-xl hover:bg-sky-100 transition duration-200 border-l-4 border-sky-400"
//                 >
//                   <span className="font-semibold text-gray-700 text-lg">
//                     {f.date}
//                   </span>
//                   <div className="flex items-center space-x-4">
//                     <span className="text-2xl">{f.icon}</span>
//                     <span className="text-xl font-medium text-sky-800">
//                       {f.temp}°C
//                     </span>
//                     <span className="text-gray-500 hidden sm:inline">
//                       {f.condition}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         )}

//         {/* Route Card */}
//         {route && (
//           <Card title="Route Details" icon={<Map className="w-8 h-8" />}>
//             <div className="space-y-4 text-gray-700">
//               <p className="flex justify-between items-center bg-amber-50 p-4 rounded-xl border-l-4 border-amber-300">
//                 <span className="font-medium flex items-center text-lg">
//                   <Compass className="w-5 h-5 mr-3 text-amber-600" />
//                   Distance:
//                 </span>
//                 <span className="text-xl font-bold text-amber-700">
//                   {route.distance}
//                 </span>
//               </p>
//               <p className="flex justify-between items-center bg-amber-50 p-4 rounded-xl border-l-4 border-amber-300">
//                 <span className="font-medium flex items-center text-lg">
//                   <Clock className="w-5 h-5 mr-3 text-amber-600" />
//                   Estimated Duration:
//                 </span>
//                 <span className="text-xl font-bold text-amber-700">
//                   {route.duration}
//                 </span>
//               </p>
//               <p className="mt-4 text-sm italic text-center text-gray-500">
//                 Summary: {route.route_summary}
//               </p>
//             </div>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// export default App;


import { MainContent, ContentRouter } from '../App'; 

const Dashboard = () => (
  <MainContent>
    <ContentRouter />
  </MainContent>
);

export default Dashboard;
