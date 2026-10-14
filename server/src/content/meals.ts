import type { TaskTemplateSeed } from "./types";
import type { MealSlot } from "../lib/enums";

// ---------------------------------------------------------------------------
// Meal content library.
//
// For each of the 7 MealSlot values, we author ~8 distinct options per
// trimester (so pool sizes are large enough for the no-repeat-within-7-days
// rotation algorithm in planGenerator.service.ts to actually have room to
// rotate). Content is authentic Indian-cuisine, trimester-aware:
//   T1 (wk 1-13):  light, easy-to-digest, anti-nausea-friendly, folic acid + iron
//   T2 (wk 14-27): calorie-dense, protein-forward, calcium + iron
//   T3 (wk 28-45): smaller/frequent, fibre-forward, heartburn-aware, iron + DHA,
//                  higher protein for growth spurt
// ---------------------------------------------------------------------------

type Trimester = 1 | 2 | 3;

const DEFAULT_TIME_BY_SLOT: Record<MealSlot, string> = {
  EARLY_MORNING: "06:30",
  BREAKFAST: "08:15",
  MID_MORNING_SNACK: "11:00",
  LUNCH: "13:00",
  EVENING_SNACK: "17:00",
  DINNER: "19:45",
  BEDTIME: "21:30",
};

const WEEK_RANGE_BY_TRIMESTER: Record<Trimester, [number, number]> = {
  1: [1, 13],
  2: [14, 27],
  3: [28, 45],
};

interface MealSeed {
  slugSuffix: string;
  name: string;
  description: string;
  instructions?: string;
  nutrientTags: string; // comma-separated
}

function buildMeals(trimester: Trimester, slot: MealSlot, seeds: MealSeed[]): TaskTemplateSeed[] {
  const [minWeek, maxWeek] = WEEK_RANGE_BY_TRIMESTER[trimester];
  const rotationPoolKey = `T${trimester}_${slot}`;
  return seeds.map((seed) => ({
    slug: `t${trimester}-${slot.toLowerCase().replace(/_/g, "-")}-${seed.slugSuffix}`,
    type: "MEAL",
    mealSlot: slot,
    defaultTime: DEFAULT_TIME_BY_SLOT[slot],
    name: seed.name,
    description: seed.description,
    instructions: seed.instructions,
    minWeek,
    maxWeek,
    nutrientTags: seed.nutrientTags,
    rotationPoolKey,
  }));
}

// ===================== EARLY_MORNING =====================

const EARLY_MORNING_T1: MealSeed[] = [
  {
    slugSuffix: "lemon-honey-water",
    name: "Warm lemon-honey water",
    description: "A glass of warm water with a few drops of lemon and a teaspoon of honey, sipped slowly on waking.",
    nutrientTags: "folic_acid",
  },
  {
    slugSuffix: "soaked-almonds-walnuts",
    name: "Soaked almonds and walnuts",
    description: "5-6 almonds and 2 walnuts soaked overnight, peeled and eaten first thing in the morning.",
    nutrientTags: "iron,dha",
  },
  {
    slugSuffix: "ginger-water",
    name: "Ginger-infused warm water",
    description: "Warm water infused with a thin slice of fresh ginger, helpful for morning nausea.",
    nutrientTags: "folic_acid",
  },
  {
    slugSuffix: "soaked-raisins",
    name: "Soaked raisins (kishmish)",
    description: "A small handful of raisins soaked overnight in water, eaten along with the soaking water.",
    nutrientTags: "iron",
  },
  {
    slugSuffix: "fennel-water",
    name: "Soaked fennel (saunf) water",
    description: "Water with a teaspoon of fennel seeds soaked overnight, strained and sipped - gentle on an unsettled stomach.",
    nutrientTags: "folic_acid",
  },
  {
    slugSuffix: "dry-roasted-peanuts",
    name: "A small handful of dry-roasted peanuts",
    description: "Plain dry-roasted, unsalted peanuts - a light protein-and-folate start to the day.",
    nutrientTags: "folic_acid,protein",
  },
  {
    slugSuffix: "methi-water",
    name: "Soaked fenugreek (methi) seed water",
    description: "A teaspoon of fenugreek seeds soaked overnight in water; sip the strained water slowly.",
    nutrientTags: "iron",
  },
  {
    slugSuffix: "tender-coconut-water",
    name: "Tender coconut water",
    description: "A small glass of fresh tender coconut water, light and hydrating.",
    nutrientTags: "folic_acid",
  },
];

