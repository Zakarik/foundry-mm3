import {
    getStatusData,
  } from "./helpers/common.mjs";

export class MigrationMM3 {
    static NEEDED_VERSION = "1.26.0";

    static needUpdate(version) {
        const currentVersion = game.settings.get("mutants-and-masterminds-3e", "systemVersion");
        return !currentVersion || foundry.utils.isNewerVersion(version, currentVersion);
    }

    static async migrateWorld(options = { force: false }) {
        if (!game.user.isFirstGM) {
            return;
        }

        // Warn the users
        ui.notifications.info(
            `Mise à jour du système Mutants & Masterminds 3E à la version ${game.system.version}.` +
                ` Patientez jusqu'à la fin de la mise à jour, ne redémarrez pas le serveur.`,
            { permanent: true }
        );

        // Migrate World Actors
        for (let actor of game.actors.contents) {
            try {
                const update = MigrationMM3._migrationActor(actor, options);
                if (!foundry.utils.isEmpty(update)) {
                    console.log(`Mutants & Masterminds 3E : Migration de l'actor ${actor.name}[${actor._id}]`);
                    await actor.update(update);
                }
            } catch (err) {
                err.message = `Mutants & Masterminds 3E : Echec de la migration du système pour ${actor.name}[${actor._id}]`;
                console.error(err);
            }
        }

        // Migrate World Items
        for (let item of game.items.contents) {
            try {
               const update = MigrationMM3._migrationItems(item, options);
                if (!foundry.utils.isEmpty(update)) {
                    console.log(`KNIGHT : Migration de l'item ${item.name}[${item._id}]`);
                    await item.update(update);
                }
            } catch (err) {
                err.message = `KNIGHT : Echec de la migration de l'item ${item.name}[${item._id}]`;
                console.error(err);
            }
        }

        await game.settings.set("mutants-and-masterminds-3e", "systemVersion", game.system.version);
        ui.notifications.info(`Migration du système de Mutants & Masterminds 3E à la version ${game.system.version} terminé!`, {
            permanent: true,
        });
    }

