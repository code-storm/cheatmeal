// ---------------------------------------------------------------------------
// Medical-safety avoid/limit lists. These are the authoritative hard-exclusion
// data the plan generator cross-checks every meal/activity candidate against
// (see planGenerator.service.ts). Treat edits to this file as medical-content
// changes, not just copy edits.
//
// `matchTags` are lowercase substrings checked against a candidate's
// `name + " " + description` (lowercased). Keep tags specific enough to avoid
// false positives (e.g. "egg" alone would wrongly flag "well-cooked egg
// curry" - our content descriptions explicitly say "well-cooked"/"cooked
// through" for egg dishes, and we rely on tags like "raw egg" / "runny egg"
// rather than bare "egg").
//
// severity:
//   "avoid" -> hard-excluded by the plan generator (never served)
//   "limit" -> NOT hard-excluded; informational/moderation guidance only
// ---------------------------------------------------------------------------

export interface FoodAvoidRuleSeed {
  foodName: string;
  matchTags: string; // comma-separated lowercase substrings
  reason: string;
  minWeek?: number;
  maxWeek?: number;
  severity: "avoid" | "limit";
  source?: string;
}

export interface ActivityAvoidRuleSeed {
  activityName: string;
  matchTags: string;
  reason: string;
  minWeek?: number;
  maxWeek?: number;
  severity: "avoid" | "limit";
  source?: string;
}

export const foodAvoidRules: FoodAvoidRuleSeed[] = [
  {
    foodName: "Raw or undercooked eggs",
    matchTags: "raw egg,runny egg,undercooked egg,half-boiled egg,raw mayonnaise",
    reason: "Raw or undercooked eggs carry a risk of Salmonella infection, which can cause severe illness during pregnancy.",
    severity: "avoid",
    source: "NHS / ACOG pregnancy nutrition guidance",
  },
  {
    foodName: "Raw or undercooked meat and poultry",
    matchTags: "raw meat,undercooked meat,rare steak,undercooked chicken,raw mince,raw kheema,pink chicken",
    reason: "Undercooked meat and poultry can carry Toxoplasma, Salmonella, and other bacteria harmful to the pregnancy.",
    severity: "avoid",
    source: "NHS / ACOG pregnancy nutrition guidance",
  },
  {
    foodName: "Liver and liver-based products",
    matchTags: "liver,pate,pâté,liver curry,liver fry",
    reason: "Liver is very high in vitamin A (retinol); excess preformed vitamin A intake in pregnancy is linked to birth defects.",
    severity: "avoid",
    source: "NHS pregnancy food guidance",
  },
  {
    foodName: "Unpasteurised milk and milk products",
    matchTags: "unpasteurised milk,unpasteurized milk,raw milk,unpasteurised cheese,unpasteurized cheese",
    reason: "Unpasteurised dairy can carry Listeria and other bacteria that pose a serious risk during pregnancy.",
    severity: "avoid",
    source: "NHS / FSSAI food safety guidance",
  },
  {
    foodName: "Mould-ripened soft cheese and soft blue cheese",
    matchTags: "brie,camembert,blue cheese,gorgonzola,roquefort,soft ripened cheese",
    reason: "Mould-ripened soft cheeses and soft blue cheeses can harbour Listeria unless cooked thoroughly through.",
    severity: "avoid",
    source: "NHS pregnancy food guidance",
  },
  {
    foodName: "Raw shellfish and raw/sushi-style fish",
    matchTags: "raw shellfish,raw oyster,raw fish,sushi,sashimi,raw prawns",
    reason: "Raw shellfish and raw fish carry a higher risk of food poisoning and parasitic infection during pregnancy.",
    severity: "avoid",
    source: "NHS pregnancy food guidance",
  },
  {
    foodName: "High-mercury fish (shark, swordfish, marlin, king mackerel)",
    matchTags: "shark,swordfish,marlin,king mackerel",
    reason: "These fish accumulate high levels of mercury, which can harm the developing nervous system of the baby.",
    severity: "avoid",
    source: "FDA/EPA fish advice during pregnancy",
  },
  {
    foodName: "Oily fish and tuna (limit, do not eliminate)",
    matchTags: "tuna,oily fish,mackerel,sardine",
    reason: "Oily fish is a good source of DHA but can contain trace mercury; limit to about 2 portions a week rather than eliminating entirely.",
    severity: "limit",
    source: "NHS pregnancy fish guidance",
  },
  {
    foodName: "Raw sprouts",
    matchTags: "raw sprouts,uncooked sprouts",
    reason: "Raw sprouts can harbour Salmonella and Listeria; sprouts should be cooked through before eating during pregnancy.",
    severity: "avoid",
    source: "FDA food safety for pregnancy",
  },
  {
    foodName: "Unwashed raw vegetables and salad greens",
    matchTags: "unwashed vegetables,unwashed salad,unwashed greens,unwashed produce",
    reason: "Unwashed produce can carry Listeria and Toxoplasma from soil contact; always wash raw vegetables thoroughly before eating.",
    severity: "avoid",
    source: "NHS pregnancy food guidance",
  },
  {
    foodName: "Raw or unripe papaya",
    matchTags: "raw papaya,unripe papaya,green papaya",
    reason: "Raw or unripe papaya contains latex and papain that may stimulate uterine contractions; this caution is specifically about raw/unripe papaya - well-ripened papaya is generally considered fine in moderation.",
    severity: "avoid",
    source: "Traditional Indian prenatal dietary caution",
  },
  {
    foodName: "Excess pineapple",
    matchTags: "pineapple",
    reason: "Large amounts of pineapple are a traditional folk caution in pregnancy (bromelain); this is not strong medical consensus, so pineapple is limited rather than avoided outright.",
    severity: "limit",
    source: "Traditional dietary caution (limited clinical evidence)",
  },
  {
    foodName: "Caffeine over ~200mg/day",
    matchTags: "coffee,caffeinated,strong tea,energy drink",
    reason: "High caffeine intake has been associated with risk to fetal growth; total caffeine intake should stay under about 200mg/day across all sources.",
    severity: "limit",
    source: "NHS / ACOG caffeine guidance in pregnancy",
  },
  {
    foodName: "Alcohol",
    matchTags: "alcohol,wine,beer,whisky,whiskey,vodka,rum,liquor",
    reason: "No amount of alcohol has been proven safe during pregnancy; alcohol is a hard avoid for the full pregnancy.",
    severity: "avoid",
    source: "NHS / ACOG / WHO pregnancy alcohol guidance",
  },
  {
    foodName: "High-dose vitamin A supplements / fish liver oil supplements",
    matchTags: "fish liver oil,high-dose vitamin a,retinol supplement,cod liver oil",
    reason: "High-dose vitamin A (retinol) supplements, including fish liver oil, can be toxic to the developing baby in excess.",
    severity: "avoid",
    source: "NHS pregnancy supplement guidance",
  },
  {
    foodName: "Unlabelled herbal supplements",
    matchTags: "herbal supplement,unlabelled herbal,ayurvedic supplement,unregulated herbal",
    reason: "Many herbal supplements have limited safety data in pregnancy and are not regulated for quality or dosage; avoid unlabelled or unverified herbal products.",
    severity: "avoid",
    source: "NHS / ACOG pregnancy supplement guidance",
  },
];

