import { motion } from "framer-motion";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RewardCard } from "../components/RewardCard";
import {
  useActivateReward,
  useDeactivateReward,
  useRewards,
  useUnlockReward,
} from "../hooks/useRewards";
import { useEvents } from "../hooks/useEvents";
import { useRewardPreview } from "../hooks/RewardPreviewContext";
import type { Rarity, RewardItemDTO } from "../types";

const GRID_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const RARITY_ORDER: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

export default function WardrobePage() {
  const { data, isLoading, isError, error, refetch } = useRewards();
  const unlockReward = useUnlockReward();
  const activateReward = useActivateReward();
  const deactivateReward = useDeactivateReward();
  const { data: eventsData } = useEvents();
  const { preview, startPreview, clearPreview } = useRewardPreview();

  if (isLoading) {
    return (
      <div className="page page--wardrobe">
        <LoadingState label="Loading your wardrobe..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page page--wardrobe">
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const skins = data.items.filter((item) => item.category === "SKIN");
  const unlockedCount = skins.filter((item) => item.unlocked).length;

  // See RewardsPage.tsx's identical helper - same cached ["events"] data.
  function eventStartsAtFor(item: RewardItemDTO): string | null {
    if (!item.eventSlug) return null;
    return eventsData?.events.find((e) => e.slug === item.eventSlug)?.startsAt ?? null;
  }

  function handleTogglePreview(item: RewardItemDTO) {
    if (preview?.slug === item.slug) {
      clearPreview();
    } else {
      startPreview({ category: item.category, slug: item.slug, name: item.name, icon: item.icon, imageUrl: item.imageUrl });
    }
  }

  return (
    <div className="page page--wardrobe">
      <header className="page-header">
        <h1>Wardrobe</h1>
        <p className="page-header__subtitle">
          {unlockedCount} of {skins.length} skins collected
        </p>
        <div className="wardrobe-tier-breakdown">
          {RARITY_ORDER.map((rarity) => {
            const tierSkins = skins.filter((s) => s.rarity === rarity);
            if (tierSkins.length === 0) return null;
            const tierUnlocked = tierSkins.filter((s) => s.unlocked).length;
            return (
              <span
                key={rarity}
                className={`wardrobe-tier-breakdown__item reward-card__rarity reward-card__rarity--${rarity.toLowerCase()}`}
              >
                {tierUnlocked}/{tierSkins.length} {rarity}
              </span>
            );
          })}
        </div>
      </header>

      <motion.div
        className="rewards-grid"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.05 }}
      >
        {skins.map((item) => (
          <motion.div key={item.slug} variants={GRID_ITEM_VARIANTS}>
            <RewardCard
              item={item}
              pointsBalance={data.pointsBalance}
              isActive={data.activeSkinSlug === item.slug}
              isPreviewing={preview?.slug === item.slug}
              canPreview
              onUnlock={() => unlockReward.mutate(item.slug)}
              onActivate={() => activateReward.mutate(item.slug)}
              onRemove={() => deactivateReward.mutate(item.category)}
              onTogglePreview={() => handleTogglePreview(item)}
              isUnlocking={unlockReward.isPending && unlockReward.variables === item.slug}
              isActivating={activateReward.isPending && activateReward.variables === item.slug}
              isRemoving={deactivateReward.isPending && deactivateReward.variables === item.category}
              eventStartsAt={eventStartsAtFor(item)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
