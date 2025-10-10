const { tool } = require("@langchain/core/tools");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { config } = require("dotenv");
config();
const { fetchWeather } = require("../services/weatherAgent");
const { fetchRoute } = require("../services/mapsAgent");
const {generateItinerary} =require("./itineraryController");
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
      start_date=startDate;
      end_date=endDate;
      const res= await generateItinerary(destination,startDate,endDate);
      if(res.status==400)return null;
      return res;
        }
        catch{
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
        destination: z.string().describe("The destination city of which is to be visited"),
        startDate: z.string().describe("The starting date of the trip"),
        endDate: z.string().describe("The ending date of the trip"),
      }),
    }
  );

  const llmWithTool = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }).bindTools([getWeatherTool, getRouteTool,getItineraryTool]);

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
    finalResponse,
  });
};

module.exports = { tripHandler };
