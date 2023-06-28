/**
 * @extends {ActorSheet}
 */
export class ModificateurItemSheet extends ItemSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mm3", "sheet", "item", "modificateur"],
      template: "systems/mutants-and-masterminds-3e/templates/modificateur-item-sheet.html",
      width: 850,
      height: 500,
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
      const value = target.data('value');
      const data = this.item.system.cout;

      const update = {};

      if(type === 'fixe' && !data.rang && value) {
        update[`system.cout.rang`] = true;
        update[`system.cout.fixe`] = false;

        this.item.update(update);
      } else this.item.update({[`system.cout.${type}`]:false});

      if(type === 'rang' && !data.fixe && value) {
        update[`system.cout.rang`] = false;
        update[`system.cout.fixe`] = true;

        this.item.update(update);
      } else this.item.update({[`system.cout.${type}`]:false});

      if(!value) this.item.update({[`system.cout.${type}`]:true});
    });
  }
}