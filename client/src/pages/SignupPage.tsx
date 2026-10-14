import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { AuthCard } from "../components/AuthCard";
import { useSignup } from "../hooks/useAuthActions";

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useSignup();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    signup.mutate(
      { email, password },
      {
        onSuccess: () => {
          // A freshly signed-up user never has a profile yet.
          navigate("/onboarding", { replace: true });
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setErrorMessage("That email is already registered. Try logging in instead.");
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
      title="Welcome to CheatMeal"
      subtitle="Create an account to start your daily pregnancy plan."
      onSubmit={handleSubmit}
      errorMessage={errorMessage}
      footer={
        <p>
          Already have an account? <Link to="/login">Log in</Link>
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
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </label>

      <button type="submit" className="btn btn--primary" disabled={signup.isPending}>
        {signup.isPending ? "Creating account..." : "Create account"}
      </button>
    </AuthCard>
  );
}
