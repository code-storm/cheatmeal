# CheatMeal — client

Frontend for CheatMeal, a daily pregnancy checklist app. React + TypeScript
(Vite), `react-router-dom` for routing, `@tanstack/react-query` for all
server state, plain CSS for styling.

## Development

```bash
npm install
npm run dev
```

In dev, requests to `/api/*` are proxied to `http://localhost:4000` (see
`vite.config.ts`) — run the sibling `server/` separately.

## Build

```bash
npm run build
```

## Structure

- `src/pages/` — one component per route (Signup, Login, Onboarding, Today,
  History, Profile).
- `src/components/` — shared UI (task rows/list, badges, progress, loading
  and error states, route guards, layout).
- `src/api/` — thin fetch wrappers per resource (`authApi`, `planApi`,
  `profileApi`), all using `credentials: 'include'` and throwing a typed
  `ApiError` on non-2xx responses.
- `src/hooks/` — React Query hooks wrapping the API modules.
- `src/context/` — `AuthContext`/`AuthProvider`, backed by `GET /api/auth/me`.
- `src/utils/` — time formatting/grouping and task-type display metadata.
