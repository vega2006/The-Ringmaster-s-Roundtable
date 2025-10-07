// controllers/budgetController.js

const { fetchBudget } = require('../services/budgetAgent.js'); 

const getBudget = async (req, res) => {
    
    const tripDetails = req.body;
    const { origin, destination, startTravelDate, endTravelDate, numPeople } = tripDetails;
    
    if (!origin || !destination || !startTravelDate || !endTravelDate || !numPeople) {
        return res.status(400).json({ error: "Missing required budget parameters." });
    }

    try {
        
        const result = await fetchBudget(tripDetails);
        
 
        return res.json(result);
        
    } catch (error) {
    
        console.error("Controller Error in /budget:", error.message, error.stack); 
        
        return res.status(500).json({ 
            error: "Failed to process budget estimation on the server.",
            details: error.message 
        });
    }
};

module.exports = { getBudget };