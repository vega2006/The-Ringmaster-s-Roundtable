const express = require("express");
const { getWeather }= require("../controllers/weatherController.js");
const router = express.Router();

router.get("/", getWeather);

module.exports = router;
