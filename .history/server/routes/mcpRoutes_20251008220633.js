const express=require("express");
const router =express.Router();
const {tripHandler}=require("../controllers/mcpController.js");
router.post("/",tripHandler);

module.exports=router;