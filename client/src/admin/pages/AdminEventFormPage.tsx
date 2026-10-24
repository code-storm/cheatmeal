import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../api/adminClient";
import type { AdminEventInput } from "../api/adminEventsApi";
import {
  useAdminEvent,
  useAddAdminEventTier,
  useCreateAdminEvent,
  useDeleteAdminEventTier,
  useUpdateAdminEvent,
} from "../hooks/useAdminEvents";
import { useAdminRewards } from "../hooks/useAdminRewards";
import { ImageUploadField } from "../components/ImageUploadField";

const BLANK: AdminEventInput = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  sponsorName: null,
  themeSlug: "",
  heroImageUrl: null,
  cardImageUrl: null,
  startsAt: "",
  endsAt: "",
  isActive: true,
};

function toLocalInputValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Tier sub-editor is implemented inline here rather than as a separate
// route - tiers only make sense scoped to one specific event, and there's
// no standalone "list all tiers across all events" use case.
function TierEditor({ eventId }: { eventId: string }) {
  const { data: eventData, refetch } = useAdminEvent(eventId);
  const { data: rewardsData } = useAdminRewards();
  const addTier = useAddAdminEventTier(eventId);
  const deleteTier = useDeleteAdminEventTier(eventId);

  const [tier, setTier] = useState(1);
  const [pointsRequired, setPointsRequired] = useState(50);
  const [rewardItemId, setRewardItemId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAddTier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!rewardItemId) {
      setError("Select a reward item for this tier.");
      return;
    }
    addTier.mutate(
      { tier, pointsRequired, rewardItemId },
      {
        onSuccess: () => {
          refetch();
          setTier((t) => t + 1);
          setRewardItemId("");
        },
        onError: (err) => setError(err instanceof ApiError ? err.message : "Failed to add tier."),
      },
    );
  }

  return (
    <div className="admin-tier-editor">
      <h2>Tier ladder</h2>
      {eventData?.event.tiers.length ? (
        <table className="admin-table admin-table--compact">
          <thead>
            <tr>
              <th>Tier</th>
              <th>Points required</th>
              <th>Reward</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {eventData.event.tiers.map((t) => (
              <tr key={t.id}>
                <td>{t.tier}</td>
                <td>{t.pointsRequired}</td>
                <td>{t.rewardItemName}</td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn--small admin-btn--danger"
                    onClick={() => deleteTier.mutate(t.id, { onSuccess: () => refetch() })}
                    disabled={deleteTier.isPending}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="admin-field__hint">No tiers yet.</p>
      )}

      <form className="admin-tier-editor__add" onSubmit={handleAddTier}>
        <label className="admin-field">
          <span>Tier #</span>
          <input type="number" min={1} value={tier} onChange={(e) => setTier(Number(e.target.value))} />
        </label>
        <label className="admin-field">
          <span>Points required</span>
          <input type="number" min={0} value={pointsRequired} onChange={(e) => setPointsRequired(Number(e.target.value))} />
        </label>
        <label className="admin-field">
          <span>Reward item</span>
          <select value={rewardItemId} onChange={(e) => setRewardItemId(e.target.value)}>
            <option value="">Select a reward</option>
            {rewardsData?.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.category})
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className="admin-form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="admin-btn admin-btn--secondary" disabled={addTier.isPending}>
          Add tier
        </button>
      </form>
    </div>
  );
}

export default function AdminEventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: existing } = useAdminEvent(id);
  const create = useCreateAdminEvent();
  const update = useUpdateAdminEvent(id ?? "");

  const [form, setForm] = useState<AdminEventInput>(BLANK);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existing?.event) {
      setForm({
        slug: existing.event.slug,
        name: existing.event.name,
        tagline: existing.event.tagline,
        description: existing.event.description,
        sponsorName: existing.event.sponsorName,
        themeSlug: existing.event.themeSlug,
        heroImageUrl: existing.event.heroImageUrl,
        cardImageUrl: existing.event.cardImageUrl,
        startsAt: toLocalInputValue(existing.event.startsAt),
        endsAt: toLocalInputValue(existing.event.endsAt),
        isActive: existing.event.isActive,
      });
    }
  }, [existing]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const payload: AdminEventInput = {
      ...form,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
    };

    const mutation = isEdit ? update : create;
    mutation.mutate(payload, {
      onSuccess: (result) => {
        if (!isEdit) {
          navigate(`/admin/events/${result.event.id}`, { replace: true });
        }
      },
      onError: (error) => {
        setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      },
    });
  }

  return (
    <div className="admin-page">
      <h1>{isEdit ? `Edit ${existing?.event.name ?? "event"}` : "New event"}</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="admin-field">
          <span>Slug</span>
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </label>

        <label className="admin-field">
          <span>Name</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>

        <label className="admin-field">
          <span>Tagline</span>
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} required />
        </label>

        <label className="admin-field">
          <span>Description</span>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </label>

        <label className="admin-field">
          <span>Sponsor name (optional)</span>
          <input
            value={form.sponsorName ?? ""}
            onChange={(e) => setForm({ ...form, sponsorName: e.target.value || null })}
          />
        </label>

        <label className="admin-field">
          <span>Theme slug</span>
          <input
            value={form.themeSlug}
            onChange={(e) => setForm({ ...form, themeSlug: e.target.value })}
            placeholder="e.g. tokidoki"
            required
          />
          <p className="admin-field__hint">CSS/asset namespace key - also the folder uploaded art lands in.</p>
        </label>

        <label className="admin-field">
          <span>Starts at</span>
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            required
          />
        </label>

        <label className="admin-field">
          <span>Ends at</span>
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            required
          />
        </label>

        <ImageUploadField
          label="Hero image"
          value={form.heroImageUrl}
          themeSlug={form.themeSlug || "evergreen"}
          onUploaded={(url) => setForm({ ...form, heroImageUrl: url })}
        />

        <ImageUploadField
          label="Card image"
          value={form.cardImageUrl}
          themeSlug={form.themeSlug || "evergreen"}
          onUploaded={(url) => setForm({ ...form, cardImageUrl: url })}
        />

        <label className="admin-field admin-field--checkbox">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          <span>Active (kill-switch - unchecking retires this event immediately)</span>
        </label>

        {errorMessage && (
          <p className="admin-form-error" role="alert">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="admin-btn admin-btn--primary" disabled={create.isPending || update.isPending}>
          {isEdit ? "Save changes" : "Create event"}
        </button>
      </form>

      {isEdit && id && <TierEditor eventId={id} />}
    </div>
  );
}
