// backend/langchain/tripGraph.js
const { StateGraph, START,END } = require("@langchain/langgraph");
const { getWeatherTool, getRouteTool, getItineraryTool, getEventTool } = require("./tool");

async function weatherNode(state) {
    console.log(state.city,state.travelDate);
  const result = await getWeatherTool.func({
    city: state.city || state.destination,
    travelDate: state.travelDate,
  });
  console.log(result);
  return { ...state, weather: result };
}

async function routeNode(state) {
    console.log(state.origin,state.destination);
  const result = await getRouteTool.func({
    origin: state.origin,
    destination: state.destination,
  });
  return { ...state, route: result };
}

async function itineraryNode(state) {
    console.log(state.city,state.startDate,state.endDate);
  const result = await getItineraryTool.func({
    destination: state.destination,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  return { ...state, itinerary: result };
}

async function eventNode(state) {
    console.log(state.city,state.startDate,state.endDate);
  const result = await getEventTool.func({
    city: state.destination||state.city,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  console.log(result);
  return { ...state, events: result };
}

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
  .addEdge("get_weather", "get_route")
  .addEdge("get_route", "get_itinerary")
  .addEdge("get_itinerary", "get_event")
  .addEdge("get_event", END)
  .addEdge(START, "get_weather");

module.exports = { graph };
