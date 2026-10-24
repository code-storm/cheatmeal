import { Link } from "react-router-dom";
import { useAdminBadges } from "../hooks/useAdminBadges";

export default function AdminBadgesListPage() {
  const { data, isLoading, error } = useAdminBadges();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Badges</h1>
        <Link to="/admin/badges/new" className="admin-btn admin-btn--primary">
          New badge
        </Link>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="admin-form-error">{error instanceof Error ? error.message : "Failed to load badges."}</p>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Criteria</th>
              <th>Event</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.badges.map((badge) => (
              <tr key={badge.id} className={badge.isActive ? "" : "admin-table__row--inactive"}>
                <td>
                  <Link to={`/admin/badges/${badge.id}`}>
                    {badge.icon} {badge.name}
                  </Link>
                  <div className="admin-table__subtext">{badge.slug}</div>
                </td>
                <td>
                  <code>{badge.criteriaKey}</code>
                </td>
                <td>{badge.eventName ?? "—"}</td>
                <td>{badge.isActive ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
