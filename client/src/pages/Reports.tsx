import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useReport } from "../hooks/useReport";
import "../styles/reports.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatMonth(month: string): string {
    const [year, monthNumber] =
        month.split("-").map(Number);

    const date = new Date(
        year,
        monthNumber - 1,
        1
    );

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            year: "numeric",
        }
    );
}

const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
};

function formatVariance(
    amount: number
): string {
    if (amount > 0) {
        return `+${formatCurrency(amount)}`;
    }

    return formatCurrency(amount);
}

function formatPercentage(
    percentage: number | null
): string {
    if (percentage === null) {
        return "N/A";
    }

    return `${percentage.toFixed(2)}%`;
}

function Report() {
    const { token } = useAuth();

  const currentYear = new Date().getFullYear();

const [from, setFrom] = useState(
    `${currentYear}-01`
);

const [to, setTo] = useState(
    `${currentYear}-12`
);

const [appliedFrom, setAppliedFrom] = useState(
    `${currentYear}-01`
);

const [appliedTo, setAppliedTo] = useState(
    `${currentYear}-12`
);

    const [rangeError, setRangeError] =
        useState<string | null>(null);

    const {
        report,
        loading,
        error,
    } = useReport(
        appliedFrom,
        appliedTo,
        token
    );

    function handleExportPDF() {
        if (!report) {
            return;
        }

        const doc = new jsPDF();

        const formatMonth = (month: string) => {
            const [year, monthNumber] = month.split("-");

            return new Date(
                Number(year),
                Number(monthNumber) - 1
            ).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
            });
        };

        const formatCurrency = (amount: number) => {
            return `${amount.toLocaleString("en-IN")}`;
        };

        // =========================
        // Header
        // =========================

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");

        doc.text(
            "Spending Report",
            14,
            20
        );

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);

        doc.text(
            `${formatMonth(report.from)} - ${formatMonth(report.to)}`,
            14,
            29
        );

        // =========================
        // Summary
        // =========================

        doc.setTextColor(0);

        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");

        doc.text(
            "Summary",
            14,
            42
        );

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.text(
            `Planned: Rs. ${formatCurrency(
                report.summary.planned
            )}`,
            14,
            50
        );

        doc.text(
            `Actual: Rs. ${formatCurrency(
                report.summary.actual
            )}`,
            14,
            57
        );

        doc.text(
            `Variance: Rs. ${formatCurrency(
                report.summary.variance
            )}`,
            14,
            64
        );

        doc.text(
            `Variance %: ${report.summary.variancePercentage === null
                ? "N/A"
                : `${report.summary.variancePercentage}%`
            }`,
            14,
            71
        );

        // =========================
        // Report Table
        // =========================

        autoTable(doc, {
            startY: 82,

            head: [[
                "Category",
                "Month",
                "Plan (in Rs.)",
                "Actual (in Rs.)",
                "Variance (in Rs.)",
                "Variance %",
            ]],

            body: report.rows.map((row) => [
                row.category,
                formatMonth(row.month),
                formatCurrency(row.planned),
                formatCurrency(row.actual),
                formatCurrency(row.variance),
                row.variancePercentage === null
                    ? "N/A"
                    : `${row.variancePercentage}%`,
            ]),

            theme: "grid",

            headStyles: {
                fillColor: [37, 99, 235],
                textColor: 255,
                fontStyle: "bold",
            },

            styles: {
                fontSize: 9,
                cellPadding: 4,
            },

            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },

            columnStyles: {
                2: {
                    halign: "right",
                },
                3: {
                    halign: "right",
                },
                4: {
                    halign: "right",
                },
                5: {
                    halign: "right",
                },
            },
        });

        // =========================
        // Footer
        // =========================

        const pageCount =
            doc.getNumberOfPages();

        for (
            let page = 1;
            page <= pageCount;
            page++
        ) {
            doc.setPage(page);

            doc.setFontSize(8);
            doc.setTextColor(100);

            doc.text(
                `Spending Tracker • Page ${page} of ${pageCount}`,
                14,
                doc.internal.pageSize.height - 10
            );
        }

        // =========================
        // Download
        // =========================

        doc.save(
            `spending-report-${report.from}-to-${report.to}.pdf`
        );
    }

    function handleApply() {
        if (!from || !to) {
            setRangeError(
                "Please select both a start and end month"
            );
            return;
        }

        if (from > to) {
            setRangeError(
                "From month cannot be after To month"
            );
            return;
        }

        setRangeError(null);
        setAppliedFrom(from);
        setAppliedTo(to);
    }

    return (
        <div className="report-page">
            <div className="report-header">
                <div>
                    <h1>Report</h1>

                    <p>
                        Compare planned spending with
                        actual spending across a date range.
                    </p>
                </div>
            </div>

            {/* =========================
                Date Range
            ========================= */}

            <section className="report-filter-section">
                <div className="report-filter-field">
                    <label htmlFor="report-from">
                        From
                    </label>

                    <div className="report-month-wrapper">
                        <input
                            id="report-from"
                            type="month"
                            min="2020-01"
                            max="2035-12"
                            value={from}
                            onChange={(event) => {
                                setFrom(
                                    event.target.value
                                );
                                setRangeError(null);
                            }}
                        />

                        <span className="report-month-icon">
                            📅
                        </span>
                    </div>
                </div>

                <div className="report-filter-field">
                    <label htmlFor="report-to">
                        To
                    </label>

                    <div className="report-month-wrapper">
                        <input
                            id="report-to"
                            type="month"
                            min="2020-01"
                            max="2035-12"
                            value={to}
                            onChange={(event) => {
                                setTo(
                                    event.target.value
                                );
                                setRangeError(null);
                            }}
                        />

                        <span className="report-month-icon">
                            📅
                        </span>
                    </div>
                </div>

                <button
                    className="report-apply-button"
                    type="button"
                    onClick={handleApply}
                    disabled={loading}
                >
                    {loading
                        ? "Loading..."
                        : "Apply"}
                </button>

                <button
                    className="report-export-button"
                    type="button"
                    onClick={handleExportPDF}
                    disabled={!report || loading}
                >
                    Export PDF
                </button>
            </section>

            {rangeError && (
                <p
                    className="report-error"
                    role="alert"
                >
                    {rangeError}
                </p>
            )}

            {error && (
                <p
                    className="report-error"
                    role="alert"
                >
                    {error}
                </p>
            )}

            {loading && (
                <p className="report-loading">
                    Loading report...
                </p>
            )}

            {!loading &&
                !error &&
                report && (
                    <>
                        {/* =========================
                            Report Range
                        ========================= */}

                        <div className="report-range-label">
                            {formatMonth(report.from)}
                            {" — "}
                            {formatMonth(report.to)}
                        </div>

                        {/* =========================
                            Summary
                        ========================= */}

                        <section className="report-summary-grid">
                            <div className="report-summary-card">
                                <span>
                                    Total Planned
                                </span>

                                <strong>
                                    {formatCurrency(
                                        report.summary
                                            .planned
                                    )}
                                </strong>
                            </div>

                            <div className="report-summary-card">
                                <span>
                                    Total Actual
                                </span>

                                <strong>
                                    {formatCurrency(
                                        report.summary
                                            .actual
                                    )}
                                </strong>
                            </div>

                            <div
                                className={`report-summary-card ${report.summary
                                    .variance > 0
                                    ? "report-card-over"
                                    : report.summary
                                        .variance <
                                        0
                                        ? "report-card-under"
                                        : ""
                                    }`}
                            >
                                <span>
                                    Net Variance
                                </span>

                                <strong>
                                    {formatVariance(
                                        report.summary
                                            .variance
                                    )}
                                </strong>
                            </div>

                            <div
                                className={`report-summary-card ${report.summary
                                    .variancePercentage !==
                                    null &&
                                    report.summary
                                        .variancePercentage >
                                    0
                                    ? "report-card-over"
                                    : report.summary
                                        .variancePercentage !==
                                        null &&
                                        report.summary
                                            .variancePercentage <
                                        0
                                        ? "report-card-under"
                                        : ""
                                    }`}
                            >
                                <span>
                                    Variance %
                                </span>

                                <strong>
                                    {formatPercentage(
                                        report.summary
                                            .variancePercentage
                                    )}
                                </strong>
                            </div>
                        </section>

                        {/* =========================
                            Monthly Chart
                        ========================= */}

                        <section className="report-section">
                            <div className="report-section-header">
                                <div>
                                    <h2>
                                        Monthly Variance
                                    </h2>

                                    <p>
                                        Actual spending minus
                                        planned spending.
                                    </p>
                                </div>
                            </div>

                            <div className="variance-chart">
                                {report.monthly.map(
                                    (month) => {
                                        const absoluteVariance =
                                            Math.abs(
                                                month.variance
                                            );

                                        const maxVariance =
                                            Math.max(
                                                ...report.monthly.map(
                                                    (item) =>
                                                        Math.abs(
                                                            item.variance
                                                        )
                                                ),
                                                1
                                            );

                                        const barHeight =
                                            Math.max(
                                                (absoluteVariance /
                                                    maxVariance) *
                                                100,
                                                month.variance ===
                                                    0
                                                    ? 0
                                                    : 4
                                            );

                                        const isOver =
                                            month.variance >
                                            0;

                                        const isUnder =
                                            month.variance <
                                            0;

                                        return (
                                            <div
                                                className="variance-chart-column"
                                                key={
                                                    month.month
                                                }
                                            >
                                                <div className="variance-chart-value">
                                                    {formatVariance(
                                                        month.variance
                                                    )}
                                                </div>

                                                <div className="variance-chart-bar-area">
                                                    <div
                                                        className={`variance-chart-bar ${isOver
                                                            ? "variance-bar-over"
                                                            : isUnder
                                                                ? "variance-bar-under"
                                                                : "variance-bar-zero"
                                                            }`}
                                                        style={{
                                                            height: `${barHeight}%`,
                                                        }}
                                                    />
                                                </div>

                                                <div className="variance-chart-month">
                                                    {formatMonth(
                                                        month.month
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            <div className="variance-chart-legend">
                                <span>
                                    <i className="legend-under" />
                                    Under plan
                                </span>

                                <span>
                                    <i className="legend-over" />
                                    Over plan
                                </span>
                            </div>
                        </section>

                        {/* =========================
                            Detailed Report
                        ========================= */}

                        <section className="report-section">
                            <div className="report-section-header">
                                <div>
                                    <h2>
                                        Detailed Report
                                    </h2>

                                    <p>
                                        Category and month
                                        breakdown for the
                                        selected range.
                                    </p>
                                </div>
                            </div>

                            {report.rows.length ===
                                0 ? (
                                <div className="report-empty-state">
                                    <h3>
                                        No report data
                                    </h3>

                                    <p>
                                        There are no plans or
                                        actuals in the selected
                                        date range.
                                    </p>
                                </div>
                            ) : (
                                <div className="report-table-wrapper">
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    Category
                                                </th>

                                                <th>
                                                    Month
                                                </th>

                                                <th>
                                                    Plan
                                                </th>

                                                <th>
                                                    Actual
                                                </th>

                                                <th>
                                                    Variance
                                                </th>

                                                <th>
                                                    Variance %
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {report.rows.map(
                                                (row) => {
                                                    const varianceClass =
                                                        row.variance >
                                                            0
                                                            ? "report-variance-over"
                                                            : row.variance <
                                                                0
                                                                ? "report-variance-under"
                                                                : "report-variance-neutral";

                                                    return (
                                                        <tr
                                                            key={`${row.categoryId}-${row.month}`}
                                                        >
                                                            <td className="report-category">
                                                                {
                                                                    row.category
                                                                }
                                                            </td>

                                                            <td className="report-month">
                                                                {formatMonth(
                                                                    row.month
                                                                )}
                                                            </td>

                                                            <td className="report-number">
                                                                {formatCurrency(
                                                                    row.planned
                                                                )}
                                                            </td>

                                                            <td className="report-number">
                                                                {formatCurrency(
                                                                    row.actual
                                                                )}
                                                            </td>

                                                            <td
                                                                className={`report-number ${varianceClass}`}
                                                            >
                                                                {formatVariance(
                                                                    row.variance
                                                                )}
                                                            </td>

                                                            <td
                                                                className={`report-number ${varianceClass}`}
                                                            >
                                                                {formatPercentage(
                                                                    row.variancePercentage
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        {/* =========================
                            Report Notes
                        ========================= */}

                        <div className="report-note">
                            <strong>
                                Reporting rules:
                            </strong>

                            <span>
                                Missing actuals are treated as
                                ₹0. When the planned amount is
                                ₹0, variance percentage is shown
                                as N/A.
                            </span>
                        </div>
                    </>
                )}
        </div>
    );
}

export default Report;