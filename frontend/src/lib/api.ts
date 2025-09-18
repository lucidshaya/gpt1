// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // adjust to your backend URL
  withCredentials: true, // if you use cookies
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // if you store JWT in localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
