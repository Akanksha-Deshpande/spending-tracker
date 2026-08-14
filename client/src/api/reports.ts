import { apiRequest } from "./client";

export interface ReportCategory {
    categoryId: string;
    category: string;
    planned: number;
    actual: number;
    variance: number;
    variancePercentage: number | null;
}

export interface MonthlyReport {
    month: string;

    summary: {
        planned: number;
        actual: number;
        variance: number;
        variancePercentage: number | null;
    };

    categories: ReportCategory[];
}

export interface RangeReportRow {
    categoryId: string;
    category: string;
    month: string;
    planned: number;
    actual: number;
    variance: number;
    variancePercentage: number | null;
}

export interface RangeReportMonth {
    month: string;
    planned: number;
    actual: number;
    variance: number;
}

export interface RangeReport {
    from: string;
    to: string;

    summary: {
        planned: number;
        actual: number;
        variance: number;
        variancePercentage: number | null;
    };

    monthly: RangeReportMonth[];

    rows: RangeReportRow[];
}

export function getMonthlyReport(
    month: string,
    token: string
): Promise<MonthlyReport> {
    return apiRequest<MonthlyReport>(
        `/reports/${month}`,
        {
            token,
        }
    );
}

export function getRangeReport(
    from: string,
    to: string,
    token: string
): Promise<RangeReport> {
    return apiRequest<RangeReport>(
        `/reports?from=${encodeURIComponent(
            from
        )}&to=${encodeURIComponent(to)}`,
        {
            token,
        }
    );
}