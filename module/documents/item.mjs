 /**
 * Extend the base Item document to support attributes and groups with a custom template creation dialog.
 * @extends {Item}
 */
export class MM3Item extends Item {
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

    prepareDerivedData() {}
}
