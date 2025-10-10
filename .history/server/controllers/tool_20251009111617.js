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
    try {
      const { destination, startDate, endDate } = args;
      start_date = startDate;
      end_date = endDate;
      const totalDays = moment(endDate).diff(moment(startDate), "days") + 1;
      const places = await fetchPlaces(destination);
      const dailyPlan = Array.from({ length: totalDays }, (_, i) => ({
        day: i + 1,
        morning: places[i * 3]?.name || "Free exploration",
        afternoon: places[i * 3 + 1]?.name || "Leisure time",
        evening: places[i * 3 + 2]?.name || "Local food tour",
      }));
      return { destination, totalDays, itinerary: dailyPlan };
    } catch (error) {
      console.error("Itinerary error:", error.message);
      return { error: "Failed to generate itinerary" };
    }
  },
  {
    name: "get_itinerary",
    description: "Use this to create a daily itinerary for the trip.",
    schema: z.object({
      destination: z.string(),
      startDate: z.string(),
      endDate: z.string(),
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

module.exports = {
  getWeatherTool,
  getRouteTool,
  getItineraryTool,
  getEventTool,
};
