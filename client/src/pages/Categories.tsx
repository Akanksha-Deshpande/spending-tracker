import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCategories } from "../hooks/useCategories";
import "../styles/categories.css";

function Categories() {
    const { token } = useAuth();

    const {
        categories,
        loading,
        error,
        addCategory,
        removeCategory,
        editCategory
    } = useCategories(token);

    const [name, setName] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(
        null
    );

    const [deleteError, setDeleteError] = useState<string | null>(
        null
    );

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [editingError, setEditingError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        try {
            setCreating(true);
            setCreateError(null);

            await addCategory(trimmedName);

            setName("");
        } catch (error) {
            console.error(
                "Failed to create category:",
                error
            );

            setCreateError(
                error instanceof Error
                    ? error.message
                    : "Failed to create category"
            );
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(categoryId: string) {
        const category = categories.find(
            (category) => category.id === categoryId
        );

        if (!category) {
            return;
        }

        const confirmed = window.confirm(
            `Delete ${category.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleteError(null);

            await removeCategory(categoryId);

            setDeleteError(null);
        } catch (error) {
            console.error(
                "Failed to delete category:",
                error
            );

            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete category"
            );
        }
    }

    async function handleEdit(
        categoryId: string
    ) {
        const trimmedName = editingName.trim();

        if (!trimmedName) {
            return;
        }

        try {
            setUpdating(true);
            setEditingError(null);

            await editCategory(
                categoryId,
                trimmedName
            );

            setEditingId(null);
            setEditingName("");
        } catch (error) {
            console.error(
                "Failed to update category:",
                error
            );

            setEditingError(
                error instanceof Error
                    ? error.message
                    : "Failed to update category"
            );
        } finally {
            setUpdating(false);
        }
    }

    return (
        <div className="categories-page">
            <h1>Categories</h1>

            <form className="category-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                        setCreateError(null);
                    }}
                    placeholder="Category name"
                />

                <button
                    type="submit"
                    disabled={
                        creating || !name.trim()
                    }
                >
                    {creating
                        ? "Creating..."
                        : "Add Category"}
                </button>
            </form>

            {createError && (
                <p className="error-message" role="alert">
                    {createError}
                </p>
            )}

            {deleteError && (
                <p className="error-message" role="alert">
                    {deleteError}
                </p>
            )}

            {loading && (
                <p className="loading-message">Loading categories...</p>
            )}

            {error && (
                <p role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <ul className="categories-list">
                    {categories.map((category) => (
                        <li key={category.id} className="category-item">
                            {editingId === category.id ? (
                                <div className="category-edit">
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(event) => {
                                            setEditingName(
                                                event.target.value
                                            );
                                            setEditingError(null);
                                        }}
                                    />

                                    <button
                                    className="save-button"
                                        type="button"
                                        disabled={
                                            updating ||
                                            !editingName.trim()
                                        }
                                        onClick={() =>
                                            handleEdit(category.id)
                                        }
                                    >
                                        {updating
                                            ? "Saving..."
                                            : "Save"}
                                    </button>

                                    <button
                                    className="cancel-button"
                                        type="button"
                                        disabled={updating}
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditingName("");
                                            setEditingError(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="category-name">{category.name}</span>
                                    <div className="category-actions">
                                    <button
                                     className="edit-button"
                                        type="button"
                                        onClick={() => {
                                            setEditingId(category.id);
                                            setEditingName(category.name);
                                            setEditingError(null);
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                    className="delete-button"
                                        type="button"
                                        onClick={() =>
                                            handleDelete(category.id)
                                        }
                                    >
                                        Delete
                                    </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {editingError && (
                <p className="error-message" role="alert">
                    {editingError}
                </p>
            )}
        </div>
    );
}

export default Categories;