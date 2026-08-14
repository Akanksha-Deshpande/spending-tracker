import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCategories } from "../hooks/useCategories";
import { useActuals } from "../hooks/useActuals";
import { useLocks } from "../hooks/useLocks";
import "../styles/actuals.css";

function Actuals() {
    const { token } = useAuth();

    const { categories } =
        useCategories(token);

    const {
        actuals,
        loading,
        error,
        addActual,
        editActual,
        removeActual,
    } = useActuals(token, categories);

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

    const [note, setNote] =
        useState("");

    const [creating, setCreating] =
        useState(false);

    const [createError, setCreateError] =
        useState<string | null>(null);

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [editingAmount, setEditingAmount] =
        useState("");

    const [editingNote, setEditingNote] =
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

    /*
     * Get unique months from the actuals table.
     * Newest month appears first.
     */
    const months = Array.from(
        new Set(
            actuals.map(
                (actual) => actual.month
            )
        )
    ).sort((a, b) =>
        b.localeCompare(a)
    );

    function getActualsForMonth(
        selectedMonth: string
    ) {
        return actuals.filter(
            (actual) =>
                actual.month === selectedMonth
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

        if (isMonthLocked(month)) {
            setCreateError(
                "This month is locked and actuals cannot be modified"
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

            await addActual(
                categoryId,
                month,
                numericAmount,
                note,
                selectedCategory.name
            );

            setCategoryId("");
            setMonth("");
            setAmount("");
            setNote("");
        } catch (error) {
            console.error(
                "Failed to create actual:",
                error
            );

            setCreateError(
                error instanceof Error
                    ? error.message
                    : "Failed to create actual"
            );
        } finally {
            setCreating(false);
        }
    }

    async function handleEdit(
        actualId: string
    ) {
        const actual =
            actuals.find(
                (item) =>
                    item.id === actualId
            );

        if (
            actual &&
            isMonthLocked(actual.month)
        ) {
            setEditingError(
                "This month's actuals are locked and cannot be modified"
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

            await editActual(
                actualId,
                numericAmount,
                editingNote
            );

            setEditingId(null);
            setEditingAmount("");
            setEditingNote("");
        } catch (error) {
            console.error(
                "Failed to update actual:",
                error
            );

            setEditingError(
                error instanceof Error
                    ? error.message
                    : "Failed to update actual"
            );
        } finally {
            setUpdating(false);
        }
    }

    async function handleDelete(
        actualId: string
    ) {
        const actual =
            actuals.find(
                (item) =>
                    item.id === actualId
            );

        if (
            actual &&
            isMonthLocked(actual.month)
        ) {
            setDeleteError(
                "This month's actuals are locked and cannot be deleted"
            );
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this actual?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeleteError(null);

            await removeActual(
                actualId
            );
        } catch (error) {
            console.error(
                "Failed to delete actual:",
                error
            );

            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete actual"
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
        <div className="actuals-page">
            <h1>Actuals</h1>

            {loading && (
                <p className="actual-loading">
                    Loading actuals...
                </p>
            )}

            {error && (
                <p
                    className="actual-error"
                    role="alert"
                >
                    {error}
                </p>
            )}

            {/* =========================
                Create Actual
            ========================= */}

            <section className="create-actual-section">
                <div className="create-actual-header">
                    <div>
                        <h2>Create Actual</h2>

                        <p>
                            Add an actual amount
                            for a category and month.
                        </p>
                    </div>
                </div>

                <form
                    className="actual-form"
                    onSubmit={handleSubmit}
                >
                    <div className="actual-field">
                        <label htmlFor="actual-category">
                            Category
                        </label>

                        <select
                            id="actual-category"
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
                                month !== "" &&
                                isMonthLocked(month)
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
                                        {
                                            category.name
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="actual-field">
                        <label htmlFor="actual-month">
                            Month
                        </label>

                        <div className="month-input-wrapper">
                            <input
                                id="actual-month"
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

                    <div className="actual-field">
                        <label htmlFor="actual-amount">
                            Amount
                        </label>

                        <input
                            id="actual-amount"
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
                                month !== "" &&
                                isMonthLocked(month)
                            }
                        />
                    </div>

                    <div className="actual-field actual-note-field">
                        <label htmlFor="actual-note">
                            Note
                        </label>

                        <input
                            id="actual-note"
                            type="text"
                            placeholder="Optional note"
                            value={note}
                            onChange={(event) => {
                                setNote(
                                    event.target
                                        .value
                                );

                                setCreateError(
                                    null
                                );
                            }}
                            disabled={
                                month !== "" &&
                                isMonthLocked(month)
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={
                            creating ||
                            (month !== "" &&
                                isMonthLocked(
                                    month
                                ))
                        }
                    >
                        {creating
                            ? "Adding..."
                            : month !== "" &&
                                isMonthLocked(
                                    month
                                )
                                ? "Month Locked"
                                : "Add Actual"}
                    </button>
                </form>

                {createError && (
                    <p
                        className="actual-error"
                        role="alert"
                    >
                        {createError}
                    </p>
                )}
            </section>

            {/* =========================
                Actuals By Month
            ========================= */}

            {!loading &&
                !error &&
                months.length === 0 && (
                    <div className="actuals-empty-state">
                        <h2>No actuals yet</h2>

                        <p>
                            Create your first actual
                            using the form above.
                        </p>
                    </div>
                )}

            {!loading &&
                !error &&
                months.map(
                    (actualMonth) => {
                        const monthActuals =
                            getActualsForMonth(
                                actualMonth
                            );

                        const monthLocked =
                            isMonthLocked(
                                actualMonth
                            );

                        const isLocking =
                            lockingMonth ===
                            actualMonth;

                        const isUnlocking =
                            unlockingMonth ===
                            actualMonth;

                        return (
                            <section
                                className="actual-month-section"
                                key={
                                    actualMonth
                                }
                            >
                                {/* Month Header */}

                                <div className="actual-month-header">
                                    <div className="actual-month-heading">
                                        <h2>
                                            {
                                                formatMonth(actualMonth)
                                            }
                                        </h2>

                                        <span
                                            className={
                                                monthLocked
                                                    ? "actual-status-locked"
                                                    : "actual-status-open"
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
                                                    actualMonth
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
                                                        actualMonth
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
                                        className="actual-error actual-month-error"
                                        role="alert"
                                    >
                                        {lockError}
                                    </p>
                                )}

                                {/* Month Table */}

                                <div className="actuals-table-wrapper">
                                    <table className="actuals-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    Category
                                                </th>

                                                <th>
                                                    Amount
                                                </th>

                                                <th>
                                                    Note
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
                                            {monthActuals.map(
                                                (
                                                    actual
                                                ) => {
                                                    const actualLocked =
                                                        isMonthLocked(
                                                            actual.month
                                                        );

                                                    return (
                                                        <tr
                                                            key={
                                                                actual.id
                                                            }
                                                        >
                                                            <td className="actual-category">
                                                                {
                                                                    actual.categoryName
                                                                }
                                                            </td>

                                                            <td className="actual-amount">
                                                                {editingId ===
                                                                    actual.id ? (
                                                                    <input
                                                                        className="actual-edit-amount"
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
                                                                    `₹${actual.amount}`
                                                                )}
                                                            </td>

                                                            <td className="actual-note">
                                                                {editingId ===
                                                                    actual.id ? (
                                                                    <input
                                                                        className="actual-edit-note"
                                                                        type="text"
                                                                        value={
                                                                            editingNote
                                                                        }
                                                                        onChange={(
                                                                            event
                                                                        ) => {
                                                                            setEditingNote(
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
                                                                    actual.note ||
                                                                    "—"
                                                                )}
                                                            </td>

                                                            <td>
                                                                {actualLocked ? (
                                                                    <span className="actual-status-locked">
                                                                        🔒
                                                                        Locked
                                                                    </span>
                                                                ) : (
                                                                    <span className="actual-status-open">
                                                                        Open
                                                                    </span>
                                                                )}
                                                            </td>

                                                            <td className="actual-actions">
                                                                {editingId ===
                                                                    actual.id ? (
                                                                    <>
                                                                        <button
                                                                            className="actual-save-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleEdit(
                                                                                    actual.id
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
                                                                            className="actual-cancel-button"
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

                                                                                setEditingNote(
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
                                                                ) : actualLocked ? (
                                                                    <span className="actual-locked-actions">
                                                                        🔒
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            className="actual-edit-button"
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setEditingId(
                                                                                    actual.id
                                                                                );

                                                                                setEditingAmount(
                                                                                    String(
                                                                                        actual.amount
                                                                                    )
                                                                                );

                                                                                setEditingNote(
                                                                                    actual.note ||
                                                                                    ""
                                                                                );

                                                                                setEditingError(
                                                                                    null
                                                                                );
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </button>

                                                                        <button
                                                                            className="actual-delete-button"
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    actual.id
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
                    className="actual-error"
                    role="alert"
                >
                    {editingError}
                </p>
            )}

            {deleteError && (
                <p
                    className="actual-error"
                    role="alert"
                >
                    {deleteError}
                </p>
            )}
        </div>
    );
}

export default Actuals;