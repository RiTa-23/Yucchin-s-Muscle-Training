import axios from "axios";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    withCredentials: true, // Enable sending cookies
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor removed as we now use HttpOnly cookies

export default client;
