import {
  getFullCarac,
} from "../helpers/common.mjs";

/**
 * Extend the base Actor document to support attributes and groups with a custom template creation dialog.
 * @extends {Actor}
 */
export class MM3Actor extends Actor {

  /**
     * Create a new entity using provided input data
     * @override
     */
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

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  prepareDerivedData() {
    const actorData = this;

    this._preparePersonnageData(actorData);
    this._prepareVehiculeData(actorData);
    this._prepareQGData(actorData);
  }

  _preparePersonnageData(actorData) {
    if (actorData.type !== 'personnage') return;

    const items = actorData.items;
    const pouvoirs = items.filter(item => item.type === 'pouvoir');
    const talents = items.filter(item => item.type === 'talent');
    const equipements = items.filter(item => item.type === 'equipement');
    const data = actorData.system;
    const getCarac = data.caracteristique;
    const getComp = data.competence;
    const getDef = data.defense;
    const getInit = data.initiative;
    const getStr = data.strategie;
    const listStr = ['attaqueprecision', 'attaqueoutrance', 'attaquedefensive', 'attaquepuissance', 'etats']
    const pp = data.pp;
    let attaque = 0;
    let defense = 0;
    let effet = 0;
    let ppCarac = 0;
    let ppComp = 0;
    let ppDef = 0;
    let ppPouvoir = 0;
    let ppTalent = 0;
    let ppEquipement = 0;
    let ppEquipementUsed = 0;

    for(let str of listStr) {
      const dataStr = getStr[str];

      attaque += dataStr.attaque;
      defense += dataStr.defense;
      effet += dataStr.effet;
    }

    getStr.total = {
      attaque:attaque,
      defense:defense,
      effet:effet
    };

    for(let car in CONFIG.MM3.caracteristiques) {
      const carac = getCarac[car];

      if(carac.absente) {
        ppCarac += -10;
        carac.total = -5;
      } else {
        const cBase = carac.base;

        ppCarac += cBase*2;

        carac.total = cBase+carac.divers;
      }     
    }

    for(let com in CONFIG.MM3.competences) {
      const comp = getComp[com];

      if(comp.canAdd) {
        const cList = comp.list;
        for(let list in cList) {
          const listData = cList[list];
          const listCompRang = listData.rang;
          const carac = listData.carCanChange ? getCarac[getFullCarac(listData.car)] : getCarac[getFullCarac(comp.car)];
          const scoreCarac = carac.total;

          listData.carac = carac.absente ? 0 : scoreCarac;
          listData.total = listData.carac+listCompRang+listData.autre;
          ppComp += listCompRang/2;
        }      
      } else {
        const carac = getCarac[getFullCarac(comp.car)];
        const compRang = comp.rang;

        ppComp += compRang/2;
        comp.carac = carac.absente ? 0 : carac.total;
        comp.total = comp.carac+compRang+comp.autre;
      }
    }

    for(let def in CONFIG.MM3.defenses) {
      const defense = getDef[def];
      const defRang = defense.base;
      const carac = getCarac[getFullCarac(defense.car)];
      let mod = 0;

      if(def === 'robustesse') mod -= data.blessure;
      if(def === 'esquive') mod += getStr.total.defense;
      if(def === 'parade') mod += getStr.total.defense;

      ppDef += defRang;
      defense.carac = carac.absente ? 0 : carac.total;
      defense.total = defRang+defense.carac+defense.divers+mod;
    }

    for(let pouvoir of pouvoirs) {
      const pwrData = pouvoir.system;

      ppPouvoir += (pwrData.special === 'dynamique' && pwrData.link !== '') || pwrData.special === 'alternatif' ? pwrData.cout.total : pwrData.cout.totalTheorique;
    }

    for(let talent of talents) {
      const tlData = talent.system;

      ppTalent += tlData.rang;

      if(tlData.equipement) ppEquipement += tlData.rang*5;
    }

    for(let equipement of equipements) {
      const tlData = equipement.system;

      ppEquipementUsed += tlData.cout;
    }

    data.ddesquive = 10+getDef['esquive'].total;
    data.ddparade = 10+getDef['parade'].total;

    getInit.carac = getCarac['agilite'].total;
    getInit.total = getInit.carac+getInit.base;

    pp.total = pp.base+pp.gain;
    pp.caracteristiques = ppCarac;
    pp.pouvoirs = ppPouvoir;
    pp.talents = ppTalent;
    pp.competences = Math.ceil(ppComp);
    pp.defenses = ppDef;
    pp.used = pp.caracteristiques+pp.pouvoirs+pp.talents+pp.competences+pp.defenses+pp.divers;

    data.ptsEquipements = {
      max:ppEquipement,
      use:ppEquipementUsed
    }
  };

