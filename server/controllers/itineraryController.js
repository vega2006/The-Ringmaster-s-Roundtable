const { fetchPlaces } = require("../services/itineraryAgent.js");
const moment = require("moment");

exports.generateItinerary = async (req, res) => {
  try {
    const { destination, startDate, endDate } = req.body;
    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const totalDays =
      moment(endDate).diff(moment(startDate), "days") + 1;

    const places = await fetchPlaces(destination);

    // Create simple day-by-day plan
    const dailyPlan = [];
    let placeIndex = 0;

    for (let day = 1; day <= totalDays; day++) {
      dailyPlan.push({
        day,
        morning: places[placeIndex++]?.name || "Free exploration",
        afternoon: places[placeIndex++]?.name || "Leisure time",
        evening: places[placeIndex++]?.name || "Local food tour",
      });
    }

    res.json({
      destination,
      totalDays,
      itinerary: dailyPlan,
    });
  } catch (error) {
    console.error("Itinerary generation error:", error.message);
    res.status(500).json({ error: "Failed to generate itinerary" });
  }
};
