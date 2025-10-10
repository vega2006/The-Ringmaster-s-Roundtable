const { tool } = require("@langchain/core/tools");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { config } = require("dotenv");
config();
const { fetchWeather } = require("../services/weatherAgent");
const { fetchRoute } = require("../services/mapsAgent");
const { fetchPlaces } = require("../services/itineraryAgent.js");
const {fetchEvents} =require("../services/eventsAgent.js");
const moment = require("moment");

const { z } = require("zod");

const tripHandler = async (req, res) => {
  let isWeather = false;
  let isRoute = false;
  let weather = null;
  let route = null;
  let isItinerary=false;
  let itinerary=null;
  let start=null;
  let end=null;
  let start_date=null;
  let end_date=null;
  let isEvent=false;
  let event=null;
  const { prompt } = req.body;

  const getWeatherTool = tool(
    async (args) => {
      const { city, travelDate } = args;
      return await fetchWeather(city, travelDate);
    },
    {
      name: "get_weather",
     description: `
      Always use this tool to get the weather report for the destination city on the trip dates.
      This tool is essential for planning the trip, as you need weather info to suggest activities.
      Input example: { city: "Goa", travelDate: "2025-10-15" }
    `,
      schema: z.object({
        city: z.string().describe("The city of which weather is to be got"),
        travelDate: z.string().optional().describe("The date of which weather is to be got"),
      }),
    }
  );

  const getRouteTool = tool(
    async (args) => {
      const { origin, destination } = args;
      start=origin;
      end=destination;
      return await fetchRoute(origin, destination);
    },
    {
      name: "get_route",
    description: `
      Always use this tool to get the route details from the origin city to the destination city.
      This information is essential to calculate travel time, distance, and suggest logistics.
      Input example: { origin: "Delhi", destination: "Goa" }
    `,
      schema: z.object({
        origin: z.string().describe("The source city."),
        destination: z.string().describe("The destination city."),
      }),
    }
  );

   const getItineraryTool = tool(
     async (args) => {
        try{
             const { destination, startDate, endDate} = args;
             console.log(destination);
             console.log(startDate);
             console.log(endDate);
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

  const getEventTool = tool(
     async (args) => {
        try{
             const { city, startDate, endDate} = args;
             console.log(city);
             console.log(startDate);
             console.log(endDate);
      start_date=startDate;
      end_date=endDate;
      const res= await fetchEvents({city,startDate,endDate});
       // Example checks depending on your implementation:
      if (!res|| res.error) return null;
      return res;
        }
        catch(err){
            return null;
        }
    },
    {
      name: "get_event",
      description: `
      Always use this tool to know any event details that is happening at the destination city that you have to visit.
      Input example: { city: "Goa", startDate: "2025-10-15", endDate: "2025-10-20" }
    `,
      schema: z.object({
        city: z.string().describe("The destination city where the you have to go"),
        startDate: z.string().describe("The starting date of the trip"),
        endDate: z.string().describe("The ending date of the trip"),
      }),
    }
  );

  const llmWithTool = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }).bindTools([getWeatherTool, getRouteTool,getItineraryTool,getEventTool]);

  const toolRes = await llmWithTool.invoke([
    ["human", `${prompt}`],
  ]);

  console.log(toolRes.tool_calls);

  let toolOutputs = [];

  for (const call of toolRes.tool_calls) {
    if (call.name === "get_weather") {
      const result = await getWeatherTool.func(call.args);
      isWeather = true;
      weather = result;
      toolOutputs.push({ name: call.name, output: result });
    }
    if (call.name === "get_route") {
      const result = await getRouteTool.func(call.args);
      isRoute = true;
      route = result;
      toolOutputs.push({ name: call.name, output: result });
    }
     if (call.name === "get_itinerary") {
      const result = await getItineraryTool.func(call.args);
      isItinerary = true;
      itinerary = result;
      toolOutputs.push({ name: call.name, output: result });
    }
    if (call.name === "get_event") {
      const result = await getEventTool.func(call.args);
      console.log(result);
      isEvent = true;
      event = result;
      toolOutputs.push({ name: call.name, output: result });
    }
  }

  const finalResponse = await llmWithTool.invoke([
    [
      "system",
      `You are an intelligent trip planner. Here are the tool results: ${JSON.stringify(toolOutputs)}`,
    ],
    ["human", `${prompt} Now generate a complete, friendly trip summary using the above data.`],
  ]);

  res.json({
    origin:start,
    destination:end,
    start_date,
    end_date,
    weather: isWeather ? weather : null,
    route: isRoute ? route : null,
    itinerary:isItinerary ?itinerary:null,
    event:isEvent?event:null,
    finalResponse,
  });
};




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

module.exports = { tripHandler };
