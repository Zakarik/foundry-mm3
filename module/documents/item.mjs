import {
    checkActiveOrUnactive,
  } from "../helpers/common.mjs";

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

    prepareDerivedData() {
        const itemData = this;
    
        this._preparePouvoirData(itemData);
    }

    _preparePouvoirData(itemData) {
        if (itemData.type !== 'pouvoir') return;

        const data = itemData.system;
        const duration = data.duree;
        const extras = data.extras;
        const defauts = data.defauts;
        const cout = data.cout;
        const actorType = itemData?.actor?.type ?? ''
        let ispermanent = duration === 'permanent' ? true : false;
        let activate = data?.activate ?? undefined;
        let modFixe = 0;
        let modRang = 0;

        data.actor = actorType;

        if(activate === undefined) {
            if(ispermanent) {
                data.activate = true;
                activate = true;
            } else activate = false;
        }

        for(let ext in extras) {
            const dataExt = extras[ext].data.cout;
            
            if(dataExt.fixe) modFixe += dataExt.value; 
            else if(!dataExt.fixe) modRang += dataExt.value;
        }
        
        for(let ext in defauts) {
            const dataExt = defauts[ext].data.cout;
            
            if(dataExt.fixe) modFixe -= dataExt.value; 
            else if(!dataExt.fixe) modRang -= dataExt.value;
        }

        if(data.special === 'dynamique') modFixe += 1;

        cout.modrang = modRang;
        cout.modfixe = modFixe;
        
        const coutParRang = cout.parrang+cout.modrang;
        let coutRang = 1;

        if(coutParRang === 0) {
            coutRang = Math.ceil(cout.rang/2);
            cout.parrangtotal = `1:2`;
        } else if(coutParRang < 0) {
            cout.parrangtotal = `1:${((coutParRang*-1)+2)}`
            coutRang = Math.ceil(cout.rang/((coutParRang*-1)+2));
        } else {
            cout.parrangtotal = coutParRang;
            coutRang = cout.rang*coutParRang;
        }

        let trueTotal = Math.max(coutRang+cout.divers+cout.modfixe, 1);
        let total = 0;
        
        if(data.special === 'standard') total = trueTotal;
        else if(data.special === 'alternatif') total = 1;
        else if(data.special === 'dynamique') { 
            total = 2;
        }

        cout.total = total;
        cout.totalTheorique = trueTotal;

        if(data.link === "" && data.special === 'dynamique') cout.rangDynMax = cout.rang;
        else if(data.link !== "" && data.special === 'dynamique') {
            const getItem = itemData.parent.items.get(data.link);   
            
            let dynCoupParRang = 0;
            let dynCoutPrincipal = 0;
            
            if(getItem !== undefined) {
                if(coutParRang > 0) cout.rangDynMax = Math.floor(getItem.system.cout.totalTheorique/(cout.parrangtotal+cout.divers+cout.modfixe-1));
                else if(coutParRang === 0) { 
                    dynCoupParRang = 2;
                    dynCoutPrincipal = getItem.system.special === 'dynamique' ? (getItem.system.cout.totalTheorique-1-cout.divers-cout.modfixe+1) : getItem.system.cout.totalTheorique-cout.divers-cout.modfixe+1;

                    cout.rangDynMax = Math.floor(dynCoutPrincipal*dynCoupParRang);

                } else if(coutParRang < 0) {
                    dynCoupParRang = ((coutParRang*-1)+2);
                    dynCoutPrincipal = getItem.system.special === 'dynamique' ? (getItem.system.cout.totalTheorique-1-cout.divers-cout.modfixe+1) : getItem.system.cout.totalTheorique-cout.divers-cout.modfixe+1;
                    
                    cout.rangDynMax = Math.floor(dynCoutPrincipal*dynCoupParRang);
                }
            } 
        }

        if(itemData.parent !== null && data.special === 'dynamique') {
            const parent = itemData.parent.system?.pwr?.[itemData._id] ?? false;

            if(parent !== false) {
                const rang = parent?.cout?.rang ?? 0;

                if(coutParRang > 0) parent.cout.actuel = Number(rang)*cout.parrangtotal+cout.divers+cout.modfixe-1;
                else if(coutParRang === 0) parent.cout.actuel = Math.floor((Number(rang)/2)+(cout.divers+cout.modfixe-1));
                else if(coutParRang < 0) parent.cout.actuel = Math.floor((Number(rang)/((coutParRang*-1)+2))+(cout.divers+cout.modfixe-1));

                if(rang > cout.rangDynMax) parent.cout.rang = cout.rangDynMax;
            }
        }

        //checkActiveOrUnactive(itemData, activate);
    };
}
