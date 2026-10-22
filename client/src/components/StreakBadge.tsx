import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StreakBadgeProps {
  currentStreak: number;
}

export function StreakBadge({ currentStreak }: StreakBadgeProps) {
  const prevRef = useRef(currentStreak);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (currentStreak > prevRef.current) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 600);
      prevRef.current = currentStreak;
      return () => clearTimeout(timer);
    }
    prevRef.current = currentStreak;
  }, [currentStreak]);

  if (currentStreak <= 0) return null;

  return (
    <motion.span
      className="streak-badge"
      animate={bounce ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      🔥 {currentStreak}
    </motion.span>
  );
}
