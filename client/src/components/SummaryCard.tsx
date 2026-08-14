interface SummaryCardProps {
    label: string;
    value: string;
}

function SummaryCard({
    label,
    value,
}: SummaryCardProps) {
    return (
        <div className="summary-card">
            <p className="summary-card-label">
                {label}
            </p>

            <strong className="summary-card-value">
                {value}
            </strong>
        </div>
    );
}

export default SummaryCard;