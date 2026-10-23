import { ProgressBar } from "./ProgressBar";
import type { EventTierDTO } from "../types";

interface EventProgressBarProps {
  pointsEarnedDuringEvent: number;
  tiers: EventTierDTO[];
}

export function EventProgressBar({ pointsEarnedDuringEvent, tiers }: EventProgressBarProps) {
  const nextTier = tiers.find((t) => !t.claimed);

  return (
    <div className="event-progress">
      <div className="event-progress__header">
        <span>Event progress</span>
        <span>{pointsEarnedDuringEvent} pts</span>
      </div>
      {nextTier ? (
        <>
          <ProgressBar completed={pointsEarnedDuringEvent} total={nextTier.pointsRequired} />
          <p className="event-progress__next">
            {Math.max(0, nextTier.pointsRequired - pointsEarnedDuringEvent)} points to tier {nextTier.tier}
          </p>
        </>
      ) : (
        <p className="event-progress__next">All tiers claimed!</p>
      )}
      <div className="event-progress__tiers">
        {tiers.map((tier) => (
          <span
            key={tier.tier}
            className={`event-progress__tier-chip ${tier.claimed ? "event-progress__tier-chip--claimed" : ""}`}
          >
            Tier {tier.tier} · {tier.pointsRequired}pts
          </span>
        ))}
      </div>
    </div>
  );
}
