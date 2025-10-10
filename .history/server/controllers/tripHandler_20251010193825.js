const { graph } = require("./tripgraph");
const { getWeatherTool, getRouteTool, getItineraryTool, getEventTool } = require("./tool");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { config } = require("dotenv");
config();
const Trip = require("../models/tripModel");
const { v4: uuidv4 } = require("uuid");

async function tripHandler(req, res) {
  const { prompt, userId, tripId } = req.body;

  const llmWithTool = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }).bindTools([getWeatherTool, getRouteTool, getItineraryTool, getEventTool]);

  // 1 Retrieve existing trip (if any)
  let trip = tripId ? await Trip.findOne({ tripId, userId }) : null;

  if (!trip) {
    trip = new Trip({
      userId,
      tripId: tripId || uuidv4(),
    });
  }

  //  Construct dynamic human prompt that includes trip state
  const humanPrompt = `
You are an expert AI trip planner. You have access to these tools:
- getWeatherTool: fetch weather from startDate to endDate
- getRouteTool: compute route from origin to destination
- getItineraryTool: generate daily itinerary
- getEventTool: find local events during the trip

User request: "${prompt}"

Existing trip state (if available): ${JSON.stringify(trip)}

Your job:
1. Understand what user wants to change or add.
2. If trip details already exist, reuse them when relevant.
3. If user mentions only destination or duration (e.g., “plan a trip to Goa for 9 days”), infer:
   - startDate = today 
   - endDate = startDate + duration - 1 day
4. Call only the tools needed to update or complete missing information.
5. Always ensure the trip has destination, startDate, endDate, weather, route, itinerary, and events.
6. Output structured tool calls accordingly.
7. If user does not specify the start date assume today as start date and first find what date is today.
`;

  //  Invoke LLM for tool decisions
  const decision = await llmWithTool.invoke([
    ["human", humanPrompt]
  ]);


  const app = graph.compile();
  let state = {};
  for (const node of decision.tool_calls) {
    const args = node.args || {};
    if (!args) continue;
    state = await app.invoke({ ...state, ...args });

    switch (node.name) {
      case "get_weather":
        trip.weather = state.weather;
        break;
      case "get_route":
        trip.route = state.route;
        if (!trip.origin) trip.origin = args.origin;
        if (!trip.destination) trip.destination = args.destination;
        break;
      case "get_itinerary":
        trip.itinerary = state.itinerary;
        if (!trip.startDate) trip.startDate = args.startDate;
        if (!trip.endDate) trip.endDate = args.endDate;
        break;
      case "get_event":
        trip.events = state.events;
        if (!trip.startDate) trip.startDate = args.startDate;
        if (!trip.endDate) trip.endDate = args.endDate;
        break;
    }
  }

  const summaryModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7
});
  // Create a clean trip object excluding the previous summary
const cleanTripData = trip.toObject ? trip.toObject() : trip;
delete cleanTripData.finalResponse;

// Ask Gemini to generate the summary


const finalResponse = await summaryModel.invoke([
  [
    "system",
    `You are an intelligent trip planner. Here are the finalized trip details:
${JSON.stringify(cleanTripData, null, 2)}
Use this data to write a clear, friendly trip summary for the user.`,
  ],
  ["human", `using the above output summarize the result for the user prompt ${prompt}`],
]);
trip.finalResponse = finalResponse;

await trip.save();


  res.json({
    message: "Trip executed successfully",
    executed: decision.tool_calls,
    trip,
    finalResponse,
  });
}

const getTripDetails = async (req, res) => {
  try {
    const { userId, tripId } = req.body;

    if (!userId || !tripId) {
      return res.status(400).json({ error: "Missing userId or tripId" });
    }

    const trip = await Trip.findOne({ tripId, userId });
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    res.json({ trip });
  } catch (err) {
    console.error("Error fetching trip details:", err);
    res.status(500).json({ error: "Failed to fetch trip details" });
  }
};

module.exports = { tripHandler, getTripDetails };
