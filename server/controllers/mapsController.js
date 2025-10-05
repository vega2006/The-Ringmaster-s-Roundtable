const { fetchRoute } = require("../services/mapsAgent.js");
const getRoute = async (req, res) => {
  const { origin, destination, travelDate } = req.query;
  if (!origin || !destination || !travelDate) {
    return res.status(400).json({ error: "Origin, destination, and travel date required" });
  }

  try {
    const data = await fetchRoute(origin, destination);
    res.json(data);
  } catch (err) {
    console.error("Route fetch error:", err); 
    res.status(500).json({ error: "Failed to fetch route data" });
  }
};

module.exports = { getRoute };