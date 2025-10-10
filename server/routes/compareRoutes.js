const express = require("express");
const { compareDestinationsHandler } = require("../controllers/compareController");

const router = express.Router();

// POST route for comparing destinations

router.post("/compare", compareDestinationsHandler);

// CommonJS export
module.exports = router;
