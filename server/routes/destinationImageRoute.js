const express = require("express");
const {getDestinationImage}=require("../services/destinationImageAgent");
const router = express.Router();

router.get("/:query", getDestinationImage);

module.exports = router;
