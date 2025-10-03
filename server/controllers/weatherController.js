const { fetchWeather } = require("../services/weatherAgent.js");

const getWeather = async (req, res) => {
  const { city , travelDate} = req.query;
  if (!city) return res.status(400).json({ error: "City is required" });
  if(!travelDate) return res.status(400).json({error: "travel date is req"});
  try {
    const data = await fetchWeather(city, travelDate);
    res.json(data);
  } catch (err) {
    console.error("Weather fetch error:", err); 
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};


module.exports = {getWeather}
