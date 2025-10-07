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
        
        // 1. Remove console.log in final code to ensure no unexpected side effects
        // 2. Explicitly return the response to ensure the function ends here
        return res.json(result);
        
    } catch (error) {
        // Log the full error to the server console for debugging
        console.error("Controller Error in /budget:", error.message, error.stack); 
        
        // This catch block executes if fetchBudget fails (e.g., Google Maps API failure)
        // Send a 500 error back to the frontend with a specific message
        return res.status(500).json({ 
            error: "Failed to process budget estimation on the server.",
            details: error.message 
        });
    }
};

module.exports = { getBudget };