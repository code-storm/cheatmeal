import { NavLink } from "react-router-dom";
import { useAdminLogout } from "../hooks/useAdminAuthActions";

export function AdminNav() {
  const logout = useAdminLogout();

  return (
    <nav className="admin-nav">
      <span className="admin-nav__brand">CheatMeal Admin</span>
      <div className="admin-nav__links">
        <NavLink to="/admin/events" className={({ isActive }) => (isActive ? "admin-nav__link admin-nav__link--active" : "admin-nav__link")}>
          Events
        </NavLink>
        <NavLink to="/admin/rewards" className={({ isActive }) => (isActive ? "admin-nav__link admin-nav__link--active" : "admin-nav__link")}>
          Rewards
        </NavLink>
        <NavLink to="/admin/badges" className={({ isActive }) => (isActive ? "admin-nav__link admin-nav__link--active" : "admin-nav__link")}>
          Badges
        </NavLink>
      </div>
      <button type="button" className="admin-btn admin-btn--secondary" onClick={() => logout.mutate()}>
        Log out
      </button>
    </nav>
  );
}
