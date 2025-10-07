const { fetchEvents } = require("../services/eventsAgent.js");

const getEvents = async (req, res) => {
  const { city, startDate, endDate } = req.query;

  if (!city || !startDate) {
    return res.status(400).json({ error: "City and start date are required for event lookup." });
  }

  try {
    const data = await fetchEvents(city, startDate, endDate);
    res.json(data);
    // console.log(data);
    
  } catch (err) {
    console.error("Events fetch error:", err);
    res.status(500).json({ error: "Failed to fetch events data from external API." });
  }
};

module.exports = { getEvents };