const EARLY_MORNING_T2: MealSeed[] = [
  {
    slugSuffix: "almonds-walnuts-dates",
    name: "Soaked almonds, walnuts and dates",
    description: "6-8 soaked almonds, 2-3 walnuts and 2 dates - a calorie-dense, iron-rich start.",
    nutrientTags: "iron,dha,protein",
  },
  {
    slugSuffix: "turmeric-milk-almonds",
    name: "Warm turmeric milk with crushed almonds",
    description: "A small cup of warm milk with a pinch of turmeric and a few crushed almonds stirred in.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "raisins-figs",
    name: "Soaked raisins and dried figs (anjeer)",
    description: "A small handful of raisins and 2 dried figs, soaked overnight - good source of iron and calcium.",
    nutrientTags: "iron,calcium",
  },
  {
    slugSuffix: "methi-seeds-date",
    name: "Soaked fenugreek seeds with a date",
    description: "Fenugreek seeds soaked overnight in water, taken with a date for extra iron.",
    nutrientTags: "iron",
  },
  {
    slugSuffix: "fresh-fruit-juice",
    name: "Fresh pomegranate or orange juice",
    description: "A small glass of freshly squeezed pomegranate or orange juice, no added sugar.",
    nutrientTags: "folic_acid,iron",
  },
  {
    slugSuffix: "peanut-jaggery",
    name: "Roasted peanuts with a small piece of jaggery",
    description: "A small handful of roasted peanuts with a small piece of jaggery (gud-chana style) - iron and quick energy.",
    nutrientTags: "iron,protein",
  },
  {
    slugSuffix: "coconut-water-almonds",
    name: "Tender coconut water with soaked almonds",
    description: "A glass of tender coconut water alongside a small handful of soaked almonds.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "saffron-milk",
    name: "Warm milk with a pinch of saffron and almonds",
    description: "Warm milk with a pinch of saffron (kesar) and a few crushed almonds stirred in.",
    nutrientTags: "calcium,protein",
  },
];

const EARLY_MORNING_T3: MealSeed[] = [
  {
    slugSuffix: "warm-water-raisins",
    name: "Warm water with soaked raisins",
    description: "Plain warm water (not citrus, to go easy on heartburn) with a small handful of soaked raisins.",
    nutrientTags: "iron",
  },
  {
    slugSuffix: "almonds-walnuts",
    name: "Soaked almonds and walnuts",
    description: "6-8 soaked almonds and 2-3 walnuts, peeled - walnuts contribute DHA for the baby's brain development.",
    nutrientTags: "dha,iron",
  },
  {
    slugSuffix: "turmeric-milk",
    name: "Warm turmeric milk (no citrus)",
    description: "A small cup of warm milk with a pinch of turmeric - gentle on the stomach, no acidic citrus.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "dates-figs",
    name: "Soaked dates and dried figs",
    description: "2-3 soaked dates and 2 dried figs - iron and fibre to help with third-trimester constipation.",
    nutrientTags: "iron,fiber",
  },
  {
    slugSuffix: "coconut-water",
    name: "Tender coconut water",
    description: "A small glass of fresh tender coconut water, light and easy on the stomach.",
    nutrientTags: "folic_acid",
  },
  {
    slugSuffix: "flaxseed-water",
    name: "Soaked flaxseed (alsi) water",
    description: "A teaspoon of soaked flaxseeds in water - a plant source of omega-3 and iron.",
    nutrientTags: "iron,dha,fiber",
  },
  {
    slugSuffix: "ajwain-water",
    name: "Warm water with a pinch of ajwain",
    description: "Warm water with a pinch of ajwain (carom seeds) - traditionally used to ease digestion, non-acidic.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "almonds-walnuts-date",
    name: "Soaked almonds, walnuts and a date",
    description: "A small mixed handful of soaked almonds, walnuts and one date, chewed slowly.",
    nutrientTags: "iron,dha",
  },
];

// ===================== BREAKFAST =====================

const BREAKFAST_T1: MealSeed[] = [
  {
    slugSuffix: "plain-poha",
    name: "Plain poha with peanuts and curry leaves",
    description: "Flattened rice lightly cooked with peanuts, curry leaves, turmeric and a little lemon - mild and easy to digest.",
    nutrientTags: "folic_acid,iron",
  },
  {
    slugSuffix: "veg-upma",
    name: "Vegetable rava (suji) upma",
    description: "Semolina upma cooked with mild spices and finely chopped vegetables.",
    nutrientTags: "folic_acid,fiber",
  },
  {
    slugSuffix: "idli-chutney",
    name: "Idli with light coconut chutney",
    description: "Soft steamed idlis served with a mild coconut chutney - gentle on the stomach.",
    nutrientTags: "folic_acid,protein",
  },
  {
    slugSuffix: "moong-dal-cheela",
    name: "Moong dal cheela",
    description: "A thin savoury pancake made from ground moong dal, cooked with minimal oil and mild spices.",
    nutrientTags: "protein,folic_acid",
  },
  {
    slugSuffix: "toast-boiled-egg",
    name: "Dry toast with a boiled egg",
    description: "Two slices of lightly toasted bread with one boiled egg - simple, protein-rich, easy on morning nausea.",
    nutrientTags: "protein,folic_acid",
  },
  {
    slugSuffix: "veg-daliya",
    name: "Vegetable daliya (broken wheat porridge)",
    description: "Broken wheat cooked soft with vegetables and light seasoning - gentle and filling.",
    nutrientTags: "fiber,folic_acid",
  },
  {
    slugSuffix: "besan-chilla",
    name: "Besan chilla with mint chutney",
    description: "A savoury gram-flour pancake, lightly spiced, served with mint chutney.",
    nutrientTags: "protein,folic_acid",
  },
  {
    slugSuffix: "curd-chivda",
    name: "Curd (dahi) with roasted chivda",
    description: "A bowl of plain curd with a small portion of mildly spiced roasted chivda mixed in.",
    nutrientTags: "calcium,folic_acid",
  },
];

