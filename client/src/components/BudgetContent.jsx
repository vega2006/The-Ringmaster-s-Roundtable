

import React from 'react';
import { useTrip } from '../contexts/TripContext'; 

export default function BudgetContent() {
    const { budgetEstimate, isManualLookup, isLoading, error } = useTrip();
    // console.log("💡 budgetEstimate from context:", budgetEstimate);

    // --- Error State (Red is standard for errors, so keep the color) ---
    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg max-w-lg mx-auto my-8">
                ❌ Error: Failed to load budget. {error}
            </div>
        );
    }

    // --- Loading State: CHANGED from 'blue' to 'sky' ---
    if (isLoading && isManualLookup) {
        return (
            <div className="flex items-center justify-center p-10 max-w-lg mx-auto my-8 bg-sky-50 text-sky-700 rounded-lg shadow-md">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-semibold">Calculating Budget...</span>
            </div>
        );
    }
    
    // --- Initial/Empty State (Gray is standard, keep it) ---
    if (!budgetEstimate) {
        return (
            <div className="text-gray-500 italic text-center p-10 max-w-lg mx-auto my-8 bg-gray-50 rounded-lg border border-gray-200">
                💰 Budget planner: Enter your Origin, Destination, and Dates to get a trip cost estimate.
            </div>
        );
    }

    const { total, breakdown, duration_days, duration_nights } = budgetEstimate;

    const estimatedPeople = budgetEstimate.numPeople || 2;


    return (
        <div className="p-6 max-w-xl mx-auto my-8 bg-white border border-gray-200 rounded-xl shadow-2xl">
            <header className="mb-6 border-b pb-4">
                {/* CHANGED from 'text-green-600' to 'text-sky-700' */}
                <h2 className="text-3xl font-extrabold text-sky-700">
                    Estimated Trip Budget
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Estimate for **{duration_days} days** ({duration_nights} nights) and **{estimatedPeople} people**. 
                </p>
            </header>
            
            <div className="space-y-3">
                {Object.entries(breakdown)
                    .filter(([key]) => key !== 'travel_type') 
                    .map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <span className="flex items-center text-gray-700 font-medium">
                                {/* Emojis provide visual distinction for the categories */}
                                {key === 'travel' && <span className="mr-2">✈️</span>}
                                {key === 'accommodation' && <span className="mr-2">🏨</span>}
                                {key === 'food' && <span className="mr-2">🍽️</span>}
                                {key === 'activities' && <span className="mr-2">🎟️</span>}
                                {key === 'miscellaneous' && <span className="mr-2">🛍️</span>}
                                {key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}
                            </span>
                            <span className="font-semibold text-lg text-gray-800">${value.toFixed(2)}</span>
                        </div>
                    ))}
            </div>

            {/* CHANGED from 'bg-green-50/border-2/border-green-200' to 'bg-sky-50/border-2/border-sky-200' and 'text-green-800' to 'text-sky-800' */}
            <div className="flex justify-between items-center mt-8 p-4 bg-sky-50 rounded-lg border-2 border-sky-200">
                <span className="text-xl font-bold text-sky-800">TOTAL ESTIMATE</span>
                <span className="text-3xl font-extrabold text-sky-800">${total.toFixed(2)}</span>
            </div>
            
            <footer className="mt-5 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 italic">
                    *Travel mode: **{breakdown.travel_type}**. All non-travel costs (Accommodation, Food, Activities) are based on cost-of-living data for your destination city.
                </p>
            </footer>
        </div>
    );
}