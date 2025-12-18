import axios from "axios";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    withCredentials: true, // Enable sending cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to handle 401 Unauthorized errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Prevent infinite redirect loop if already on auth page
            if (window.location.pathname !== "/auth") {
                window.location.href = "/auth";
            }
        }
        return Promise.reject(error);
    }
);

export default client;
