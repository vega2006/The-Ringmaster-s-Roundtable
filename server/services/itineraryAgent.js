// agents/itineraryAgent.js
const axios = require("axios");
require("dotenv").config();

const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY;

// Step 1 – Get city coordinates
async function geocodeCity(city) {
  const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    city
  )}&limit=1&apiKey=${GEOAPIFY_KEY}`;
  const { data } = await axios.get(geoUrl);

  if (!data.features || data.features.length === 0) {
    throw new Error("City not found");
  }

  const coords = data.features[0].geometry.coordinates; // [lon, lat]
  return { lon: coords[0], lat: coords[1] };
}

// Step 2 – Get places near those coordinates
exports.fetchPlaces = async (city) => {
  try {
    const { lat, lon } = await geocodeCity(city);

    const radius = 10000; // 10 km radius
    const url = `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:${lon},${lat},${radius}&limit=10&apiKey=${GEOAPIFY_KEY}`;

    const { data } = await axios.get(url);

    if (!data.features || data.features.length === 0) {
      console.warn("No places found near city");
      return [];
    }

    return data.features.map((f) => ({
      name: f.properties.name || f.properties.address_line1 || "Unknown place",
      category: f.properties.categories?.[0] || "Attraction",
    }));
  } catch (err) {
    console.error("Geoapify API error:", err.message);
    return [];
  }
};
