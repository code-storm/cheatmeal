import type { FormEvent, ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  errorMessage?: string | null;
  footer?: ReactNode;
}

export function AuthCard({
  title,
  subtitle,
  children,
  onSubmit,
  errorMessage,
  footer,
}: AuthCardProps) {
  return (
    <div className="full-page-center">
      <div className="auth-card">
        <h1 className="auth-card__title">{title}</h1>
        {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
        <form className="auth-card__form" onSubmit={onSubmit}>
          {children}
          {errorMessage && (
            <p className="form-error" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
        {footer && <div className="auth-card__footer">{footer}</div>}
      </div>
    </div>
  );
}
