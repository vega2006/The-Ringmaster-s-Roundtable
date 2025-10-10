// backend/langchain/tripGraph.js
const { StateGraph, END, Command ,StateAnnotation} = require("@langchain/langgraph");
const { getWeatherTool, getRouteTool, getItineraryTool, getEventTool } = require("./tool");

// Define state annotation as a plain object
const TripState = {
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
};

// Node functions
async function weatherNode(state) {
  const result = await getWeatherTool.func({
    city: state.city || state.destination,
    travelDate: state.travelDate,
  });
  return { state: { ...state, weather: result }, commands: [new Command("get_route")] };
}

async function routeNode(state) {
  const result = await getRouteTool.func({
    origin: state.origin,
    destination: state.destination,
  });
  return { state: { ...state, route: result }, commands: [new Command("get_itinerary")] };
}

async function itineraryNode(state) {
  const result = await getItineraryTool.func({
    destination: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return { state: { ...state, itinerary: result }, commands: [new Command("get_event")] };
}

async function eventNode(state) {
  const result = await getEventTool.func({
    city: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return { state: { ...state, event: result }, commands: [END] };
}

// Build graph using updated API
const graph = StateGraph.fromStateAnnotation(TripState)
  .addNode("get_weather", weatherNode, { ends: ["get_route"] })
  .addNode("get_route", routeNode, { ends: ["get_itinerary"] })
  .addNode("get_itinerary", itineraryNode, { ends: ["get_event"] })
  .addNode("get_event", eventNode, { ends: [END] })
  .setEntryPoint("get_weather");

module.exports = { graph };
