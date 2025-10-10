const { graph } = require("./tripgraph");
const { createClient } = require("redis");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { config } = require("dotenv");
config();

const redis = createClient();
redis.connect();

async function tripHandler(req, res) {
  const { prompt, userId } = req.body;

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Step 1️⃣ — Ask model which nodes to trigger
  const decision = await llm.invoke([["human", `User request: ${prompt}. Decide which modules are needed among: get_weather, get_route, get_itinerary, get_event. Return as JSON list.`]]);
  const selected = JSON.parse(decision.content || "[]");

  // Step 2️⃣ — Get user state (if continuing)
  const stateKey = `user:${userId}:tripState`;
  let state = JSON.parse((await redis.get(stateKey)) || "{}");

  // Step 3️⃣ — Run selected parts of the graph dynamically
  const app = graph.compile();
  for (const node of selected) {
    state = await app.invoke(node, state);
    await redis.set(stateKey, JSON.stringify(state));
  }

  res.json({
    message: "Trip modules executed successfully",
    executed: selected,
    state,
  });
}

module.exports = { tripHandler };
