// Reference daily nutrient targets for pregnancy. Used only for a coverage
// annotation (e.g. "today's plan touches X of Y target nutrients") - not for
// auto-balancing meal selection at runtime.
export const DAILY_NUTRIENT_TARGETS = {
  folic_acid_mcg: { min: 400, max: 600 },
  iron_mg: { min: 27, max: 30 },
  calcium_mg: { min: 1000, max: 1100 },
  iodine_mcg: { min: 220, max: 250 },
  dha_mg: { min: 200, max: 300 },
  caffeine_mg_max: 200,
};

export default DAILY_NUTRIENT_TARGETS;
