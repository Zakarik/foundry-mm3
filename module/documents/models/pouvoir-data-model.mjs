import { isSurcharge } from '../../helpers/common-model-management.mjs';

export class PouvoirDataModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const {SchemaField, StringField, NumberField, BooleanField, ObjectField, HTMLField} = foundry.data.fields;

		return {
            activate:new BooleanField({ initial: true, nullable:false}),
            special:new StringField({ initial: "standard"}),
            type:new StringField({ initial: "generaux"}),
            action:new StringField({ initial: "aucune"}),
            portee:new StringField({ initial: "personnelle"}),
            duree:new StringField({ initial: "instantane"}),
            effetsprincipaux:new StringField({ initial: ""}),
            effets:new HTMLField({ initial: ""}),
            notes:new HTMLField({ initial: ""}),
            link:new StringField({ initial: ""}),
            descripteurs:new ObjectField(),
            extras:new ObjectField(),
            defauts:new ObjectField(),
            effectsVarianteSelected:new StringField({ initial: ""}),
            listEffectsVariantes:new ObjectField(),
            edit:new BooleanField({ initial:false}),
            cout:new SchemaField({
                rangDyn:new NumberField({ initial: 0}),
                rangDynMax:new NumberField({ initial: 0}),
                rang:new NumberField({ initial: 0}),
                parrang:new NumberField({ initial: 0}),
                divers:new NumberField({ initial: 0}),
                modrang:new NumberField({ initial: 0}),
                modfixe:new NumberField({ initial: 0}),
                total:new NumberField({ initial: 0}),
                totalTheorique:new NumberField({ initial: 0}),
                parrangtotal:new StringField({ initial: '0'}),
            }),
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

    get extraCost() {
        const extras = this.extras;
        const defauts = this.defauts;
        let modfixe = 0;
        let modrang = 0;

        for(let e in extras) {
            const dataE = extras[e].data.cout;

            if(dataE.fixe) modfixe += dataE.value;
            else if(!dataE.fixe) modrang += dataE.value;
        }

        for(let d in defauts) {
            const dataD = defauts[d].data.cout;

            if(dataD.fixe) modfixe -= dataD.value;
            else if(!dataD.fixe) modrang -= dataD.value;
        }

        return {
            fixe:modfixe,
            rang:modrang,
        }
    }

    get effects() {
        return this.item.effects;
    }

    get isVersion12() {
        const version = game.version.split('.')[0];

        return version <= 12 ? true : false;
    }

    prepareBaseData() {
        this.#_activate();
        this.#_cout();
    }

    prepareDerivedData() {
        this.#_dyn();
        this.#_effects();
    }

    #_activate() {
        if(this.duree === 'permanent') {
            Object.defineProperty(this, 'activate', {
                value: true,
            });
        }
    }

    #_cout() {
        let modfixe = 0;
        let cout = this.cout;
        let coutParRang = 0;
        let coutRang = 0;
        let coutParRangTotal = 0;
        let total = 0;
        let trueTotal = 0;

        if(this.special === 'dynamique') modfixe += 1;

        modfixe += this.extraCost.fixe;

        Object.defineProperty(cout, 'modrang', {
            value: this.extraCost.rang,
        });

        Object.defineProperty(cout, 'modfixe', {
            value: modfixe,
        });

        coutParRang = cout.parrang+cout.modrang;

        if(coutParRang === 0) {
            coutRang = Math.ceil(parseInt(cout.rang)/2);
            coutParRangTotal = `1:2`;
        } else if(coutParRang < 0) {
            coutParRangTotal = `1:${((coutParRang*-1)+2)}`
            coutRang = Math.ceil(cout.rang/((coutParRang*-1)+2));
        } else {
            coutParRangTotal = coutParRang;
            coutRang = cout.rang*coutParRang;
        }

        trueTotal = Math.max(coutRang+cout.divers+cout.modfixe, 1);

        if(this.special === 'standard') total = trueTotal;
        else if(this.special === 'alternatif') total = 1;
        else if(this.special === 'dynamique') {
            total = 2;
        }

        Object.defineProperty(cout, 'parrangtotal', {
            value: coutParRangTotal,
        });

        Object.defineProperty(cout, 'total', {
            value: total,
        });

        Object.defineProperty(cout, 'totalTheorique', {
            value: trueTotal,
        });
    }

    #_dyn() {
        const actor = this.actor;
        const item = this.item;
        const link = this.link;
        const special = this.special;
        const cout = this.cout;
        const coutParRang = cout.parrang+cout.modrang;
        const isDynamique = special === 'dynamique' ? true : false;
        let rangDynMax = 0;
        let totalUsed = 0;
        let rankCalc = 0;


        if((link === "" || !actor.items.get(link)) && isDynamique) {
            Object.defineProperty(this, 'link', {
                value: '',
            });

            totalUsed = this.calculateLinkedPwrCostUsed(item.id);
            totalUsed += cout.modfixe;
            totalUsed += cout.divers;

            rankCalc = this.calculatePwrRankAvailable(totalUsed);

            rangDynMax = Math.min(cout.rang, rankCalc);
        }
        else if(link !== "" && isDynamique) {
            totalUsed = this.calculateLinkedPwrCostUsed(link, false);
            totalUsed += cout.modfixe;
            totalUsed += cout.divers;
            rankCalc = this.calculatePwrRankAvailable(totalUsed);

            rangDynMax = Math.min(cout.rang, rankCalc);
        }

        Object.defineProperty(this.cout, 'rangDynMax', {
            value: rangDynMax,
        });

        if(actor && isDynamique) {
            const parentId = item?.id ?? 0;
            const rangDyn = actor.system?.pwr?.[parentId] ?? 0;

            if(rangDyn) {
                const rang = Math.min(rangDyn?.cout?.rang ?? 0, rangDynMax);

                if(coutParRang > 0) rangDyn.cout.actuel = (Number(rang)*cout.parrangtotal)+cout.divers+cout.modfixe-1;
                else if(coutParRang === 0) rangDyn.cout.actuel = Math.floor((Number(rang)/2)+(cout.divers+cout.modfixe-1));
                else if(coutParRang < 0) rangDyn.cout.actuel = Math.floor((Number(rang)/((coutParRang*-1)+2))+(cout.divers+cout.modfixe-1));

                rangDyn.cout.rang = rang;

                Object.defineProperty(cout, 'rangDyn', {
                    value: rang,
                });
            }
        }
    }

    async #_effects() {
        const item = this.item;
        const actor = this.actor;
        const effects = this.effects;
        const isactive = this.activate;
        const nactive = isactive ? false : true;
        const variante = this.effectsVarianteSelected === "" ? Object.keys(this.listEffectsVariantes)[0] : this.effectsVarianteSelected;
        const effectsToUpdate = [];

        await this.#_updateV13(effects);

        const effectItem = this.effects.find(itm => itm.getFlag('mutants-and-masterminds-3e', 'variante') === variante && itm.disabled !== nactive);
        const effectsItem = this.effects.filter(itm => itm.getFlag('mutants-and-masterminds-3e', 'variante') !== variante && itm.disabled !== true);

        if(effectItem !== undefined) effectsToUpdate.push({"_id":effectItem.id, disabled:nactive});

        for(let e of effectsItem) {
            effectsToUpdate.push({"_id":e.id, disabled:true});
        }

        if(effectsToUpdate.length > 0) await item.updateEmbeddedDocuments('ActiveEffect', effectsToUpdate);

        if(this.isVersion12) {
            if(!this.actor) return;
            if(this.actor.permission !== 3) return;
            const actorToUpdate = [];
            const actorItem = actor.effects.find(itm => (itm?.origin?.includes(this.item.id) ?? false) && itm.getFlag('mutants-and-masterminds-3e', 'variante') === variante && itm.disabled !== nactive);
            const actorItems = actor.effects.filter(itm => (itm?.origin?.includes(this.item._id) ?? false) && itm.getFlag('mutants-and-masterminds-3e', 'variante') !== variante && itm.disabled !== true);

            if(actorItem !== undefined) actorToUpdate.push({"_id":actorItem.id, disabled:nactive});

            for(let e of actorItems) {
                actorToUpdate.push({"_id":e.id, disabled:true});
            }

            if(actorToUpdate.length > 0) await actor.updateEmbeddedDocuments('ActiveEffect', actorToUpdate);
        }
    }

    async #_updateV13(effects) {
        const filter = effects.filter(itm => !itm.getFlag('mutants-and-masterminds-3e', 'variante'))

        if(filter.length === 0) return;

        const listVariante = this.listEffectsVariantes;
        const keysVariante = Object.keys(listVariante);
        const effectsToUpdate = [];

        for(let e of filter) {
            effectsToUpdate.push({"_id":e.id, 'flags.-=variante':null});
            effectsToUpdate.push({"_id":e.id, 'flags.mutants-and-masterminds-3e.variante':keysVariante.find(key => listVariante[key] === e.name)});
        }

        await this.item.updateEmbeddedDocuments('ActiveEffect', effectsToUpdate);
    }

    calculateLinkedPwrCostUsed(id, excludeMain=true) {
        const actor = this.actor;
        const filter = excludeMain ? actor.items.filter(itm => itm.system.link === id) : actor.items.filter(itm => (itm.system.link === id || itm.id === id) && itm.id !== this.item.id);
        const pwrById = actor.system?.pwr ?? {};
        let totalUsed = 0;

        for(let c in filter) {
            const itm = filter[c];
            const rank = pwrById[itm.id]?.cout?.rang ?? 0;
            if(rank > 0) {
                const cost = itm.system.cout
                const extracost = itm.system.extraCost;

                totalUsed += (rank*(cost?.parrang ?? 0) + extracost.rang);
                totalUsed += cost?.divers ?? 0;
                totalUsed += extracost.fixe;
            }
        }

        return totalUsed;
    }

    calculatePwrRankAvailable(alreadyUsed) {
        const cout = this.cout;
        const costPerRank = cout.parrang+cout.modrang;
        let calc = 0

        if(costPerRank === 0) {
           calc = Math.ceil(parseInt((cout.totalTheorique-alreadyUsed))*2);
        } else if(costPerRank < 0) {
            calc = Math.ceil((cout.totalTheorique-alreadyUsed)*((costPerRank*-1)+2));
        } else calc += Math.floor((cout.totalTheorique-alreadyUsed)/cout.parrangtotal);

        return calc;
    }
}