import axios from "axios";

const base = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;