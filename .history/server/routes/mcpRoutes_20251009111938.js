const express=require("express");
const router =express.Router();
const {tripHandler}=require("../controllers/tripHandler");
router.post("/",tripHandler);

module.exports=router;