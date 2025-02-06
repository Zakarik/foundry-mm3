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

    get effects() {
        return this.item.effects;
    }

    prepareDerivedData() {
        this.#_activate();
        this.#_cout();
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
        const extras = this.extras;
        const defauts = this.defauts;
        let modfixe = 0;
        let modrang = 0;
        let cout = this.cout;
        let coutParRang = 0;
        let coutRang = 0;
        let coutParRangTotal = 0;
        let total = 0;
        let trueTotal = 0;

        if(this.special === 'dynamique') modfixe += 1;

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

        Object.defineProperty(cout, 'modrang', {
            value: modrang,
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
        const link = this.link;
        const special = this.special;
        const cout = this.cout;
        const coutParRang = cout.parrang+cout.modrang;
        let rangDynMax = 0;

        if(link === "" && special === 'dynamique') rangDynMax = cout.rang;
        else if(link !== "" && special === 'dynamique') {
            const getItem = this.actor.items.get(link);

            let dynCoupParRang = 0;
            let dynCoutPrincipal = 0;

            if(getItem) {
                if(coutParRang > 0) rangDynMax = Math.floor(getItem.system.cout.totalTheorique/(cout.parrangtotal+cout.divers+cout.modfixe-1));
                else if(coutParRang === 0) {
                    dynCoupParRang = 2;
                    dynCoutPrincipal = getItem.system.special === 'dynamique' ? (getItem.system.cout.totalTheorique-1-cout.divers-cout.modfixe+1) : getItem.system.cout.totalTheorique-cout.divers-cout.modfixe+1;

                    rangDynMax = Math.floor(dynCoutPrincipal*dynCoupParRang);
                } else if(coutParRang < 0) {
                    dynCoupParRang = ((coutParRang*-1)+2);
                    dynCoutPrincipal = getItem.system.special === 'dynamique' ? (getItem.system.cout.totalTheorique-1-cout.divers-cout.modfixe+1) : getItem.system.cout.totalTheorique-cout.divers-cout.modfixe+1;

                    rangDynMax = Math.floor(dynCoutPrincipal*dynCoupParRang);
                }
            }
        }

        Object.defineProperty(this.cout, 'rangDynMax', {
            value: rangDynMax,
        });

        if(this.actor !== null && this.special === 'dynamique') {
            const parent = this.actor.system?.pwr?.[this.parent.id] ?? false;

            if(parent !== false) {
                const rang = parent?.cout?.rang ?? 0;

                if(coutParRang > 0) parent.cout.actuel = Number(rang)*cout.parrangtotal+cout.divers+cout.modfixe-1;
                else if(coutParRang === 0) parent.cout.actuel = Math.floor((Number(rang)/2)+(cout.divers+cout.modfixe-1));
                else if(coutParRang < 0) parent.cout.actuel = Math.floor((Number(rang)/((coutParRang*-1)+2))+(cout.divers+cout.modfixe-1));

                if(rang > cout.rangDynMax) {
                    parent.cout.rang = cout.rangDynMax;

                    Object.defineProperty(cout, 'rangDyn', {
                        value: rangDynMax,
                    });
                } else {
                    Object.defineProperty(cout, 'rangDyn', {
                        value: rang,
                    });
                }


            }
        }
    }

    #_effects() {
        if(!this.actor) return;
        if(this.actor.permission !== 3) return;

        const isactive = this.activate;
        const nactive = isactive ? false : true;
        const actor = this.actor;
        const variante = this.effectsVarianteSelected === "" ? Object.keys(this.listEffectsVariantes)[0] : this.effectsVarianteSelected;
        const actorToUpdate = [];

        if(!actor) return;

        const actorItem = actor.effects.find(itm => (itm?.origin?.includes(this.item.id) ?? false) && itm.flags.variante === variante && itm.disabled !== nactive);
        const actorItems = actor.effects.filter(itm => (itm?.origin?.includes(this.item._id) ?? false) && itm.flags.variante !== variante && itm.disabled !== true);

        if(actorItem !== undefined) actorToUpdate.push({"_id":actorItem.id, disabled:nactive});

        for(let e of actorItems) {
            actorToUpdate.push({"_id":e.id, disabled:true});
        }

        actor.updateEmbeddedDocuments('ActiveEffect', actorToUpdate);
    }
}