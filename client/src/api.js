import axios from "axios";

// Create axios instance
export const API = axios.create({
  baseURL: "http://localhost:5000/api", // Backend URL
});

// Automatically attach token to every request (if exists)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});