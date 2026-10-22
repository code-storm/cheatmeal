import { useState } from "react";
import { motion } from "framer-motion";
import type { ChallengeInstance } from "../types";
import { SPRING_TAP, TAP_SCALE } from "../utils/motion";

const DIFFICULTY_LABEL: Record<ChallengeInstance["difficulty"], string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  HARD: "Hard",
};

interface DailyChallengesCardProps {
  challenges: ChallengeInstance[];
  onComplete: (id: string, proofCaption?: string) => void;
  completingId?: string | null;
}

export function DailyChallengesCard({ challenges, onComplete, completingId }: DailyChallengesCardProps) {
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

  if (challenges.length === 0) return null;

  return (
    <section className="challenges-card glass-glow">
      <h2 className="challenges-card__heading">Today's Challenges</h2>
      <ul className="challenges-card__list">
        {challenges.map((challenge) => {
          const isCompleted = challenge.status === "COMPLETED";
          const isCompleting = completingId === challenge.id;
          const draft = captionDrafts[challenge.id] ?? "";

          return (
            <motion.li
              key={challenge.id}
              className={`challenges-card__item ${isCompleted ? "challenges-card__item--completed" : ""}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="challenges-card__row">
                <span
                  className={`challenges-card__difficulty challenges-card__difficulty--${challenge.difficulty.toLowerCase()}`}
                >
                  {DIFFICULTY_LABEL[challenge.difficulty]}
                </span>
                <span className="challenges-card__title">{challenge.title}</span>
                <span className="challenges-card__bonus">+{challenge.bonusPoints} pts</span>
              </div>
              <p className="challenges-card__description">{challenge.description}</p>

              {!isCompleted && challenge.proofType === "CAPTION" && (
                <div className="challenges-card__proof-input">
                  <input
                    type="text"
                    placeholder="Add a short note..."
                    value={draft}
                    onChange={(e) =>
                      setCaptionDrafts((prev) => ({ ...prev, [challenge.id]: e.target.value }))
                    }
                  />
                  <motion.button
                    type="button"
                    className="btn btn--primary"
                    whileTap={TAP_SCALE} transition={SPRING_TAP}
                    disabled={isCompleting || draft.trim().length === 0}
                    onClick={() => onComplete(challenge.id, draft.trim())}
                  >
                    {isCompleting ? "Saving..." : "Done"}
                  </motion.button>
                </div>
              )}

              {!isCompleted && challenge.proofType === "CHECKBOX" && (
                <motion.button
                  type="button"
                  className="btn btn--primary"
                  whileTap={TAP_SCALE} transition={SPRING_TAP}
                  disabled={isCompleting}
                  onClick={() => onComplete(challenge.id)}
                >
                  {isCompleting ? "Saving..." : "Mark done"}
                </motion.button>
              )}

              {isCompleted && <span className="task-pill task-pill--done">Done</span>}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
