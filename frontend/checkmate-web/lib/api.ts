import axios from "axios";
import { useAuth } from "@/store/auth";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Hər request-ə token əlavə et
api.interceptors.request.use((config) => {
    const token = useAuth.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// 401 olanda logout
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            useAuth.getState().logout();
            if (typeof window !== "undefined") window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);