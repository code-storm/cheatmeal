import { Link } from "react-router-dom";
import { useAdminRewards } from "../hooks/useAdminRewards";

export default function AdminRewardsListPage() {
  const { data, isLoading, error } = useAdminRewards();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Rewards</h1>
        <Link to="/admin/rewards/new" className="admin-btn admin-btn--primary">
          New reward
        </Link>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="admin-form-error">{error instanceof Error ? error.message : "Failed to load rewards."}</p>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Rarity</th>
              <th>Cost</th>
              <th>Event</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id} className={item.isActive ? "" : "admin-table__row--inactive"}>
                <td>
                  <Link to={`/admin/rewards/${item.id}`}>
                    {item.icon} {item.name}
                  </Link>
                  <div className="admin-table__subtext">{item.slug}</div>
                </td>
                <td>{item.category}</td>
                <td>{item.rarity}</td>
                <td>{item.costPoints}</td>
                <td>{item.eventName ?? "—"}</td>
                <td>{item.isActive ? "Active" : "Inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
