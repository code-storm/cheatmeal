import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/client";
import { AuthCard } from "../components/AuthCard";
import { useLogin } from "../hooks/useAuthActions";
import { authApi } from "../api/authApi";
import { AUTH_ME_QUERY_KEY } from "../context/authQueryKey";

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    login.mutate(
      { email, password },
      {
        onSuccess: async () => {
          // The login response only includes { user }; fetch /me so we know
          // whether onboarding is still needed before deciding where to go.
          const me = await queryClient.fetchQuery({
            queryKey: AUTH_ME_QUERY_KEY,
            queryFn: authApi.me,
          });
          navigate(me.hasProfile ? "/" : "/onboarding", { replace: true });
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401) {
            setErrorMessage("Invalid email or password.");
          } else if (error instanceof ApiError) {
            setErrorMessage(error.message);
          } else {
            setErrorMessage("Something went wrong. Please try again.");
          }
        },
      },
    );
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to see today's plan."
      onSubmit={handleSubmit}
      errorMessage={errorMessage}
      footer={
        <p>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      }
    >
      <label className="field">
        <span className="field__label">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>

      <label className="field">
        <span className="field__label">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
      </label>

      <button type="submit" className="btn btn--primary" disabled={login.isPending}>
        {login.isPending ? "Logging in..." : "Log in"}
      </button>
    </AuthCard>
  );
}
