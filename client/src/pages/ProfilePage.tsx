import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { useLogout } from "../hooks/useAuthActions";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";
import type { ProfileResponse, Trimester } from "../types";

const TRIMESTER_LABEL: Record<Trimester, string> = {
  1: "First trimester",
  2: "Second trimester",
  3: "Third trimester",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useProfile();
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/login", { replace: true }),
    });
  }

  if (isLoading) {
    return (
      <div className="page page--profile">
        <LoadingState label="Loading your profile..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page page--profile">
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="page page--profile">
      <ProfileSummary data={data} />
      <button type="button" className="btn btn--secondary btn--logout" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}

// Mounted only once `data` has loaded, so local state can initialize
// directly from the fetched profile without an effect-based sync.
function ProfileSummary({ data }: { data: ProfileResponse }) {
  const { profile, currentPregnancyWeek, trimester } = data;
  const updateProfile = useUpdateProfile();

  const [currentWeight, setCurrentWeight] = useState(
    profile.currentWeightKg != null ? String(profile.currentWeightKg) : "",
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function handleSaveWeight() {
    setSavedMessage(null);
    const weight = Number(currentWeight);
    if (!currentWeight || Number.isNaN(weight) || weight < 30 || weight > 200) {
      setSavedMessage("Please enter a valid weight between 30 and 200 kg.");
      return;
    }
    updateProfile.mutate(
      { currentWeightKg: weight },
      { onSuccess: () => setSavedMessage("Saved!") },
    );
  }

  return (
    <>
      <header className="page-header">
        <h1>Your profile</h1>
        <p className="page-header__subtitle">
          Week {currentPregnancyWeek} · {TRIMESTER_LABEL[trimester]}
        </p>
      </header>

      <div className="profile-card">
        <dl className="profile-details">
          <div className="profile-details__row">
            <dt>Age</dt>
            <dd>{profile.age}</dd>
          </div>
          <div className="profile-details__row">
            <dt>Pre-pregnancy weight</dt>
            <dd>{profile.prePregnancyWeightKg} kg</dd>
          </div>
          {profile.heightCm != null && (
            <div className="profile-details__row">
              <dt>Height</dt>
              <dd>{profile.heightCm} cm</dd>
            </div>
          )}
          <div className="profile-details__row">
            <dt>Current week</dt>
            <dd>Week {currentPregnancyWeek}</dd>
          </div>
          <div className="profile-details__row">
            <dt>Trimester</dt>
            <dd>{TRIMESTER_LABEL[trimester]}</dd>
          </div>
        </dl>

        <div className="profile-edit">
          <label className="field">
            <span className="field__label">Current weight (kg)</span>
            <input
              type="number"
              min={30}
              max={200}
              step="0.1"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSaveWeight}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save"}
          </button>
          {savedMessage && <p className="profile-edit__message">{savedMessage}</p>}
        </div>
      </div>
    </>
  );
}
