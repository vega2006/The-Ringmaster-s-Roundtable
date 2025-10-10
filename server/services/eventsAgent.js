const axios = require("axios");

const TICKETMASTER_API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const fetchEvents = async (city, startDate, endDate) => {
  const API_KEY = process.env.TICKETMASTER_API_KEY;
 console.log(city +" "+startDate+" "+endDate);
  const startDateTime = `${startDate}T00:00:00Z`;
  const endDateTime = endDate ? `${endDate}T23:59:59Z` : `${startDate}T23:59:59Z`;

  try {
    const response = await axios.get(TICKETMASTER_API_URL, {
      params: {
        apikey: API_KEY,
        city: city,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        countryCode: 'US',
        size: 6,
      },
    });

    const events = response.data._embedded?.events || [];
    // console.log((response.data));
    
    return events.map(event => ({
      name: event.name,
      date: event.dates.start.localDate,
      time: event.dates.start.localTime || 'N/A',
      venue: event._embedded?.venues?.[0]?.name || 'TBD',
      url: event.url,
    }));
  } catch (error) {
    console.error("Ticketmaster API call failed:", error.message);
    throw new Error("Failed to fetch events. Please check your parameters.");
  }
};

module.exports = { fetchEvents };

// const axios = require("axios");

// const TICKETMASTER_API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

// const fetchEvents = async (city, startDate, endDate, countryCode = null) => {
//   const API_KEY = process.env.TICKETMASTER_API_KEY;
//   if (!city || !startDate) throw new Error("City and startDate are required");

//   const startDateTime = new Date(startDate).toISOString();
//   const endDateTime = endDate ? new Date(endDate).toISOString() : new Date(startDate).toISOString();

//   try {
//     const params = {
//       apikey: API_KEY,
//       city,
//       startDateTime,
//       endDateTime,
//       size: 6,
//     };

//     if (countryCode) params.countryCode = countryCode;

//     const response = await axios.get(TICKETMASTER_API_URL, { params });

//     const events = response.data._embedded?.events || [];

//     return events.map(event => ({
//       name: event.name,
//       date: event.dates.start.localDate,
//       time: event.dates.start.localTime || "N/A",
//       venue: event._embedded?.venues?.[0]?.name || "TBD",
//       url: event.url,
//     }));
//   } catch (error) {
//     console.error("Ticketmaster API call failed:", error.response?.data || error.message);
//     throw new Error("Failed to fetch events. Please check your parameters.");
//   }
// };

// module.exports = { fetchEvents };
