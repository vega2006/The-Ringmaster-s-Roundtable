// backend/langchain/tripGraph.js
const { StateGraph, START,END } = require("@langchain/langgraph");
const { getWeatherTool, getRouteTool, getItineraryTool, getEventTool } = require("./tool");

async function weatherNode(state) {
  const result = await getWeatherTool.func({
    city: state.city || state.destination,
    travelDate: state.travelDate,
  });
  console.log(result);
  return { ...state, weather: result };
}

async function routeNode(state) {
  const result = await getRouteTool.func({
    origin: state.origin,
    destination: state.destination,
  });
  return { ...state, route: result };
}

async function itineraryNode(state) {
  const result = await getItineraryTool.func({
    destination: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return { ...state, itinerary: result };
}

async function eventNode(state) {
  const result = await getEventTool.func({
    city: state.destination||state.city,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return { ...state, events: result };
}

async function isSourceDestination(state{
    
})
const graph = new StateGraph({
  channels: {
    city: "string",
    travelDate: "string",
    startDate: "string",
    endDate: "string",
    origin: "string",
    destination: "string",
    weather: "object",
    route: "object",
    itinerary: "object",
    events: "object",
  },
})

  .addNode("get_weather", weatherNode)
  .addNode("get_route", routeNode)
  .addNode("get_itinerary", itineraryNode)
  .addNode("get_event", eventNode)
  .addConditionalEdge("get_route",isCityStartandEndDate,"get_itinerary")
  .addEdge("get_itinerary", "get_event")
  .addEdge("get_event", END)
  .addEdge(START, "get_weather")
  .addConditionalEdges("get_weather",isSourceDestination,"get_route");
module.exports = { graph };
