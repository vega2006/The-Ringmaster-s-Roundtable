const mongoose = require("mongoose");

const tripModelSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  tripId: { type: String, required: true, unique: true },
  origin: { type: String },
  destination: { type: String },
  weather: { type: Object, default: {} },
  route: { type: Object, default: {} },
  itinerary: { type: Object, default: {} },
  events: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model("tripModel", tripModelSchema);
