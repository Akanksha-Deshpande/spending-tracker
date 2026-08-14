import { useEffect, useState } from "react";
import { getRangeReport } from "../api/reports";
import type { RangeReport } from "../api/reports";

export function useReport(
    from: string,
    to: string,
    token: string | null
) {
    const [report, setReport] =
        useState<RangeReport | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        if (!token || !from || !to) {
            return;
        }

        const currentToken = token;

        async function fetchReport() {
            try {
                setLoading(true);
                setError(null);

                const data =
                    await getRangeReport(
                        from,
                        to,
                        currentToken
                    );

                setReport(data);
            } catch (error) {
                console.error(
                    "Failed to fetch report:",
                    error
                );

                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load report"
                );

                setReport(null);
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
    }, [from, to, token]);

    return {
        report,
        loading,
        error,
    };
}