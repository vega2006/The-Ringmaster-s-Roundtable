const Tab = require("../models/tabModel");
const Trip=require("../models/tripModel");
const { v4: uuidv4 } = require("uuid");

// Get all tabs for a user
const getAllTabs = async (req, res) => {
  const { userId } = req.body;

  try {
    const tabs = await Tab.find({ userId });// only send tabId & name
    res.json(tabs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tabs" });
  }
};

// Create a new tab
const createTab = async (req, res) => {
  const { userId ,tabName} = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const tabId = uuidv4(); // generate unique tabId
    let defaultTabName = `Tab ${Date.now()}`; // default name, can be improved
    if(tabName)defaultTabName=tabName;
    const newTab = new Tab({ userId, tabId, name: defaultTabName });
    await newTab.save();

    res.json({ tabId: newTab.tabId, name: newTab.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create tab" });
  }
};

const deleteTab = async (req, res) => {
  try {
    const { tabId, userId } = req.body;

    if (!tabId || !userId) {
      return res.status(400).json({ message: "Missing tabId or userId." });
    }

    // Delete the tab
    const tab = await Tab.findOneAndDelete({ tabId, userId });
    if (!tab) {
      return res.status(404).json({ message: "Tab not found." });
    }

    // Delete corresponding trip 
    await Trip.findOneAndDelete({ tabId, userId });

    return res.status(200).json({
      message: "Tab and its associated trip deleted successfully.",
      deletedTabId: tabId,
    });
  } catch (error) {
    console.error("Error deleting the tab:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the tab.",
      error: error.message,
    });
  }
};
module.exports = {
  getAllTabs,
  createTab,
  deleteTab,
};
