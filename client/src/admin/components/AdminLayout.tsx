import { Outlet } from "react-router-dom";
import { AdminNav } from "./AdminNav";
import "../admin.css";

// Intentionally plain/utilitarian - no theming system (skins, confetti,
// liquid-glass) at all, so it's visually unmistakable from the real
// consumer product. This is an internal ops tool, not a marketing
// surface.
export function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminNav />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
