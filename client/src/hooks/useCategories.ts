import { useEffect, useState } from "react";
import {
    createCategory,
    getCategories,
    deleteCategory,
    updateCategory
} from "../api/categories";
import type { Category } from "../api/categories";

export function useCategories(token: string | null) {
    const [categories, setCategories] = useState<Category[]>(
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

        async function fetchCategories() {
            try {
                setLoading(true);
                setError(null);

                const data = await getCategories(
                    currentToken
                );

                setCategories(data.categories);
            } catch (error) {
                console.error(
                    "Failed to fetch categories:",
                    error
                );

                setError("Failed to load categories");
                setCategories([]);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, [token]);

    async function addCategory(name: string) {
        if (!token) {
            throw new Error("Not authenticated");
        }

        const data = await createCategory(
            { name },
            token
        );

        setCategories((currentCategories) => [
            ...currentCategories,
            data.category,
        ]);
    }

    async function removeCategory(categoryId: string) {
        if (!token) {
            throw new Error("Not authenticated");
        }

        await deleteCategory(categoryId, token);

        setCategories((currentCategories) =>
            currentCategories.filter(
                (category) => category.id !== categoryId
            )
        );
    }

    async function editCategory(
        categoryId: string,
        name: string
    ) {
        if (!token) {
            throw new Error("Not authenticated");
        }

        const data = await updateCategory(
            categoryId,
            { name },
            token
        );

        setCategories((currentCategories) =>
            currentCategories.map((category) =>
                category.id === categoryId
                    ? data.category
                    : category
            )
        );
    }

    return {
        categories,
        loading,
        error,
        addCategory,
        removeCategory,
        editCategory
    };
}