  _prepareVehiculeData(actorData) {
    if (actorData.type !== 'vehicule') return;

    const items = actorData.items;
    const pouvoirs = items.filter(item => item.type === 'pouvoir');
    const data = actorData.system;
    const getTaille = data.taille;
    const getCarac = data.caracteristique;
    const getInit = data.initiative;
    const getStr = data.strategie;
    const listStr = ['attaqueprecision', 'attaqueoutrance', 'attaquedefensive', 'attaquepuissance', 'etats']
    const cout = data.cout;
    let attaque = 0;
    let defense = 0;
    let effet = 0;
    let ppTaille = 0;
    let ppForce = 0;
    let ppRobustesse = 0;
    let ppDefense = 0;
    let ppPouvoir = 0;
    
    for(let str of listStr) {
      const dataStr = getStr[str];

      attaque += dataStr.attaque;
      defense += dataStr.defense;
      effet += dataStr.effet;
    }

    getStr.total = {
      attaque:attaque,
      defense:defense,
      effet:effet
    };

    switch(getTaille) {
      case 'intermediaire':
        getCarac.force.base = 0;
        getCarac.robustesse.base = 5;
        getCarac.defense.base = 0;
        break;

      case 'grand':
        getCarac.force.base = 4;
        getCarac.robustesse.base = 7;
        getCarac.defense.base = -2;
        ppTaille = 1;
        break;

      case 'enorme':
        getCarac.force.base = 8;
        getCarac.robustesse.base = 9;
        getCarac.defense.base = -4;
        ppTaille = 2;
        break;

      case 'gigantesque':
        getCarac.force.base = 12;
        getCarac.robustesse.base = 11;
        getCarac.defense.base = -6;
        ppTaille = 3;
        break;

      case 'colossal':
        getCarac.force.base = 16;
        getCarac.robustesse.base = 13;
        getCarac.defense.base = -8;
        ppTaille = 4;
        break;

      case 'titanesque':
        getCarac.force.base = 20;
        getCarac.robustesse.base = 15;
        getCarac.defense.base = -10;
        ppTaille = 5;
        break;
    }

    for(let car in CONFIG.MM3.vehicule) {
      const carac = getCarac[car];
      const cBase = carac.base;

      carac.total = car === 'defense' ? cBase+carac.rang+carac.divers+defense : cBase+carac.rang+carac.divers;

      switch(car) {
        case 'force':
          ppForce += carac.rang;
          break;

        case 'robustesse':
          ppRobustesse += carac.rang
          break;

        case 'defense':
          ppDefense += carac.rang;
          break;
      }
    }

    for(let pouvoir of pouvoirs) {
      const pwrData = pouvoir.system;

      ppPouvoir += (pwrData.special === 'dynamique' && pwrData.link !== '') || pwrData.special === 'alternatif' ? pwrData.cout.total : pwrData.cout.totalTheorique;
    }

    getInit.carac = 0;
    getInit.total = getInit.base;

    cout.taille = ppTaille;
    cout.force = ppForce;
    cout.robustesse = ppRobustesse;
    cout.defense = ppDefense;
    cout.pouvoir = ppPouvoir;
    cout.total = ppTaille+ppForce+ppRobustesse+ppDefense+ppPouvoir+cout.vitesse+cout.particularite+cout.divers;
  };

  _prepareQGData(actorData) {
    if (actorData.type !== 'qg') return;

    const items = actorData.items;
    const pouvoirs = items.filter(item => item.type === 'pouvoir');
    const data = actorData.system;
    const getTaille = data.taille;
    const cout = data.cout;
    const getInit = data.initiative;
    const getStr = data.strategie;
    const listStr = ['attaqueprecision', 'attaqueoutrance', 'attaquedefensive', 'attaquepuissance', 'etats'];
    let attaque = 0;
    let defense = 0;
    let effet = 0;
    let ppTaille = 0;
    let ppRobustesse = 0;
    let ppPouvoir = 0;

    for(let str of listStr) {
      const dataStr = getStr[str];

      attaque += dataStr.attaque;
      defense += dataStr.defense;
      effet += dataStr.effet;
    }

    for(let pouvoir of pouvoirs) {
      const pwrData = pouvoir.system;

      ppPouvoir += (pwrData.special === 'dynamique' && pwrData.link !== '') || pwrData.special === 'alternatif' ? pwrData.cout.total : pwrData.cout.totalTheorique;
    }

    getStr.total = {
      attaque:attaque,
      defense:defense,
      effet:effet
    };

    switch(getTaille.toLowerCase()) {
      case 'insignifiante':
        ppTaille = -4;
      break;

      case 'infime':
        ppTaille = -3;
      break;  

      case 'minuscule':
        ppTaille = -2;
      break;  

      case 'minime':
        ppTaille = -1;
      break;  

      case 'petite':
        ppTaille = 0;
      break;  
      
      case 'intermediaire':
        ppTaille = 1;
        break;

      case 'grand':
        ppTaille = 2;
        break;

      case 'enorme':
        ppTaille = 3;
        break;

      case 'gigantesque':
        ppTaille = 4;
        break;

      case 'colossal':
        ppTaille = 5;
        break;

      case 'titanesque':
        ppTaille = 6;
        break;
    }

    getInit.carac = 0;
    getInit.total = getInit.base;

    ppRobustesse += Math.floor(Math.max((data.robustesse-6), 0)/2);

    cout.taille = ppTaille;
    cout.robustesse = ppRobustesse;
    cout.pouvoir = ppPouvoir;
    cout.total = ppTaille+ppRobustesse+cout.particularite+ppPouvoir+cout.divers;
  };
}