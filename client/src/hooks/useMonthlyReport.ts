import { useEffect, useState } from "react";
import { getMonthlyReport } from "../api/reports";
import type { MonthlyReport } from "../api/reports";

export function useMonthlyReport(
    month: string,
    token: string | null
) {
    const [report, setReport] = useState<MonthlyReport | null>(
        null
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

        async function fetchReport() {
            try {
                setLoading(true);
                setError(null);

                const data = await getMonthlyReport(
                    month,
                    currentToken
                );

                setReport(data);
            } catch (error) {
                console.error(
                    "Failed to fetch monthly report:",
                    error
                );

                setError("Failed to load report");
                setReport(null);
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
    }, [month, token]);

    return {
        report,
        loading,
        error,
    };
}