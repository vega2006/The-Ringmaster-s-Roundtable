const express = require("express");
const cors = require("cors");
require("dotenv").config();
const weatherRoutes = require("./routes/weatherRoutes.js");
const mapsRoutes = require("./routes/mapsRoutes.js");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherRoutes);
app.use("/api/maps", mapsRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
