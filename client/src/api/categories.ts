import { apiRequest } from "./client";

export interface Category {
    id: string;
    name: string;
}

interface CategoriesResponse {
    categories: Category[];
}

export interface CreateCategoryData {
    name: string;
}

interface CreateCategoryResponse {
    category: Category;
}

export interface UpdateCategoryData {
    name: string;
}

interface UpdateCategoryResponse {
    category: Category;
}

export function getCategories(
    token: string
): Promise<CategoriesResponse> {
    return apiRequest<CategoriesResponse>("/categories", {
        token,
    });
}

export function createCategory(
    data: CreateCategoryData,
    token: string
): Promise<CreateCategoryResponse> {
    return apiRequest<CreateCategoryResponse>(
        "/categories",
        {
            method: "POST",
            token,
            body: JSON.stringify(data),
        }
    );
}

export async function deleteCategory(
    categoryId: string,
    token: string
): Promise<void> {
    await apiRequest<void>(
        `/categories/${categoryId}`,
        {
            method: "DELETE",
            token,
        }
    );
}

export function updateCategory(
    categoryId: string,
    data: UpdateCategoryData,
    token: string
): Promise<UpdateCategoryResponse> {
    return apiRequest<UpdateCategoryResponse>(
        `/categories/${categoryId}`,
        {
            method: "PATCH",
            token,
            body: JSON.stringify(data),
        }
    );
}