const BREAKFAST_T2: MealSeed[] = [
  {
    slugSuffix: "paneer-paratha",
    name: "Stuffed paneer paratha with curd",
    description: "A whole-wheat paratha stuffed with spiced paneer, served with a bowl of curd.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "methi-thepla",
    name: "Methi thepla with curd",
    description: "Fenugreek-leaf flatbread, lightly spiced, served with curd.",
    nutrientTags: "iron,calcium",
  },
  {
    slugSuffix: "masala-dosa",
    name: "Masala dosa with sambar and coconut chutney",
    description: "A crisp dosa filled with lightly spiced potato filling, served with sambar and coconut chutney.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "moong-dal-paratha",
    name: "Moong dal and vegetable paratha with curd",
    description: "A whole-wheat paratha stuffed with mashed moong dal and vegetables, served with curd.",
    nutrientTags: "protein,iron,calcium",
  },
  {
    slugSuffix: "egg-bhurji-roti",
    name: "Egg bhurji with multigrain roti",
    description: "Scrambled eggs cooked with onion, tomato and mild spices, served with multigrain roti.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "besan-uttapam",
    name: "Besan-vegetable uttapam with sambar",
    description: "A thick gram-flour and vegetable pancake served with sambar.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "paneer-bhurji-toast",
    name: "Paneer bhurji with multigrain toast",
    description: "Mashed paneer cooked with onion, tomato and mild spices, served with multigrain toast.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "sprouted-moong-poha",
    name: "Sprouted moong and vegetable poha",
    description: "Flattened rice cooked with sprouted moong and mixed vegetables for extra protein.",
    nutrientTags: "protein,iron",
  },
];

const BREAKFAST_T3: MealSeed[] = [
  {
    slugSuffix: "ragi-dosa",
    name: "Ragi dosa with light coconut chutney",
    description: "A finger-millet (ragi) dosa, mild and fibre-rich, served with a light coconut chutney.",
    nutrientTags: "fiber,iron,calcium",
  },
  {
    slugSuffix: "veg-daliya-ghee",
    name: "Vegetable daliya porridge with a drop of ghee",
    description: "Broken wheat porridge with vegetables and a drop of ghee - fibre-forward and gentle.",
    nutrientTags: "fiber,iron",
  },
  {
    slugSuffix: "soft-idli-sambar",
    name: "Soft idli with mild sambar",
    description: "Steamed idlis served with a mildly spiced sambar - easy to digest, low fried content.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "oats-upma",
    name: "Oats upma with vegetables",
    description: "Rolled oats cooked upma-style with vegetables and light tempering - high fibre.",
    nutrientTags: "fiber,iron",
  },
  {
    slugSuffix: "multigrain-paneer-bhurji",
    name: "Multigrain roti with mild paneer bhurji",
    description: "Multigrain roti served with a mildly spiced paneer bhurji.",
    nutrientTags: "protein,calcium,fiber",
  },
  {
    slugSuffix: "jowar-roti-curd",
    name: "Jowar roti with curd and vegetables",
    description: "Sorghum (jowar) flatbread served with curd and a small bowl of lightly cooked vegetables.",
    nutrientTags: "fiber,calcium",
  },
  {
    slugSuffix: "moong-cheela-mild",
    name: "Moong dal cheela with mild chutney",
    description: "A savoury moong dal pancake served with a very mild chutney - protein-rich, low fried content.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "boiled-egg-toast",
    name: "Boiled egg with soft multigrain toast",
    description: "One boiled egg with lightly toasted multigrain bread.",
    nutrientTags: "protein,dha",
  },
];

// ===================== MID_MORNING_SNACK =====================

const MID_MORNING_T1: MealSeed[] = [
  {
    slugSuffix: "roasted-chana",
    name: "Roasted chana (chickpeas)",
    description: "A small bowl of plain roasted chickpeas.",
    nutrientTags: "folic_acid,protein",
  },
  {
    slugSuffix: "plain-makhana",
    name: "Plain roasted makhana (fox nuts)",
    description: "Lightly roasted fox nuts with a pinch of salt - a crunchy, light snack.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "mixed-dry-fruits",
    name: "A handful of mixed dry fruits",
    description: "Almonds, raisins and walnuts - a light energy-dense snack.",
    nutrientTags: "iron,dha",
  },
  {
    slugSuffix: "seasonal-fruit",
    name: "Fresh seasonal fruit",
    description: "A banana or an apple, eaten as a mid-morning snack.",
    nutrientTags: "fiber,folic_acid",
  },
  {
    slugSuffix: "plain-khakhra",
    name: "Plain khakhra",
    description: "A couple of plain, light whole-wheat khakhras.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "roasted-peanuts",
    name: "Roasted peanuts, small handful",
    description: "A small handful of plain roasted peanuts.",
    nutrientTags: "folic_acid,protein",
  },
  {
    slugSuffix: "buttermilk-cumin",
    name: "Buttermilk (chaas) with roasted cumin",
    description: "A glass of light buttermilk with a pinch of roasted cumin powder.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "plain-murmura",
    name: "Plain murmura (puffed rice) with light seasoning",
    description: "Puffed rice lightly tossed with a pinch of salt and lemon.",
    nutrientTags: "folic_acid",
  },
];

