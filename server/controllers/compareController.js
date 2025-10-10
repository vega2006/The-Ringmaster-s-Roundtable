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
    const weatherTool = tool(async ({ city, travelDate }) => await fetchWeather(city, travelDate), {
      name: "get_weather",
      description: "Get weather for a destination on a specific date.",
      schema: z.object({ city: z.string(), travelDate: z.string().optional() }),
    });

    const itineraryTool = tool(async ({ destination, startDate, endDate }) => await getItinerary({ destination, startDate, endDate }), {
      name: "get_itinerary",
      description: "Get a detailed day-by-day itinerary for a destination.",
      schema: z.object({ destination: z.string(), startDate: z.string(), endDate: z.string() }),
    });

    const eventTool = tool(async ({ city, startDate, endDate }) => await fetchEvents(city, startDate, endDate), {
      name: "get_event",
      description: "Get event info for a destination between given dates.",
      schema: z.object({ city: z.string(), startDate: z.string(), endDate: z.string() }),
    });

    // ----- Initialize LLM with Tools -----
    const llmWithTool = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
    }).bindTools([weatherTool, itineraryTool, eventTool]);

    // ----- Helper to fetch tool data -----
    const fetchDestinationData = async (decision) => {
      let weather, itinerary, event;
      if (!decision?.tool_calls) return {};
      for (const call of decision.tool_calls) {
        try {
          if (call.name === "get_weather") weather = await weatherTool.invoke(call.args);
          if (call.name === "get_itinerary") itinerary = await itineraryTool.invoke(call.args);
          if (call.name === "get_event") event = await eventTool.invoke(call.args);
        } catch (err) {
          console.error("Error running tool ${call.name}:", err);
        }
      }
      return { weather, itinerary, event };
    };

    // ----- Generate Decisions -----
    const makeDecisionPrompt = (destination) => `
You are a trip planner for a traveler with preferences: ${preferences.join(", ")}.
Budget: ${budget || "not specified"}.

Destination: ${destination}
Trip dates: ${startDate} to ${endDate}

Decide which tool to call for this trip. You have access to:
- WeatherTool: fetch weather from startDate to endDate
- ItineraryTool: generate daily itinerary
- EventTool: find local events during the trip
`;

    const decisionA = await llmWithTool.invoke([["human", makeDecisionPrompt(destinationA)]]);
    const decisionB = await llmWithTool.invoke([["human", makeDecisionPrompt(destinationB)]]);

    // ----- Fetch Data in Parallel -----
    const [dataA, dataB] = await Promise.all([fetchDestinationData(decisionA), fetchDestinationData(decisionB)]);

    // ----- Build Comparison Prompt -----
    const comparisonPrompt = `
You are a travel expert. Compare the following two destinations for a traveler with preferences: ${preferences.join(", ")}.
Budget: ${budget || "not specified"}.

Destination A: ${destinationA}
Data: ${JSON.stringify(dataA, null, 2)}

Destination B: ${destinationB}
Data: ${JSON.stringify(dataB, null, 2)}

Include:
- Attractions and highlights
- Local culture
- Events
- Cost considerations
- Who should visit each place

Give a final recommendation.
`;

    const comparisonResponse = await llmWithTool.invoke([["human", comparisonPrompt]]);

    res.json({
      destinations: [destinationA, destinationB],
      startDate,
      endDate,
      preferences,
      budget,
      data: { [destinationA]: dataA, [destinationB]: dataB },
      comparison: comparisonResponse.text || "No comparison generated",
    });
  } catch (error) {
    console.error("Error comparing destinations:", error);
    res.status(500).json({ error: "Something went wrong while comparing destinations." });
  }
};

module.exports = { compareDestinationsHandler };