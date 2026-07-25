// ============================================
// ARAB UNITY SCHOOL
// API Service
// Central Axios setup for backend requests
// ============================================

import axios from "axios";

export const API_MUTATION_EVENT = "operations-platform:api-mutation";

const WRITE_METHODS = new Set(["post", "put", "patch", "delete"]);

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("liveModeToken") || localStorage.getItem("token");

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired / invalid token
api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();
    if (WRITE_METHODS.has(method)) {
      window.dispatchEvent(
        new CustomEvent(API_MUTATION_EVENT, {
          detail: {
            method,
            url: response.config?.url || "",
          },
        })
      );
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "PASSWORD_CHANGE_REQUIRED" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