const MID_MORNING_T2: MealSeed[] = [
  {
    slugSuffix: "makhana-ghee",
    name: "Roasted makhana with ghee",
    description: "Fox nuts roasted in a little ghee with a pinch of salt - calcium and good fats.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "paneer-cubes",
    name: "Lightly seasoned paneer cubes",
    description: "A small bowl of paneer cubes with a pinch of chaat masala.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "sprouted-moong-salad",
    name: "Sprouted moong salad",
    description: "Sprouted moong tossed with chopped onion, tomato, lemon and chaat masala.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "dry-fruit-nut-mix",
    name: "Mixed dry fruit and nut mix",
    description: "Dates, almonds and walnuts mixed together - calorie-dense and iron-rich.",
    nutrientTags: "iron,dha",
  },
  {
    slugSuffix: "fruit-with-nuts",
    name: "Seasonal fruit with a handful of nuts",
    description: "A piece of seasonal fruit paired with a small handful of mixed nuts.",
    nutrientTags: "fiber,protein",
  },
  {
    slugSuffix: "boiled-chana-chaat",
    name: "Boiled chana chaat",
    description: "Boiled chickpeas tossed with onion, tomato and mild chaat masala.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "hung-curd-honey",
    name: "Thick hung curd with honey and nuts",
    description: "A bowl of thick hung curd drizzled with honey and topped with chopped nuts.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "veg-cutlet",
    name: "Shallow-fried vegetable cutlet",
    description: "A mixed vegetable cutlet, shallow-fried (not deep-fried) with mint chutney.",
    nutrientTags: "fiber",
  },
];

const MID_MORNING_T3: MealSeed[] = [
  {
    slugSuffix: "makhana-walnuts",
    name: "Roasted makhana with a few walnuts",
    description: "Roasted fox nuts mixed with a few chopped walnuts for extra DHA.",
    nutrientTags: "calcium,dha",
  },
  {
    slugSuffix: "ripe-papaya-or-pear",
    name: "Fresh ripe fruit (pear, apple or well-ripened papaya)",
    description: "A bowl of fresh, well-ripened fruit - good fibre for easing third-trimester constipation. Choose fruit that is fully and evenly ripened.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "boiled-corn",
    name: "Boiled sweet corn with light seasoning",
    description: "A small bowl of boiled sweet corn with a pinch of salt and pepper.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "sprouted-moong-chaat",
    name: "Sprouted moong chaat",
    description: "Lightly spiced sprouted moong chaat - protein and fibre.",
    nutrientTags: "protein,fiber,iron",
  },
  {
    slugSuffix: "pomegranate-seeds",
    name: "A small bowl of pomegranate seeds",
    description: "Fresh pomegranate seeds - iron-rich and refreshing.",
    nutrientTags: "iron,fiber",
  },
  {
    slugSuffix: "chana-peanut-mix",
    name: "Roasted chana and peanut mix",
    description: "A small bowl of roasted chickpeas mixed with roasted peanuts.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "veg-soup-small",
    name: "Light vegetable soup",
    description: "A small bowl of warm, lightly seasoned vegetable soup.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "dates-walnuts",
    name: "Dates and walnuts",
    description: "2-3 dates with a few walnuts - iron, fibre and DHA in a small portion.",
    nutrientTags: "iron,dha,fiber",
  },
];

// ===================== LUNCH =====================

const LUNCH_T1: MealSeed[] = [
  {
    slugSuffix: "dal-rice-veg",
    name: "Dal, steamed rice and a light seasonal vegetable",
    description: "A simple plate of dal, steamed rice and a lightly cooked seasonal vegetable.",
    nutrientTags: "protein,folic_acid,iron",
  },
  {
    slugSuffix: "khichdi-ghee-curd",
    name: "Khichdi with ghee and curd",
    description: "Rice-and-dal khichdi cooked soft, served with a drop of ghee and a bowl of curd.",
    nutrientTags: "protein,calcium",
  },
  {
    slugSuffix: "roti-lauki-dal",
    name: "Roti, mild lauki (bottle gourd) sabzi and dal",
    description: "Whole-wheat roti with a mildly spiced bottle gourd sabzi and a bowl of dal.",
    nutrientTags: "fiber,protein",
  },
  {
    slugSuffix: "curd-rice",
    name: "Plain curd rice with a light vegetable",
    description: "Mild curd rice served with a lightly cooked seasonal vegetable on the side.",
    nutrientTags: "calcium,folic_acid",
  },
  {
    slugSuffix: "moong-khichdi-veg",
    name: "Moong dal khichdi with vegetables",
    description: "Khichdi made with moong dal and finely chopped vegetables, cooked soft.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "rice-rasam-stirfry",
    name: "Steamed rice, rasam and a light vegetable stir-fry",
    description: "Steamed rice with a tangy-mild rasam and a lightly stir-fried vegetable.",
    nutrientTags: "folic_acid,iron",
  },
  {
    slugSuffix: "roti-palak-dal",
    name: "Roti with mild palak (spinach) sabzi and dal",
    description: "Whole-wheat roti with a mildly spiced spinach sabzi and a bowl of dal.",
    nutrientTags: "folic_acid,iron",
  },
  {
    slugSuffix: "mild-veg-pulao",
    name: "Mild vegetable pulao with raita",
    description: "Lightly spiced vegetable pulao served with cooling raita.",
    nutrientTags: "folic_acid,calcium",
  },
];

