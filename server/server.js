const express = require("express");
const cors = require("cors");
require("dotenv").config();
const weatherRoutes = require("./routes/weatherRoutes.js");
const mapsRoutes = require("./routes/mapsRoutes.js");
const eventsRoutes = require("./routes/eventsRoutes.js")
const budgetRoutes = require("./routes/budgetRoutes.js");
const itineraryRoutes = require("./routes/itineraryRoutes.js")
const authRoutes = require("./routes/authRoutes.js");
const database = require("./config/database.js");

database.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/itinerary", itineraryRoutes);

app.use('/auth/', authRoutes); 

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
