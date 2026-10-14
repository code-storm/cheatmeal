interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function FullPageLoadingState({ label }: LoadingStateProps) {
  return (
    <div className="full-page-center">
      <LoadingState label={label} />
    </div>
  );
}