const LUNCH_T2: MealSeed[] = [
  {
    slugSuffix: "dal-roti-paneer-curd",
    name: "Dal, roti, paneer sabzi and curd",
    description: "A full plate with dal, roti, a paneer-based sabzi and a bowl of curd.",
    nutrientTags: "protein,calcium,iron",
  },
  {
    slugSuffix: "rajma-chawal",
    name: "Rajma chawal with a side salad",
    description: "Kidney bean curry served over steamed rice with a fresh salad on the side.",
    nutrientTags: "protein,iron,fiber",
  },
  {
    slugSuffix: "chole-roti-salad",
    name: "Chole with roti and onion salad",
    description: "Spiced chickpea curry served with roti and a fresh onion salad.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "fish-curry-rice",
    name: "Mild fish curry with rice",
    description: "A mild fish curry (using a low-mercury fish such as rohu or pomfret) served with steamed rice.",
    nutrientTags: "protein,dha,iodine",
  },
  {
    slugSuffix: "chicken-curry-roti-veg",
    name: "Chicken curry with roti and vegetable",
    description: "Home-style chicken curry, well-cooked through, served with roti and a side vegetable.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "soya-chunk-sabzi",
    name: "Soya chunk sabzi with roti and dal",
    description: "Soya chunks cooked in a light curry, served with roti and dal.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "mixed-veg-curry-full",
    name: "Mixed vegetable curry, roti, dal and curd",
    description: "A balanced plate of mixed vegetable curry, roti, dal and curd.",
    nutrientTags: "calcium,protein,fiber",
  },
  {
    slugSuffix: "paneer-pulao-raita",
    name: "Paneer-vegetable pulao with raita",
    description: "Pulao cooked with paneer and vegetables, served with raita.",
    nutrientTags: "calcium,protein",
  },
];

const LUNCH_T3: MealSeed[] = [
  {
    slugSuffix: "roti-dal-bhindi",
    name: "Roti, dal and bhindi (okra) sabzi",
    description: "Whole-wheat roti with dal and a fibre-rich okra sabzi.",
    nutrientTags: "fiber,protein,iron",
  },
  {
    slugSuffix: "khichdi-smaller-portion",
    name: "Vegetable khichdi with ghee, smaller portion",
    description: "A smaller, more frequent portion of vegetable khichdi with a drop of ghee.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "rice-sambar-stirfry",
    name: "Steamed rice, sambar and a vegetable stir-fry",
    description: "Steamed rice with mild sambar and a lightly cooked vegetable stir-fry.",
    nutrientTags: "fiber,protein",
  },
  {
    slugSuffix: "roti-methi-dal",
    name: "Roti with methi (fenugreek) sabzi and dal",
    description: "Whole-wheat roti with a mildly spiced fenugreek-leaf sabzi and dal.",
    nutrientTags: "iron,fiber",
  },
  {
    slugSuffix: "veg-dal-khichdi-curd",
    name: "Vegetable and dal khichdi with curd",
    description: "Khichdi cooked with vegetables and dal, served with a bowl of curd.",
    nutrientTags: "protein,calcium,fiber",
  },
  {
    slugSuffix: "jowar-roti-mixed-veg",
    name: "Jowar roti with mixed vegetable curry and dal",
    description: "Sorghum flatbread with a mixed vegetable curry and dal - fibre-forward.",
    nutrientTags: "fiber,iron",
  },
  {
    slugSuffix: "rice-moong-dal-veg",
    name: "Rice, moong dal and a lightly cooked seasonal vegetable",
    description: "A gentle, easy-to-digest plate of rice, moong dal and a seasonal vegetable.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "roti-palak-dal-curd",
    name: "Roti, palak dal and a small bowl of curd",
    description: "Whole-wheat roti with spinach-dal and a small bowl of curd.",
    nutrientTags: "iron,calcium,fiber",
  },
];

// ===================== EVENING_SNACK =====================

const EVENING_SNACK_T1: MealSeed[] = [
  {
    slugSuffix: "ginger-tea-khakhra",
    name: "Ginger herbal tea with light khakhra",
    description: "A cup of ginger herbal tea (non-caffeinated) with a plain khakhra.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "roasted-chana-handful",
    name: "Roasted chana, small handful",
    description: "A small handful of plain roasted chickpeas.",
    nutrientTags: "protein,folic_acid",
  },
  {
    slugSuffix: "fresh-fruit-orange",
    name: "Fresh fruit - orange or guava",
    description: "A piece of fresh orange or guava.",
    nutrientTags: "folic_acid,fiber",
  },
  {
    slugSuffix: "veg-soup-light",
    name: "Light vegetable soup",
    description: "A small bowl of warm, lightly seasoned vegetable soup.",
    nutrientTags: "folic_acid",
  },
  {
    slugSuffix: "mild-veg-sandwich",
    name: "Light vegetable sandwich",
    description: "A multigrain sandwich with mildly seasoned vegetables.",
    nutrientTags: "fiber,folic_acid",
  },
  {
    slugSuffix: "buttermilk-cumin-eve",
    name: "Buttermilk with roasted cumin",
    description: "A glass of light buttermilk with a pinch of roasted cumin.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "steamed-corn-bhutta",
    name: "Steamed corn (bhutta), light seasoning",
    description: "A small portion of steamed corn with a pinch of salt and lemon.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "murmura-chaat-light",
    name: "Plain murmura chaat (light)",
    description: "Puffed rice tossed lightly with chopped onion, tomato and lemon.",
    nutrientTags: "folic_acid",
  },
];

