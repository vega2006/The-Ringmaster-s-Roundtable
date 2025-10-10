

// Create a new tab
const createTab= async (req, res) => {
  const { userId, name } = req.body;
  if (!userId || !name) return res.status(400).json({ error: "Missing userId or name" });

  try {
    const newTab = new Tab({ name, userId });
    await newTab.save();
    res.json(newTab);
  } catch (err) {
    res.status(500).json({ error: "Failed to create tab" });
  }
};


module.exports = {createTab};