import { apiRequest } from "./client";

export interface Plan {
    id: string;
    categoryId: string;
    categoryName: string;
    month: string;
    amount: number;
}

interface PlansResponse {
    plans: Plan[];
}

interface CreatePlanData {
    categoryId: string;
    month: string;
    amount: number;
}

interface CreatePlanResponse {
    plan: {
        id: string;
        categoryId: string;
        month: string;
        amount: number;
    };
}

interface UpdatePlanResponse {
    plan: {
        id: string;
        categoryId: string;
        month: string;
        amount: number;
    };
}

export function updatePlan(
    planId: string,
    amount: number,
    token: string
): Promise<UpdatePlanResponse> {
    return apiRequest<UpdatePlanResponse>(
        `/plans/${planId}`,
        {
            method: "PATCH",
            token,
            body: JSON.stringify({ amount }),
        }
    );
}

export function getPlans(
    token: string
): Promise<PlansResponse> {
    return apiRequest<PlansResponse>("/plans", {
        token,
    });
}

export function createPlan(
    data: CreatePlanData,
    token: string
): Promise<CreatePlanResponse> {
    return apiRequest<CreatePlanResponse>("/plans", {
        method: "POST",
        token,
        body: JSON.stringify(data),
    });
}

export function deletePlan(
    planId: string,
    token: string
): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(
        `/plans/${planId}`,
        {
            method: "DELETE",
            token,
        }
    );
}