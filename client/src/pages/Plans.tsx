import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCategories } from "../hooks/useCategories";
import { usePlans } from "../hooks/usePlans";
import { useLocks } from "../hooks/useLocks";
import "../styles/plans.css";

function Plans() {
    const { token } = useAuth();

    const {
        plans,
        loading,
        error,
        addPlan,
        editPlan,
        removePlan,
    } = usePlans(token);

    const { categories } = useCategories(token);

    const {
        isMonthLocked,
        lock,
        unlock,
    } = useLocks(token);

    const [categoryId, setCategoryId] =
        useState("");

    const [month, setMonth] =
        useState("");

    const [amount, setAmount] =
        useState("");

    const [creating, setCreating] =
        useState(false);

    const [createError, setCreateError] =
        useState<string | null>(null);

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [editingAmount, setEditingAmount] =
        useState("");

    const [editingError, setEditingError] =
        useState<string | null>(null);

    const [updating, setUpdating] =
        useState(false);

    const [deleteError, setDeleteError] =
        useState<string | null>(null);

    const [lockingMonth, setLockingMonth] =
        useState<string | null>(null);

    const [unlockingMonth, setUnlockingMonth] =
        useState<string | null>(null);

    const [unlockNote, setUnlockNote] =
        useState("");

    const [lockError, setLockError] =
        useState<string | null>(null);

    const selectedMonthLocked =
        month !== "" &&
        isMonthLocked(month);

    /*
     * Get unique months from the plans table.
     * Newest month appears first.
     */
    const months = Array.from(
        new Set(
            plans.map(
                (plan) => plan.month
            )
        )
    ).sort((a, b) =>
        b.localeCompare(a)
    );

    function getPlansForMonth(
        selectedMonth: string
    ) {
        return plans.filter(
            (plan) =>
                plan.month === selectedMonth
        );
    }

    function handleMonthChange(
        value: string
    ) {
        setMonth(value);
        setCreateError(null);
        setLockError(null);
    }

    async function handleSubmit(
        event: React.FormEvent
    ) {
        event.preventDefault();

        if (
            !categoryId ||
            !month ||
            amount === ""
        ) {
            setCreateError(
                "Category, month, and amount are required"
            );
            return;
        }

        if (selectedMonthLocked) {
            setCreateError(
                "This month is locked and cannot be modified"
            );
            return;
        }

        const numericAmount =
            Number(amount);

        if (
            Number.isNaN(numericAmount) ||
            numericAmount < 0
        ) {
            setCreateError(
                "Amount must be a non-negative number"
            );
            return;
        }

        const selectedCategory =
            categories.find(
                (category) =>
                    category.id === categoryId
            );

        if (!selectedCategory) {
            setCreateError(
                "Selected category not found"
            );
            return;
        }

        try {
            setCreating(true);
            setCreateError(null);

            await addPlan(
                categoryId,
                month,
                numericAmount,
                selectedCategory.name
            );

            setCategoryId("");
            setMonth("");
            setAmount("");
        } catch (error) {
            console.error(
                "Failed to create plan:",
                error
            );

            setCreateError(
                error instanceof Error
                    ? error.message
                    : "Failed to create plan"
            );
        } finally {
            setCreating(false);
        }
    }

    async function handleEdit(
        planId: string
    ) {
        const plan = plans.find(
            (item) =>
                item.id === planId
        );

        if (
            plan &&
            isMonthLocked(plan.month)
        ) {
            setEditingError(
                "This month's plan is locked and cannot be modified"
            );
            return;
        }

        const numericAmount =
            Number(editingAmount);

        if (
            Number.isNaN(numericAmount) ||
            numericAmount < 0
        ) {
            setEditingError(
                "Amount must be a non-negative number"
            );
            return;
        }

        try {
            setUpdating(true);
            setEditingError(null);

            await editPlan(
                planId,
                numericAmount
            );

            setEditingId(null);
            setEditingAmount("");
        } catch (error) {
            console.error(
                "Failed to update plan:",
                error
            );

            setEditingError(
                error instanceof Error
                    ? error.message
                    : "Failed to update plan"
            );
        } finally {
            setUpdating(false);
        }
    }

    async function handleDelete(
        planId: string
    ) {
        const plan = plans.find(
            (item) =>
                item.id === planId
        );

        if (
            plan &&
            isMonthLocked(plan.month)
        ) {
            setDeleteError(
                "This month's plan is locked and cannot be deleted"
            );
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this plan?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeleteError(null);

            await removePlan(planId);
        } catch (error) {
            console.error(
                "Failed to delete plan:",
                error
            );

            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete plan"
            );
        }
    }

    async function handleLock(
        monthToLock: string
    ) {
        if (
            isMonthLocked(monthToLock)
        ) {
            return;
        }

        try {
            setLockingMonth(
                monthToLock
            );

            setLockError(null);

            await lock(
                monthToLock
            );
        } catch (error) {
            console.error(
                "Failed to lock month:",
                error
            );

            setLockError(
                error instanceof Error
                    ? error.message
                    : "Failed to lock month"
            );
        } finally {
            setLockingMonth(null);
        }
    }

    async function handleUnlock(
        monthToUnlock: string
    ) {
        if (
            !isMonthLocked(
                monthToUnlock
            )
        ) {
            return;
        }

        if (!unlockNote.trim()) {
            setLockError(
                "A reason is required to unlock a month"
            );
            return;
        }

        try {
            setUnlockingMonth(
                monthToUnlock
            );

            setLockError(null);

            await unlock(
                monthToUnlock,
                unlockNote.trim()
            );

            setUnlockNote("");
        } catch (error) {
            console.error(
                "Failed to unlock month:",
                error
            );

            setLockError(
                error instanceof Error
                    ? error.message
                    : "Failed to unlock month"
            );
        } finally {
            setUnlockingMonth(null);
        }
    }

    function formatMonth(month: string) {
    if (!month) {
        return "";
    }

    const [year, monthNumber] = month.split("-");

    const date = new Date(
        Number(year),
        Number(monthNumber) - 1,
        1
    );

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(date);
}

    return (
        <div className="plans-page">
            <h1>Plans</h1>

            {loading && (
                <p className="plan-loading">
                    Loading plans...
                </p>
            )}

            {error && (
                <p
                    className="plan-error"
                    role="alert"
                >
                    {error}
                </p>
            )}

            {/* =========================
                Create Plan
            ========================= */}

            <section className="create-plan-section">
                <div className="create-plan-header">
                    <div>
                        <h2>Create Plan</h2>

                        <p>
                            Add a planned amount
                            for a category and month.
                        </p>
                    </div>
                </div>

                <form
                    className="plan-form"
                    onSubmit={handleSubmit}
                >
                    <div className="plan-field">
                        <label htmlFor="plan-category">
                            Category
                        </label>

                        <select
                            id="plan-category"
                            value={categoryId}
                            onChange={(event) => {
                                setCategoryId(
                                    event.target.value
                                );

                                setCreateError(
                                    null
                                );
                            }}
                            required
                            disabled={
                                selectedMonthLocked
                            }
                        >
                            <option
                                value=""
                                disabled
                            >
                                Select category
                            </option>

                            {categories.map(
                                (category) => (
                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.id
                                        }
                                    >
                                        {category.name}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="plan-field">
                        <label htmlFor="plan-month">
                            Month
                        </label>

                        <div className="month-input-wrapper">
                            <input
                                id="plan-month"
                                type="month"
                                min="2020-01"
                                max="2035-12"
                                value={month}
                                onChange={(
                                    event
                                ) =>
                                    handleMonthChange(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                            />

                            <span className="month-icon">
                                📅
                            </span>
                        </div>
                    </div>

                    <div className="plan-field">
                        <label htmlFor="plan-amount">
                            Amount
                        </label>

                        <input
                            id="plan-amount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(event) => {
                                setAmount(
                                    event.target
                                        .value
                                );

                                setCreateError(
                                    null
                                );
                            }}
                            required
                            disabled={
                                selectedMonthLocked
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={
                            creating ||
                            selectedMonthLocked
                        }
                    >
                        {creating
                            ? "Creating..."
                            : selectedMonthLocked
                                ? "Month Locked"
                                : "Add Plan"}
                    </button>
                </form>

                {createError && (
                    <p
                        className="plan-error"
                        role="alert"
                    >
                        {createError}
                    </p>
                )}
            </section>

            {/* =========================
                Plans By Month
            ========================= */}

            {!loading &&
                !error &&
                months.length === 0 && (
                    <div className="plans-empty-state">
                        <h2>No plans yet</h2>

                        <p>
                            Create your first plan
                            using the form above.
                        </p>
                    </div>
                )}

            {!loading &&
                !error &&
                months.map(
                    (planMonth) => {
                        const monthPlans =
                            getPlansForMonth(
                                planMonth
                            );

                        const monthLocked =
                            isMonthLocked(
                                planMonth
                            );

                        const isLocking =
                            lockingMonth ===
                            planMonth;

                        const isUnlocking =
                            unlockingMonth ===
                            planMonth;

                        return (
                            <section
                                className="plan-month-section"
                                key={planMonth}
                            >
                                {/* Month Header */}

                                <div className="plan-month-header">
                                    <div className="plan-month-heading">
                                        <h2>
                                            {formatMonth(planMonth)}
                                        </h2>

                                        <span
                                            className={
                                                monthLocked
                                                    ? "plan-status-locked"
                                                    : "plan-status-open"
                                            }
                                        >
                                            {monthLocked
                                                ? "🔒 Locked"
                                                : "Open"}
                                        </span>
                                    </div>

                                    {!monthLocked ? (
                                        <button
                                            className="month-lock-button"
                                            type="button"
                                            onClick={() =>
                                                handleLock(
                                                    planMonth
                                                )
                                            }
                                            disabled={
                                                isLocking ||
                                                isUnlocking
                                            }
                                        >
                                            {isLocking
                                                ? "Locking..."
                                                : "🔒 Lock Month"}
                                        </button>
                                    ) : (
                                        <div className="month-unlock-controls">
                                            <input
                                                className="unlock-note-input"
                                                type="text"
                                                placeholder="Reason for unlocking"
                                                value={
                                                    unlockNote
                                                }
                                                onChange={(
                                                    event
                                                ) => {
                                                    setUnlockNote(
                                                        event
                                                            .target
                                                            .value
                                                    );

                                                    setLockError(
                                                        null
                                                    );
                                                }}
                                                disabled={
                                                    isUnlocking
                                                }
                                            />

                                            <button
                                                className="month-unlock-button"
                                                type="button"
                                                onClick={() =>
                                                    handleUnlock(
                                                        planMonth
                                                    )
                                                }
                                                disabled={
                                                    isUnlocking
                                                }
                                            >
                                                {isUnlocking
                                                    ? "Unlocking..."
                                                    : "Unlock Month"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Month Error */}

                                {lockError && (
                                    <p
                                        className="plan-error plan-month-error"
                                        role="alert"
                                    >
                                        {lockError}
                                    </p>
                                )}

                                {/* Month Table */}

                                <div className="plans-table-wrapper">
                                    <table className="plans-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    Category
                                                </th>

                                                <th>
                                                    Amount
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {monthPlans.map(
                                                (
                                                    plan
                                                ) => {
                                                    const planLocked =
                                                        isMonthLocked(
                                                            plan.month
                                                        );

                                                    return (
                                                        <tr
                                                            key={
                                                                plan.id
                                                            }
                                                        >
                                                            <td className="plan-category">
                                                                {
                                                                    plan.categoryName
                                                                }
                                                            </td>

                                                            <td className="plan-amount">
                                                                {editingId ===
                                                                plan.id ? (
                                                                    <input
                                                                        className="plan-edit-amount"
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={
                                                                            editingAmount
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            setEditingAmount(
                                                                                event
                                                                                    .target
                                                                                    .value
                                                                            );

                                                                            setEditingError(
                                                                                null
                                                                            );
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    `₹${plan.amount}`
                                                                )}
                                                            </td>

                                                            <td>
                                                                {planLocked ? (
                                                                    <span className="plan-status-locked">
                                                                        🔒
                                                                        Locked
                                                                    </span>
                                                                ) : (
                                                                    <span className="plan-status-open">
                                                                        Open
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td className="plan-actions">
                                                                {editingId ===
                                                                plan.id ? (
                                                                    <>
                                                                        <button
                                                                            className="plan-save-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleEdit(
                                                                                    plan.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                updating ||
                                                                                editingAmount ===
                                                                                    ""
                                                                            }
                                                                        >
                                                                            {updating
                                                                                ? "Saving..."
                                                                                : "Save"}
                                                                        </button>

                                                                        <button
                                                                            className="plan-cancel-button"
                                                                            type="button"
                                                                            disabled={
                                                                                updating
                                                                            }
                                                                            onClick={() => {
                                                                                setEditingId(
                                                                                    null
                                                                                );

                                                                                setEditingAmount(
                                                                                    ""
                                                                                );

                                                                                setEditingError(
                                                                                    null
                                                                                );
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </>
                                                                ) : planLocked ? (
                                                                    <span className="plan-locked-actions">
                                                                        🔒
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            className="plan-edit-button"
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setEditingId(
                                                                                    plan.id
                                                                                );

                                                                                setEditingAmount(
                                                                                    String(
                                                                                        plan.amount
                                                                                    )
                                                                                );

                                                                                setEditingError(
                                                                                    null
                                                                                );
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </button>

                                                                        <button
                                                                            className="plan-delete-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    plan.id
                                                                                )
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        );
                    }
                )}

            {editingError && (
                <p
                    className="plan-error"
                    role="alert"
                >
                    {editingError}
                </p>
            )}

            {deleteError && (
                <p
                    className="plan-error"
                    role="alert"
                >
                    {deleteError}
                </p>
            )}
        </div>
    );
}

export default Plans;