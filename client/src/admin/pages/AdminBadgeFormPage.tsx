import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../api/adminClient";
import { ADMIN_BADGE_CRITERIA_KEYS, type AdminBadgeCriteriaKey, type AdminBadgeInput } from "../api/adminBadgesApi";
import { useAdminBadge, useCreateAdminBadge, useUpdateAdminBadge } from "../hooks/useAdminBadges";
import { useAdminEvents } from "../hooks/useAdminEvents";
import { ImageUploadField } from "../components/ImageUploadField";

const BLANK: AdminBadgeInput = {
  slug: "",
  name: "",
  description: "",
  icon: "",
  criteriaKey: "FIRST_TASK",
  imageUrl: null,
  eventId: null,
  isActive: true,
};

const EVENT_SCOPED_KEYS: AdminBadgeCriteriaKey[] = ["EVENT_FIRST_ITEM", "EVENT_SET_COMPLETE"];

export default function AdminBadgeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: existing } = useAdminBadge(id);
  const { data: eventsData } = useAdminEvents();
  const create = useCreateAdminBadge();
  const update = useUpdateAdminBadge(id ?? "");

  const [form, setForm] = useState<AdminBadgeInput>(BLANK);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existing?.badge) {
      setForm({
        slug: existing.badge.slug,
        name: existing.badge.name,
        description: existing.badge.description,
        icon: existing.badge.icon,
        criteriaKey: existing.badge.criteriaKey,
        imageUrl: existing.badge.imageUrl,
        eventId: existing.badge.eventId,
        isActive: existing.badge.isActive,
      });
    }
  }, [existing]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const mutation = isEdit ? update : create;
    mutation.mutate(form, {
      onSuccess: () => navigate("/admin/badges"),
      onError: (error) => {
        setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      },
    });
  }

  const requiresEvent = EVENT_SCOPED_KEYS.includes(form.criteriaKey);
  const themeSlugForUpload = eventsData?.events.find((e) => e.id === form.eventId)?.themeSlug ?? "evergreen";

  return (
    <div className="admin-page">
      <h1>{isEdit ? `Edit ${existing?.badge.name ?? "badge"}` : "New badge"}</h1>

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
          <span>Description</span>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </label>

        <label className="admin-field">
          <span>Icon (emoji)</span>
          <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} required />
        </label>

        <label className="admin-field">
          <span>Criteria key</span>
          <select
            value={form.criteriaKey}
            onChange={(e) => setForm({ ...form, criteriaKey: e.target.value as AdminBadgeCriteriaKey })}
          >
            {ADMIN_BADGE_CRITERIA_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <p className="admin-field__hint">
            A badge with any other criteria key would be permanently un-awardable - this list matches
            server/src/services/badges.service.ts exactly.
          </p>
        </label>

        <label className="admin-field">
          <span>
            Event {requiresEvent ? "(required for this criteria key)" : "(optional)"}
          </span>
          <select value={form.eventId ?? ""} onChange={(e) => setForm({ ...form, eventId: e.target.value || null })} required={requiresEvent}>
            <option value="">No event</option>
            {eventsData?.events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>

        <ImageUploadField
          label="Image"
          value={form.imageUrl}
          themeSlug={themeSlugForUpload}
          onUploaded={(url) => setForm({ ...form, imageUrl: url })}
        />

        <label className="admin-field admin-field--checkbox">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          <span>Active</span>
        </label>

        {errorMessage && (
          <p className="admin-form-error" role="alert">
            {errorMessage}
          </p>
        )}

        <button type="submit" className="admin-btn admin-btn--primary" disabled={create.isPending || update.isPending}>
          {isEdit ? "Save changes" : "Create badge"}
        </button>
      </form>
    </div>
  );
}
