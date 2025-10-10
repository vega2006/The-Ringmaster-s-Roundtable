
const Tab= require("../models/tabModel")
// Create a new tab
// Get all tabs for a user
const getAllTabs=async (req, res) => {
  const { userId } = req.query;
  try {
    const tabs = await Tab.find({ userId }).select("-_id tabId name"); // only send tabId & name
    res.json(tabs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tabs" });
  }
};

// Create a new tab
const createTab=async (req, res) => {
  const { userId } = req.body;
  if (!userId ) return res.status(400).json({ error: "Missing fields" });

  try {
    const newTab = new Tab({ name, userId,tabId });
    await newTab.save();
    res.json({ tabId: newTab.tabId, name: newTab.name });
  } catch (err) {
    res.status(500).json({ error: "Failed to create tab" });
  }
};