import { useEffect, useState } from "react";
import {
    getLocks,
    lockMonth,
    unlockMonth,
} from "../api/locks";
import type { Lock } from "../api/locks";

export function useLocks(
    token: string | null
) {
    const [locks, setLocks] = useState<Lock[]>(
        []
    );

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        const currentToken = token;

        async function fetchLocks() {
            try {
                setLoading(true);
                setError(null);

                const data = await getLocks(
                    currentToken
                );

                setLocks(data.locks);
            } catch (error) {
                console.error(
                    "Failed to fetch locks:",
                    error
                );

                setError(
                    "Failed to load locks"
                );

                setLocks([]);
            } finally {
                setLoading(false);
            }
        }

        fetchLocks();
    }, [token]);

    function isMonthLocked(
        month: string
    ): boolean {
        return locks.some(
            (lock) =>
                lock.month === month
        );
    }

    async function lock(
        month: string
    ) {
        if (!token) {
            throw new Error(
                "Not authenticated"
            );
        }

        const data =
            await lockMonth(
                month,
                token
            );

        setLocks(
            (currentLocks) => [
                ...currentLocks,
                data.lock,
            ]
        );
    }

    async function unlock(
        month: string,
        note: string
    ) {
        if (!token) {
            throw new Error(
                "Not authenticated"
            );
        }

        await unlockMonth(
            month,
            note,
            token
        );

        setLocks(
            (currentLocks) =>
                currentLocks.filter(
                    (lock) =>
                        lock.month !==
                        month
                )
        );
    }

    return {
        locks,
        loading,
        error,
        isMonthLocked,
        lock,
        unlock,
    };
}