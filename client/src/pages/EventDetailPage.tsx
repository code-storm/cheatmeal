import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RewardCard } from "../components/RewardCard";
import { BadgeCard } from "../components/BadgeCard";
import { EventProgressBar } from "../components/EventProgressBar";
import {
  useActivateReward,
  useDeactivateReward,
  useRewards,
  useUnlockReward,
} from "../hooks/useRewards";
import { useBadges } from "../hooks/useBadges";
import { useEventProgress, useEvents } from "../hooks/useEvents";
import { useRewardPreview } from "../hooks/RewardPreviewContext";
import type { RewardItemDTO } from "../types";

const GRID_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: eventsData, isLoading: eventsLoading } = useEvents();
  const { data: rewardsData, isLoading: rewardsLoading, isError, error, refetch } = useRewards();
  const { data: badgesData } = useBadges();
  const { data: progressData } = useEventProgress(slug);
  const unlockReward = useUnlockReward();
  const activateReward = useActivateReward();
  const deactivateReward = useDeactivateReward();
  const { preview, startPreview, clearPreview } = useRewardPreview();

  if (eventsLoading || rewardsLoading) {
    return (
      <div className="page page--event-detail">
        <LoadingState label="Loading event..." />
      </div>
    );
  }

  if (isError || !rewardsData) {
    return (
      <div className="page page--event-detail">
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const event = eventsData?.events.find((e) => e.slug === slug);
  const items = rewardsData.items.filter((item) => item.eventSlug === slug);
  const badges = badgesData?.items.filter((badge) => badge.eventSlug === slug) ?? [];

  function isActiveForItem(item: RewardItemDTO): boolean {
    if (item.category === "SKIN") return rewardsData!.activeSkinSlug === item.slug;
    if (item.category === "AVATAR") return rewardsData!.activeAvatarSlug === item.slug;
    return false;
  }

  function handleTogglePreview(item: RewardItemDTO) {
    if (preview?.slug === item.slug) {
      clearPreview();
    } else {
      startPreview({ category: item.category, slug: item.slug, name: item.name });
    }
  }

  return (
    <div className="page page--event-detail">
      <header className="page-header">
        {event?.heroImageUrl && (
          <img src={event.heroImageUrl} alt="" className="event-detail__hero" aria-hidden="true" />
        )}
        <h1>{event?.name ?? "Event"}</h1>
        <p className="page-header__subtitle">{event?.tagline}</p>
        {event?.description && <p className="event-detail__description">{event.description}</p>}
      </header>

      {progressData && progressData.tiers.length > 0 && (
        <EventProgressBar
          pointsEarnedDuringEvent={progressData.pointsEarnedDuringEvent}
          tiers={progressData.tiers}
        />
      )}

      {items.length > 0 && (
        <section className="rewards-section">
          <h2 className="rewards-section__heading">Items</h2>
          <motion.div
            className="rewards-grid"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05 }}
          >
            {items.map((item) => (
              <motion.div key={item.slug} variants={GRID_ITEM_VARIANTS}>
                <RewardCard
                  item={item}
                  pointsBalance={rewardsData.pointsBalance}
                  isActive={isActiveForItem(item)}
                  isPreviewing={preview?.slug === item.slug}
                  canPreview={item.category === "SKIN" || item.category === "AVATAR"}
                  onUnlock={() => unlockReward.mutate(item.slug)}
                  onActivate={() => activateReward.mutate(item.slug)}
                  onRemove={() => deactivateReward.mutate(item.category)}
                  onTogglePreview={() => handleTogglePreview(item)}
                  isUnlocking={unlockReward.isPending && unlockReward.variables === item.slug}
                  isActivating={activateReward.isPending && activateReward.variables === item.slug}
                  isRemoving={deactivateReward.isPending && deactivateReward.variables === item.category}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {badges.length > 0 && (
        <section className="rewards-section">
          <h2 className="rewards-section__heading">Badges</h2>
          <motion.div
            className="rewards-grid"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05 }}
          >
            {badges.map((badge) => (
              <motion.div key={badge.slug} variants={GRID_ITEM_VARIANTS}>
                <BadgeCard badge={badge} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}
