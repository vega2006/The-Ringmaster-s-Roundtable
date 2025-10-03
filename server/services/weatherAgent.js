const axios = require("axios");



const fetchWeather = async (city, travelDate) => {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
  
  if (!API_KEY) {
      console.error("OPENWEATHER_API_KEY is missing!");
      throw new Error("API Key not configured.");
  }
  
  const res = await axios.get(url);
  const allForecasts = res.data.list;
  const cityName = res.data.city.name;

  let finalForecasts = [];

  if (travelDate) {
    const dateObj = new Date(travelDate);
    
    if (!isNaN(dateObj)) {
      const targetDateStr = dateObj.toISOString().slice(0, 10); 

      const entriesForTargetDay = allForecasts.filter(item => item.dt_txt.startsWith(targetDateStr));

      if (entriesForTargetDay.length > 0) {
        finalForecasts = entriesForTargetDay;
      }
    }
  }

  if (finalForecasts.length === 0) {
      const dailySummary = {};
      
     
      allForecasts.forEach(item => {
          const day = item.dt_txt.slice(0, 10); 
          
          if (!dailySummary[day] && item.dt_txt.includes("12:00:00")) {
              dailySummary[day] = item;
          }
 
          if (!dailySummary[day]) {
              dailySummary[day] = item;
          }
      });
      
      finalForecasts = Object.keys(dailySummary).slice(0, 5).map(dayKey => dailySummary[dayKey]);
  }
  
  return {
    city: cityName,
    forecast: finalForecasts.map(item => {
        const dateObj = new Date(item.dt_txt);
        const formatOptions = finalForecasts.length <= 5 ? 
            { weekday: "short", month: "short", day: "numeric" } : 
            { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true };

        const formattedDate = dateObj.toLocaleString("en-US", formatOptions);
        
        return {
            date: formattedDate,
            temp: item.main.temp,
            condition: item.weather[0].description
        };
    })
  };
};

module.exports = { fetchWeather };
