const { graph } = require("./tripgraph");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const mongoose = require("mongoose");
const Trip = require("../models/tripModel");


async function tripHandler(req, res) {
  const { prompt, userId } = req.body;

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Step 1️⃣ — Ask model which modules to trigger
  const decision = await llm.invoke([
    ["human", `User request: ${prompt}. Decide which modules are needed among: get_weather, get_route, get_itinerary, get_event`]
  ]);

  console.log(decision);
  const selected = JSON.parse(decision.content || "[]");

  // Step 2️⃣ — Parse origin, destination, start/end dates from prompt
  const parseResult = await llm.invoke([
    ["human", `Extract origin, destination, start date, and end date from the user prompt: "${prompt}". Return as JSON with keys: origin, destination, startDate, endDate.`]
  ]);
  const { origin, destination, startDate, endDate } = JSON.parse(parseResult.content || "{}");

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
