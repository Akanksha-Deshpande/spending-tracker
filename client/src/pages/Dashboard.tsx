import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useMonthlyReport } from "../hooks/useMonthlyReport";
import SummaryCard from "../components/SummaryCard";
import CategoryReportRow from "../components/CategoryReportRow";
import "../styles/dashboard.css";

function Dashboard() {

    const { token } = useAuth();

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();

        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;
    });

    const monthInputRef = useRef<HTMLInputElement | null>(null);

    const { report, loading, error } = useMonthlyReport(selectedMonth, token)

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Dashboard</h1>

                <div className="month-selector">
                    <label htmlFor="month">
                        Month
                    </label>

                    <div className="dashboard-month-picker">
                        <input
                            ref={monthInputRef}
                            id="month"
                            type="month"
                            value={selectedMonth}
                            onChange={(event) =>
                                setSelectedMonth(
                                    event.target.value
                                )
                            }
                        />

                        <button
                            type="button"
                            className="dashboard-month-icon"
                            aria-label="Open month picker"
                            onClick={() => {
                                monthInputRef.current?.showPicker?.();
                            }}
                        >
                            📅
                        </button>
                    </div>
                </div>
            </div>

            {loading && <p>Loading report...</p>}

            {error && <p>{error}</p>}

            {report && (
                <div>
                    <h2>{report.month}</h2>

                    <div className="summary-grid">
                        <SummaryCard
                            label="Planned"
                            value={`₹${report.summary.planned.toLocaleString()}`}
                        />

                        <SummaryCard
                            label="Actual"
                            value={`₹${report.summary.actual.toLocaleString()}`}
                        />

                        <SummaryCard
                            label="Variance"
                            value={`₹${report.summary.variance.toLocaleString()}`}
                        />

                        <SummaryCard
                            label="Variance %"
                            value={
                                report.summary.variancePercentage === null
                                    ? "N/A"
                                    : `${report.summary.variancePercentage}%`
                            }
                        />
                    </div>

                    <div className="categories-section">

                        <h2>Categories</h2>

                        {report.categories.length === 0 ? (
                            <p>No category data for this month.</p>
                        ) : (
                            <table className="category-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Planned</th>
                                        <th>Actual</th>
                                        <th>Variance</th>
                                        <th>Variance %</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {report.categories.map((category) => (
                                        <CategoryReportRow
                                            key={category.categoryId}
                                            category={category}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;