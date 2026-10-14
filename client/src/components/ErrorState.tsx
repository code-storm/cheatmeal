interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong on our end.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <p className="error-state__title">We hit a snag</p>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
