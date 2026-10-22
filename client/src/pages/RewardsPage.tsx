import { motion } from "framer-motion";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RewardCard } from "../components/RewardCard";
import { BadgeCard } from "../components/BadgeCard";
import {
  useActivateReward,
  useDeactivateReward,
  useRewards,
  useUnlockReward,
} from "../hooks/useRewards";
import { useBadges } from "../hooks/useBadges";
import { useRewardPreview } from "../hooks/RewardPreviewContext";
import type { RewardCategory, RewardItemDTO } from "../types";

const GRID_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const CATEGORY_SECTIONS: { category: RewardCategory; title: string }[] = [
  { category: "SKIN", title: "Skins" },
  { category: "AVATAR", title: "Avatars" },
  { category: "POWER", title: "Powers" },
];

export default function RewardsPage() {
  const { data, isLoading, isError, error, refetch } = useRewards();
  const unlockReward = useUnlockReward();
  const activateReward = useActivateReward();
  const deactivateReward = useDeactivateReward();
  const { data: badgesData } = useBadges();
  const { preview, startPreview, clearPreview } = useRewardPreview();

  if (isLoading) {
    return (
      <div className="page page--rewards">
        <LoadingState label="Loading rewards..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page page--rewards">
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  function isActiveForItem(item: RewardItemDTO): boolean {
    if (item.category === "SKIN") return data!.activeSkinSlug === item.slug;
    if (item.category === "AVATAR") return data!.activeAvatarSlug === item.slug;
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
    <div className="page page--rewards">
      <header className="page-header">
        <h1>Rewards</h1>
        <p className="page-header__subtitle">
          {data.pointsBalance} points to spend · {data.totalPointsEarned} earned so far
        </p>
      </header>

      {CATEGORY_SECTIONS.map(({ category, title }) => {
        const items = data.items.filter((item) => item.category === category);
        if (items.length === 0) return null;
        const canPreview = category === "SKIN" || category === "AVATAR";
        return (
          <section key={category} className="rewards-section">
            <h2 className="rewards-section__heading">{title}</h2>
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
                    pointsBalance={data.pointsBalance}
                    isActive={isActiveForItem(item)}
                    isPreviewing={preview?.slug === item.slug}
                    canPreview={canPreview}
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
        );
      })}

      {badgesData && badgesData.items.length > 0 && (
        <section className="rewards-section">
          <h2 className="rewards-section__heading">Badges</h2>
          <motion.div
            className="rewards-grid"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.05 }}
          >
            {badgesData.items.map((badge) => (
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
