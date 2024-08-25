export const MM3 = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {Object}
 */
MM3.LIST = {
    Base:['affiliation', 'base', 'genre', 'age', 'taille', 'poids', 'yeux', 'cheveux', 'etats'],
    Caracteristiques:['force', 'agilite', 'combativite', 'sensibilite', 'endurance', 'dexterite', 'intelligence', 'presence'],
    VehiculeCaracteristiques:['force', 'vitesse', 'defense', 'robustesse'],
    Competences:['combatcontact', 'combatdistance', 'expertise', 'acrobaties', 'athletisme', 'duperie', 'perspicacite', 'intimidation', 'investigation', 'perception', 'persuasion', 'habilete', 'discretion', 'technologie', 'soins', 'vehicules'],
    DataCompetences:{
        acrobaties:{
            car:'agi',
        },
        athletisme:{
            car:'for',
        },
        duperie:{
            car:'prs',
        },
        perspicacite:{
            car:'sns',
        },
        intimidation:{
            car:'prs',
        },
        investigation:{
            car:'int',
        },
        perception:{
            car:'sns',
        },
        persuasion:{
            car:'prs',
        },
        habilete:{
            car:'dex',
        },
        discretion:{
            car:'agi',
        },
        technologie:{
            car:'int',
        },
        soins:{
            car:'int',
        },
        vehicules:{
            car:'dex',
        },
        combatcontact:{
            car:'cbt',
            canAdd:true,
        },
        combatdistance:{
            car:'dex',
            canAdd:true,
        },
        expertise:{
            car:'int',
            canAdd:true,
            carCanChange:true,
        }
    },
    Defenses:['esquive', 'parade', 'vigueur', 'robustesse', 'volonte'],
    CarDefenses:{
        esquive:'agi',
        parade:'cbt',
        vigueur:'end',
        robustesse:'end',
        volonte:'sns',
    },
    Strategie:['attaqueprecision', 'attaqueoutrance', 'attaquedefensive', 'attaquepuissance'],
    LimiteStrategie:{
        attaqueprecision:{
            attaque:2,
            defense:0,
            effet:-2
        },
        attaqueoutrance:{
            attaque:2,
            defense:-2,
            effet:0
        },
        attaquedefensive:{
            attaque:-2,
            defense:2,
            effet:0
        },
        attaquepuissance:{
            attaque:-2,
            defense:0,
            effet:2
        },
    },
}

MM3.ModType = {
    'extra':'MM3.Extra',
    'defaut':'MM3.Defaut',
}

MM3.vehicule = {
    "force":"MM3.CARACTERISTIQUES.Force",
    "robustesse":"MM3.DEFENSE.Robustesse",
    "defense":"MM3.DEFENSE.Label",
    "vitesse":"MM3.Vitesse",
}

MM3.tailles = {
    "titanesque":"MM3.TAILLE.Titanesque",
    "colossal":"MM3.TAILLE.Colossal",
    "gigantesque":"MM3.TAILLE.Gigantesque",
    "enorme":"MM3.TAILLE.Enorme",
    "grand":"MM3.TAILLE.Grand",
    "intermediaire":"MM3.TAILLE.Intermediaire",
}

MM3.qgtailles = {
    "titanesque":"MM3.TAILLE.Titanesque",
    "colossal":"MM3.TAILLE.Colossal",
    "gigantesque":"MM3.TAILLE.Gigantesque",
    "enorme":"MM3.TAILLE.Enorme",
    "grand":"MM3.TAILLE.Grand",
    "intermediaire":"MM3.TAILLE.Intermediaire",
    "petite":"MM3.TAILLE.Petite",
    "minime":"MM3.TAILLE.Minime",
    "minuscule":"MM3.TAILLE.Minuscule",
    "infime":"MM3.TAILLE.Infime",
    "Insignifiante":"MM3.TAILLE.Insignifiante",
}

MM3.caracteristiques = {
    "force":"MM3.CARACTERISTIQUES.Force",
    "agilite":"MM3.CARACTERISTIQUES.Agilite",
    "combativite":"MM3.CARACTERISTIQUES.Combativite",
    "sensibilite":"MM3.CARACTERISTIQUES.Sensibilite",
    "endurance":"MM3.CARACTERISTIQUES.Endurance",
    "dexterite":"MM3.CARACTERISTIQUES.Dexterite",
    "intelligence":"MM3.CARACTERISTIQUES.Intelligence",
    "presence":"MM3.CARACTERISTIQUES.Presence",
}

MM3.caracteristiquesshort = {
    "for":"MM3.CARACTERISTIQUES.Force-short",
    "agi":"MM3.CARACTERISTIQUES.Agilite-short",
    "cbt":"MM3.CARACTERISTIQUES.Combativite-short",
    "sns":"MM3.CARACTERISTIQUES.Sensibilite-short",
    "end":"MM3.CARACTERISTIQUES.Endurance-short",
    "dex":"MM3.CARACTERISTIQUES.Dexterite-short",
    "int":"MM3.CARACTERISTIQUES.Intelligence-short",
    "prs":"MM3.CARACTERISTIQUES.Presence-short",
}

