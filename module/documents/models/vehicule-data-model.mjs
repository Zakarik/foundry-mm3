import { isSurcharge } from '../../helpers/common-model-management.mjs';

export class VehiculeDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {SchemaField, StringField, NumberField, BooleanField, ObjectField, HTMLField} = foundry.data.fields;
        let base = {};
        let caracteristique = {};
        let strategie = {};
        let limite = {};

        for(let c of CONFIG.MM3.LIST.VehiculeCaracteristiques) {
            caracteristique[c] = new SchemaField({
                total:new NumberField({ initial: 0}),
                bonuses:new NumberField({ initial: 0}),
                base:new NumberField({ initial: 0}),
                rang:new NumberField({ initial: 0}),
                divers:new NumberField({ initial: 0}),
            });
        }

        for(let s of CONFIG.MM3.LIST.Strategie) {
            strategie[s] = new SchemaField({
                attaque:new NumberField({ initial: 0}),
                defense:new NumberField({ initial: 0}),
                effet:new NumberField({ initial: 0}),
            });

            limite[s] = new SchemaField({
                atk:new SchemaField({
                    base:new NumberField({ initial: CONFIG.MM3.LIST.LimiteStrategie[s].attaque}),
                    bonuses:new NumberField({ initial: 0}),
                }),
                eff:new SchemaField({
                    base:new NumberField({ initial: CONFIG.MM3.LIST.LimiteStrategie[s].effet}),
                    bonuses:new NumberField({ initial: 0}),
                }),
                def:new SchemaField({
                    base:new NumberField({ initial: CONFIG.MM3.LIST.LimiteStrategie[s].defense}),
                    bonuses:new NumberField({ initial: 0}),
                }),
                attaque:new NumberField({ initial: CONFIG.MM3.LIST.LimiteStrategie[s].attaque}),
                defense:new NumberField({ initial: CONFIG.MM3.LIST.LimiteStrategie[s].defense}),
                effet:new NumberField({ initial: CONFIG.MM3.LIST.LimiteStrategie[s].effet}),
            });
        }

        strategie['etats'] = new SchemaField({
            attaque:new NumberField({ initial: 0}),
            defense:new NumberField({ initial: 0}),
            effet:new NumberField({ initial: 0}),
        });

        strategie['total'] = new SchemaField({
            attaque:new NumberField({ initial: 0, nullable:false}),
            defense:new NumberField({ initial: 0, nullable:false}),
            effet:new NumberField({ initial: 0, nullable:false}),
        });

        strategie['limite'] = new SchemaField(limite);

        let data = {
            version:new NumberField({ initial: 1}),
            description:new HTMLField({ initial: ""}),
            taille:new StringField({ initial: "intermediaire", choices:['titanesque', 'colossal', 'gigantesque', 'enorme', 'grand', 'intermediaire']}),
            particularite:new HTMLField({ initial: ""}),
            caracteristique:new SchemaField(caracteristique),
            cout:new SchemaField({
                taille:new NumberField({ initial: 0, min:0}),
                force:new NumberField({ initial: 0, min:0}),
                vitesse:new NumberField({ initial: 0, min:0}),
                robustesse:new NumberField({ initial: 0}),
                defense:new NumberField({ initial: 0}),
                particularite:new NumberField({ initial: 0, min:0}),
                pouvoir:new NumberField({ initial: 0, min:0}),
                divers:new NumberField({ initial: 0, min:0}),
                total:new NumberField({ initial: 0, min:0}),
            }),
            attaque:new ObjectField(),
            initiative:new SchemaField({
                base:new NumberField({ initial: 0}),
                carac:new NumberField({ initial: 0}),
                total:new NumberField({ initial: 0}),
            }),
            strategie:new SchemaField(strategie),
            pwr:new ObjectField(),
            accessibility:new ObjectField(),
            vitesse:new SchemaField({
                list:new ObjectField({initial:{
                        base:{
                            autotrade:"base",
                            rang:0,
                            round:0,
                            kmh:0,
                            selected:true,
                        },
                    }
                }),
                actuel:new NumberField({ initial: 0}),
            }),
        };

		return foundry.utils.mergeObject(data, base);
	}

	_initialize(options = {}) {
		super._initialize(options);
	}

    get actor() {
        return this.parent;
    }

    get items() {
        return this.actor.items;
    }

    prepareDerivedData() {
        this.#_strValue();
        this.#_tailleValue();
        this.#_carValue();
        this.#_initiative();
        this.#_cout();
        this.#_vitesse();
    }

    #_strValue() {
        let attaque = 0;
        let defense = 0;
        let effet = 0;
        let strategie = this.strategie;

        for(let s of CONFIG.MM3.LIST.Strategie) {
            let limite = strategie.limite[s];
            let newValue = 0;
            const tAtk = isSurcharge(limite.surcharge, limite.atk.base, limite.atk.bonuses);
            const tDef = isSurcharge(limite.surcharge, limite.def.base, limite.def.bonuses);
            const tEff = isSurcharge(limite.surcharge, limite.eff.base, limite.eff.bonuses);

            Object.defineProperty(limite, 'attaque', {
				value: tAtk,
			});

            Object.defineProperty(limite, 'defense', {
				value: tDef,
			});

            Object.defineProperty(limite, 'effet', {
				value: tEff,
			});

            switch(s) {
                case 'attaqueoutrance':
                    newValue -= strategie[s].attaque;

                    Object.defineProperty(strategie[s], 'defense', {
                        value: Math.max(newValue, tDef),
                    });
                    break;

                case 'attaquedefensive':
                    newValue -= strategie[s].defense;

                    Object.defineProperty(strategie[s], 'attaque', {
                        value: Math.max(newValue, tAtk),
                    });
                    break;

                case 'attaqueprecision':
                    newValue -= strategie[s].attaque;

                    Object.defineProperty(strategie[s], 'effet', {
                        value: Math.max(newValue, tEff),
                    });
                    break;

                case 'attaquepuissance':
                    newValue -= strategie[s].effet;

                    Object.defineProperty(strategie[s], 'attaque', {
                        value: Math.max(newValue, tAtk),
                    });
                    break;
            }

            attaque += strategie[s].attaque;
            defense += strategie[s].defense;
            effet += strategie[s].effet;
        }

        Object.defineProperty(strategie.total, 'attaque', {
            value: attaque ?? 0,
        });

        Object.defineProperty(strategie.total, 'defense', {
            value: defense ?? 0,
        });

        Object.defineProperty(strategie.total, 'effet', {
            value: effet ?? 0,
        });
    }

    #_tailleValue() {
        let force = 0;
        let robustesse = 0;
        let defense = 0;
        let cout = 0;

        switch(this.taille) {
            case 'intermediaire':
            force = 0;
            robustesse = 5;
            defense = 0;
            break;

        case 'grand':
            force = 4;
            robustesse = 7;
            defense = -1;
            cout = 1;
            break;

        case 'enorme':
            force = 8;
            robustesse = 9;
            defense = -2;
            cout = 2;
            break;

        case 'gigantesque':
            force = 12;
            robustesse = 11;
            defense = -4;
            cout = 3;
            break;

        case 'colossal':
            force = 16;
            robustesse = 13;
            defense = -8;
            cout = 4;
            break;

        case 'titanesque':
            force = 20;
            robustesse = 15;
            defense = -10;
            cout = 5;
            break;
        }

        Object.defineProperty(this.caracteristique.force, 'base', {
            value: force,
        });

        Object.defineProperty(this.caracteristique.robustesse, 'base', {
            value: robustesse,
        });

        Object.defineProperty(this.caracteristique.defense, 'base', {
            value: defense,
        });

        Object.defineProperty(this.cout, 'taille', {
            value: cout,
        });
    }

    #_carValue() {
        for(let c of CONFIG.MM3.LIST.VehiculeCaracteristiques) {
            const carac = this.caracteristique[c];

            Object.defineProperty(carac, 'total', {
                value: isSurcharge(carac.surcharge, carac.base, carac.rang, carac.divers, carac.bonuses),
            });

            switch(c) {
                case 'force':
                case 'robustesse':
                case 'defense':
                    Object.defineProperty(this.cout, c, {
                        value: carac.rang,
                    });
                    break;
            }
        }
    }

    #_initiative() {
        Object.defineProperty(this.initiative, 'total', {
            value: this.initiative.base+this.initiative.carac,
        });
    }

    #_cout() {
        const pouvoir = this.items.filter(item => item.type === 'pouvoir').reduce((acc, item) => acc + ((item.system.special === 'dynamique' && item.system.link !== '') || item.system.special === 'alternatif') ? item.system.cout.total : item.system.cout.totalTheorique, 0);
        let cout = this.cout;

        Object.defineProperty(cout, 'pouvoir', {
            value: pouvoir,
        });

        Object.defineProperty(cout, 'total', {
            value: cout.taille+cout.force+cout.vitesse+cout.robustesse+cout.defense+cout.particularite+cout.pouvoir+cout.divers,
        });
    }

    #_vitesse() {
        const find = Object.values(this.vitesse.list).find(itm => itm.selected);

        Object.defineProperty(this.vitesse, 'actuel', {
            value: game.settings.get("mutants-and-masterminds-3e", "speedcalculate") ? find.rang : find.round,
        });
    }
}