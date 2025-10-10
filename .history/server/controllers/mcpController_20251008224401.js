const { tool } = require("@langchain/core/tools");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { config } = require("dotenv");
config();
const { fetchWeather } = require("../services/weatherAgent");
const { fetchRoute } = require("../services/mapsAgent");
const { z } = require("zod");

const tripHandler = async (req, res) => {
  let isWeather = false;
  let isRoute = false;
  let weather = null;
  let route = null;

  const { prompt } = req.body;

  const getWeatherTool = tool(
    async (args) => {
      const { city, travelDate } = args;
      return await fetchWeather(city, travelDate);
    },
    {
      name: "get_weather",
      description:
        "Useful for when you have to get the weather report of a certain city.",
      schema: z.object({
        city: z.string().describe("The city of which weather is to be got"),
        travelDate: z.string().optional().describe("The date of which weather is to be got"),
      }),
    }
  );

  const getRouteTool = tool(
    async (args) => {
      const { origin, destination } = args;
      return await fetchRoute(origin, destination);
    },
    {
      name: "get_route",
      description:
        "Useful for when you have to get the distance from a city to another city",
      schema: z.object({
        origin: z.string().describe("The source city."),
        destination: z.string().describe("The destination city."),
      }),
    }
  );

  const llmWithTool = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }).bindTools([getWeatherTool, getRouteTool]);

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
  }

  const finalResponse = await llmWithTool.invoke([
    [
      "system",
      `You are an intelligent trip planner. Here are the tool results: ${JSON.stringify(toolOutputs)}`,
    ],
    ["human", `${prompt} Now generate a complete, friendly trip summary using the above data.`],
  ]);

  res.json({
    weather: isWeather ? weather : null,
    route: isRoute ? route : null,
    finalResponse,
  });
};

module.exports = { tripHandler };