MM3.competences = {
    "acrobaties":"MM3.COMPETENCES.Acrobaties",
    "athletisme":"MM3.COMPETENCES.Athletisme",
    "duperie":"MM3.COMPETENCES.Duperie",
    "expertise":"MM3.COMPETENCES.Expertise",
    "perspicacite":"MM3.COMPETENCES.Perspicacite",
    "combatcontact":"MM3.COMPETENCES.Combatcontact",
    "combatdistance":"MM3.COMPETENCES.Combatdistance",
    "intimidation":"MM3.COMPETENCES.Intimidation",
    "investigation":"MM3.COMPETENCES.Investigation",
    "perception":"MM3.COMPETENCES.Perception",
    "persuasion":"MM3.COMPETENCES.Persuasion",
    "habilete":"MM3.COMPETENCES.Habilete",
    "discretion":"MM3.COMPETENCES.Discretion",
    "technologie":"MM3.COMPETENCES.Technologie",
    "soins":"MM3.COMPETENCES.Soins",
    "vehicules":"MM3.COMPETENCES.Vehicules",
}

MM3.defenses = {
    "esquive":"MM3.DEFENSE.Esquive",
    "parade":"MM3.DEFENSE.Parade",
    "vigueur":"MM3.DEFENSE.Vigueur",
    "robustesse":"MM3.DEFENSE.Robustesse",
    "volonte":"MM3.DEFENSE.Volonte",
}

MM3.jetdefenses = {
    "esquive":"MM3.ROLL.DEFENSE.Esquive",
    "parade":"MM3.ROLL.DEFENSE.Parade",
    "vigueur":"MM3.ROLL.DEFENSE.Vigueur",
    "robustesse":"MM3.ROLL.DEFENSE.Robustesse",
    "volonte":"MM3.ROLL.DEFENSE.Volonte",
}

MM3.vitesse = {
    "base":"MM3.Base",
    "course":"MM3.VITESSE.Course",
    "natation":"MM3.VITESSE.Natation"
}

MM3.pouvoirs = {};

MM3.pouvoirs.types = {
    "attaque":"MM3.POUVOIR.TYPE.Attaque",
    "defense":"MM3.POUVOIR.TYPE.Defense",
    "mouvement":"MM3.POUVOIR.TYPE.Mouvement",
    "generaux":"MM3.POUVOIR.TYPE.Generaux",
    "sensoriels":"MM3.POUVOIR.TYPE.Sensoriels",
    "controle":"MM3.POUVOIR.TYPE.Controle",
}

MM3.pouvoirs.actions = {
    "simple":"MM3.POUVOIR.ACTION.Simple",
    "mouvement":"MM3.POUVOIR.ACTION.Mouvement",
    "libre":"MM3.POUVOIR.ACTION.Libre",
    "reaction":"MM3.POUVOIR.ACTION.Reaction",
    "aucune":"MM3.POUVOIR.ACTION.Aucune",
}

MM3.pouvoirs.factions = {
    "simple":"MM3.POUVOIR.ACTION.FSimple",
    "mouvement":"MM3.POUVOIR.ACTION.FMouvement",
    "libre":"MM3.POUVOIR.ACTION.FLibre",
    "reaction":"MM3.POUVOIR.ACTION.FReaction",
    "aucune":"MM3.POUVOIR.ACTION.FAucune",
}

MM3.pouvoirs.portees = {
    "personnelle":"MM3.POUVOIR.PORTEE.Personnelle",
    "contact":"MM3.POUVOIR.PORTEE.Contact",
    "distance":"MM3.POUVOIR.PORTEE.Distance",
    "perception":"MM3.POUVOIR.PORTEE.Perception",
    "rang":"MM3.POUVOIR.PORTEE.Rang",
}

MM3.pouvoirs.durees = {
    "instantane":"MM3.POUVOIR.DUREE.Instantane",
    "concentration":"MM3.POUVOIR.DUREE.Concentration",
    "prolonge":"MM3.POUVOIR.DUREE.Prolonge",
    "continu":"MM3.POUVOIR.DUREE.Continu",
    "permanent":"MM3.POUVOIR.DUREE.Permanent",
}

MM3.modsranks = {
    'force':'system.caracteristique.force',
    'agilite':'system.caracteristique.agilite',
    'combativite':'system.caracteristique.combativite',
    'sensibilite':'system.caracteristique.sensibilite',
    'endurance':'system.caracteristique.endurance',
    'dexterite':'system.caracteristique.dexterite',
    'intelligence':'system.caracteristique.intelligence',
    'presence':'system.caracteristique.presence',
    'esquive':'system.defense.esquive',
    'parade':'system.defense.parade',
    'vigueur':'system.defense.vigueur',
    'robustesse':'system.defense.robustesse',
}

