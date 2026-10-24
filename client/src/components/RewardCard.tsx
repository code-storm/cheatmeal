import { motion } from "framer-motion";
import type { RewardItemDTO } from "../types";
import { HOVER_LIFT, SPRING_HOVER, SPRING_TAP, TAP_SCALE } from "../utils/motion";
import { SkinSwatch } from "./SkinSwatch";
import { SpriteImage } from "./SpriteImage";
import { useCountdown, formatCountdown } from "../hooks/useCountdown";

interface RewardCardProps {
  item: RewardItemDTO;
  pointsBalance: number;
  isActive: boolean;
  isPreviewing: boolean;
  canPreview: boolean;
  onUnlock: () => void;
  onActivate: () => void;
  onRemove: () => void;
  onTogglePreview: () => void;
  isUnlocking?: boolean;
  isActivating?: boolean;
  isRemoving?: boolean;
  // The parent event's startsAt (ISO), when item.eventStage === "UPCOMING" -
  // resolved by the page from the already-cached useEvents() list (see
  // RewardsPage/WardrobePage/EventDetailPage), not refetched per-card.
  // Undefined/null for non-UPCOMING items, which render a plain "Coming
  // soon" with no timer.
  eventStartsAt?: string | null;
}

export function RewardCard({
  item,
  pointsBalance,
  isActive,
  isPreviewing,
  canPreview,
  onUnlock,
  onActivate,
  onRemove,
  onTogglePreview,
  isUnlocking,
  isActivating,
  isRemoving,
  eventStartsAt,
}: RewardCardProps) {
  const canAfford = pointsBalance >= item.effectiveCostPoints;
  const progressPct = Math.min(100, Math.round((pointsBalance / item.effectiveCostPoints) * 100));
  // "Locked" (reward-card--locked) means affordable-but-not-yet-bought; a
  // week-scoped item outside its window is a different state entirely - it
  // was never purchasable in the first place, regardless of points - so it
  // gets its own modifier rather than reusing --locked.
  const expiredForUser = !item.unlocked && !item.purchasable;
  const isUpcoming = expiredForUser && item.eventStage === "UPCOMING";
  const countdown = useCountdown(isUpcoming ? eventStartsAt : null);

  return (
    <motion.div
      className={`reward-card glass-glow ${item.unlocked ? "reward-card--unlocked" : "reward-card--locked"} ${
        isPreviewing ? "reward-card--previewing" : ""
      } ${expiredForUser ? "reward-card--expired" : ""}`}
      animate={item.unlocked ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ ...HOVER_LIFT, transition: SPRING_HOVER }}
    >
      <span
        className={`reward-card__rarity reward-card__rarity--${item.rarity.toLowerCase()}`}
      >
        {item.rarity === "LEGENDARY" ? "⭐ " : ""}
        {item.rarity}
      </span>

      {item.eventName && (
        <span className="reward-card__event-chip">🎀 {item.eventName}</span>
      )}

      {item.imageUrl ? (
        <SpriteImage url={item.imageUrl} alt={item.name} className="reward-card__image" size={96} />
      ) : item.category === "SKIN" ? (
        <SkinSwatch slug={item.slug} icon={item.icon} />
      ) : (
        <span className="reward-card__icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <p className="reward-card__name">{item.name}</p>
      <p className="reward-card__description">{item.description}</p>

      {item.featured && !item.unlocked && (
        <span className="reward-card__featured">Featured · 25% off</span>
      )}

      {!item.unlocked && item.purchasable && item.availableUntilWeek != null && (
        <span className="reward-card__limited">⏳ Limited to your trimester</span>
      )}

      {item.eventStage === "ENDING_SOON" && !item.unlocked && (
        <span className="reward-card__limited reward-card__limited--urgent">⏰ Event ending soon</span>
      )}

      {expiredForUser && (
        <span className="reward-card__expired-label">
          {!item.eventSlug
            ? "No longer available for you"
            : isUpcoming
              ? countdown
                ? `Coming in ${formatCountdown(countdown)}`
                : "Coming soon"
              : "This event has ended"}
        </span>
      )}

      <p className="reward-card__cost">
        {item.featured && !item.unlocked ? (
          <>
            <span className="reward-card__cost--struck">{item.costPoints}</span>{" "}
            {item.effectiveCostPoints} pts
          </>
        ) : (
          `${item.costPoints} pts`
        )}
      </p>

      {!item.unlocked && !expiredForUser && (
        <div className="reward-card__progress">
          <div className="reward-card__progress-track">
            <div className="reward-card__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="reward-card__progress-label">
            {pointsBalance}/{item.effectiveCostPoints} pts
          </span>
        </div>
      )}

      <div className="reward-card__actions">
        {canPreview && (
          <motion.button
            type="button"
            whileTap={TAP_SCALE}
            transition={SPRING_TAP}
            className={`btn btn--secondary ${isPreviewing ? "btn--secondary-active" : ""}`}
            onClick={onTogglePreview}
          >
            {isPreviewing ? "Previewing ✓" : "Preview"}
          </motion.button>
        )}

        {!item.unlocked && !expiredForUser && (
          <motion.button
            type="button"
            whileTap={TAP_SCALE}
            transition={SPRING_TAP}
            className="btn btn--primary"
            onClick={onUnlock}
            disabled={!canAfford || isUnlocking}
          >
            {isUnlocking ? "Unlocking..." : canAfford ? "Unlock" : "Not enough points"}
          </motion.button>
        )}

        {item.unlocked && item.category !== "POWER" && !isActive && (
          <motion.button
            type="button"
            whileTap={TAP_SCALE}
            transition={SPRING_TAP}
            className="btn btn--primary"
            onClick={onActivate}
            disabled={isActivating}
          >
            {isActivating ? "Activating..." : "Activate"}
          </motion.button>
        )}

        {item.unlocked && item.category !== "POWER" && isActive && (
          <motion.button
            type="button"
            whileTap={TAP_SCALE}
            transition={SPRING_TAP}
            className="btn btn--secondary"
            onClick={onRemove}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </motion.button>
        )}

        {item.unlocked && item.category === "POWER" && (
          <span className="reward-card__unlocked-badge">Unlocked ✓</span>
        )}
      </div>
    </motion.div>
  );
}
