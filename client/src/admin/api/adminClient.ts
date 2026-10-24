// Structural clone of ../../api/client.ts's apiRequest, pointed at the
// admin token instead of the regular user token - this is the one place
// the two systems' behavior actually differs. ApiError itself is reused
// (not duplicated): it's a generic HTTP-error wrapper with no
// auth-system-specific logic.
import { getAdminAuthToken } from "../lib/adminAuthToken";
import { ApiError } from "../../api/client";

export { ApiError };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const err = (payload as { error?: unknown }).error;
    if (typeof err === "string" && err.trim()) return err;
  }
  return fallback;
}

export interface AdminRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function adminApiRequest<T>(path: string, options: AdminRequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;
  const token = getAdminAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseBody(res);

  if (!res.ok) {
    const message = extractErrorMessage(payload, `Request failed with status ${res.status}`);
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}

// Multipart upload has a different body-building contract (FormData, no
// JSON.stringify, no Content-Type header - the browser sets that itself
// with the correct multipart boundary) so it's a separate function rather
// than overloading adminApiRequest's signature.
export async function adminUploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const token = getAdminAuthToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const payload = await parseBody(res);
  if (!res.ok) {
    const message = extractErrorMessage(payload, `Upload failed with status ${res.status}`);
    throw new ApiError(res.status, message, payload);
  }
  return payload as T;
}
