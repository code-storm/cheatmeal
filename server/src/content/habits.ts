import type { TaskTemplateSeed } from "./types";

// HABIT and GROOMING-type daily tasks. One-per-day items (no mealSlot /
// rotationPoolKey - not rotated), gated by minWeek/maxWeek.

export const habits: TaskTemplateSeed[] = [
  {
    slug: "hydration-reminder-morning",
    type: "HABIT",
    defaultTime: "10:00",
    name: "Hydration check-in - mid-morning",
    description: "Drink a glass of water. Aim for consistent sips through the morning rather than large amounts at once.",
    minWeek: 1,
    maxWeek: 45,
    nutrientTags: "",
  },
  {
    slug: "hydration-reminder-afternoon",
    type: "HABIT",
    defaultTime: "15:30",
    name: "Hydration check-in - afternoon",
    description: "Drink a glass of water or buttermilk. Staying well-hydrated through the day helps with energy and reduces swelling.",
    minWeek: 1,
    maxWeek: 45,
    nutrientTags: "",
  },
  {
    slug: "oral-hygiene-brushing",
    type: "HABIT",
    defaultTime: "07:30",
    name: "Oral hygiene - brush and floss",
    description: "Brush your teeth and floss. Pregnancy hormones can increase gum sensitivity, so gentle, consistent oral care matters more than usual.",
    minWeek: 1,
    maxWeek: 45,
    nutrientTags: "",
  },
  {
    slug: "skin-belly-oiling",
    type: "GROOMING",
    defaultTime: "21:00",
    name: "Belly and skin oiling",
    description: "Gently massage a pregnancy-safe oil or moisturiser onto your belly, hips, and thighs to help with skin elasticity and comfort as your body changes.",
    instructions: "Use gentle, upward strokes. Avoid any oil or product your doctor hasn't cleared if you have sensitive skin.",
    minWeek: 14,
    maxWeek: 45,
    nutrientTags: "",
  },
  {
    slug: "wind-down-side-sleeping",
    type: "HABIT",
    defaultTime: "22:00",
    name: "Wind-down and sleep position reminder",
    description: "Begin winding down for sleep: dim the lights, keep screens away, and settle into bed. From this stage, prefer side-sleeping (left side is often recommended) over sleeping on your back.",
    instructions: "Use a pillow between your knees or behind your back for comfort. Avoid staying on your back for long stretches while sleeping.",
    minWeek: 16,
    maxWeek: 45,
    nutrientTags: "",
  },
  {
    slug: "wind-down-general-t1",
    type: "HABIT",
    defaultTime: "22:00",
    name: "Wind-down for sleep",
    description: "Begin winding down for sleep: dim the lights, keep screens away, and settle into a comfortable position in bed.",
    minWeek: 1,
    maxWeek: 15,
    nutrientTags: "",
  },
  {
    slug: "kick-count-awareness",
    type: "HABIT",
    defaultTime: "20:00",
    name: "Fetal movement (kick count) awareness",
    description: "Spend a quiet 20-30 minutes noticing your baby's movements. Note roughly how long it takes to feel 10 movements; contact your doctor promptly if movement feels notably reduced or different from usual.",
    instructions: "Lie on your side in a quiet spot for this. This is an awareness habit, not a medical diagnostic - always contact your doctor with any concerns.",
    minWeek: 28,
    maxWeek: 45,
    nutrientTags: "",
  },
];

export default habits;
