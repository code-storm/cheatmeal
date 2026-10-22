import type { FormEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { PAGE_TRANSITION } from "../utils/motion";

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
      <motion.div
        className="auth-card glass-glow"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={PAGE_TRANSITION}
      >
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
      </motion.div>
    </div>
  );
}
