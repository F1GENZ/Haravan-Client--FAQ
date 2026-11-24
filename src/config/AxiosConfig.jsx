import axios from "axios";
import { clearSession, getSessionToken } from "../lib/session";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Pages that must stay reachable without a session; a 401 there must not bounce us in a loop.
const PUBLIC_ROUTES = ["/install/login", "/install/grandservice"];

httpClient.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      const path = window.location.pathname;
      if (!PUBLIC_ROUTES.some((route) => path.startsWith(route))) {
        window.location.replace("/install/login");
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