    static _migrationActor(actor, options = { force:false }) {
        const update = {};
        const data = actor.system;

        if (options?.force || MigrationMM3.needUpdate("1.4.0")) {
            const attaque = data.attaque;

            for(let a in attaque) {
                const getAtt = attaque[a];

                update[`system.attaque.${a}.noAtk`] = false;

                switch(getAtt.save) {
                    case 'esquive':
                        update[`system.attaque.${a}.basedef`] = 10;
                        break;
                        
                    case 'parade':
                        update[`system.attaque.${a}.basedef`] = 10;
                        break;

                    case 'vigueur':
                        update[`system.attaque.${a}.basedef`] = 10;
                        break;
                        
                    case 'robustesse':
                        update[`system.attaque.${a}.basedef`] = 15;
                        break;
                        
                    case 'volonte':
                        update[`system.attaque.${a}.basedef`] = 10;
                        break;
                }
            }
        }

        if (options?.force || MigrationMM3.needUpdate("1.4.1")) {
            const attaque = data.attaque;

            for(let a in attaque) {
                update[`system.attaque.${a}.defpassive`] = 'parade';
            }
        }

        if (options?.force || MigrationMM3.needUpdate("1.10.0")) {
            const attaque = data.attaque;

            for(let a in attaque) {
                let defpassive = '';
                if(attaque[a].type === 'combatcontact') defpassive = 'parade';
                else if(attaque[a].type === 'combatdistance') defpassive = 'esquive';

                if(defpassive !== '') update[`system.attaque.${a}.defpassive`] = defpassive;
            }
        }

        if (options?.force || MigrationMM3.needUpdate("1.16.0")) {
            
            if(actor.type === 'vehicule' || actor.type === 'qg') {
                update[`system.initiative`] = {
                    "base":0
                };

                update[`system.attaque`] = {};

                update[`system.strategie`] = {
                    "attaqueprecision":{
                        "attaque":0,
                        "defense":0,
                        "effet":0
                    },
                    "attaqueoutrance":{
                        "attaque":0,
                        "defense":0,
                        "effet":0
                    },
                    "attaquedefensive":{
                        "attaque":0,
                        "defense":0,
                        "effet":0
                    },
                    "attaquepuissance":{
                        "attaque":0,
                        "defense":0,
                        "effet":0
                    },
                    "etats":{
                        "attaque":0,
                        "defense":0,
                        "effet":0
                    }
                };
            }

            if(actor.type === 'qg') update[`system.pwr`] = {};
        }

        if (options?.force || MigrationMM3.needUpdate("1.21.0")) {
            if(data.accessibility === undefined) update[`system.accessibility`] = {
                font:'Kalam',
                fontOther:'',
            }
        }

        if (options?.force || MigrationMM3.needUpdate("1.22.0")) {
            update['system.vitesse'] = {
                'list':{
                    'base':{
                        'autotrade':'base',
                        'rang':0,
                        'round':0,
                        'kmh':0,
                        'selected':true
                    },
                    'course':{
                        'autotrade':'course',
                        'rang':1,
                        'round':0,
                        'kmh':0,
                        'selected':false
                    },
                    'natation':{
                        'autotrade':'natation',
                        'rang':-2,
                        'round':0,
                        'kmh':0,
                        'selected':false
                    }
                }                
            }
            update['system.strategie.limite'] = {
                "attaqueprecision":{
                    "attaque":2,
                    "defense":0,
                    "effet":-2
                },
                "attaqueoutrance":{
                    "attaque":2,
                    "defense":-2,
                    "effet":0
                },
                "attaquedefensive":{
                    "attaque":-2,
                    "defense":2,
                    "effet":0
                },
                "attaquepuissance":{
                    "attaque":-2,
                    "defense":0,
                    "effet":2
                },
                "query":{
                    "attaqueprecision":{
                        "attaque":2,
                        "defense":0,
                        "effet":-2
                    },
                    "attaqueoutrance":{
                        "attaque":2,
                        "defense":-2,
                        "effet":0
                    },
                    "attaquedefensive":{
                        "attaque":-2,
                        "defense":2,
                        "effet":0
                    },
                    "attaquepuissance":{
                        "attaque":-2,
                        "defense":0,
                        "effet":2
                    },
                }
            }
        }

        if (options?.force || MigrationMM3.needUpdate("1.26.0")) {
            const version = data?.version ?? 0;
            const attacks = data.attaque;
            const attEntries = Object.entries(attacks);

            let listAttacks = {};
            let listCombatContact = {};
            let listCombatDistance = {};

            if(version < 1) {
                update[`system.version`] = 1;

                for(let a in Object.values(attacks)) {
                    let exist = attacks[attEntries[a][0]]?._id ?? false;
                    let rand = foundry.utils.randomID();
    
                    if(exist === false) {
                        let dazed = getStatusData('dazed');
                        let chanceling = getStatusData('chanceling');
                        let neutralized = getStatusData('neutralized');

                        update[`system.attaque.${attEntries[a][0]}._id`] = rand;
                        update[`system.attaque.${attEntries[a][0]}.-=edit`] = null;
                        update[`system.attaque.${attEntries[a][0]}.skill`] = '';
                        update[`system.attaque.${attEntries[a][0]}.pwr`] = '';
                        update[`system.attaque.${attEntries[a][0]}.noCrit`] = false;
                        update[`system.attaque.${attEntries[a][0]}.isAffliction`] = false;
                        update[`system.attaque.${attEntries[a][0]}.isDmg`] = false;
                        update[`system.attaque.${attEntries[a][0]}.saveAffliction`] = 'volonte';
                        update[`system.attaque.${attEntries[a][0]}.afflictiondef`] = 10;
                        update[`system.attaque.${attEntries[a][0]}.afflictioneffet`] = 10;
                        update[`system.attaque.${attEntries[a][0]}.afflictionechec`] = {
                            e1:[],
                            e2:[],
                            e3:[],
                        };
                        update[`system.attaque.${attEntries[a][0]}.dmgechec`] = {
                            v1:1,
                            v2:1,
                            v3:1,
                        };
                        listAttacks[a] = {
                            _id:rand,
                        };
                        
                    }
                }
    
                if(actor.type === 'personnage') {
                    const contact = data.competence.combatcontact.list;
                    const distance = data.competence.combatdistance.list;
    
                    for(let cc in contact) {
                        let idAtt = contact[cc].idAtt;
                        let exist = contact[cc]?._id ?? false;
    
                        if(exist === false) {
                            let rand = foundry.utils.randomID();
    
                            update[`system.competence.combatcontact.list.${cc}._id`] = rand;
                            update[`system.competence.combatcontact.list.${cc}.idAtt`] = listAttacks[idAtt]._id;
    
                            listCombatContact[cc] = {
                                _id:rand,
                            };
                        }                    
                    }
    
                    for(let rc in distance) {
                        let idAtt = distance[rc].idAtt;
                        let exist = distance[rc]?._id ?? false;
    
                        if(exist === false) {
                            let rand = foundry.utils.randomID();
    
                            update[`system.competence.combatdistance.list.${rc}._id`] = rand;
                            update[`system.competence.combatdistance.list.${rc}.idAtt`] = listAttacks[idAtt]._id;
    
                            listCombatDistance[rc] = {
                                _id:rand,
                            };
                        }
                    }
    
                    for(let a in attacks) {
                        let id = attacks[a].id;
                        let type = attacks[a].type;
    
                        if(type !== 'other') {
                            update[`system.attaque.${a}.skill`] = type === 'combatcontact' ? listCombatContact[id]._id : listCombatDistance[id]._id;
                            update[`system.attaque.${a}.-=id`] = null;
                        }
                    }
                }
            }

            if(actor.type === 'vehicule' || actor.type === 'qg') {
                update[`system.vitesse.list.-=course`] = null;
                update[`system.vitesse.list.-=natation`] = null;
            }

            for (let item of actor.items) {
                let updateItm = {};

                if(item.type === 'pouvoir') {
                    updateItm[`system.effetsprincipaux`] = "";
                }

                item.update(updateItm);
            }
        }
        return update;
    }

    static _migrationItems(item, options = { force:false }) {
        const update = {};
        const data = item.system;

        if (options?.force || MigrationMM3.needUpdate("1.26.0")) {
            if(item.type === 'pouvoir') {
                update[`system.effetsprincipaux`] = "";
            }
        }

        return update;
    }
 }