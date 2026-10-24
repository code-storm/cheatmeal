import { Link } from "react-router-dom";
import type { EventDTO } from "../types";
import { useCountdown, formatCountdown } from "../hooks/useCountdown";

interface EventBannerProps {
  event: EventDTO;
}

export function EventBanner({ event }: EventBannerProps) {
  // Ticks live (see useCountdown's adaptive interval) rather than being
  // computed once at render time - the previous version only ever
  // recomputed "Coming in 21d" when something else happened to re-render
  // this component, so it could sit stale for the entire session.
  const countdown = useCountdown(event.stage === "RETIRED" ? null : event.stage === "UPCOMING" ? event.startsAt : event.endsAt);

  if (event.stage === "RETIRED") return null;

  const countdownLabel = countdown
    ? `${event.stage === "UPCOMING" ? "Coming in" : "Ends in"} ${formatCountdown(countdown)}`
    : event.stage === "UPCOMING"
      ? "Coming soon"
      : "Ending soon";

  return (
    <Link
      to={`/events/${event.slug}`}
      className={`event-banner glass-glow ${event.stage === "ENDING_SOON" ? "event-banner--urgent" : ""}`}
    >
      <span className={`event-banner__image event-banner__image--${event.themeSlug}`} aria-hidden="true" />
      <div className="event-banner__content">
        <span className="event-banner__name">{event.name}</span>
        <span className="event-banner__tagline">{event.tagline}</span>
        <span className="event-banner__countdown">{countdownLabel}</span>
      </div>
    </Link>
  );
}
