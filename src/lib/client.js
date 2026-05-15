import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/backend" : "https://collabration-teams.onrender.com");

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include authorization token
apiClient.interceptors.request.use(
  (config) => {
    const { session } = useAuthStore.getState();
    const token = session?.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
