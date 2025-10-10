const axios = require("axios")

const fetchRoute = async (origin, destination) => {
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${API_KEY}`;
  const res = await axios.get(url);

  const route = res.data.routes[0].legs[0];
  return {
    distance: route.distance.text,
    duration: route.duration.text,
    start: route.start_address,
    end: route.end_address
  };
};
module.exports = {fetchRoute}
