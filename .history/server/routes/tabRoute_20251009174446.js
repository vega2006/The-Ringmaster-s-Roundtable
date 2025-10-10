const express = require("express");
const { getAllTabs,createTab}= require("../controllers/tabsController.js");
const router = express.Router();

router.get("/", getAllTabs);
router.post("/createTab",createTab);
module.exports = router ;
