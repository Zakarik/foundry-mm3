export class ModificateurDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {SchemaField, StringField, NumberField, BooleanField, ObjectField, HTMLField} = foundry.data.fields;

		return {
            type:new StringField({ initial: "extra"}),
            description:new HTMLField({ initial: ""}),
            cout:new SchemaField({
                fixe:new BooleanField({ initial: true}),
                rang:new BooleanField({ initial: false}),
                value:new NumberField({ initial: 0}),
            }),
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