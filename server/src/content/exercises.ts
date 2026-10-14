import type { TaskTemplateSeed } from "./types";

// EXERCISE-type daily tasks. These are one-per-day items (no mealSlot /
// rotationPoolKey - not rotated), gated by minWeek/maxWeek so the right
// variant surfaces for the user's current trimester.

export const exercises: TaskTemplateSeed[] = [
  {
    slug: "walk-gentle-t1",
    type: "EXERCISE",
    defaultTime: "06:30",
    name: "Gentle morning walk (15-20 min)",
    description: "A slow, comfortable 15-20 minute walk outdoors or at home, at a pace where you can still hold a conversation.",
    instructions: "Stop and rest if you feel breathless, dizzy, or unusually tired. Stay hydrated.",
    minWeek: 1,
    maxWeek: 13,
    nutrientTags: "",
  },
  {
    slug: "walk-brisk-t2",
    type: "EXERCISE",
    defaultTime: "06:30",
    name: "Brisk morning walk (25-30 min)",
    description: "A brisker 25-30 minute walk, picking up pace now that early first-trimester fatigue and nausea have usually eased.",
    instructions: "Wear supportive footwear. Slow down if you feel short of breath or your heart is racing.",
    minWeek: 14,
    maxWeek: 27,
    nutrientTags: "",
  },
  {
    slug: "walk-gentle-short-t3",
    type: "EXERCISE",
    defaultTime: "17:30",
    name: "Gentle short walk (10-15 min)",
    description: "A shorter, gentler 10-15 minute walk at a relaxed pace as your body carries more weight in the third trimester.",
    instructions: "Take breaks as needed. Avoid walking in extreme heat. Stop immediately if you notice contractions, pain, or fluid leakage and contact your doctor.",
    minWeek: 28,
    maxWeek: 45,
    nutrientTags: "",
  },
  {
    slug: "prenatal-yoga-seated-standing-t1t2",
    type: "EXERCISE",
    defaultTime: "07:00",
    name: "Prenatal stretching - seated and standing poses",
    description: "10-15 minutes of gentle seated and standing stretches designed for pregnancy, focused on easy breathing and comfortable range of motion.",
    instructions: "Avoid lying flat on your back for long stretches. Avoid deep twists. Stop if anything feels strained.",
    minWeek: 1,
    maxWeek: 27,
    nutrientTags: "",
  },
  {
    slug: "prenatal-yoga-seated-standing-t3",
    type: "EXERCISE",
    defaultTime: "07:00",
    name: "Gentle prenatal stretching - seated and standing poses only",
    description: "10 minutes of very gentle seated and standing stretches, avoiding any pose that requires lying flat on the back or deep bending.",
    instructions: "Use a chair or wall for support if needed. Avoid inversions, deep backbends, and lying flat on your back.",
    minWeek: 28,
    maxWeek: 45,
    nutrientTags: "",
  },
  {
    slug: "pelvic-floor-exercises",
    type: "EXERCISE",
    defaultTime: "09:00",
    name: "Pelvic floor (Kegel) exercises",
    description: "A short set of pelvic floor muscle contractions - squeeze and hold for a few seconds, then release, repeated 10 times.",
    instructions: "Can be done seated or lying on your side. Breathe normally throughout, don't hold your breath.",
    minWeek: 14,
    maxWeek: 45,
    nutrientTags: "",
  },
  {
    slug: "breathing-exercises-daily",
    type: "EXERCISE",
    defaultTime: "20:30",
    name: "Deep breathing exercise",
    description: "5-10 minutes of slow, deep belly breathing to relax, improve oxygen flow, and prepare for labour breathing techniques.",
    instructions: "Sit or lie on your side comfortably. Inhale slowly through the nose, exhale slowly through the mouth.",
    minWeek: 1,
    maxWeek: 45,
    nutrientTags: "",
  },
];

export default exercises;
