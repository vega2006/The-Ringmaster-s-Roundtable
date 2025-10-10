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

 const llmWithTool = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }).bindTools([getWeatherTool, getRouteTool,getItineraryTool,getEventTool]);


  const decision = await llmWithTool.invoke([
    ["human", `${prompt}`],
  ]);


  console.log(decision);
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
  for (const node of decision) {
    state = await app.invoke(node, state);
// each node already has the arguments it needs
  const args = node.args || {}; 
  state = await app.invoke(node.name, { ...state, ...args });

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

  res.json({
    message: "Trip executed successfully",
    executed: selected,
    trip,
  });
}

module.exports = { tripHandler };
