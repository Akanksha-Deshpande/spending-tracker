import { apiRequest } from "./client";


export interface Actual {
    id: string;
    categoryId: string;
    categoryName: string;
    month: string;
    amount: number;
    note: string;
}


interface ActualsResponse {
    actuals: Actual[];
}


interface CreateActualData {
    categoryId: string;
    month: string;
    amount: number;
    note?: string;
}


interface CreateActualResponse {
    actual: {
        id: string;
        categoryId: string;
        month: string;
        amount: number;
        note: string;
    };
}


interface UpdateActualResponse {
    actual: {
        id: string;
        categoryId: string;
        month: string;
        amount: number;
        note: string;
    };
}


export function getActuals(
    token: string
): Promise<ActualsResponse> {
    return apiRequest<ActualsResponse>(
        "/actuals",
        {
            token,
        }
    );
}


export function createActual(
    data: CreateActualData,
    token: string
): Promise<CreateActualResponse> {
    return apiRequest<CreateActualResponse>(
        "/actuals",
        {
            method: "POST",
            token,
            body: JSON.stringify(data),
        }
    );
}


export function updateActual(
    actualId: string,
    amount: number,
    note: string,
    token: string
): Promise<UpdateActualResponse> {
    return apiRequest<UpdateActualResponse>(
        `/actuals/${actualId}`,
        {
            method: "PATCH",
            token,
            body: JSON.stringify({
                amount,
                note,
            }),
        }
    );
}


export function deleteActual(
    actualId: string,
    token: string
): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
        `/actuals/${actualId}`,
        {
            method: "DELETE",
            token,
        }
    );
}