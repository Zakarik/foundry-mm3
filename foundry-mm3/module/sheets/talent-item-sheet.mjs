import {
  loadEffectsContext,
  accessibility,
  loadEffectsHTML,
  loadEffectsClose
} from "../helpers/common.mjs";

/**
 * @extends {ItemSheet}
 */
export class TalentItemSheet extends ItemSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mm3", "sheet", "item", "talent"],
      template: "systems/mutants-and-masterminds-3e/templates/talent-item-sheet.html",
      width: 850,
      height: 580,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "talent"}],
      dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();
    loadEffectsContext(context);
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

    accessibility(this.item, html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    loadEffectsHTML(html, this.item, true, true);

    html.find('a.btn').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const value = target.data('value') ? false : true;

      this.item.update({[`system.${type}`]:value});
    });
  }

  /** @inheritdoc */
  async close(options={}) {
    loadEffectsClose(this.item);

    await super.close(options);
    delete this.object.apps?.[this.appId];
  }
}