import axios from "axios";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    withCredentials: true, // Enable sending cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to add Bearer token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Prevent infinite redirect loop if already on auth page
            // Also ignore 401 on /users/me (initial auth check)
            if (
                window.location.pathname !== "/auth" &&
                !error.config?.url?.includes("/users/me")
            ) {
                window.location.href = "/auth";
            }
        }
        return Promise.reject(error);
    }
);

export default client;
