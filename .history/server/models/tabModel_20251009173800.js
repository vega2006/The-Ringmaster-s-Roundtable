const express = require("express");
const mongoose = require("mongoose");

// Tab Schema with tabId
const tabSchema = new mongoose.Schema({
  tabId: { type: String, unique: true }, // unique tab identifier
  name: String,
});
module.exports= mongoose.model("Tab", tabSchema);