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
  await app.invoke( { city: "Goa", travelDate: "2025-10-15" });

  // Step 5️⃣ — Save or update trip
  await trip.save();

  res.json({
    message: "Trip executed successfully",
    executed: decision.tool_calls,
    trip,
  });
}

module.exports = { tripHandler };
