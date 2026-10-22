import type { ChallengeDifficulty, ChallengeProofType } from "../lib/enums";
import { CHALLENGE_BONUS_POINTS } from "./points";

export interface DailyChallengeTemplateSeed {
  slug: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  proofType: ChallengeProofType;
  bonusPoints: number;
}

export const challengeTemplates: DailyChallengeTemplateSeed[] = [
  // Easy - quick, low-effort nudges.
  {
    slug: "sip-of-water",
    title: "Drink a glass of water",
    description: "Grab a glass of water right now and drink it slowly.",
    difficulty: "EASY",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.EASY,
  },
  {
    slug: "three-deep-breaths",
    title: "Take three deep breaths",
    description: "Pause wherever you are and take three slow, deep breaths.",
    difficulty: "EASY",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.EASY,
  },
  {
    slug: "stretch-your-shoulders",
    title: "Stretch your shoulders",
    description: "Roll your shoulders back and forth ten times to ease tension.",
    difficulty: "EASY",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.EASY,
  },
  {
    slug: "sunlight-break",
    title: "Step into some sunlight",
    description: "Stand near a window or step outside for two minutes of daylight.",
    difficulty: "EASY",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.EASY,
  },
  {
    slug: "name-one-gratitude",
    title: "Name one thing you're grateful for",
    description: "Think of one small thing today that you're thankful for.",
    difficulty: "EASY",
    proofType: "CAPTION",
    bonusPoints: CHALLENGE_BONUS_POINTS.EASY,
  },
  {
    slug: "snack-swap",
    title: "Swap one snack for a healthier pick",
    description: "Choose fruit, nuts, or yogurt instead of your usual snack today.",
    difficulty: "EASY",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.EASY,
  },

  // Moderate - a bit of effort or reflection.
  {
    slug: "ten-minute-walk",
    title: "Go for a 10-minute walk",
    description: "Take a gentle 10-minute walk, indoors or outdoors.",
    difficulty: "MODERATE",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.MODERATE,
  },
  {
    slug: "mood-journal-line",
    title: "Write one line about your mood",
    description: "Jot down a single sentence describing how you're feeling today.",
    difficulty: "MODERATE",
    proofType: "CAPTION",
    bonusPoints: CHALLENGE_BONUS_POINTS.MODERATE,
  },
  {
    slug: "pack-hospital-bag-item",
    title: "Add one item to your hospital bag",
    description: "Pick one item you'll need later and set it aside or pack it.",
    difficulty: "MODERATE",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.MODERATE,
  },
  {
    slug: "call-a-loved-one",
    title: "Check in with a loved one",
    description: "Call or message someone close to you just to say hello.",
    difficulty: "MODERATE",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.MODERATE,
  },
  {
    slug: "prep-tomorrows-breakfast",
    title: "Prep tomorrow's breakfast tonight",
    description: "Set out or prepare part of tomorrow's breakfast in advance.",
    difficulty: "MODERATE",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.MODERATE,
  },
  {
    slug: "learn-one-new-fact",
    title: "Learn one new pregnancy fact",
    description: "Read today's tip on the Today page and note what you learned.",
    difficulty: "MODERATE",
    proofType: "CAPTION",
    bonusPoints: CHALLENGE_BONUS_POINTS.MODERATE,
  },

  // Hard - bigger effort, reflection, or a small "share" moment.
  {
    slug: "try-new-healthy-recipe",
    title: "Try a new healthy recipe",
    description: "Cook or order something new and nutritious today, then share how it went.",
    difficulty: "HARD",
    proofType: "CAPTION",
    bonusPoints: CHALLENGE_BONUS_POINTS.HARD,
  },
  {
    slug: "full-prenatal-stretch",
    title: "Do a full prenatal stretch routine",
    description: "Complete a full 10-15 minute prenatal stretching or yoga routine.",
    difficulty: "HARD",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.HARD,
  },
  {
    slug: "plan-next-appointment",
    title: "Plan your next checkup",
    description: "Confirm the date of your next prenatal appointment and write it down.",
    difficulty: "HARD",
    proofType: "CAPTION",
    bonusPoints: CHALLENGE_BONUS_POINTS.HARD,
  },
  {
    slug: "share-your-progress",
    title: "Tell someone about your progress today",
    description: "Share one win from today - a completed task, a good meal, anything - with someone else.",
    difficulty: "HARD",
    proofType: "CAPTION",
    bonusPoints: CHALLENGE_BONUS_POINTS.HARD,
  },
  {
    slug: "device-free-hour",
    title: "Take a full device-free hour",
    description: "Spend one full hour today away from your phone or screens.",
    difficulty: "HARD",
    proofType: "CHECKBOX",
    bonusPoints: CHALLENGE_BONUS_POINTS.HARD,
  },
];
