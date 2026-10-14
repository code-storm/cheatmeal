interface ProgressBarProps {
  completed: number;
  total: number;
  label?: string;
}

export function ProgressBar({ completed, total, label }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress">
      {label && <div className="progress__label">{label}</div>}
      <div
        className="progress__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ProgressRing({
  completed,
  total,
  size = 44,
}: ProgressBarProps & { size?: number }) {
  const pct = total > 0 ? completed / total : 0;
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="progress-ring"
      role="img"
      aria-label={`${completed} of ${total} completed`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="progress-ring__track"
        strokeWidth={4}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="progress-ring__fill"
        strokeWidth={4}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="52%" textAnchor="middle" className="progress-ring__text">
        {total > 0 ? `${completed}/${total}` : "–"}
      </text>
    </svg>
  );
}
