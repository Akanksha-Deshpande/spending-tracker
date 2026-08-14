import { apiRequest } from "./client";

export interface User {
    id: string;
    email: string;
}

interface LoginResponse {
    token: string;
    user: User;
}

export function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email,
            password,
        }),
    });
}

export function getProfile(token: string): Promise<{ user: User }> {
    return apiRequest<{ user: User }>("/auth/profile", {
        token,
    });
}