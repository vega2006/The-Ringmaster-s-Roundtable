const express = require("express");
const { getAllTabs,createTab}= require("../controllers/tabController.js");
const router = express.Router();

router.post("/", getAllTabs);
router.post("/createTab",createTab);
module.exports = router ;
