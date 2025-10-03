const express = require("express");
const { getRoute }= require("../controllers/mapsController.js");
const router = express.Router();

router.get("/", getRoute);

module.exports = router ;