const EVENING_SNACK_T2: MealSeed[] = [
  {
    slugSuffix: "sprouts-chaat-lemon",
    name: "Sprouts chaat with lemon",
    description: "Mixed sprouts tossed with lemon, onion and mild chaat masala.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "veg-cutlet-shallow",
    name: "Vegetable cutlet (shallow-fried) with mint chutney",
    description: "A shallow-fried mixed vegetable cutlet served with mint chutney.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "paneer-tikka-grilled",
    name: "Grilled paneer tikka",
    description: "Paneer cubes marinated in mild spices and grilled (not deep-fried).",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "steamed-moong-cake",
    name: "Steamed moong dal cake with chutney",
    description: "A steamed savoury cake made from ground moong dal, served with mild chutney.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "chai-makhana",
    name: "Mild masala chai with roasted makhana",
    description: "A cup of mild masala chai (kept within safe caffeine limits) with roasted fox nuts.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "dhokla-chutney",
    name: "Steamed dhokla with mint chutney",
    description: "Soft steamed dhokla served with mint chutney - light and low oil.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "veg-upma-small",
    name: "Vegetable upma, small bowl",
    description: "A small bowl of semolina upma with mixed vegetables.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "peanut-jaggery-chikki",
    name: "Roasted peanut and jaggery chikki, small piece",
    description: "A small piece of peanut-jaggery chikki for quick energy and iron.",
    nutrientTags: "iron,protein",
  },
];

const EVENING_SNACK_T3: MealSeed[] = [
  {
    slugSuffix: "veg-soup-warm-small",
    name: "Warm vegetable soup, small bowl",
    description: "A small bowl of warm, lightly seasoned vegetable soup - gentle on the stomach.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "dhokla-mint",
    name: "Steamed dhokla with mint chutney",
    description: "Soft steamed dhokla served with a mild mint chutney.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "makhana-light-seasoning",
    name: "Roasted makhana with light seasoning",
    description: "Roasted fox nuts with a pinch of salt - light, crunchy snack.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "fruit-bowl-pomegranate",
    name: "Fresh fruit bowl - pomegranate, apple, pear",
    description: "A mixed bowl of pomegranate seeds, apple and pear.",
    nutrientTags: "iron,fiber",
  },
  {
    slugSuffix: "boiled-corn-lemon",
    name: "Boiled sweet corn with lemon and light spices",
    description: "Boiled sweet corn tossed with a dash of lemon and light spices.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "sprouts-salad-small",
    name: "Sprouts salad, small bowl",
    description: "A small bowl of lightly dressed sprouts salad.",
    nutrientTags: "protein,fiber,iron",
  },
  {
    slugSuffix: "herbal-tea-khakhra",
    name: "Herbal tea (non-caffeinated) with a khakhra",
    description: "A cup of non-caffeinated herbal tea with a plain khakhra.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "veg-idli-sambar",
    name: "Vegetable idli with light sambar",
    description: "Steamed vegetable idli served with a mildly spiced sambar.",
    nutrientTags: "fiber,protein",
  },
];

// ===================== DINNER =====================

const DINNER_T1: MealSeed[] = [
  {
    slugSuffix: "khichdi-ghee-curd",
    name: "Khichdi with ghee and curd",
    description: "Soft-cooked rice-and-dal khichdi with a drop of ghee, served with curd.",
    nutrientTags: "protein,calcium",
  },
  {
    slugSuffix: "roti-mild-dal-veg",
    name: "Roti with mild dal and a light vegetable",
    description: "Whole-wheat roti served with mild dal and a lightly cooked vegetable.",
    nutrientTags: "protein,folic_acid",
  },
  {
    slugSuffix: "veg-soup-toast",
    name: "Vegetable soup with multigrain toast",
    description: "A warm bowl of vegetable soup with a slice of multigrain toast.",
    nutrientTags: "folic_acid,fiber",
  },
  {
    slugSuffix: "curd-rice-light-veg",
    name: "Curd rice with a light vegetable side",
    description: "Mild curd rice served with a lightly cooked vegetable on the side.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "moong-soup-rice",
    name: "Moong dal soup with steamed rice",
    description: "A thin, light moong dal soup served with steamed rice.",
    nutrientTags: "protein,folic_acid",
  },
  {
    slugSuffix: "light-pulao-raita",
    name: "Light vegetable pulao with raita",
    description: "A lightly spiced vegetable pulao with cooling raita.",
    nutrientTags: "folic_acid,calcium",
  },
  {
    slugSuffix: "roti-lauki-dal-dinner",
    name: "Roti with lauki sabzi and dal",
    description: "Whole-wheat roti with mild bottle gourd sabzi and dal.",
    nutrientTags: "fiber,protein",
  },
  {
    slugSuffix: "rice-rasam-stirfry-dinner",
    name: "Steamed rice with rasam and vegetable stir-fry",
    description: "Steamed rice served with a light rasam and a vegetable stir-fry.",
    nutrientTags: "folic_acid,iron",
  },
];

