const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * Computes the current pregnancy week given the LMP (last menstrual period)
 * date and a reference date, clamped to [1, 45].
 *
 * week = floor((onDate - lmpDate) / (7 days)) + 1
 */
export function computeCurrentWeek(lmpDate: Date, onDate: Date): number {
  const diffMs = onDate.getTime() - lmpDate.getTime();
  const week = Math.floor(diffMs / MS_PER_WEEK) + 1;
  return Math.max(1, Math.min(45, week));
}

/**
 * Maps a pregnancy week to its trimester:
 *   Trimester 1: weeks <= 13
 *   Trimester 2: weeks 14-27
 *   Trimester 3: weeks >= 28
 */
export function trimesterForWeek(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}