export const activityAvoidRules: ActivityAvoidRuleSeed[] = [
  {
    activityName: "Lying flat on your back for extended periods",
    matchTags: "lying flat on back,flat on your back,supine position,back-lying",
    reason: "From around week 16, lying flat on the back for long periods can compress the vena cava and reduce blood flow to the baby.",
    minWeek: 16,
    severity: "avoid",
    source: "ACOG exercise in pregnancy guidance",
  },
  {
    activityName: "Contact or collision sports",
    matchTags: "contact sport,collision sport,kickboxing,boxing,rugby,wrestling,martial arts sparring",
    reason: "Contact and collision sports carry a risk of abdominal trauma that could harm the pregnancy.",
    severity: "avoid",
    source: "ACOG exercise in pregnancy guidance",
  },
  {
    activityName: "Scuba diving",
    matchTags: "scuba diving,scuba dive,underwater diving",
    reason: "Scuba diving carries a risk of decompression sickness that can affect the baby, as the fetus cannot be protected from gas-bubble formation.",
    severity: "avoid",
    source: "ACOG exercise in pregnancy guidance",
  },
  {
    activityName: "Hot yoga, sauna, or hot tub",
    matchTags: "hot yoga,sauna,hot tub,bikram yoga,steam room",
    reason: "Activities causing significant overheating raise core body temperature and are linked with risk to fetal development, especially in the first trimester.",
    severity: "avoid",
    source: "ACOG exercise in pregnancy guidance",
  },
  {
    activityName: "Yoga inversions and deep backbends",
    matchTags: "inversion,headstand,shoulder stand,deep backbend,handstand",
    reason: "Inversions and deep backbends become riskier for balance and abdominal strain in the third trimester as the body's centre of gravity shifts.",
    minWeek: 28,
    severity: "avoid",
    source: "Prenatal yoga safety guidance",
  },
  {
    activityName: "Heavy lifting or straining",
    matchTags: "heavy lifting,heavy weights,straining,maximal lift",
    reason: "Heavy lifting and straining increase intra-abdominal pressure and strain on pelvic floor and back, and are generally discouraged in pregnancy.",
    severity: "avoid",
    source: "ACOG exercise in pregnancy guidance",
  },
  {
    activityName: "Smoking and secondhand smoke exposure",
    matchTags: "smoking,secondhand smoke,cigarette,tobacco",
    reason: "Smoking and secondhand smoke exposure are linked to low birth weight, preterm birth, and other serious pregnancy complications.",
    severity: "avoid",
    source: "NHS / WHO pregnancy smoking guidance",
  },
  {
    activityName: "Unprotected X-rays where avoidable",
    matchTags: "x-ray,xray,unprotected radiation,unshielded x-ray",
    reason: "Unnecessary or unshielded X-ray exposure should be avoided during pregnancy unless medically essential, due to radiation risk to the fetus.",
    severity: "avoid",
    source: "ACOG radiation exposure in pregnancy guidance",
  },
];

export default { foodAvoidRules, activityAvoidRules };
