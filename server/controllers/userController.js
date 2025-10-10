const User = require("../models/User");


exports.updateUserProfile = async (req, res) => {
    try {
        const { email, name, image, preferences } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required to update profile" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { name, image, preferences },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error while updating profile" });
    }
};