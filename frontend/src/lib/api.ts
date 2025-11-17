"use client";

import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
});

// Attach auth header
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const email = localStorage.getItem("auth_email");
    if (email) {
      config.headers["x-user-email"] = email;
    }
  }
  return config;
});

// -----------------------------
// GLOBAL ERROR HANDLER
// -----------------------------
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error.message ||
      "Unexpected system error";

    // Display toast error globally
    toast.error(msg);

    // Redirect 401 to login
    if (error?.response?.status === 401) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
