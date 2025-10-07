const express = require("express");
const { getBudget } = require("../controllers/budgetController.js");
const router = express.Router();

router.post("/", getBudget);

module.exports = router;
