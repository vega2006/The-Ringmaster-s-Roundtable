// backend/langchain/tripGraph.js
const { StateGraph, END } = require("@langchain/langgraph");
const { getWeatherTool, getRouteTool, getItineraryTool, getEventTool } = require("./tool");

// Define node functions
async function weatherNode(state) {
  const result = await getWeatherTool.func({
    city: state.city || state.destination,
    travelDate: state.travelDate,
  });
  return { ...state, weather: result };
}

async function routeNode(state) {
  const result = await getRouteTool.func({
    origin: state.origin,
    destination: state.destination,
  });
  return { ...state, route: result};
}

async function itineraryNode(state) {
  const result = await getItineraryTool.func({
    destination: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return { ...state, itinerary: result};
}

async function eventNode(state) {
  const result = await getEventTool.func({
    city: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return { ...state, event: result };
}

// Build LangGraph
const graph = new StateGraph({
  channels: {
    start: "string",
    end: "string",
    city: "string",
    travelDate: "string",
    startDate: "string",
    endDate: "string",
    origin: "string",
    destination: "string",
    weather: "object",
    route: "object",
    itinerary: "object",
    event: "object",
    next: "string",
  },
})
  .addNode("get_weather", weatherNode)
  .addNode("get_route", routeNode)
  .addNode("get_itinerary", itineraryNode)
  .addNode("get_event", eventNode)
  .addEdge("get_weather", "get_route")
  .addEdge("get_route", "get_itinerary")
  .addEdge("get_itinerary", "get_event")
  .addEdge("get_event", END)

module.exports = { graph };
