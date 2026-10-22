// Reference daily macro-nutrient targets for pregnancy, by trimester. Used
// to show a target alongside the day's actual (summed) macros - not for
// auto-balancing meal selection at runtime.
export interface MacroTarget {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export const DAILY_MACRO_TARGETS: Record<1 | 2 | 3, MacroTarget> = {
  1: { calories: 2000, proteinG: 75, carbsG: 260, fatG: 65 },
  2: { calories: 2300, proteinG: 85, carbsG: 300, fatG: 75 },
  3: { calories: 2400, proteinG: 90, carbsG: 310, fatG: 80 },
};

export default DAILY_MACRO_TARGETS;
