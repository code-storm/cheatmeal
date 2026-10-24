import { useRef, useState, type ChangeEvent } from "react";
import { adminUploadApi } from "../api/adminUploadApi";
import { ApiError } from "../api/adminClient";

interface ImageUploadFieldProps {
  label: string;
  value: string | null;
  // The event's own themeSlug for event-scoped art, or the literal
  // "evergreen" for non-event-scoped RewardItem/Badge art - matches the
  // server upload route's destination-folder convention (see
  // adminUpload.routes.ts).
  themeSlug: string;
  onUploaded: (url: string) => void;
}

// Single reusable file input: on change, uploads immediately, shows a
// thumbnail preview of the result, and reports the URL string up to the
// parent form. LOCAL-DEV-ONLY, same constraint as the server route it
// calls - labeled as such so an admin isn't surprised if this fails
// against the deployed server.
export function ImageUploadField({ label, value, themeSlug, onUploaded }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const { url } = await adminUploadApi.upload(file, themeSlug);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="admin-field admin-field--image">
      <span>{label}</span>
      <p className="admin-field__hint">Uploads work in local dev only - see server/src/routes/admin/adminUpload.routes.ts.</p>
      {value && (
        <div className="admin-image-preview">
          <img src={value} alt="" />
          <code>{value}</code>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileChange} disabled={isUploading} />
      {isUploading && <p className="admin-field__hint">Uploading...</p>}
      {error && (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
