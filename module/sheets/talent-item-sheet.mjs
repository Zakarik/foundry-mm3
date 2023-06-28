/**
 * @extends {ActorSheet}
 */
export class TalentItemSheet extends ItemSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mm3", "sheet", "item", "talent"],
      template: "systems/mutants-and-masterminds-3e/templates/talent-item-sheet.html",
      width: 850,
      height: 480,
      dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    context.systemData = context.data.system;

    return context;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
   get template() {
    if (!game.user.isGM && this.item.limited) {
      return "systems/mutants-and-masterminds/templates/limited-sheet.html";
    }
    return this.options.template;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    html.find('a.btn').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const value = target.data('value') ? false : true;

      this.item.update({[`system.${type}`]:value});
    });
  }
}