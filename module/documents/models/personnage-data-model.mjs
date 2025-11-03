import { isSurcharge } from '../../helpers/common-model-management.mjs';
import { getFullCarac } from '../../helpers/common.mjs';

export class PersonnageDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {SchemaField, StringField, NumberField, BooleanField, ObjectField, HTMLField} = foundry.data.fields;
        let base = {};
        let caracteristique = {};
        let competence = {};
        let defense = {};
        let strategie = {};
        let limite = {};

        for(let b of CONFIG.MM3.LIST.Base) {
            base[b] = new StringField({ initial: ""});
        }

        for(let c of CONFIG.MM3.LIST.Caracteristiques) {
            caracteristique[c] = new SchemaField({
                total:new NumberField({ initial: 0}),
                base:new NumberField({ initial: 0}),
                divers:new NumberField({ initial: 0}),
                absente:new BooleanField({initial: false}),
                bonuses:new NumberField({ initial: 0}),
                surcharge:new NumberField({ initial: 0}),
                ranks:new ObjectField(),
                surchargeranks:new ObjectField(),
            });
        }

        for(let c of CONFIG.MM3.LIST.Competences) {
            const dataCmp = CONFIG.MM3.LIST.DataCompetences[c];

            const baseSchema = {
                rang:new NumberField({ initial: 0}),
                autre:new NumberField({ initial: 0}),
                total:new NumberField({ initial: 0}),
            };
            if(dataCmp.canAdd) {
                if(dataCmp.carCanChange) {
                    competence[c] = new SchemaField({
                        canAdd:new BooleanField({ initial: true}),
                        modele:new SchemaField(foundry.utils.mergeObject({
                            car:new StringField({ initial: dataCmp.car}),
                            carCanChange:new BooleanField({ initial: true}),
                            label:new StringField({ initial: ""}),
                            carac:new NumberField({ initial: 0}),
                        }, baseSchema)),
                        list:new ObjectField(),
                        bonuses:new NumberField({ initial: 0}),
                        surcharge:new NumberField({ initial: 0}),
                        ranks:new ObjectField(),
                        surchargeranks:new ObjectField(),
                    });
                } else {
                    competence[c] = new SchemaField({
                        canAdd:new BooleanField({ initial: true}),
                        car:new StringField({ initial: dataCmp.car}),
                        modele:new SchemaField(foundry.utils.mergeObject({
                            label:new StringField({ initial: ""}),
                            carac:new NumberField({ initial: 0}),
                        }, baseSchema)),
                        list:new ObjectField(),
                        bonuses:new NumberField({ initial: 0}),
                        surcharge:new NumberField({ initial: 0}),
                        ranks:new ObjectField(),
                        surchargeranks:new ObjectField(),
                    });
                }
            }
            else {            
                if(c === "new"){
                competence[c] = new SchemaField({
                    modele:new SchemaField(foundry.utils.mergeObject({
                        carCanChange:new BooleanField({ initial: true}),
                        car:new StringField({ initial: dataCmp.car}),
                        label:new StringField({ initial: ""}),
                        carac:new NumberField({ initial: 0}),
                    }, baseSchema)),
                    list:new ObjectField(),
                    bonuses:new NumberField({ initial: 0}),
                    surcharge:new NumberField({ initial: 0}),
                    ranks:new ObjectField(),
                    surchargeranks:new ObjectField(),
                    new: new BooleanField({ initial: true})

                })
            }
            else{
                competence[c] = new SchemaField(foundry.utils.mergeObject({
                carac:new NumberField({ initial: 0}),
                car:new StringField({ initial: dataCmp.car}),
                bonuses:new NumberField({ initial: 0}),
                surcharge:new NumberField({ initial: 0}),
                ranks:new ObjectField(),
                surchargeranks:new ObjectField(),
            }, baseSchema));
        }
    }
}

        for(let d of CONFIG.MM3.LIST.Defenses) {
            defense[d] = new SchemaField({
                car:new StringField({ initial: CONFIG.MM3.LIST.CarDefenses[d]}),
                carac:new NumberField({ initial: 0}),
                base:new NumberField({ initial: 0}),
                divers:new NumberField({ initial: 0}),
                total:new NumberField({ initial: 0}),
                defenseless:new BooleanField({ initial: false}),
                bonuses:new NumberField({ initial: 0}),
                surcharge:new NumberField({ initial: 0}),
                ranks:new ObjectField(),
                surchargeranks:new ObjectField(),
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
                    surcharge:new NumberField({ initial: 0}),
                    ranks:new ObjectField(),
                    surchargeranks:new ObjectField(),
                    allbonuses:new NumberField({ initial: 0}),
                }),
                eff:new SchemaField({
                    base:new NumberField({ initial: CONFIG.MM3.LIST.LimiteStrategie[s].effet}),
                    bonuses:new NumberField({ initial: 0}),
                    surcharge:new NumberField({ initial: 0}),
                    ranks:new ObjectField(),
                    surchargeranks:new ObjectField(),
                    allbonuses:new NumberField({ initial: 0}),
                }),
                def:new SchemaField({
                    base:new NumberField({ initial: CONFIG.MM3.LIST.LimiteStrategie[s].defense}),
                    bonuses:new NumberField({ initial: 0}),
                    surcharge:new NumberField({ initial: 0}),
                    ranks:new ObjectField(),
                    surchargeranks:new ObjectField(),
                    allbonuses:new NumberField({ initial: 0}),
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
            version:new NumberField({ initial: 2}),
            identite:new SchemaField({
                name:new StringField({ initial: ""}),
                secret:new BooleanField({ initial: false}),
            }),
            description:new HTMLField({ initial: ""}),
            historique:new HTMLField({ initial: ""}),
            puissance:new NumberField({ initial: 0, min:0}),
            heroisme:new NumberField({ initial: 0, min:0}),
            blessure:new NumberField({ initial: 0, min:0}),
            blessureNL:new NumberField({ initial: 0, min:0}),
            ddparade:new NumberField({ initial: 0, min:0}),
            ddesquive:new NumberField({ initial: 0, min:0}),
            ptsEquipements:new SchemaField({
                max:new NumberField({ initial: 0}),
                use:new NumberField({ initial: 0}),
            }),
            filtre:new StringField({ initial: "tous"}),
            complications:new ObjectField(),
            caracteristique:new SchemaField(caracteristique),
            competence:new SchemaField(competence),
            pp:new SchemaField({
                base:new NumberField({ initial: 0, min:0}),
                gain:new NumberField({ initial: 0, min:0}),
                used:new NumberField({ initial: 0, min:0}),
                divers:new NumberField({ initial: 0}),
                caracteristiques:new NumberField({ initial: 0}),
                pouvoirs:new NumberField({ initial: 0, min:0}),
                talents:new NumberField({ initial: 0, min:0}),
                competences:new NumberField({ initial: 0, min:0}),
                defenses:new NumberField({ initial: 0, min:0}),
                total:new NumberField({ initial: 0, min:0}),
            }),
            attaque:new ObjectField(),
            defense:new SchemaField(defense),
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
                        course:{
                            autotrade: "course",
                            rang:1,
                            round:0,
                            kmh:0,
                            selected:false,
                        },
                        natation:{
                            autotrade:"natation",
                            rang:-2,
                            round:0,
                            kmh:0,
                            selected:false,
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

    get skills() {
        return {
            combatcontact:this.competence.combatcontact.list,
            combatdistance:this.competence.combatdistance.list,
            expertise:this.competence.expertise.list,
        }
    }

    get isVersion12() {
        const version = game.version.split('.')[0];

        return version <= 12 ? true : false;
    }

    get effects() {
        return this.actor.statuses;
    }

    prepareDerivedData() {
        this.#_strValue();
        this.#_carValue();
        this.#_cmpValue();
        this.#_defense();
        this.#_initiative();
        this.#_pp();
        this.#_equipment();
        this.#_vitesse();
        this.#_atk();
    }

    static migrateData(source) {
        const attaque = source.attaque;

        let atk = {};

        if(source.version < 2) {
            for(let a in attaque) {
                const dAtt = attaque[a];
                const dmg1 = dAtt.dmgechec?.v1 ?? 1;
                const dmg2 = dAtt.dmgechec?.v2 ?? 1;
                const dmg3 = dAtt.dmgechec?.v3 ?? 1;
                const dmg4 = dAtt.dmgechec?.v4 ?? 1;

                if(!dAtt?.repeat) {
                    let update = {
                        _id:dAtt._id,
                        label:dAtt.label,
                        text:dAtt.text,
                        isDmg:dAtt?.isDmg ?? false,
                        isAffliction:dAtt?.isAffliction ?? false,
                        attaque:dAtt?.attaque ?? 0,
                        critique:dAtt?.critique ?? 20,
                        effet:dAtt?.effet ?? 0,
                        repeat:{
                            dmg:[{
                                value:dmg1,
                                status:[]
                            },
                            {
                                value:dmg2,
                                status:['dazed']
                            },
                            {
                                value:dmg3,
                                status:['chanceling']
                            },
                            {
                                value:dmg4,
                                status:['neutralized']
                            }],
                            affliction:[{
                                value:0,
                                status:dAtt.afflictionechec.e1.map(e => e.label)
                            },
                            {
                                value:0,
                                status:dAtt.afflictionechec.e2.map(e => e.label)
                            },
                            {
                                value:0,
                                status:dAtt.afflictionechec.e3.map(e => e.label)
                            },
                            {
                                value:0,
                                status:[]
                            }],
                        },
                        links:{
                            skill:dAtt?.skill ?? '',
                            pwr:dAtt?.pwr ?? '',
                            aby:'',
                            ability:''
                        },
                        save:{
                            dmg:{
                                type:dAtt?.save ?? 'robustesse',
                                defense:dAtt?.basedef ?? 15,
                                effet:dAtt?.effet ?? 0,
                            },
                            other:{
                                type:dAtt?.save ?? 'robustesse',
                                defense:dAtt?.basedef ?? 15,
                            },
                            aflliction:{
                                type:dAtt?.saveAffliction ?? 'volonte',
                                defense:dAtt?.afflictiondef ?? 10,
                                effet:dAtt?.afflictioneffet ?? 0,
                            },
                            passive:{
                                type:dAtt?.defpassive ?? 'parade',
                            }
                        },
                        area:{
                            has:dAtt?.area ?? false,
                            esquive:dAtt?.mod?.area ?? 0,
                        },
                        settings:{
                            noatk:dAtt?.noatk ?? false,
                            nocrit:dAtt?.nocrit ?? false,
                        }
                    };

                    atk[a] = Object.assign(atk[a] || {}, update);
                }
            }
        }

        if(Object.keys(atk).length > 0 && source.version < 2) {
            source.attaque = atk;
        }

        if(source.version < 2) source.version = 2;

        return super.migrateData(source);
    }

    #_strValue() {
        let attaque = 0;
        let defense = 0;
        let effet = 0;
        let strategie = this.strategie;

        for(let s of CONFIG.MM3.LIST.Strategie) {
            let limite = strategie.limite[s];
            let atkRangs = limite.atk.ranks;
            let effRangs = limite.eff.ranks;
            let defRangs = limite.def.ranks;
            let surchargeAtkRangs = limite.atk.surchargeranks;
            let surchargeEffRangs = limite.eff.surchargeranks;
            let surchargeDefRangs = limite.def.surchargeranks;
            let newValue = 0;
            let atkRangsValue = 0;
            let effRangsValue = 0;
            let defRangsValue = 0;
            let surchargeAtkRangsValue = 0;
            let surchargeEffRangsValue = 0;
            let surchargeDefRangsValue = 0;

            for(let r in atkRangs) {
                const itm = this.items.get(r);

                if(itm && itm.type === 'pouvoir') {
                    if(itm.system.special === 'dynamique') {
                        atkRangsValue += itm.system.cout.rangDyn*atkRangs[r];
                    } else {
                        atkRangsValue += itm.system.cout.rang*atkRangs[r];
                    }
                } else if(itm) {
                    atkRangsValue += itm.system.rang*atkRangs[r];
                }
            }

            for(let r in effRangs) {
                const itm = this.items.get(r);

                if(itm && itm.type === 'pouvoir') {
                    if(itm.system.special === 'dynamique') {
                        effRangsValue += itm.system.cout.rangDyn*effRangs[r];
                    } else {
                        effRangsValue += itm.system.cout.rang*effRangs[r];
                    }
                } else if(itm) {
                    effRangsValue += itm.system.rang*effRangs[r];
                }
            }

            for(let r in defRangs) {
                const itm = this.items.get(r);

                if(itm && itm.type === 'pouvoir') {
                    if(itm.system.special === 'dynamique') {
                        defRangsValue += itm.system.cout.rangDyn*defRangs[r];
                    } else {
                        defRangsValue += itm.system.cout.rang*defRangs[r];
                    }
                } else if(itm) {
                    effRangsValue += itm.system.rang*defRangs[r];
                }
            }

            for(let r in surchargeAtkRangs) {
                const itm = this.items.get(r);

                if(itm && itm.type === 'pouvoir') {
                    if(itm.system.special === 'dynamique') {
                        surchargeAtkRangsValue = Math.max(itm.system.cout.rangDyn*surchargeAtkRangs[r], surchargeAtkRangsValue);
                    } else {
                        surchargeAtkRangsValue = Math.max(itm.system.cout.rang*surchargeAtkRangs[r], surchargeAtkRangsValue);
                    }
                } else if(itm) {
                    surchargeAtkRangsValue = Math.max(itm.system.rang*surchargeAtkRangs[r], surchargeAtkRangsValue);
                }
            }

            for(let r in surchargeEffRangs) {
                const itm = this.items.get(r);

                if(itm && itm.type === 'pouvoir') {
                    if(itm.system.special === 'dynamique') {
                        surchargeEffRangsValue = Math.max(itm.system.cout.rangDyn*surchargeEffRangs[r], surchargeEffRangsValue);
                    } else {
                        surchargeEffRangsValue = Math.max(itm.system.cout.rang*surchargeEffRangs[r], surchargeEffRangsValue);
                    }
                } else if(itm) {
                    surchargeEffRangsValue = Math.max(itm.system.rang*surchargeEffRangs[r], surchargeEffRangsValue);
                }
            }

            for(let r in surchargeDefRangs) {
                const itm = this.items.get(r);

                if(itm && itm.type === 'pouvoir') {
                    if(itm.system.special === 'dynamique') {
                        surchargeDefRangsValue = Math.max(itm.system.cout.rangDyn*surchargeDefRangs[r], surchargeDefRangsValue);
                    } else {
                        surchargeDefRangsValue = Math.max(itm.system.cout.rang*surchargeDefRangs[r], surchargeDefRangsValue);
                    }
                } else if(itm) {
                    surchargeDefRangsValue = Math.max(itm.system.rang*surchargeDefRangs[r], surchargeDefRangsValue);
                }
            }


            Object.defineProperty(limite.atk, 'allbonuses', {
				value: limite.atk.bonuses+atkRangsValue,
			});

            Object.defineProperty(limite.def, 'allbonuses', {
				value: limite.def.bonuses+defRangsValue,
			});

            Object.defineProperty(limite.eff, 'allbonuses', {
				value: limite.eff.bonuses+effRangsValue,
			});

            const tAtk = isSurcharge(Math.max(limite.atk.surcharge, surchargeAtkRangsValue), limite.atk.base, limite.atk.allbonuses);
            const tDef = isSurcharge(Math.max(limite.def.surcharge, surchargeDefRangsValue), limite.def.base, limite.def.allbonuses);
            const tEff = isSurcharge(Math.max(limite.eff.surcharge, surchargeEffRangsValue), limite.eff.base, limite.eff.allbonuses);

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

    #_carValue() {
        let ppCarac = 0;

        for(let c of CONFIG.MM3.LIST.Caracteristiques) {
            const carac = this.caracteristique[c];
            const ranks = carac.ranks;
            const surchargeRanks = carac.surchargeranks;

            if(carac.absente) {
              ppCarac += -10;
              carac.total = -5;
            } else {
                ppCarac += carac.base*2;
                let ranksValue = 0;
                let surchargeRanksValue = 0;

                for(let r in ranks) {
                    const itm = this.items.get(r);

                    if(itm) {
                        if(itm.system.special === 'dynamique') {
                            ranksValue += itm.system.cout.rangDyn*ranks[r];
                        } else {
                            ranksValue += itm.system.cout.rang*ranks[r];
                        }
                    }
                }

                for(let r in surchargeRanks) {
                    const itm = this.items.get(r);

                    if(itm) {
                        if(itm.system.special === 'dynamique') {
                            surchargeRanksValue = Math.max(itm.system.cout.rangDyn*surchargeRanks[r], surchargeRanksValue);
                        } else {
                            surchargeRanksValue += Math.max(itm.system.cout.rang*surchargeRanks[r], surchargeRanksValue);
                        }
                    }
                }

                Object.defineProperty(carac, 'total', {
                    value: isSurcharge(Math.max(carac.surcharge, surchargeRanksValue), carac.base, carac.divers, carac.bonuses, ranksValue),
                });
            }
        }

        Object.defineProperty(this.pp, 'caracteristiques', {
            value: ppCarac,
        });
    }

    #_cmpValue() {
        let ppComp = 0;
        const cmp = this.competence;

        for(let c of CONFIG.MM3.LIST.Competences) {
            const currentCmp = cmp[c];
            const ranks = currentCmp.ranks;
            const surchargeRanks = currentCmp.surchargeranks;
            const dataCmp = CONFIG.MM3.LIST.DataCompetences[c];
            let ranksValue = 0;
            let surchargeRanksValue = 0;

            for(let r in ranks) {
                const itm = this.items.get(r);

                if(itm) {
                    if(itm.type === 'talent') {
                        const rnk = itm?.system?.rang ?? 0;

                        ranksValue += rnk*ranks?.[r] ?? 0;
                    }
                    else if(itm.system.special === 'dynamique') {
                        const rDyn = itm?.system?.cout?.rangDyn ?? 0;

                        ranksValue += rDyn*ranks?.[r] ?? 0;
                    } else {
                        const rnk = itm?.system?.cout?.rang ?? 0;

                        ranksValue += rnk*ranks?.[r] ?? 0;
                    }
                }
            }

            for(let r in surchargeRanks) {
                const itm = this.items.get(r);

                if(itm) {
                    if(itm.type === 'talent') {
                        surchargeRanksValue = Math.max(itm.system.rang*surchargeRanks[r], surchargeRanksValue);
                    }
                    else if(itm.system.special === 'dynamique') {
                        surchargeRanksValue = Math.max(itm.system.cout.rangDyn*surchargeRanks[r], surchargeRanksValue);
                    }
                    else {
                        surchargeRanksValue = Math.max(itm.system.cout.rang*surchargeRanks[r], surchargeRanksValue);
                    }
                }
            }
            console.log(currentCmp)
            if(dataCmp.canAdd || currentCmp.new) {
                const cList = currentCmp.list;

                for(let list in cList) {
                    const getCarac = cList[list].carCanChange ? this.caracteristique[getFullCarac(cList[list].car)].total : this.caracteristique[getFullCarac(dataCmp.car)].total;


                    ppComp += cList[list].rang/2;
                    Object.defineProperty(cList[list], 'carac', {
                        value: getCarac,
                    });

                    Object.defineProperty(cList[list], 'total', {
                        value: isSurcharge(Math.max(currentCmp.surcharge, surchargeRanksValue), getCarac, cList[list].rang, cList[list].autre, currentCmp.bonuses, ranksValue),
                    });
                }
            } else {
                ppComp += currentCmp.rang/2;

                Object.defineProperty(currentCmp, 'carac', {
                    value: this.caracteristique[getFullCarac(dataCmp.car)].total,
                });

                Object.defineProperty(currentCmp, 'total', {
                    value: isSurcharge(Math.max(currentCmp.surcharge, surchargeRanksValue), this.caracteristique[getFullCarac(dataCmp.car)].total, currentCmp.rang, currentCmp.autre, currentCmp.bonuses, ranksValue),
                });
            }
        }

        Object.defineProperty(this.pp, 'competences', {
            value: Math.ceil(ppComp),
        });
    }

    #_defense() {
        const actor = this.actor;
        const effects = this.effects;

        let defense = this.defense;
        let ppDef = 0;

        for(let d of CONFIG.MM3.LIST.Defenses) {
            let currentDefense = defense[d];
            const ranks = currentDefense.ranks;
            const defRang = currentDefense.base;
            const carac = this.caracteristique[getFullCarac(CONFIG.MM3.LIST.CarDefenses[d])];
            const isAbs = carac.absente;
            const surchargeRanks = currentDefense.surchargeranks;
            let total = 0;
            let mod = 0;
            let ranksValue = 0;
            let surchargeRanksValue = 0;

            for(let r in ranks) {
                const itm = this.items.get(r);

                if(itm) {
                    if(itm.system.special === 'dynamique') {
                        const rDyn = itm.type === 'pouvoir' ? parseInt(itm.system.cout.rangDyn) : parseInt(itm.system?.rang ?? 1);

                        ranksValue += rDyn*ranks[r];
                    } else {
                        const ra = itm.type === 'pouvoir' ? parseInt(itm.system.cout.rang) : parseInt(itm.system?.rang ?? 1);

                        ranksValue += ra*ranks[r];
                    }
                }
            }

            for(let r in surchargeRanks) {
                const itm = this.items.get(r);

                if(itm) {
                    if(itm.system.special === 'dynamique') {
                        surchargeRanksValue = Math.max(itm.system.cout.rangDyn*surchargeRanks[r], surchargeRanksValue);
                    } else {
                        surchargeRanksValue += Math.max(itm.system.cout.rang*surchargeRanks[r], surchargeRanksValue);
                    }
                }
            }

            if(d === 'robustesse') {
                mod -= this.blessure;

                if(game.settings.get("mutants-and-masterminds-3e", "stackeddmg")) mod -= this.blessureNL;
            }
            if(d === 'esquive') mod += this.strategie.total.defense;
            if(d === 'parade') mod += this.strategie.total.defense;
            ppDef += defRang;

            Object.defineProperty(currentDefense, 'carac', {
                value: isAbs ? 0 : carac.total,
            });

            if(effects.has('defenseless')) {
                const def = actor.effects.find(itm => itm.origin === 'status' && itm.statuses.has('defenseless'));

                for(let e of def.changes) {
                    if(e.key === d) {
                        Object.defineProperty(currentDefense, 'defenseless', {
                            value: true,
                        });
                    }
                }
            }

            if(!currentDefense.defenseless) total = isSurcharge(Math.max(currentDefense.surcharge, surchargeRanksValue), defRang, currentDefense.carac, currentDefense.divers, mod, currentDefense.bonuses, ranksValue);

            if(effects.has('vulnerability') && !currentDefense.defenseless) {
                const vul = actor.effects.find(itm => itm.origin === 'status' && itm.statuses.has('vulnerability'));
                for(let e of vul.changes) {
                    if(e.key === d) total = total/e.value;
                }
            }

            if(d === 'esquive') Object.defineProperty(this, 'ddesquive', { value: 10+total });
            else if(d === 'parade') Object.defineProperty(this, 'ddparade', { value: 10+total });


            Object.defineProperty(currentDefense, 'total', {
                value: total,
            });
        }

        Object.defineProperty(this.pp, 'defenses', {
            value: ppDef,
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

        Object.defineProperty(initiative, 'carac', {
            value: this.caracteristique.agilite.total,
        });

        Object.defineProperty(initiative, 'total', {
            value: isSurcharge(Math.max(initiative.surcharge, surchargeRanksValue), initiative.carac, initiative.base, initiative.bonuses, ranksValue),
        });
    }

    #_pp() {
        const pouvoir = this.items.filter(item => item.type === 'pouvoir').reduce((acc, item) => {
            const coutToAdd = (item.system.special === 'dynamique' || item.system.special === 'alternatif')
                ? item.system.cout.total
                : item.system.cout.totalTheorique;

            return acc + coutToAdd;
        }, 0);
        //const pouvoir = this.items.filter(item => item.type === 'pouvoir').reduce((acc, item) => acc + ((item.system.special === 'dynamique' && item.system.link !== '') || item.system.special === 'alternatif') ? item.system.cout.totalTheorique : item.system.cout.total, 0);
        const talent = this.items.filter(item => item.type === 'talent').reduce((acc, item) => acc + item.system.rang, 0);
        let pp = this.pp;

        Object.defineProperty(pp, 'pouvoirs', {
            value: pouvoir,
        });

        Object.defineProperty(pp, 'talents', {
            value: talent,
        });

        Object.defineProperty(pp, 'total', {
            value: pp.base+pp.gain,
        });

        Object.defineProperty(pp, 'used', {
            value: pp.caracteristiques+pp.pouvoirs+pp.talents+pp.competences+pp.defenses+pp.divers,
        });
    }

    #_equipment() {
        const coutEqp = this.items.filter(item => item.type === 'equipement').reduce((acc, item) => acc + item.system.cout, 0);
        const ptsEqp = this.items.filter(item => item.type === 'talent' && item.system.equipement).reduce((acc, item) => acc + (item.system.rang*5), 0);

        Object.defineProperty(this.ptsEquipements, 'use', {
            value: coutEqp,
        });

        Object.defineProperty(this.ptsEquipements, 'max', {
            value: ptsEqp,
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

                    if(dataPwr?.system.special === 'dynamique') rang = this.pwr?.[pwr]?.cout?.rang ?? 0;

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