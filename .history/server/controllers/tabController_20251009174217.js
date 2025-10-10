const Tab = require("../models/tabModel");
const { v4: uuidv4 } = require("uuid");

// Get all tabs for a user
const getAllTabs = async (req, res) => {
  const { userId } = req.query;
  try {
    const tabs = await Tab.find({ userId }).select("-_id tabId name"); // only send tabId & name
    res.json(tabs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tabs" });
  }
};

// Create a new tab
const createTab = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const tabId = uuidv4(); // generate unique tabId
    const defaultTabName = `Tab ${Date.now()}`; // default name, can be improved

    const newTab = new Tab({ userId, tabId, name: defaultTabName });
    await newTab.save();

    res.json({ tabId: newTab.tabId, name: newTab.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create tab" });
  }
};

// Select a tab
const selectTab = async (req, res) => {
  const { userId, tabId } = req.body;
  if (!userId || !tabId) return res.status(400).json({ error: "Missing fields" });

  try {
    // Optional: log or track tab selection for analytics
    res.json({ message: "Tab selected", tabId });
  } catch (err) {
    res.status(500).json({ error: "Failed to select tab" });
  }
};

module.exports = {
  getAllTabs,
  createTab,
};
