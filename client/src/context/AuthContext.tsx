import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getProfile, login as loginApi } from "../api/auth";
import type { User } from "../api/auth";

interface IAuthContextValue {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<IAuthContextValue | undefined>(
    undefined
);

interface IAuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: IAuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);

    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );

    const [loading, setLoading] = useState(true);

    const isAuthenticated = user !== null;

    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
            setLoading(false);
            return;
        }

        getProfile(storedToken)
            .then((data) => {
                setToken(storedToken);
                setUser(data.user);
            })
            .catch(() => {
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    async function login(email: string, password: string) {
        const data = await loginApi(email, password);

        localStorage.setItem("token", data.token);

        setToken(data.token);
        setUser(data.user);
    }

    function logout() {
        localStorage.removeItem("token");

        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within an AuthProvider"
        );
    }

    return context;
}