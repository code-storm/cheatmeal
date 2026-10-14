import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/client";
import { profileApi } from "../api/profileApi";
import { AUTH_ME_QUERY_KEY } from "../context/authQueryKey";

interface FormState {
  age: string;
  prePregnancyWeightKg: string;
  heightCm: string;
  currentPregnancyWeek: string;
}

const INITIAL_STATE: FormState = {
  age: "",
  prePregnancyWeightKg: "",
  heightCm: "",
  currentPregnancyWeek: "",
};

function validate(form: FormState): string | null {
  const age = Number(form.age);
  const weight = Number(form.prePregnancyWeightKg);
  const week = Number(form.currentPregnancyWeek);

  if (!form.age || Number.isNaN(age) || age < 13 || age > 55) {
    return "Please enter an age between 13 and 55.";
  }
  if (!form.prePregnancyWeightKg || Number.isNaN(weight) || weight < 30 || weight > 200) {
    return "Please enter a pre-pregnancy weight between 30 and 200 kg.";
  }
  if (form.heightCm) {
    const height = Number(form.heightCm);
    if (Number.isNaN(height) || height <= 0) {
      return "Please enter a valid height in cm.";
    }
  }
  if (!form.currentPregnancyWeek || Number.isNaN(week) || week < 1 || week > 45) {
    return "Please enter a pregnancy week between 1 and 45.";
  }
  return null;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const validationError = validate(form);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.createOnboardingProfile({
        age: Number(form.age),
        prePregnancyWeightKg: Number(form.prePregnancyWeightKg),
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        currentPregnancyWeek: Number(form.currentPregnancyWeek),
      });

      // The profile now exists — refresh auth so hasProfile flips to true
      // before we navigate, otherwise the guard would bounce us right back.
      await queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Profile already exists server-side — just go to the dashboard.
        await queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
        navigate("/", { replace: true });
        return;
      }
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="full-page-center">
      <div className="onboarding-card">
        <h1 className="onboarding-card__title">Let's set up your plan</h1>
        <p className="onboarding-card__subtitle">
          A few details so we can tailor your daily checklist to your stage of
          pregnancy. You can always update these later.
        </p>

        <form className="onboarding-card__form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Age</span>
            <input
              type="number"
              required
              min={13}
              max={55}
              value={form.age}
              onChange={(e) => updateField("age", e.target.value)}
              placeholder="e.g. 29"
            />
          </label>

          <label className="field">
            <span className="field__label">Pre-pregnancy weight (kg)</span>
            <input
              type="number"
              required
              min={30}
              max={200}
              step="0.1"
              value={form.prePregnancyWeightKg}
              onChange={(e) => updateField("prePregnancyWeightKg", e.target.value)}
              placeholder="e.g. 58"
            />
          </label>

          <label className="field">
            <span className="field__label">Height (cm) — optional</span>
            <input
              type="number"
              min={1}
              value={form.heightCm}
              onChange={(e) => updateField("heightCm", e.target.value)}
              placeholder="e.g. 162"
            />
          </label>

          <label className="field">
            <span className="field__label">Current pregnancy week</span>
            <input
              type="number"
              required
              min={1}
              max={45}
              value={form.currentPregnancyWeek}
              onChange={(e) => updateField("currentPregnancyWeek", e.target.value)}
              placeholder="e.g. 18"
            />
            <span className="field__hint">
              If you're not sure, your doctor's estimate from your last checkup
              is fine.
            </span>
          </label>

          {errorMessage && (
            <p className="form-error" role="alert">
              {errorMessage}
            </p>
          )}

          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Start my plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
