import { useEffect, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import type { TipDTO } from "../types";

const AUTO_ADVANCE_MS = 7000;
const SWIPE_VELOCITY_THRESHOLD = 300;
const SWIPE_DISTANCE_THRESHOLD = 60;

interface TipsCarouselProps {
  tips: TipDTO[];
}

export function TipsCarousel({ tips }: TipsCarouselProps) {
  const [index, setIndex] = useState(0);
  const safeIndex = tips.length > 0 ? index % tips.length : 0;

  useEffect(() => {
    if (tips.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % tips.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [tips.length]);

  if (tips.length === 0) return null;

  const tip = tips[safeIndex];

  function goTo(nextIndex: number) {
    setIndex(((nextIndex % tips.length) + tips.length) % tips.length);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_DISTANCE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
      goTo(safeIndex + 1);
    } else if (info.offset.x > SWIPE_DISTANCE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY_THRESHOLD) {
      goTo(safeIndex - 1);
    }
  }

  return (
    <div className="tips-carousel glass-glow">
      <AnimatePresence mode="wait">
        <motion.div
          key={tip.id}
          className="tips-carousel__slide"
          drag={tips.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          <span className="tips-carousel__icon" aria-hidden="true">
            {tip.icon}
          </span>
          <div>
            <p className="tips-carousel__title">{tip.title}</p>
            <p className="tips-carousel__body">{tip.body}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {tips.length > 1 && (
        <div className="tips-carousel__dots">
          {tips.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`tips-carousel__dot ${i === safeIndex ? "tips-carousel__dot--active" : ""}`}
              aria-label={`Show tip ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
