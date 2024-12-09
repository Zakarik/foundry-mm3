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

    prepareDerivedData() {
    }
}