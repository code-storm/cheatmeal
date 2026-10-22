import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ProgressBar } from "./ProgressBar";
import type { LevelInfo } from "../types";

interface LevelProgressProps {
  level: LevelInfo;
  compact?: boolean;
}

export function LevelProgress({ level, compact }: LevelProgressProps) {
  const prevIndexRef = useRef(level.index);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (level.index > prevIndexRef.current) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 700);
      prevIndexRef.current = level.index;
      return () => clearTimeout(timer);
    }
    prevIndexRef.current = level.index;
  }, [level.index]);

  if (compact) {
    return (
      <motion.span
        className="level-progress--compact"
        animate={bounce ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <span aria-hidden="true">{level.icon}</span>
        <span className="level-progress--compact__name">{level.name}</span>
      </motion.span>
    );
  }

  return (
    <motion.div
      className="level-progress"
      animate={bounce ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="level-progress__header">
        <span className="level-progress__icon" aria-hidden="true">
          {level.icon}
        </span>
        <span>{level.name}</span>
      </div>
      {level.pointsForNextLevel !== null ? (
        <>
          <ProgressBar completed={level.pointsIntoLevel} total={level.pointsForNextLevel} />
          <p className="level-progress__next">
            {level.pointsForNextLevel - level.pointsIntoLevel} points to the next level
          </p>
        </>
      ) : (
        <p className="level-progress__next">Max level reached</p>
      )}
    </motion.div>
  );
}
