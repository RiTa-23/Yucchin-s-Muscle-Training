import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import client from "../api/client";

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Check auth status on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await client.get("/users/me");
                setUser(response.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (email: string, password: string) => {
        // Send email/password as JSON body
        // Cookie is set by backend automatically
        await client.post("/token", { email, password });

        // Fetch user immediately after login
        const userResponse = await client.get("/users/me");
        setUser(userResponse.data);
    };

    const signup = async (username: string, email: string, password: string) => {
        await client.post("/signup", { username, email, password });
        // Auto login after signup
        await login(email, password);
    };

    const logout = async () => {
        try {
            await client.post("/logout");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
            // No need to clear localStorage
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
