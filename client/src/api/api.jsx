import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;


const api = axios.create({
    baseURL: "http://localhost:4000/auth/",
    // withCredentials: true,
});

export const googleAuth = (code) => api.get(`/google?code=${code}`);


export const getWeather = (city, travelDate) => 
  axios.get(`${API_BASE}/weather?city=${encodeURIComponent(city)}&travelDate=${encodeURIComponent(travelDate)}`);
;

export const getRoute = (origin, destination, travelDate) =>
  axios.get(`${API_BASE}/maps?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelDate=${encodeURIComponent(travelDate)}`);


export const getEvents = (destination, startTravelDate, endTravelDate) =>
  axios.get(`${API_BASE}/events`, {
    params: {
      city: destination,
      startDate: startTravelDate,
      endDate: endTravelDate,
    },
  });

export const getTripBudget = async (payload) => {
  // console.log(payload);
  return axios.post(`${API_BASE}/budget`, payload);
};


export const getItinerary = async (destination,startDate, endDate) => {
  return axios.post(`${API_BASE}/itinerary/generate`, {
      destination,
      startDate,
      endDate,
    });
};