const DINNER_T2: MealSeed[] = [
  {
    slugSuffix: "roti-paneer-dal",
    name: "Roti, paneer sabzi and dal",
    description: "Whole-wheat roti with a paneer-based sabzi and a bowl of dal.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "grilled-fish-veg-rice",
    name: "Grilled fish with vegetables and rice",
    description: "A mild, well-cooked grilled fish (low-mercury variety such as rohu or pomfret) with vegetables and rice.",
    nutrientTags: "protein,dha",
  },
  {
    slugSuffix: "chicken-stew-roti",
    name: "Chicken stew with roti",
    description: "A light, well-cooked chicken stew served with roti.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "dal-roti-mixed-veg",
    name: "Dal, roti and a mixed vegetable curry",
    description: "Dal and roti served with a mixed vegetable curry.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "soya-curry-rice",
    name: "Soya curry with rice",
    description: "Soya chunks cooked in a light curry, served with rice.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "egg-curry-roti",
    name: "Egg curry with roti",
    description: "Well-cooked egg curry (eggs cooked through, not runny) served with roti.",
    nutrientTags: "protein,iron",
  },
  {
    slugSuffix: "paneer-veg-curry-roti",
    name: "Paneer and vegetable curry with roti",
    description: "A paneer-and-vegetable curry served with roti.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "moong-veg-khichdi-curd",
    name: "Moong dal and vegetable khichdi with curd",
    description: "Khichdi made with moong dal and vegetables, served with curd.",
    nutrientTags: "protein,calcium",
  },
];

const DINNER_T3: MealSeed[] = [
  {
    slugSuffix: "light-roti-moong-dal",
    name: "Light roti with moong dal and a mild vegetable",
    description: "Whole-wheat roti with moong dal and a mildly cooked vegetable - gentle, not fried or heavily spiced before bedtime.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "veg-khichdi-smaller-curd",
    name: "Vegetable khichdi, smaller portion, with curd",
    description: "A smaller portion of vegetable khichdi served with curd - easy on digestion closer to bedtime.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "rice-mild-sambar-veg",
    name: "Steamed rice with mild sambar and vegetable",
    description: "Steamed rice with a mild sambar and a lightly cooked vegetable.",
    nutrientTags: "fiber,protein",
  },
  {
    slugSuffix: "roti-palak-dal-mild",
    name: "Roti with mild palak dal",
    description: "Whole-wheat roti with a gently spiced spinach dal.",
    nutrientTags: "iron,fiber",
  },
  {
    slugSuffix: "soft-khichdi-light-spices",
    name: "Soft khichdi with ghee, light on spices",
    description: "Soft-cooked khichdi with a drop of ghee, kept mild to avoid heartburn before bed.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "veg-soup-small-roti",
    name: "Vegetable soup with a small roti",
    description: "A warm bowl of vegetable soup with one small roti.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "mild-dal-rice-steamed-veg",
    name: "Mild dal and rice with a steamed vegetable",
    description: "A gentle plate of mild dal, rice and a steamed vegetable.",
    nutrientTags: "protein,fiber",
  },
  {
    slugSuffix: "roti-lauki-moong-mild",
    name: "Roti with lauki-moong dal sabzi, mild spices",
    description: "Whole-wheat roti with a mildly spiced bottle gourd and moong dal sabzi.",
    nutrientTags: "fiber,protein,iron",
  },
];

// ===================== BEDTIME =====================

const BEDTIME_T1: MealSeed[] = [
  {
    slugSuffix: "warm-plain-milk",
    name: "Warm plain milk",
    description: "A small cup of warm, plain milk before bed.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "turmeric-milk-small",
    name: "Warm turmeric milk, small cup",
    description: "A small cup of warm milk with a pinch of turmeric.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "few-soaked-raisins",
    name: "A few soaked raisins",
    description: "A small handful of soaked raisins before bed.",
    nutrientTags: "iron",
  },
  {
    slugSuffix: "herbal-tea-warm",
    name: "Warm herbal tea (non-caffeinated)",
    description: "A cup of warm, non-caffeinated herbal tea such as chamomile.",
    nutrientTags: "folic_acid",
  },
  {
    slugSuffix: "milk-nutmeg-light",
    name: "Warm milk with a pinch of nutmeg",
    description: "A small bowl of warm milk with a very light pinch of nutmeg, to aid sleep.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "ajwain-water-bedtime",
    name: "Warm water with a pinch of ajwain",
    description: "Warm water with a pinch of ajwain to ease digestion before sleep.",
    nutrientTags: "fiber",
  },
  {
    slugSuffix: "small-banana",
    name: "A small banana",
    description: "A small, easy-to-digest banana before bed.",
    nutrientTags: "fiber,folic_acid",
  },
  {
    slugSuffix: "plain-warm-milk-small",
    name: "Small cup of warm milk, plain",
    description: "A small cup of plain warm milk, unsweetened.",
    nutrientTags: "calcium",
  },
];

