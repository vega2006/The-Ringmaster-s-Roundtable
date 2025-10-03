import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;




export const getWeather = (city, travelDate) => 
  axios.get(`${API_BASE}/weather?city=${encodeURIComponent(city)}&travelDate=${encodeURIComponent(travelDate)}}`);


export const getRoute = (origin, destination, travelDate) =>
  axios.get(`${API_BASE}/maps?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelDate=${encodeURIComponent(travelDate)}`);
