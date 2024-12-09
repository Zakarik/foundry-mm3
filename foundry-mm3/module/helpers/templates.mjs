/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths to load
  const templatePaths = [
    // Attribute list partial.
    "systems/mutants-and-masterminds-3e/templates/parts/informations.html",
    "systems/mutants-and-masterminds-3e/templates/parts/vitesse.html",
    "systems/mutants-and-masterminds-3e/templates/parts/caracteristiques.html",
    "systems/mutants-and-masterminds-3e/templates/parts/attaque.html",
    "systems/mutants-and-masterminds-3e/templates/parts/strategie.html",
    "systems/mutants-and-masterminds-3e/templates/parts/listPouvoirs.html",
    "systems/mutants-and-masterminds-3e/templates/parts/pouvoirs.html",
    "systems/mutants-and-masterminds-3e/templates/parts/importations.html",
    "systems/mutants-and-masterminds-3e/templates/parts/options.html",
    "systems/mutants-and-masterminds-3e/templates/parts/informations-limited.html",
    "systems/mutants-and-masterminds-3e/templates/parts/bottom.html",
    "systems/mutants-and-masterminds-3e/templates/parts/effects.html",
    "systems/mutants-and-masterminds-3e/templates/limited-personnage-sheet.html",
    "systems/mutants-and-masterminds-3e/templates/limited-qg-sheet.html",
    "systems/mutants-and-masterminds-3e/templates/limited-vehicule-sheet.html",
    "systems/mutants-and-masterminds-3e/templates/dialog/parts/repeat.html",
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};