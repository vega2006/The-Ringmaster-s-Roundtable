const express=require("express");
const router =express.Router();
const {tripHandler,getTripDetails}=require("../controllers/tripHandler");
router.post("/",tripHandler);
router.post("/tripDetails",getTripDetails);
module.exports=router;