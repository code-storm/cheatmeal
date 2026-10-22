import { RewardToast } from "./RewardToast";

interface PointsToastProps {
  points: number;
}

/** Thin wrapper around the generalized RewardToast, kept for simple call-sites. */
export function PointsToast({ points }: PointsToastProps) {
  return (
    <RewardToast
      toast={points > 0 ? { key: `points-${points}`, icon: "⭐", label: `+${points} points!`, tone: "points" } : null}
    />
  );
}
