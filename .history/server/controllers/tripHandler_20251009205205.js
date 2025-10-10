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

  // 1️⃣ Retrieve existing trip (if any)
  let trip = tripId ? await Trip.findOne({ tripId, userId }) : null;

  if (!trip) {
    trip = new Trip({
      userId,
      tripId: tripId || uuidv4(),
    });
  }

  // 2️⃣ Construct dynamic human prompt that includes trip state
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
`;

  // 3️⃣ Invoke LLM for tool decisions
  const decision = await llmWithTool.invoke([
    ["human", humanPrompt]
  ]);


  console.log(decision);
  // 4️⃣ Execute tools via LangGraph
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

  // 5️⃣ Ask Gemini to summarize final plan (with full context)
  const finalResponse = await llmWithTool.invoke([
    [
      "system",
      `You are an intelligent trip planner. Here is the final structured trip data: ${JSON.stringify(trip)}. 
If some details are missing, gracefully complete them.`,
    ],
    ["human", `${prompt} Generate a friendly, readable summary for the user.`],
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
