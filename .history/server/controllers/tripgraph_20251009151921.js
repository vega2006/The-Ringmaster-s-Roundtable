// backend/langchain/tripGraph.js
const { StateGraph, Annotation, END, Command,entrypoint } = require("@langchain/langgraph");
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


// Node functions
const weatherNode = async (state) => {
  const result = await getWeatherTool.func({
    city: state.city || state.destination,
    travelDate: state.travelDate,
  });
  
  return {weather:result};
};

const routeNode = async (state) => {

  const result = await getRouteTool.func({
    origin: state.origin,
    destination: state.destination,
  });
  return {route:result};
};

const itineraryNode = async (state) => {
  const result = await getItineraryTool.func({
    destination: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return {itinerary:result};
};

const eventNode = async (state) => {
  const result = await getEventTool.func({
    city: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
   return {events:result};
};

// Build graph
const tripGraph = new StateGraph(TripState)
  .addNode("get_weather", weatherNode)
  .addNode("get_route", routeNode)
  .addNode("get_itinerary", itineraryNode)
  .addNode("get_event", eventNode)
  .addEdge("__start__", "get_weather")
  .addEdge("get_weather", "get_route")
  .addEdge("get_route", "get_itinerary")
  .addEdge("get_itinerary", "get_event")
  .addEdge("get_event", "__end__")



module.exports = { tripGraph };
