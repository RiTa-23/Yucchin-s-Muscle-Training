import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import client from "../api/client";

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [loading, setLoading] = useState<boolean>(true);

    // Initial user fetch if token exists
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await client.get("/users/me");
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    logout();
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, [token]);

    const login = async (email: string, password: string) => {
        // Send email/password as JSON body
        const response = await client.post("/token", { email, password });
        const { access_token } = response.data;

        localStorage.setItem("token", access_token);
        setToken(access_token);

        // Fetch user immediately after login
        const userResponse = await client.get("/users/me");
        setUser(userResponse.data);
    };

    const signup = async (username: string, email: string, password: string) => {
        await client.post("/signup", { username, email, password });
        // Auto login after signup
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
