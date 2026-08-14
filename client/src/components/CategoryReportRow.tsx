import type { ReportCategory } from "../api/reports";

interface CategoryReportRowProps {
    category: ReportCategory;
}

function CategoryReportRow({
    category,
}: CategoryReportRowProps) {
    const varianceClass =
        category.variance < 0
            ? "variance-negative"
            : category.variance > 0
                ? "variance-positive"
                : "variance-neutral";

    return (
        <tr>
            <td>
                {category.category}
            </td>

            <td>
                ₹{category.planned.toLocaleString()}
            </td>

            <td>
                ₹{category.actual.toLocaleString()}
            </td>

            <td className={varianceClass}>
                {category.variance > 0 && "+"}
                ₹{category.variance.toLocaleString()}
            </td>

            <td className={varianceClass}>
                {category.variancePercentage === null
                    ? "N/A"
                    : `${category.variancePercentage > 0 ? "+" : ""}${category.variancePercentage}%`}
            </td>
        </tr>
    );
}

export default CategoryReportRow;