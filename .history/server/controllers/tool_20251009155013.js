// backend/langchain/tools.js
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { fetchWeather } = require("../services/weatherAgent");
const { fetchRoute } = require("../services/mapsAgent");
const { fetchPlaces } = require("../services/itineraryAgent.js");
const { fetchEvents } = require("../services/eventsAgent.js");
const moment = require("moment");

let start = null, end = null, start_date = null, end_date = null;

// -------------------- TOOL: WEATHER --------------------
const getWeatherTool = tool(
  async (args) => {
    console.log(args);
    const { city, travelDate } = args;
    return await fetchWeather(city, travelDate);
  },
  {
    name: "get_weather",
    description: "Use this to get weather info for the destination city.",
    schema: z.object({
      city: z.string(),
      travelDate: z.string().optional(),
    }),
  }
);

// -------------------- TOOL: ROUTE --------------------
const getRouteTool = tool(
  async (args) => {
    const { origin, destination } = args;
    start = origin;
    end = destination;
    return await fetchRoute(origin, destination);
  },
  {
    name: "get_route",
    description: "Use this to fetch the route from origin to destination.",
    schema: z.object({
      origin: z.string(),
      destination: z.string(),
    }),
  }
);

// -------------------- TOOL: ITINERARY --------------------
 const getItineraryTool = tool(
     async (args) => {
        try{
             const { destination, startDate, endDate} = args;
      start_date=startDate;
      end_date=endDate;
      const res= await getItinerary({destination,startDate,endDate});
       // Example checks depending on your implementation:
      if (!res|| res.error) return null;
      return res;
        }
        catch(err){
            return null;
        }
    },
    {
      name: "get_itinerary",
      description: `
      Always use this tool to create a detailed day-by-day itinerary for the trip.
      Include sightseeing, activities, and suggested timing based on trip dates.
      Input example: { destination: "Goa", startDate: "2025-10-15", endDate: "2025-10-20" }
    `,
      schema: z.object({
        destination: z.string().describe("The destination city where the you have to go"),
        startDate: z.string().describe("The starting date of the trip"),
        endDate: z.string().describe("The ending date of the trip"),
      }),
    }
  );
// -------------------- TOOL: EVENT --------------------
const getEventTool = tool(
  async (args) => {
    const { city, startDate, endDate } = args;
    start_date = startDate;
    end_date = endDate;
    return await fetchEvents(city, startDate, endDate);
  },
  {
    name: "get_event",
    description: "Use this to get event details at the destination city.",
    schema: z.object({
      city: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }),
  }
);

const getItinerary = async (params) => {
  try {
    const { destination, startDate, endDate } = params;

    // Validate inputs
    if (!destination || !startDate || !endDate) {
      return { error: "All fields are required" };
    }

    // Calculate total days
    const totalDays = moment(endDate).diff(moment(startDate), "days") + 1;

    // Fetch places
    const places = await fetchPlaces(destination);

    // Create a clean day-by-day plan
    const dailyPlan = Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      morning: places[i * 3]?.name || "Free exploration",
      afternoon: places[i * 3 + 1]?.name || "Leisure time",
      evening: places[i * 3 + 2]?.name || "Local food tour",
    }));

    return {
      destination: String(destination),
      totalDays,
      itinerary: dailyPlan,
    };
  } catch (error) {
    console.error("Itinerary generation error:", error.message);
    return { error: "Failed to generate itinerary" };
  }
};


module.exports = {
  getWeatherTool,
  getRouteTool,
  getItineraryTool,
  getEventTool,
};
