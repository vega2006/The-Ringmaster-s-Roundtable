export const API_KEY = "";
export const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

export const TABS = ["Plan", "Itinerary","Travel", "Weather", "Events","Result",,"Map View"];

export const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    destination: { type: "STRING" },
    duration_days: { type: "NUMBER" },
    summary: { type: "STRING" },
    itinerary: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "NUMBER" },
          date: { type: "STRING" },
          activities: { type: "ARRAY", items: { type: "STRING" } },
        },
      },
    },
  },
};
