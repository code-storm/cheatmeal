import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../api/adminClient";
import { useAdminLogin } from "../hooks/useAdminAuthActions";
import "../admin.css";

// A new, separate login form - deliberately NOT reusing pages/LoginPage.tsx
// even though the visual shape (email+password, submit, error) looks
// similar, per the requirement that this is a fully separate login
// system/audience.
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAdminLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate("/admin", { replace: true });
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage("Something went wrong. Please try again.");
          }
        },
      },
    );
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <h1 className="admin-login__title">CheatMeal Admin</h1>
        <p className="admin-login__subtitle">Sign in to manage events, rewards, and badges.</p>

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {errorMessage && (
          <p className="admin-form-error" role="alert">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="admin-btn admin-btn--primary" disabled={login.isPending}>
          {login.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
