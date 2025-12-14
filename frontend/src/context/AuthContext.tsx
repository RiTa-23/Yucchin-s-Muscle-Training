import React, { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

interface User {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            fetchUser();
        } else {
            localStorage.removeItem("token");
            setUser(null);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await client.get("/users/me");
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user", error);
            logout();
        }
    };

    const login = async (username: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const response = await client.post("/token", formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        setToken(response.data.access_token);
    };

    const signup = async (username: string, email: string, password: string) => {
        await client.post("/signup", {
            username,
            email,
            password,
        });
        // Auto login after signup
        await login(username, password);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
