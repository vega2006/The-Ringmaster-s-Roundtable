// backend/langchain/tripGraph.js
const { StateGraph, Annotation, END, Command } = require("@langchain/langgraph");
const { getWeatherTool, getRouteTool, getItineraryTool, getEventTool } = require("./tool");

// Define the state annotation
const TripState = Annotation.Root({
  city: Annotation(),
  travelDate: Annotation(),
  startDate: Annotation(),
  endDate: Annotation(),
  origin: Annotation(),
  destination: Annotation(),
  weather: Annotation(),
  route: Annotation(),
  itinerary: Annotation(),
  events: Annotation(),
});

// ----------------- Node functions -----------------

const weatherNode = async (state) => {
  const result = await getWeatherTool.func({
    city: state.city || state.destination,
    travelDate: state.travelDate,
  });
  return {
    state: { ...state, weather: result },
    commands: [new Command("get_route")],
  };
};

const routeNode = async (state) => {
  const result = await getRouteTool.func({
    origin: state.origin,
    destination: state.destination,
  });
  return {
    state: { ...state, route: result },
    commands: [new Command("get_itinerary")],
  };
};

const itineraryNode = async (state) => {
  const result = await getItineraryTool.func({
    destination: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return {
    state: { ...state, itinerary: result },
    commands: [new Command("get_event")],
  };
};

const eventNode = async (state) => {
  const result = await getEventTool.func({
    city: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return {
    state: { ...state, events: result },
    commands: [END],
  };
};

// ----------------- Start node -----------------
const startNode = async (state) => {
  // You can initialize default values here if needed
  return {
    state,
    commands: [new Command("get_weather")],
  };
};

// ----------------- Build graph -----------------
const tripGraph = new StateGraph(TripState)
  .addNode("start", startNode, { ends: ["get_weather"] })
  .addNode("get_weather", weatherNode, { ends: ["get_route"] })
  .addNode("get_route", routeNode, { ends: ["get_itinerary"] })
  .addNode("get_itinerary", itineraryNode, { ends: ["get_event"] })
  .addNode("get_event", eventNode, { ends: [END] })
  .addEdge("__start__", "start");

// ----------------- Export -----------------
module.exports = { tripGraph };
