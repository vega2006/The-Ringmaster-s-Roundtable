// backend/langchain/tripGraph.ts
 const { StateGraph, Annotation, END, Command } =require("@langchain/langgraph");
 const { getWeatherTool, getRouteTool, getItineraryTool, getEventTool } =require("./tool");

// Define the state annotation
const TripState = Annotation.Root({
  city: Annotation<string>,
  travelDate: Annotation<string>,
  startDate: Annotation<string>(),
  endDate: Annotation<string>(),
  origin: Annotation<string>(),
  destination: Annotation<string>(),
  weather: Annotation<object>(),
  route: Annotation<object>(),
  itinerary: Annotation<object>(),
  events: Annotation<object>(),
});

// Node functions
const weatherNode = async (state: typeof TripState.State) => {
  const result = await getWeatherTool.func({
    city: state.city || state.destination,
    travelDate: state.travelDate,
  });
  return {
    state: { ...state, weather: result },
    commands: [new Command("get_route")],
  };
};

const routeNode = async (state: typeof TripState.State) => {
  const result = await getRouteTool.func({
    origin: state.origin,
    destination: state.destination,
  });
  return {
    state: { ...state, route: result },
    commands: [new Command("get_itinerary")],
  };
};

const itineraryNode = async (state: typeof TripState.State) => {
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

const eventNode = async (state: typeof TripState.State) => {
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

// Build graph
const tripGraph = new StateGraph(TripState)
  .addNode("get_weather", weatherNode, { ends: ["get_route"] })
  .addNode("get_route", routeNode, { ends: ["get_itinerary"] })
  .addNode("get_itinerary", itineraryNode, { ends: ["get_event"] })
  .addNode("get_event", eventNode, { ends: [END] })
  .addEdge("__start__", "get_weather")
  .compile();

export { tripGraph };
