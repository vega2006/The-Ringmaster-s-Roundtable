// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { updateUserProfile, getUserByEmail } = require("../controllers/userController");

// PUT → Update user profile
router.put("/update", updateUserProfile);

module.exports = router;