const BEDTIME_T2: MealSeed[] = [
  {
    slugSuffix: "turmeric-milk-almonds-bed",
    name: "Warm milk with turmeric and crushed almonds",
    description: "A small cup of warm milk with a pinch of turmeric and a few crushed almonds.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "saffron-milk-bed",
    name: "Warm milk with a few saffron strands",
    description: "A small cup of warm milk with a few strands of saffron.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "soaked-almonds-walnuts-bed",
    name: "A small handful of soaked almonds and walnuts",
    description: "A few soaked almonds and walnuts eaten before bed.",
    nutrientTags: "iron,dha",
  },
  {
    slugSuffix: "nutmeg-milk-bed",
    name: "Warm milk with a pinch of nutmeg",
    description: "A small cup of warm milk with a pinch of nutmeg.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "date-chewed-slowly",
    name: "A date or two, chewed slowly",
    description: "One or two dates eaten slowly before bed.",
    nutrientTags: "iron",
  },
  {
    slugSuffix: "cardamom-milk-bed",
    name: "Warm milk with a pinch of cardamom",
    description: "A small cup of warm milk with a pinch of cardamom powder.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "pistachio-milk-bed",
    name: "Warm milk with crushed pistachios",
    description: "A small bowl of warm milk with a few crushed pistachios.",
    nutrientTags: "calcium,protein",
  },
  {
    slugSuffix: "herbal-tea-date-bed",
    name: "Mild herbal tea with a date",
    description: "A cup of mild, non-caffeinated herbal tea with a date on the side.",
    nutrientTags: "iron",
  },
];

const BEDTIME_T3: MealSeed[] = [
  {
    slugSuffix: "plain-milk-small-t3",
    name: "Warm plain milk, small cup",
    description: "A small cup of plain warm milk, kept light to avoid heartburn before lying down.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "turmeric-milk-small-t3",
    name: "Warm turmeric milk, small cup",
    description: "A small cup of warm milk with a pinch of turmeric.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "soaked-walnuts-dha",
    name: "A few soaked walnuts",
    description: "A small handful of soaked walnuts for DHA before bed.",
    nutrientTags: "dha",
  },
  {
    slugSuffix: "herbal-tea-mild-warm",
    name: "Mild warm herbal tea",
    description: "A cup of mild, warm, non-caffeinated herbal tea.",
    nutrientTags: "folic_acid",
  },
  {
    slugSuffix: "nutmeg-milk-small-bowl",
    name: "Small bowl of warm milk with a pinch of nutmeg",
    description: "A small bowl of warm milk with a light pinch of nutmeg.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "date-warm-water",
    name: "A date, chewed slowly, with warm water",
    description: "One date eaten slowly along with a sip of warm water.",
    nutrientTags: "iron",
  },
  {
    slugSuffix: "milk-light-quantity",
    name: "Warm milk, light quantity to avoid heartburn",
    description: "A smaller-than-usual cup of warm milk, to reduce the chance of heartburn while lying down.",
    nutrientTags: "calcium",
  },
  {
    slugSuffix: "fennel-water-bed",
    name: "Warm water with a pinch of fennel",
    description: "Warm water with a pinch of fennel seeds - traditionally used to ease digestion, non-acidic.",
    nutrientTags: "fiber",
  },
];

export const meals: TaskTemplateSeed[] = [
  ...buildMeals(1, "EARLY_MORNING", EARLY_MORNING_T1),
  ...buildMeals(2, "EARLY_MORNING", EARLY_MORNING_T2),
  ...buildMeals(3, "EARLY_MORNING", EARLY_MORNING_T3),

  ...buildMeals(1, "BREAKFAST", BREAKFAST_T1),
  ...buildMeals(2, "BREAKFAST", BREAKFAST_T2),
  ...buildMeals(3, "BREAKFAST", BREAKFAST_T3),

  ...buildMeals(1, "MID_MORNING_SNACK", MID_MORNING_T1),
  ...buildMeals(2, "MID_MORNING_SNACK", MID_MORNING_T2),
  ...buildMeals(3, "MID_MORNING_SNACK", MID_MORNING_T3),

  ...buildMeals(1, "LUNCH", LUNCH_T1),
  ...buildMeals(2, "LUNCH", LUNCH_T2),
  ...buildMeals(3, "LUNCH", LUNCH_T3),

  ...buildMeals(1, "EVENING_SNACK", EVENING_SNACK_T1),
  ...buildMeals(2, "EVENING_SNACK", EVENING_SNACK_T2),
  ...buildMeals(3, "EVENING_SNACK", EVENING_SNACK_T3),

  ...buildMeals(1, "DINNER", DINNER_T1),
  ...buildMeals(2, "DINNER", DINNER_T2),
  ...buildMeals(3, "DINNER", DINNER_T3),

  ...buildMeals(1, "BEDTIME", BEDTIME_T1),
  ...buildMeals(2, "BEDTIME", BEDTIME_T2),
  ...buildMeals(3, "BEDTIME", BEDTIME_T3),
];

export default meals;