MM3.listmods = {
    'system.caracteristique.force':"MM3.CARACTERISTIQUES.Force",
    'system.caracteristique.agilite':"MM3.CARACTERISTIQUES.Agilite",
    'system.caracteristique.combativite':"MM3.CARACTERISTIQUES.Combativite",
    'system.caracteristique.sensibilite':"MM3.CARACTERISTIQUES.Sensibilite",
    'system.caracteristique.endurance':"MM3.CARACTERISTIQUES.Endurance",
    'system.caracteristique.dexterite':"MM3.CARACTERISTIQUES.Dexterite",
    'system.caracteristique.intelligence':"MM3.CARACTERISTIQUES.Intelligence",
    'system.caracteristique.presence':"MM3.CARACTERISTIQUES.Presence",
    'system.defense.esquive':"MM3.DEFENSE.Esquive",
    'system.defense.parade':"MM3.DEFENSE.Parade",
    'system.defense.vigueur':"MM3.DEFENSE.Vigueur",
    'system.defense.robustesse':"MM3.DEFENSE.Robustesse",
    'system.defense.volonte':"MM3.DEFENSE.Volonte",
    'system.competence.acrobaties':"MM3.COMPETENCES.Acrobaties",
    'system.competence.athletisme':"MM3.COMPETENCES.Athletisme",
    'system.competence.discretion':"MM3.COMPETENCES.Discretion",
    'system.competence.duperie':"MM3.COMPETENCES.Duperie",
    'system.competence.habilete':"MM3.COMPETENCES.Habilete",
    'system.competence.intimidation':"MM3.COMPETENCES.Intimidation",
    'system.competence.investigation':"MM3.COMPETENCES.Investigation",
    'system.competence.perception':"MM3.COMPETENCES.Perception",
    'system.competence.perspicacite':"MM3.COMPETENCES.Perspicacite",
    'system.competence.persuasion':"MM3.COMPETENCES.Persuasion",
    'system.competence.soins':"MM3.COMPETENCES.Soins",
    'system.competence.technologie':"MM3.COMPETENCES.Technologie",
    'system.competence.vehicules':"MM3.COMPETENCES.Vehicules",
    'system.competence.combatcontact':"MM3.COMPETENCES.Combatcontact",
    'system.competence.combatdistance':"MM3.COMPETENCES.Combatdistance",
    'system.competence.expertise':"MM3.COMPETENCES.Expertise",
    'system.strategie.limite.attaqueprecision.atk':"MM3.EFFECTS.STRATEGIE.AttaqueprecisionAttaque",
    'system.strategie.limite.attaqueprecision.eff':"MM3.EFFECTS.STRATEGIE.AttaqueprecisionEffet",
    'system.strategie.limite.attaqueoutrance.atk':"MM3.EFFECTS.STRATEGIE.AttaqueoutranceAttaque",
    'system.strategie.limite.attaqueoutrance.def':"MM3.EFFECTS.STRATEGIE.AttaqueoutranceDefense",
    'system.strategie.limite.attaquedefensive.atk':"MM3.EFFECTS.STRATEGIE.AttaquedefensiveAttaque",
    'system.strategie.limite.attaquedefensive.def':"MM3.EFFECTS.STRATEGIE.AttaquedefensiveDefense",
    'system.strategie.limite.attaquepuissance.atk':"MM3.EFFECTS.STRATEGIE.AttaquepuissanceAttaque",
    'system.strategie.limite.attaquepuissance.eff':"MM3.EFFECTS.STRATEGIE.AttaquepuissanceEffet",
};

MM3.StdAtk = {
    links:{
        skill:'',
        pwr:'',
        aby:'',
    },
    save:{
    dmg:{
        type:'robustesse',
        defense:15,
        effet:0,
    },
    affliction:{
        type:'volonte',
        defense:10,
        effet:0,
    },
    other:{
        type:'robustesse',
        defense:15,
    },
    passive:{
        type:'parade',
    }
    },
    settings:{
    noatk:false,
    nocrit:false,
    },
    area:{
    has:false,
    esquive:0,
    },
    repeat:{
    affliction:[
        {
        value:0,
        status:[]
        },
        {
        value:0,
        status:[]
        },
        {
        value:0,
        status:[]
        },
        {
        value:0,
        status:[]
        }
    ],
    dmg:[
        {
        value:1,
        status:[]
        },
        {
        value:1,
        status:['dazed']
        },
        {
        value:1,
        status:['chanceling']
        },
        {
        value:1,
        status:['neutralized']
        },
    ]
    },
    mod:{
    atk:0,
    eff:0,
    },
    label:'',
    type:'other',
    attaque:0,
    effet:0,
    critique:20,
    text:"",
    isAffliction:false,
    isDmg:false,
};