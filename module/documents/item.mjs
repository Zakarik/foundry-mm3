/**
 * Extend the base Item document to support attributes and groups with a custom template creation dialog.
 * @extends {Item}
 */
export class MM3Item extends Item {
    static async create(data, options = {}) {
        // Replace default image
        if (data.img === undefined) {

            switch(data.type) {
                case "distance":
                    data.img = "systems/nautilus/assets/icons/distance.svg";
                    break;

                case "melee":
                    data.img = "systems/nautilus/assets/icons/melee.svg";
                    break;

                case "equipement":
                    data.img = "systems/nautilus/assets/icons/equipement.svg";
                    break;

                case "amelioration":
                    data.img = "systems/nautilus/assets/icons/amelioration.svg";
                    break;

                case "avarie":
                    data.img = "systems/nautilus/assets/icons/avarie.svg";
                    break;

                case "armement":
                    data.img = "systems/nautilus/assets/icons/armement.svg";
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
        const extras = data.extras;
        const defauts = data.defauts;
        const cout = data.cout;
        let modFixe = 0;
        let modRang = 0;

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
                if(coutParRang > 0) cout.rangDynMax = Math.ceil(getItem.system.cout.totalTheorique/(cout.parrangtotal+cout.divers+cout.modfixe-1));
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
            const rang = itemData.parent.system?.pwr?.[itemData._id]?.cout?.rang ?? 0;

            if(coutParRang > 0) itemData.parent.system.pwr[itemData._id].cout.actuel = Number(rang)*cout.parrangtotal+cout.divers+cout.modfixe-1;
            else if(coutParRang === 0) itemData.parent.system.pwr[itemData._id].cout.actuel = Math.floor((Number(rang)/2)+(cout.divers+cout.modfixe-1));
            else if(coutParRang < 0) itemData.parent.system.pwr[itemData._id].cout.actuel = Math.floor((Number(rang)/((coutParRang*-1)+2))+(cout.divers+cout.modfixe-1));

            if(rang > cout.rangDynMax) itemData.parent.system.pwr[itemData._id].cout.rang = cout.rangDynMax;
        }
    };
}
