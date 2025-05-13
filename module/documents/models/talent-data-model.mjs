export class TalentDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {SchemaField, StringField, NumberField, BooleanField, ObjectField, HTMLField} = foundry.data.fields;

		return {
            description:new HTMLField({ initial: ""}),
            equipement:new BooleanField({ initial: false}),
            rang:new NumberField({ initial: 0}),
            edit:new BooleanField({ initial:false}),
            listEffectsVariantes:new ObjectField(),
        };
	}

	_initialize(options = {}) {
		super._initialize(options);
	}

    get actor() {
        return this.parent.actor;
    }

    get item() {
        return this.parent;
    }

    get effects() {
        return this.item.effects;
    }

    prepareDerivedData() {
        this.#_updateV13();
    }

    async #_updateV13() {
        const effects = this.effects;
        const filter = effects.filter(itm => !itm.getFlag('mutants-and-masterminds-3e', 'variante'))

        if(filter.length === 0) return;

        const effectsToUpdate = [];

        for(let e of filter) {
            effectsToUpdate.push({"_id":e.id, 'flags.-=variante':null});
            effectsToUpdate.push({"_id":e.id, 'flags.mutants-and-masterminds-3e.variante':e.name});
        }

        await this.item.updateEmbeddedDocuments('ActiveEffect', effectsToUpdate);
    }
}