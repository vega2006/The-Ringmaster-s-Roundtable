const axios = require("axios");

const fetchRoute = async (origin, destination) => {
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const modes = ["driving", "walking", "bicycling", "transit"];
  const routes = {};

  for (const mode of modes) {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${API_KEY}`;
    try {
      const res = await axios.get(url);
      if (res.data.routes.length > 0) {
        const leg = res.data.routes[0].legs[0];
        routes[mode] = {
          distance: leg.distance.text,
          duration: leg.duration.text,
          start: leg.start_address,
          end: leg.end_address
        };
      }
    } catch (err) {
      routes[mode] = { error: err.message };
    }
  }

  return routes;
};

module.exports = { fetchRoute };
