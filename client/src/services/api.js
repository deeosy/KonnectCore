import axios from "axios";

// The JWT is stored in localStorage and attached to every request via the
// request interceptor below. The baseURL ('/api') is proxied to the backend
// by the Vite dev server (see vite.config.js), so no absolute URL is needed.
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the auth token to every outgoing request. If no token is present
// (e.g. first load before login), send the request unauthenticated.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling: when the server rejects a request with an expired or
// invalid token, clear the cached session and bounce the user to /login.
// This is done once here rather than in every page so the auth expiry
// behaviour is consistent across the app. The pathname guard prevents a
// redirect loop if the user is already on the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
