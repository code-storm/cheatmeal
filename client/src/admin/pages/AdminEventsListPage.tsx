import { Link } from "react-router-dom";
import type { AdminEvent } from "../api/adminEventsApi";
import { useAdminEvents, useUpdateAdminEvent } from "../hooks/useAdminEvents";

function StageBadge({ stage }: { stage: string }) {
  return <span className={`admin-stage-badge admin-stage-badge--${stage.toLowerCase()}`}>{stage}</span>;
}

function EventRow({ event }: { event: AdminEvent }) {
  const update = useUpdateAdminEvent(event.id);

  return (
    <tr className={event.isActive ? "" : "admin-table__row--inactive"}>
      <td>
        <Link to={`/admin/events/${event.id}`}>{event.name}</Link>
        <div className="admin-table__subtext">{event.slug}</div>
      </td>
      <td>
        <StageBadge stage={event.stage} />
      </td>
      <td>{new Date(event.startsAt).toLocaleString()}</td>
      <td>{new Date(event.endsAt).toLocaleString()}</td>
      <td>{event.tiers.length}</td>
      <td>
        <button
          type="button"
          className="admin-btn admin-btn--small"
          onClick={() => update.mutate({ isActive: !event.isActive })}
          disabled={update.isPending}
        >
          {event.isActive ? "Deactivate" : "Activate"}
        </button>
      </td>
    </tr>
  );
}

export default function AdminEventsListPage() {
  const { data, isLoading, error } = useAdminEvents();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1>Events</h1>
        <Link to="/admin/events/new" className="admin-btn admin-btn--primary">
          New event
        </Link>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="admin-form-error">{error instanceof Error ? error.message : "Failed to load events."}</p>}

      {data && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stage</th>
              <th>Starts</th>
              <th>Ends</th>
              <th>Tiers</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
