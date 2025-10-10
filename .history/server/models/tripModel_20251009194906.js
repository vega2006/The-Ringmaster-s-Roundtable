const mongoose = require("mongoose");

const tripModelSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tripId: { type: String, required: true, unique: true },
  origin: { type: String },
  destination: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  weather: { type: Object, default: {} },
  route: { type: Object, default: {} },
  itinerary: { type: Object, default: {} },
  events: { type: Object, default: {} },
  finalResponse: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripModelSchema);
