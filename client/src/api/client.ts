// Thin shared fetch wrapper. Every call attaches the stored auth token (if
// any) as a Bearer header, and every non-2xx response is turned into a
// thrown ApiError carrying the backend's parsed error message so callers
// (and React Query) can show something meaningful.

import { getAuthToken } from "../lib/authToken";

// Locally this is unset, so paths stay relative and go through Vite's dev
// proxy (see vite.config.ts) straight to localhost:4000. In production
// there's no proxy (the client is a static build with no backend of its
// own), so VITE_API_BASE_URL must point at the deployed API's origin.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

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
  if (payload && typeof payload === "object" && "message" in payload) {
    const msg = (payload as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal } = options;
  const token = getAuthToken();

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
    const message = extractErrorMessage(
      payload,
      `Request failed with status ${res.status}`,
    );
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}
