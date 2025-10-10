const { graph } = require("./tripgraph");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const mongoose = require("mongoose");
const Trip = require("../models/tripModel");
const { v4: uuidv4 } = require("uuid"); 

async function tripHandler(req, res) {
  const { prompt, userId, origin, destination } = req.body;

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Step 1️⃣ — Ask model which nodes to trigger
  const decision = await llm.invoke([["human", `User request: ${prompt}. Decide which modules are needed among: get_weather, get_route, get_itinerary, get_event. Return as JSON list.`]]);
  const selected = JSON.parse(decision.content || "[]");

  // Step 2️⃣ — Create a new trip document
  const tripId = uuidv4();
  let trip = new Trip({
    userId,
    tripId,
    origin,
    destination,
  });

  // Step 3️⃣ — Run selected modules dynamically
  const app = graph.compile();
  let state = {}; // temporary state to pass between modules
  for (const node of selected) {
    state = await app.invoke(node, state);

    // Merge module outputs into trip document
    if (node === "get_weather") trip.weather = state.weather;
    if (node === "get_route") trip.route = state.route;
    if (node === "get_itinerary") trip.itinerary = state.itinerary;
    if (node === "get_event") trip.events = state.events;
  }

  // Step 4️⃣ — Save trip to DB
  await trip.save();

  res.json({
    message: "Trip created successfully",
    tripId,
    executed: selected,
    trip,
  });
}

module.exports = { tripHandler };
