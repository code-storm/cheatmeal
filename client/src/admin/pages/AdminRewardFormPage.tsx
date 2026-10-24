import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../api/adminClient";
import type { AdminPowerKey, AdminRarity, AdminRewardCategory, AdminRewardItemInput } from "../api/adminRewardsApi";
import { useAdminReward, useCreateAdminReward, useUpdateAdminReward } from "../hooks/useAdminRewards";
import { useAdminEvents } from "../hooks/useAdminEvents";
import { ImageUploadField } from "../components/ImageUploadField";

const CATEGORIES: AdminRewardCategory[] = ["SKIN", "AVATAR", "POWER"];
const RARITIES: AdminRarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
const POWER_KEYS: AdminPowerKey[] = ["TOMORROW_PREVIEW", "FRESH_PICK"];

const BLANK: AdminRewardItemInput = {
  slug: "",
  name: "",
  description: "",
  category: "SKIN",
  rarity: "COMMON",
  costPoints: 100,
  icon: "",
  powerKey: null,
  imageUrl: null,
  availableFromWeek: null,
  availableUntilWeek: null,
  eventId: null,
  isActive: true,
};

export default function AdminRewardFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: existing } = useAdminReward(id);
  const { data: eventsData } = useAdminEvents();
  const create = useCreateAdminReward();
  const update = useUpdateAdminReward(id ?? "");

  const [form, setForm] = useState<AdminRewardItemInput>(BLANK);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existing?.item) {
      setForm({
        slug: existing.item.slug,
        name: existing.item.name,
        description: existing.item.description,
        category: existing.item.category,
        rarity: existing.item.rarity,
        costPoints: existing.item.costPoints,
        icon: existing.item.icon,
        powerKey: existing.item.powerKey,
        imageUrl: existing.item.imageUrl,
        availableFromWeek: existing.item.availableFromWeek,
        availableUntilWeek: existing.item.availableUntilWeek,
        eventId: existing.item.eventId,
        isActive: existing.item.isActive,
      });
    }
  }, [existing]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const mutation = isEdit ? update : create;
    mutation.mutate(form as AdminRewardItemInput, {
      onSuccess: () => navigate("/admin/rewards"),
      onError: (error) => {
        setErrorMessage(error instanceof ApiError ? error.message : "Something went wrong.");
      },
    });
  }

  const themeSlugForUpload = eventsData?.events.find((e) => e.id === form.eventId)?.themeSlug ?? "evergreen";

  return (
    <div className="admin-page">
      <h1>{isEdit ? `Edit ${existing?.item.name ?? "reward"}` : "New reward"}</h1>

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
          <span>Category</span>
          <select
            value={form.category}
            onChange={(e) => {
              const category = e.target.value as AdminRewardCategory;
              setForm({ ...form, category, powerKey: category === "POWER" ? form.powerKey : null });
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {form.category === "POWER" && (
          <label className="admin-field">
            <span>Power key</span>
            <select value={form.powerKey ?? ""} onChange={(e) => setForm({ ...form, powerKey: e.target.value as AdminPowerKey })} required>
              <option value="" disabled>
                Select a power key
              </option>
              {POWER_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="admin-field">
          <span>Rarity</span>
          <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value as AdminRarity })}>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Cost (points)</span>
          <input
            type="number"
            min={0}
            value={form.costPoints}
            onChange={(e) => setForm({ ...form, costPoints: Number(e.target.value) })}
            required
          />
        </label>

        <label className="admin-field">
          <span>Event (optional)</span>
          <select
            value={form.eventId ?? ""}
            onChange={(e) => setForm({ ...form, eventId: e.target.value || null })}
          >
            <option value="">No event (evergreen)</option>
            {eventsData?.events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Available from week (optional)</span>
          <input
            type="number"
            value={form.availableFromWeek ?? ""}
            onChange={(e) => setForm({ ...form, availableFromWeek: e.target.value ? Number(e.target.value) : null })}
          />
        </label>

        <label className="admin-field">
          <span>Available until week (optional)</span>
          <input
            type="number"
            value={form.availableUntilWeek ?? ""}
            onChange={(e) => setForm({ ...form, availableUntilWeek: e.target.value ? Number(e.target.value) : null })}
          />
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
          {isEdit ? "Save changes" : "Create reward"}
        </button>
      </form>
    </div>
  );
}
