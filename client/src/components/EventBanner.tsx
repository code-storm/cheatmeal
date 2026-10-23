import { Link } from "react-router-dom";
import type { EventDTO } from "../types";

interface EventBannerProps {
  event: EventDTO;
}

function timeUntil(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return "soon";
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function EventBanner({ event }: EventBannerProps) {
  if (event.stage === "RETIRED") return null;

  const countdownLabel =
    event.stage === "UPCOMING"
      ? `Coming in ${timeUntil(event.startsAt)}`
      : `Ends in ${timeUntil(event.endsAt)}`;

  return (
    <Link
      to={`/events/${event.slug}`}
      className={`event-banner glass-glow ${event.stage === "ENDING_SOON" ? "event-banner--urgent" : ""}`}
    >
      {event.cardImageUrl && (
        <img src={event.cardImageUrl} alt="" className="event-banner__image" aria-hidden="true" loading="lazy" />
      )}
      <div className="event-banner__content">
        <span className="event-banner__name">{event.name}</span>
        <span className="event-banner__tagline">{event.tagline}</span>
        <span className="event-banner__countdown">{countdownLabel}</span>
      </div>
    </Link>
  );
}
