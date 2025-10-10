// const dotenv = require("dotenv");
// dotenv.config();

// const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
// const moment = require("moment");

// const { fetchWeather } = require("../services/weatherAgent");
// const { fetchPlaces } = require("../services/itineraryAgent");
// const { fetchEvents } = require("../services/eventsAgent");

// // Helper to generate day-by-day itinerary
// const generateItinerary = async (destination, startDate, endDate) => {
//   try {
//     const totalDays = moment(endDate).diff(moment(startDate), "days") + 1;
//     const places = await fetchPlaces(destination);

//     const dailyPlan = Array.from({ length: totalDays }, (_, i) => ({
//       day: i + 1,
//       morning: places[i * 3]?.name || "Free exploration",
//       afternoon: places[i * 3 + 1]?.name || "Leisure time",
//       evening: places[i * 3 + 2]?.name || "Local food tour",
//     }));

//     return {
//       destination,
//       totalDays,
//       itinerary: dailyPlan,
//     };
//   } catch (err) {
//     console.error("Itinerary generation error:", err.message);
//     return null;
//   }
// };

// // Main controller
// const compareDestinations = async (req, res) => {
//   try {
//     const { destinationA, destinationB, startDate, endDate, preferences = [], budget } = req.body;

//     if (!destinationA || !destinationB || !startDate || !endDate) {
//       return res.status(400).json({ error: "Please provide both destinations and start/end dates." });
//     }

//     // Fetch data for both destinations in parallel
//     const fetchData = async (destination) => {
//       const weather = await fetchWeather(destination, startDate).catch(() => null);
//       const itinerary = await generateItinerary(destination, startDate, endDate);
//       const events = await fetchEvents(destination, startDate, endDate).catch(() => []);

//       return { weather, itinerary, events };
//     };

//     const [dataA, dataB] = await Promise.all([
//       fetchData(destinationA),
//       fetchData(destinationB),
//     ]);

//     const destinationsData = {
//       [destinationA]: dataA,
//       [destinationB]: dataB,
//     };

//     // Initialize LLM
//     const llm = new ChatGoogleGenerativeAI({
//       model: "gemini-2.5-flash",
//       apiKey: process.env.GEMINI_API_KEY,
//     });

//     // Create the comparison prompt
//     const comparisonPrompt = `
// You are a travel expert. Compare the following two destinations for a traveler with preferences: ${preferences.join(", ")}.
// Budget: ${budget || "not specified"}.

// Destination A: ${destinationA}
// Data: ${JSON.stringify(dataA, null, 2)}

// Destination B: ${destinationB}
// Data: ${JSON.stringify(dataB, null, 2)}

// Include in your comparison:
// - Attractions and highlights
// - Local culture
// - Weather
// - Safety
// - Events
// - Cost considerations
// - Who should visit each place

// Give a **final recommendation** for which destination the traveler should pick.
// `;

//     // Generate comparison using LLM
//     const comparisonResponse = await llm.invoke([["human", comparisonPrompt]]);

//     // Send structured response
//     res.json({
//       destinations: [destinationA, destinationB],
//       startDate,
//       endDate,
//       preferences,
//       budget,
//       data: destinationsData,
//       comparison: comparisonResponse.text || "No comparison generated",
//     });
//   } catch (error) {
//     console.error("Error comparing destinations:", error);
//     res.status(500).json({ error: "Something went wrong while comparing destinations." });
//   }
// };

// module.exports = { compareDestinations };


const { tool } = require("@langchain/core/tools");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { config } = require("dotenv");
const moment = require("moment");
const { z } = require("zod");

const { fetchWeather } = require("../services/weatherAgent");
const { fetchPlaces } = require("../services/itineraryAgent");
const { fetchEvents } = require("../services/eventsAgent");
config();

// Helper to generate itinerary
const getItinerary = async ({ destination, startDate, endDate }) => {
  const totalDays = moment(endDate).diff(moment(startDate), "days") + 1;
  const places = await fetchPlaces(destination);
  const dailyPlan = Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    morning: places[i * 3]?.name || "Free exploration",
    afternoon: places[i * 3 + 1]?.name || "Leisure time",
    evening: places[i * 3 + 2]?.name || "Local food tour",
  }));

  return {
    destination,
    totalDays,
    itinerary: dailyPlan,
  };
};

const compareDestinationsHandler = async (req, res) => {
  try {
    const { destinationA, destinationB, startDate, endDate, preferences = [], budget } = req.body;

    if (!destinationA || !destinationB || !startDate || !endDate) {
      return res.status(400).json({ error: "Please provide both destinations and start/end dates." });
    }

    // ----- Define Tools -----
    const weatherTool = tool(
      async ({ city, travelDate }) => await fetchWeather(city, travelDate),
      {
        name: "get_weather",
        description: "Get weather for a destination on a specific date.",
        schema: z.object({
          city: z.string(),
          travelDate: z.string().optional(),
        }),
      }
    );

    const itineraryTool = tool(
      async ({ destination, startDate, endDate }) => await getItinerary({ destination, startDate, endDate }),
      {
        name: "get_itinerary",
        description: "Get a detailed day-by-day itinerary for a destination.",
        schema: z.object({
          destination: z.string(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      }
    );

    const eventTool = tool(
      async ({ city, startDate, endDate }) => await fetchEvents(city, startDate, endDate),
      {
        name: "get_event",
        description: "Get event info for a destination between given dates.",
        schema: z.object({
          city: z.string(),
          startDate: z.string(),
          endDate: z.string(),
        }),
      }
    );

    // ----- Initialize LLM with Tools -----
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
    }).bindTools([weatherTool, itineraryTool, eventTool]);

    // ----- Function to fetch destination data using tools -----
    const fetchDestinationData = async (destination) => {
      const weather = await weatherTool.func({ city: destination, travelDate: startDate });
      const itinerary = await itineraryTool.func({ destination, startDate, endDate });
      const events = await eventTool.func({ city: destination, startDate, endDate });
      return { weather, itinerary, events };
    };

    // Fetch both destinations in parallel
    const [dataA, dataB] = await Promise.all([
      fetchDestinationData(destinationA),
      fetchDestinationData(destinationB),
    ]);

    // ----- Build Comparison Prompt -----
    const comparisonPrompt = `
You are a travel expert. Compare the following two destinations for a traveler with preferences: ${preferences.join(", ")}.
Budget: ${budget || "not specified"}.

Destination A: ${destinationA}
Data: ${JSON.stringify(dataA, null, 2)}

Destination B: ${destinationB}
Data: ${JSON.stringify(dataB, null, 2)}

Include in your comparison:
- Attractions and highlights
- Local culture
- Events
- Cost considerations
- Who should visit each place

Give a final recommendation for which destination the traveler should pick.
`;

    // ----- Generate Comparison -----
    const comparisonResponse = await llm.invoke([["human", comparisonPrompt]]);

    // ----- Return Structured Response -----
    res.json({
      destinations: [destinationA, destinationB],
      startDate,
      endDate,
      preferences,
      budget,
      data: {
        [destinationA]: dataA,
        [destinationB]: dataB,
      },
      comparison: comparisonResponse.text || "No comparison generated",
    });
  } catch (error) {
    console.error("Error comparing destinations:", error);
    res.status(500).json({ error: "Something went wrong while comparing destinations." });
  }
};

module.exports = { compareDestinationsHandler };
