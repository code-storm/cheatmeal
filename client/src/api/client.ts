// Thin shared fetch wrapper. Every call includes credentials so the httpOnly
// auth cookie travels with the request, and every non-2xx response is turned
// into a thrown ApiError carrying the backend's parsed error message so
// callers (and React Query) can show something meaningful.

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

  const res = await fetch(path, {
    method,
    credentials: "include",
    signal,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
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
