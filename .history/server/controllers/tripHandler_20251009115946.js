const { graph } = require("./tripgraph");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const mongoose = require("mongoose");
const Trip = require("../models/tripModel");


async function tripHandler(req, res) {
  const { prompt, userId } = req.body;

const llmWithTool = new ChatGoogleGenerativeAI({
  model: "gemini-2.5",
  temperature: 0.2,
  tools: [getWeatherTool, getRouteTool, getItineraryTool, getEventTool],
});

  // Step 1️⃣ — Ask model which modules to trigger
  const decision = await llmWithTool.invoke([
    ["human", `${prompt}`],
  ]);


  console.log(decision);
 
  

  // Step 3️⃣ — Get existing trip or create a new one
  let trip = await Trip.findOne({ userId });
  if (!trip) {
    trip = new Trip({ userId, origin, destination });
  } else {
    if (origin) trip.origin = origin;
    if (destination) trip.destination = destination;
  }

  // Step 4️⃣ — Run selected modules dynamically
  const app = graph.compile();
  let state = { startDate, endDate }; // include dates in state
  for (const node of selected) {
    state = await app.invoke(node, state);

    if (node === "get_weather") trip.weather = state.weather;
    if (node === "get_route") trip.route = state.route;
    if (node === "get_itinerary") trip.itinerary = state.itinerary;
    if (node === "get_event") trip.events = state.events;
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
