const express = require("express");
const { getAllTabs,createTab,deleteTab}= require("../controllers/tabController.js");
const router = express.Router();

router.post("/", getAllTabs);
router.post("/createTab",createTab);
router.delete("deleteTab",deleteTab);
module.exports = router ;
