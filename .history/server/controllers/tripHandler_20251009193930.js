const { graph } = require("./tripgraph");
const { getWeatherTool, getRouteTool, getItineraryTool, getEventTool } = require("./tool");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { config } = require("dotenv");
config();
const mongoose = require("mongoose");
const Trip = require("../models/tripModel");
const { v4: uuidv4 } = require("uuid"); // For generating unique trip IDs

async function tripHandler(req, res) {
  const { prompt, userId,tripId } = req.body;
   const humanPrompt = `
You are an expert trip planner AI. 
Whenever a user asks to plan a trip, you must:
1. Determine the destination from the user's text.
2. Determine trip duration or start/end dates:
   - If only duration is provided, use today as startDate and compute endDate = startDate + duration - 1 day.
3. Automatically plan the trip by calling these tools:
   - getWeatherTool: fetch weather from startDate to endDate
   - getRouteTool: compute route from origin to destination
   - getItineraryTool: generate daily itinerary for the trip
   - getEventTool: suggest events in the destination during the trip
4. Fill all required fields (destination, origin if provided, startDate, endDate) for tool execution.
5. Output a structured plan that can be executed by tools.

User request: "${prompt}"
`;

 const llmWithTool = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }).bindTools([getWeatherTool, getRouteTool,getItineraryTool,getEventTool]);


  const decision = await llmWithTool.invoke([
    ["human", `${prompt} `]
  ]);
  

 let trip;
   if (tripId) {
    trip = await Trip.findOne({ tripId, userId });
  }

  if (!trip) {
    trip = new Trip({
      userId,
      tripId: tripId || uuidv4(), // Generate a new tripId if not provided
    });
  }


  const app = graph.compile();
  let state = {};
  for (const node of decision.tool_calls) {
  const args = node.args || {}; 
  if(!args)continue;
  state = await app.invoke({...state,...args});

  switch (node.name) {
    case "get_weather":
      trip.weather = state.weather;
      break;
    case "get_route":
      trip.route = state.route;
      // Also set origin/destination from tool args if not yet set
      if (!trip.origin) trip.origin = args.origin;
      if (!trip.destination) trip.destination = args.destination;
      break;
    case "get_itinerary":
      trip.itinerary = state.itinerary;
      // Set trip dates from args if not yet set
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
  // Step 5️⃣ — Save or update trip
  await trip.save();
   const finalResponse = await llmWithTool.invoke([
    [
      "system",
      `You are an intelligent trip planner. Here are the tool results: ${JSON.stringify(trip)}`,
    ],
    ["human", `${prompt} Now generate a complete, friendly trip summary using the above data.`],
  ]);
 console.log(finalResponse);
  res.json({
    message: "Trip executed successfully",
    executed: decision.tool_calls,
    trip,
    finalResponse
  });
}


const getTripDetails = async (req, res) => {
  try {
    const { userId, tripId } = req.body; // match what frontend sends

    if (!userId || !tripId) {
      return res.status(400).json({ error: "Missing userId or tripId" });
    }

    const trip = await Trip.findOne({ tripId, userId });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json({ trip });
  } catch (err) {
    console.error("Error fetching trip details:", err);
    res.status(500).json({ error: "Failed to fetch trip details" });
  }
};

module.exports = { tripHandler,getTripDetails };
