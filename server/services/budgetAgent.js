// budgetAgent.js

const axios = require("axios");

const FLIGHT_THRESHOLD_KM = 800;
const AVG_CAR_MPG_KM_PER_LITER = 10.6; 
const AVG_FUEL_PRICE_USD_PER_LITER = 1.05;
const DEFAULT_MISC_PER_DAY_PP = 15;

// --- STATIC FALLBACK DATA (Keyed by City Name) ---
const CITY_COST_FALLBACKS = {
  "new york": { daily_food_pp: 90, avg_hotel_nightly_pp: 150, daily_activities_pp: 55 },
  "paris": { daily_food_pp: 75, avg_hotel_nightly_pp: 120, daily_activities_pp: 40 },
  "bangkok": { daily_food_pp: 35, avg_hotel_nightly_pp: 70, daily_activities_pp: 25 },
  "london": { daily_food_pp: 85, avg_hotel_nightly_pp: 140, daily_activities_pp: 50 },
  "tokyo": { daily_food_pp: 70, avg_hotel_nightly_pp: 110, daily_activities_pp: 45 },
  "DEFAULT": { daily_food_pp: 60, avg_hotel_nightly_pp: 100, daily_activities_pp: 40 }, 
};

async function getDistance(origin, destination) {
  try {
    const resp = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json`, {
      params: {
        origins: origin,
        destinations: destination,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    const distanceMeters = resp.data.rows[0].elements[0].distance.value;
    return distanceMeters / 1000; 
  } catch (e) {
    console.error("Error fetching distance:", e.message);
    return 500; // fallback distance
  }
}

async function getEstimatedFlightPrice(origin, destination, date, people) {
  const distance = await getDistance(origin, destination);
  return ((distance / 5) + 300) * people;
}

async function getCityCostData(destinationCity) {
  const cityKey = destinationCity.split(',')[0].toLowerCase().trim();
  const formattedSlug = cityKey.replace(/\s+/g, '-'); 
  
  const localFallback = CITY_COST_FALLBACKS[cityKey] || CITY_COST_FALLBACKS["DEFAULT"];

  try {
    console.log(`🌍 Attempting to fetch Teleport data for: ${formattedSlug}`);
    
    // 2. Try Teleport API
    const resp = await axios.get(
      `https://api.teleport.org/api/urban_areas/slug:${formattedSlug}/details/`,
      { timeout: 15000 }
    );

    const categories = resp.data.categories;

    let daily_food_pp = 60;
    let avg_hotel_nightly_pp = 100;
    let daily_activities_pp = 40;

    const foodCat = categories.find(c => c.id === "COST-OF-LIVING");
    if (foodCat) {
      const mealData = foodCat.data.find(d => d.label.includes("Meal") || d.label.includes("Lunch"));
      if (mealData?.currency_dollar_value) {
        daily_food_pp = mealData.currency_dollar_value * 2.5;
      }
    }

    const rentCat = categories.find(c => c.id === "HOUSING");
    if (rentCat) {
      const hotelData = rentCat.data.find(d => d.label.includes("1 bedroom apartment") || d.label.includes("Studio"));
      if (hotelData?.currency_dollar_value) {
        avg_hotel_nightly_pp = hotelData.currency_dollar_value / 30;
      }
    }

    // 🎟️ Approx daily activities cost
    daily_activities_pp = daily_food_pp * 0.6;
    
    console.log(`✅ Teleport API success for ${cityKey}:`, { daily_food_pp, avg_hotel_nightly_pp, daily_activities_pp });
    return { daily_food_pp, avg_hotel_nightly_pp, daily_activities_pp };

  } catch (e) {
    // 3. FALLBACK: If Teleport fails, return static data
    console.warn(`⚠️ Teleport API failed for ${cityKey}: ${e.message}`);
    console.log(`📊 Using static fallback data:`, localFallback);
    return localFallback;
  }
}

// --- Main Budget Calculation ---
const fetchBudget = async (tripDetails) => {
  // console.log("🚀 fetchBudget called with:", tripDetails);
  
  const { origin, destination, startTravelDate, endTravelDate, numPeople } = tripDetails;

  // Calculate duration
  const people = parseInt(numPeople) || 1;
  const startDate = new Date(startTravelDate);
  const endDate = new Date(endTravelDate);
  const durationDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 3600 * 24)) + 1);
  const durationNights = Math.max(0, durationDays - 1);

  console.log(`📅 Trip: ${durationDays} days, ${durationNights} nights, ${people} people`);

  const breakdown = {};
  let totalBudget = 0;

  // 1. Travel Cost
  console.log("🚗 Calculating travel cost...");
  const distanceKm = await getDistance(origin, destination) * 2; // Round trip

  if (distanceKm < FLIGHT_THRESHOLD_KM) {
    const litersNeeded = distanceKm / AVG_CAR_MPG_KM_PER_LITER;
    breakdown.travel = litersNeeded * AVG_FUEL_PRICE_USD_PER_LITER;
    breakdown.travel_type = "Car (Fuel Estimate)";
  } else {
    breakdown.travel = await getEstimatedFlightPrice(origin, destination, startTravelDate, people);
    breakdown.travel_type = "Flight (Estimate)";
  }

  console.log(`✈️ Travel cost: $${breakdown.travel.toFixed(2)} (${breakdown.travel_type})`);

  // 2. Get City Cost Data
  console.log("🏙️ Fetching city cost data...");
  const cityCosts = await getCityCostData(destination);
  console.log("🌆 City costs received:", cityCosts);

  // 3. Accommodation
  breakdown.accommodation = cityCosts.avg_hotel_nightly_pp * durationNights * people;
  console.log(`🏨 Accommodation: $${breakdown.accommodation.toFixed(2)}`);

  // 4. Food
  breakdown.food = cityCosts.daily_food_pp * durationDays * people;
  console.log(`🍽️ Food: $${breakdown.food.toFixed(2)}`);

  // 5. Activities
  breakdown.activities = cityCosts.daily_activities_pp * durationDays * people;
  console.log(`🎭 Activities: $${breakdown.activities.toFixed(2)}`);

  // 6. Miscellaneous
  breakdown.miscellaneous = DEFAULT_MISC_PER_DAY_PP * durationDays * people;
  console.log(`💼 Miscellaneous: $${breakdown.miscellaneous.toFixed(2)}`);

  // Calculate total
  totalBudget = Object.values(breakdown)
    .filter(v => typeof v === 'number')
    .reduce((sum, val) => sum + val, 0);

  const result = {
    success: true,
    duration_days: durationDays,
    duration_nights: durationNights,
    total: parseFloat(totalBudget.toFixed(2)),
    breakdown: {
      travel: parseFloat(breakdown.travel.toFixed(2)),
      travel_type: breakdown.travel_type,
      accommodation: parseFloat(breakdown.accommodation.toFixed(2)),
      food: parseFloat(breakdown.food.toFixed(2)),
      activities: parseFloat(breakdown.activities.toFixed(2)),
      miscellaneous: parseFloat(breakdown.miscellaneous.toFixed(2))
    }
  };

  console.log("💰 Final budget result:", result);
  return result;
};

module.exports = { fetchBudget };