import {
  listFont,
} from "../helpers/common.mjs";

/**
 * Extend the base Actor document to support attributes and groups with a custom template creation dialog.
 * @extends {Actor}
 */
export class MM3Actor extends Actor {

  /**
     * Create a new entity using provided input data
     * @override
     */
  static async create(data, options = {}) {
    // Replace default image
    if (data.img === undefined) {

      switch(data.type) {
          case "equipement":
              data.img = "systems/mutants-and-masterminds-3e/assets/icons/equipement.svg";
              break;

          case "modificateur":
              data.img = "systems/mutants-and-masterminds-3e/assets/icons/modificateur.svg";
              break;

          case "pouvoir":
              data.img = "systems/mutants-and-masterminds-3e/assets/icons/pouvoir.svg";
              break;

          case "qg":
              data.img = "systems/mutants-and-masterminds-3e/assets/icons/qg.svg";
              break;

          case "talent":
              data.img = "systems/mutants-and-masterminds-3e/assets/icons/talent.svg";
              break;

          case "vehicule":
              data.img = "systems/mutants-and-masterminds-3e/assets/icons/vehicule.svg";
              break;
      }
    }
    await super.create(data, options);
  }

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  prepareDerivedData() {
    const actorData = this;

    actorData.system.accessibility = {
      listFont:listFont,
      font:actorData.system?.accessibility?.font ?? "",
      fontOther:actorData.system?.accessibility?.fontOther ?? "",
    };
  }
}