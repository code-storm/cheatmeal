import { motion } from "framer-motion";
import type { BadgeDTO } from "../types";
import { HOVER_LIFT, SPRING_HOVER } from "../utils/motion";

interface BadgeCardProps {
  badge: BadgeDTO;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <motion.div
      className={`badge-card glass-glow ${badge.unlocked ? "badge-card--unlocked" : "badge-card--locked"}`}
      initial={badge.unlocked ? { scale: 0.8, opacity: 0 } : undefined}
      animate={badge.unlocked ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ ...HOVER_LIFT, transition: SPRING_HOVER }}
    >
      <span className="badge-card__icon" aria-hidden="true">
        {badge.icon}
      </span>
      <p className="badge-card__name">{badge.name}</p>
      <p className="badge-card__description">{badge.description}</p>
    </motion.div>
  );
}
