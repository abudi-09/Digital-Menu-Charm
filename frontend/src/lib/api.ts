import axios, { AxiosHeaders, type AxiosRequestHeaders } from "axios";
import { getToken } from "./auth";
import { clearToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5001/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      const headers = (config.headers ?? {}) as AxiosRequestHeaders;
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    }
  }
  return config;
});

export default api;

// Global response handler: if backend returns 401 for protected endpoints,
// clear local token and redirect to admin login so user can re-authenticate.
api.interceptors.response.use(
  (resp) => resp,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        clearToken();
        // if we're on an admin route, navigate to admin login
        if (window && window.location) {
          const href = window.location.href;
          if (href.includes("/admin")) {
            window.location.href = "/admin/login";
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(err);
  }
);
