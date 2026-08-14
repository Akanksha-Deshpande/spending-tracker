import { apiRequest } from "./client";


export interface Lock {
    id: string;
    month: string;
}


interface LocksResponse {
    locks: Lock[];
}


interface LockResponse {
    lock: Lock;
}


export function getLocks(
    token: string
): Promise<LocksResponse> {
    return apiRequest<LocksResponse>(
        "/locks",
        {
            token,
        }
    );
}


export function lockMonth(
    month: string,
    token: string
): Promise<LockResponse> {
    return apiRequest<LockResponse>(
        `/locks/${month}`,
        {
            method: "POST",
            token,
        }
    );
}


export function unlockMonth(
    month: string,
    note: string,
    token: string
): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
        `/locks/${month}/unlock`,
        {
            method: "POST",
            token,
            body: JSON.stringify({
                note,
            }),
        }
    );
}