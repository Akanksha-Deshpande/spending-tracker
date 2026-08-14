import { useEffect, useState } from "react";
import { getPlans, createPlan, updatePlan, deletePlan } from "../api/plans";
import type { Plan } from "../api/plans";

export function usePlans(token: string | null) {
    const [plans, setPlans] = useState<Plan[]>([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(
        null
    );

    useEffect(() => {
        if (!token) {
            return;
        }

        const currentToken = token;

        async function fetchPlans() {
            try {
                setLoading(true);
                setError(null);

                const data = await getPlans(
                    currentToken
                );

                setPlans(data.plans);
            } catch (error) {
                console.error(
                    "Failed to fetch plans:",
                    error
                );

                setError("Failed to load plans");
                setPlans([]);
            } finally {
                setLoading(false);
            }
        }

        fetchPlans();
    }, [token]);

    async function addPlan(
        categoryId: string,
        month: string,
        amount: number,
        categoryName: string
    ) {
        if (!token) {
            throw new Error("Not authenticated");
        }

        const data = await createPlan(
            {
                categoryId,
                month,
                amount,
            },
            token
        );

        const newPlan: Plan = {
            ...data.plan,
            categoryName,
        };

        setPlans((currentPlans) => [
            ...currentPlans,
            newPlan,
        ]);
    }

    async function editPlan(
        planId: string,
        amount: number
    ) {
        if (!token) {
            throw new Error("Not authenticated");
        }

        const data = await updatePlan(
            planId,
            amount,
            token
        );

        setPlans((currentPlans) =>
            currentPlans.map((plan) =>
                plan.id === planId
                    ? {
                        ...plan,
                        amount: data.plan.amount,
                    }
                    : plan
            )
        );
    }

    async function removePlan(planId: string) {
        if (!token) {
            throw new Error("Not authenticated");
        }

        await deletePlan(planId, token);

        setPlans((currentPlans) =>
            currentPlans.filter(
                (plan) => plan.id !== planId
            )
        );
    }

    return {
        plans,
        loading,
        error,
        addPlan,
        editPlan,
        removePlan
    };
}