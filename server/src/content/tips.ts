export interface PregnancyTip {
  id: string;
  trimester: 1 | 2 | 3;
  title: string;
  body: string;
  icon: string;
}

export const pregnancyTips: PregnancyTip[] = [
  // Trimester 1
  {
    id: "t1-hydration",
    trimester: 1,
    title: "Stay ahead of nausea",
    body: "Sipping water through the day, instead of large gulps, can help keep morning sickness more manageable.",
    icon: "💧",
  },
  {
    id: "t1-folic-acid",
    trimester: 1,
    title: "Folic acid matters most now",
    body: "Your baby's neural tube develops in these early weeks, which is why folic acid is especially important in trimester one.",
    icon: "🧬",
  },
  {
    id: "t1-rest",
    trimester: 1,
    title: "Fatigue is normal",
    body: "Feeling more tired than usual in trimester one is common - your body is working hard behind the scenes. Rest when you can.",
    icon: "😴",
  },
  {
    id: "t1-small-meals",
    trimester: 1,
    title: "Smaller, frequent meals help",
    body: "If nausea is an issue, try five or six small meals instead of three large ones to keep your blood sugar steady.",
    icon: "🍽️",
  },
  {
    id: "t1-share-news",
    trimester: 1,
    title: "There's no 'right' time to share",
    body: "Whether you share your news early or wait, it's entirely your choice - there's no single right timeline.",
    icon: "💬",
  },
  {
    id: "t1-prenatal-vitamin",
    trimester: 1,
    title: "Keep your prenatal vitamin routine steady",
    body: "Taking your prenatal vitamin at the same time each day, with a small snack, can make it easier to stick with.",
    icon: "💊",
  },

  // Trimester 2
  {
    id: "t2-energy-returns",
    trimester: 2,
    title: "Energy often picks back up",
    body: "Many people find trimester two brings back some energy - a good window for gentle exercise and getting things done.",
    icon: "⚡",
  },
  {
    id: "t2-posture",
    trimester: 2,
    title: "Mind your posture",
    body: "As your center of gravity shifts, standing tall and avoiding slouching can help ease lower back strain.",
    icon: "🧍",
  },
  {
    id: "t2-movement",
    trimester: 2,
    title: "You might start feeling movement",
    body: "Many people first notice baby's movements - sometimes described as flutters - during this trimester.",
    icon: "🤰",
  },
  {
    id: "t2-partner-involvement",
    trimester: 2,
    title: "Bring your partner into appointments",
    body: "If you have a partner, inviting them to an upcoming scan or checkup can be a meaningful way to involve them.",
    icon: "🤝",
  },
  {
    id: "t2-sleep-side",
    trimester: 2,
    title: "Sleeping on your side gets easier",
    body: "Side-sleeping, especially on the left, is often recommended as your bump grows - a pillow between your knees can help.",
    icon: "🛏️",
  },
  {
    id: "t2-calcium",
    trimester: 2,
    title: "Calcium needs rise",
    body: "Your baby's bones are developing quickly now - dairy, leafy greens, or fortified foods can help meet calcium needs.",
    icon: "🦴",
  },
  {
    id: "t2-stretch-marks",
    trimester: 2,
    title: "Skin changes are common",
    body: "Stretch marks and skin itching are common as your skin stretches - a simple moisturizer can help with comfort.",
    icon: "🧴",
  },

  // Trimester 3
  {
    id: "t3-hospital-bag",
    trimester: 3,
    title: "Start thinking about your hospital bag",
    body: "Packing a few essentials ahead of time can take one thing off your mind as your due date approaches.",
    icon: "🎒",
  },
  {
    id: "t3-kick-counts",
    trimester: 3,
    title: "Get to know baby's patterns",
    body: "Noticing your baby's typical movement patterns now can help you feel confident about what's normal for them.",
    icon: "👣",
  },
  {
    id: "t3-swelling",
    trimester: 3,
    title: "Mild swelling can be normal",
    body: "Some swelling in your feet and ankles is common late in pregnancy - resting with your feet elevated can help.",
    icon: "🦶",
  },
  {
    id: "t3-practice-breathing",
    trimester: 3,
    title: "Practice your breathing techniques",
    body: "Whatever breathing or relaxation techniques you plan to use for labor, practicing now can make them feel familiar.",
    icon: "🫁",
  },
  {
    id: "t3-rest-often",
    trimester: 3,
    title: "Rest whenever you can",
    body: "Short rests throughout the day, even just lying down for a few minutes, can help you feel more comfortable.",
    icon: "🌙",
  },
  {
    id: "t3-birth-plan",
    trimester: 3,
    title: "Jot down your preferences",
    body: "Writing down a few preferences for labor and delivery can help you feel more prepared to discuss them with your care team.",
    icon: "📝",
  },
];
