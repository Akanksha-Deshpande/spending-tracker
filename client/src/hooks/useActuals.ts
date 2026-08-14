import { useEffect, useState } from "react";
import {
    createActual,
    deleteActual,
    getActuals,
    updateActual,
} from "../api/actuals";
import type { Actual } from "../api/actuals";
import type { Category } from "../api/categories";

export function useActuals(
    token: string | null,
    categories: Category[]
) {
    const [actuals, setActuals] = useState<Actual[]>(
        []
    );

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(
        null
    );

    useEffect(() => {
        if (!token) {
            return;
        }

        const currentToken = token;

        async function fetchActuals() {
            try {
                setLoading(true);
                setError(null);

                const data = await getActuals(
                    currentToken
                );

                const actualsWithCategoryName =
                    data.actuals.map((actual) => {
                        const category =
                            categories.find(
                                (category) =>
                                    category.id ===
                                    actual.categoryId
                            );

                        return {
                            ...actual,
                            categoryName:
                                category?.name ??
                                "Unknown category",
                        };
                    });

                setActuals(
                    actualsWithCategoryName
                );
            } catch (error) {
                console.error(
                    "Failed to fetch actuals:",
                    error
                );

                setError(
                    "Failed to load actuals"
                );

                setActuals([]);
            } finally {
                setLoading(false);
            }
        }

        fetchActuals();
    }, [token, categories]);

    async function addActual(
        categoryId: string,
        month: string,
        amount: number,
        note: string,
        categoryName: string
    ) {
        if (!token) {
            throw new Error(
                "Not authenticated"
            );
        }

        const data = await createActual(
            {
                categoryId,
                month,
                amount,
                note,
            },
            token
        );


        const newActual: Actual = {
            ...data.actual,
            categoryName
        };

        setActuals(
            (currentActuals) => [
                ...currentActuals,
                newActual,
            ]
        );
    }

    async function editActual(
        actualId: string,
        amount: number,
        note: string
    ) {
        if (!token) {
            throw new Error(
                "Not authenticated"
            );
        }

        const data = await updateActual(
            actualId,
            amount,
            note,
            token
        );

        setActuals(
            (currentActuals) =>
                currentActuals.map(
                    (actual) =>
                        actual.id === actualId
                            ? {
                                  ...actual,
                                  amount:
                                      data.actual
                                          .amount,
                                  note:
                                      data.actual
                                          .note,
                              }
                            : actual
                )
        );
    }

    async function removeActual(
        actualId: string
    ) {
        if (!token) {
            throw new Error(
                "Not authenticated"
            );
        }

        await deleteActual(
            actualId,
            token
        );

        setActuals(
            (currentActuals) =>
                currentActuals.filter(
                    (actual) =>
                        actual.id !==
                        actualId
                )
        );
    }

    return {
        actuals,
        loading,
        error,
        addActual,
        editActual,
        removeActual,
    };
}