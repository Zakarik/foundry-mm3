import { isSurcharge } from '../../helpers/common-model-management.mjs';

export class QGDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {SchemaField, StringField, NumberField, BooleanField, ObjectField, HTMLField} = foundry.data.fields;
        let base = {};
        let strategie = {};
        let limite = {};

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
            taille:new StringField({ initial: "", choice:['titanesque', 'colossal', 'gigantesque', 'enorme', 'grand', 'intermediaire', 'petite', 'minime', 'minuscule', 'infime', 'Insignifiante']}),
            particularite:new HTMLField({ initial: ""}),
            robustesse:new NumberField({ initial:0, min:0}),
            cout:new SchemaField({
                taille:new NumberField({ initial: 0, min:0}),
                robustesse:new NumberField({ initial: 0}),
                particularite:new NumberField({ initial: 0, min:0}),
                pouvoir:new NumberField({ initial: 0, min:0}),
                divers:new NumberField({ initial: 0, min:0}),
                total:new NumberField({ initial: 0, min:0}),
            }),
            attaque:new ObjectField(),
            initiative:new SchemaField({
                base:new NumberField({ initial: 0}),
                carac:new NumberField({ initial: 0}),
                bonuses:new NumberField({ initial: 0}),
                surcharge:new NumberField({ initial: 0}),
                ranks:new ObjectField(),
                surchargeranks:new ObjectField(),
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
        this.#_initiative();
        this.#_cout();
        this.#_vitesse();
        this.#_atk();
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
                    Object.defineProperty(strategie[s], 'attaque', {
                        value: Math.min(tAtk, strategie[s].attaque),
                    });

                    newValue -= strategie[s].attaque;

                    Object.defineProperty(strategie[s], 'defense', {
                        value: Math.max(newValue, tDef),
                    });
                    break;

                case 'attaquedefensive':
                    Object.defineProperty(strategie[s], 'defense', {
                        value: Math.min(tDef, strategie[s].defense),
                    });

                    newValue -= strategie[s].defense;

                    Object.defineProperty(strategie[s], 'attaque', {
                        value: Math.max(newValue, tAtk),
                    });
                    break;

                case 'attaqueprecision':
                    Object.defineProperty(strategie[s], 'attaque', {
                        value: Math.min(tAtk, strategie[s].attaque),
                    });

                    newValue -= strategie[s].attaque;

                    Object.defineProperty(strategie[s], 'effet', {
                        value: Math.max(newValue, tEff),
                    });
                    break;

                case 'attaquepuissance':
                    Object.defineProperty(strategie[s], 'effet', {
                        value: Math.min(tEff, strategie[s].effet),
                    });

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
        let cout = 0;

        switch(this.taille.toLowerCase()) {
            case 'insignifiante':
                cout = -4;
            break;

            case 'infime':
                cout = -3;
            break;

            case 'minuscule':
                cout = -2;
            break;

            case 'minime':
                cout = -1;
            break;

            case 'petite':
                cout = 0;
            break;

            case 'intermediaire':
                cout = 1;
              break;

            case 'grand':
                cout = 2;
              break;

            case 'enorme':
                cout = 3;
              break;

            case 'gigantesque':
                cout = 4;
              break;

            case 'colossal':
                cout = 5;
              break;

            case 'titanesque':
                cout = 6;
              break;
        }

        Object.defineProperty(this.cout, 'taille', {
            value: cout,
        });
    }

    #_initiative() {
        const initiative = this.initiative;
        const ranks = initiative.ranks;
        const surchargeRanks = initiative.surchargeranks;
        let ranksValue = 0;
        let surchargeRanksValue = 0;

        for(let r in ranks) {
            const itm = this.items.get(r);

            if(itm) {
                ranksValue += itm.system.rang*ranks[r];
            }
        }

        for(let r in surchargeRanks) {
            const itm = this.items.get(r);

            if(itm) {
                surchargeRanksValue += Math.max(itm.system.rang*surchargeRanks[r], surchargeRanksValue);
            }
        }

        Object.defineProperty(initiative, 'total', {
            value: isSurcharge(Math.max(initiative.surcharge, surchargeRanksValue), initiative.carac, initiative.base, initiative.bonuses, ranksValue),
        });
    }

    #_cout() {
        const pouvoir = this.items.filter(item => item.type === 'pouvoir').reduce((acc, item) => acc + ((item.system.special === 'dynamique' && item.system.link !== '') || item.system.special === 'alternatif') ? item.system.cout.total : item.system.cout.totalTheorique, 0);
        const robustesse = this.robustesse;
        let cout = this.cout;

        Object.defineProperty(cout, 'robustesse', {
            value: Math.floor(Math.max((robustesse-6), 0)/2),
        });

        Object.defineProperty(cout, 'pouvoir', {
            value: pouvoir,
        });

        Object.defineProperty(cout, 'total', {
            value: cout.taille+cout.robustesse+cout.pouvoir+cout.particularite+cout.divers,
        });
    }

    #_vitesse() {
        const find = Object.values(this.vitesse.list).find(itm => itm.selected);

        Object.defineProperty(this.vitesse, 'actuel', {
            value: game.settings.get("mutants-and-masterminds-3e", "speedcalculate") ? find.rang : find.round,
        });
    }

    #_atk() {
        const atk = this.attaque;

        for(let a in atk) {
            let atkData = atk[a];
            let pwr = atkData?.links?.pwr ?? '';
            let skill = atkData?.links?.skill ?? '';
            let ability = atkData?.links?.ability ?? '';
            let type = atkData?.type ?? 'combatcontact';
            let dataPwr = undefined;
            let dataSkill = null;
            let effet = 0;

            if(pwr !== '') {
              dataPwr = this.items.get(pwr);

              if(!dataPwr) {
                Object.defineProperty(atkData.links, 'pwr', {
                    value: '',
                });
              }
            }

            if(skill !== '' && type !== 'other') {
                dataSkill = Object.values(this.skills[type]).find(itm => itm._id === skill);

                if(!dataSkill) {
                    Object.defineProperty(atkData.links, 'skill', {
                        value: '',
                    });
                }
            }

            if(ability !== '') {
                if((atkData.isDmg && !atkData.isAffliction) ||
                    (!atkData.isDmg && atkData.isAffliction) ||
                    (!atkData.isDmg && !atkData.isAffliction)) {

                    let modEff = Number(atkData?.mod?.eff ?? 0);

                    effet += Number(this.caracteristique[ability].total)+modEff;
                }
            }

            if(pwr !== '') {
                if((atkData.isDmg && !atkData.isAffliction) ||
                    (!atkData.isDmg && atkData.isAffliction) ||
                    (!atkData.isDmg && !atkData.isAffliction)) {

                    let rang = Number(dataPwr?.system?.cout?.rang ?? 1)
                    let modEff = Number(atkData?.mod?.eff ?? 0);

                    if(dataPwr.system.special === 'dynamique') rang = this.pwr?.[pwr]?.cout?.rang ?? 0;

                    effet += rang+modEff;
                }
            }

            if(effet) {
                Object.defineProperty(atkData, 'effet', {
                    value: effet,
                });
            }

            if(skill !== '') {
                let modAtk = Number(atkData?.mod?.atk ?? 0);

                Object.defineProperty(atkData, 'attaque', {
                    value: Number(dataSkill?.total ?? 0)+Number(modAtk),
                });
            }
        }
    }
}