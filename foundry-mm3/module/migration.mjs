import {
    getStatusData,
  } from "./helpers/common.mjs";

export class MigrationMM3 {
    static NEEDED_VERSION = "1.32.11";

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
                const update = await MigrationMM3._migrationActor(actor, options);
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

    static async _migrationActor(actor, options = { force:false }) {
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

        if (options?.force || MigrationMM3.needUpdate("1.32.0")) {

            for (let item of actor.items) {
                const effects = item.effects;
                const listVariantes = item.system.listEffectsVariantes;
                let updateActEff = [];
                let updateItm = {};
                let updateEff = [];

                for(let e of effects) {
                    const variante = item.type === 'talent' ? 'e0' : e.name;
                    const name = item.type === 'talent' ? item.name : listVariantes[e.name];
                    const find = actor.effects.contents.find(itm => itm.origin === `Actor.${actor._id}.Item.${item._id}` && itm.name === e.name);

                    updateEff.push({
                        "_id":e.id,
                        icon:'',
                        flags:{
                            variante:variante
                        },
                        name:name
                    });

                    updateActEff.push({
                        "_id":find._id,
                        icon:'',
                        flags:{
                            variante:variante
                        },
                        name:name
                    })
                }

                await item.updateEmbeddedDocuments('ActiveEffect', updateEff);
                await actor.updateEmbeddedDocuments('ActiveEffect', updateActEff);
            }

        }

        if (options?.force || MigrationMM3.needUpdate("1.32.9")) {

            for(let effect of actor.effects) {
                if(effect.origin !== null) {
                    const itmId = effect.origin?.split('.') ?? null;

                    if(!itmId) continue;

                    const last = itmId[itmId.length-1];
                    const item = actor.items.get(last);
                    const eff = item.effects.find(itm => itm.flags.variante === effect.flags.variante);

                    if(!eff) actor.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
                    else {
                        if(eff.changes !== effect.changes) item.updateEmbeddedDocuments("ActiveEffect", [{
                            "_id":eff.id,
                            icon:'',
                            flags:{
                                variante:eff.flags.variante
                            },
                            name:eff.name,
                            changes:eff.changes,
                        }])
                    }

                }
            }
        }

        if (options?.force || MigrationMM3.needUpdate("1.32.11")) {
            const attaque = data.attaque;
            let actUpdate = [];

            for(let effect of actor.effects) {
                if(effect.origin === null || effect.origin === 'status') continue
                const split = effect.origin.split('.');
                const itm = actor.items.get(split[split.length-1]);
                const eff = itm.effects.find(itm => itm.flags.variante === effect.flags.variante || itm.name === effect.name);
                let itmUpdate = [];
                let toDelete = true;

                for(let change of effect.changes) {
                    let key = change.key;

                    if(key !== '') toDelete = false;

                    if(key.includes('effects.total')) {
                        change.key = key.replaceAll('effects.total', 'bonuses');
                    } else if(key.includes('.effectsranks.')) {
                        change.key = key.replaceAll('.effectsranks.', '.ranks.');
                    }
                }

                if(toDelete) actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
                if(toDelete && eff) itm.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);

                if(!toDelete) {
                    actUpdate.push({
                        "_id":effect.id,
                        changes:effect.changes,
                    });

                    if(eff) {
                        itmUpdate.push({
                            "_id":eff.id,
                            changes:effect.changes,
                        });
                    }

                    if(itmUpdate.length > 0) itm.updateEmbeddedDocuments("ActiveEffect", itmUpdate);
                }
            }

            if(actUpdate.length > 0) actor.updateEmbeddedDocuments("ActiveEffect", actUpdate);

            for(let a in attaque) {
                const dAtt = attaque[a];

                if(dAtt.dmgechec) {
                    const dmg1 = dAtt.dmgechec?.v1 ?? 1;
                    const dmg2 = dAtt.dmgechec?.v2 ?? 1;
                    const dmg3 = dAtt.dmgechec?.v3 ?? 1;
                    const dmg4 = dAtt.dmgechec?.v4 ?? 1;

                    update[`system.attaque.${a}.-=dmgechec`] = null;

                    update[`system.attaque.${a}.repeat.dmg`] = [{
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
                    }]
                } else if(!dAtt.repeat) {
                    update[`system.attaque.${a}.repeat.dmg`] = [{
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
                    }]
                }

                if(dAtt.afflictionechec) {
                    update[`system.attaque.${a}.-=afflictionechec`] = null;

                    update[`system.attaque.${a}.repeat.affliction`] = [{
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
                    }]
                } else if(!dAtt.repeat) {
                    update[`system.attaque.${a}.repeat.affliction`] = [{
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
                    }]

                }

                if(typeof dAtt.save === 'string' || dAtt.save instanceof String) {
                    update[`system.attaque.${a}.-=save`] = null;
                    update[`system.attaque.${a}.save.dmg.type`] = dAtt.save;
                    update[`system.attaque.${a}.save.other.type`] = dAtt.save;
                } else if(!dAtt.save) {
                    update[`system.attaque.${a}.save.dmg.type`] = 'robustesse';
                    update[`system.attaque.${a}.save.other.type`] = 'robustesse';
                }

                if(typeof dAtt.saveAffliction === 'string' || dAtt.saveAffliction instanceof String) {
                    update[`system.attaque.${a}.-=saveAffliction`] = null;
                    update[`system.attaque.${a}.save.affliction.type`] = dAtt.saveAffliction;
                } else if(!dAtt.saveAffliction) update[`system.attaque.${a}.save.affliction.type`] = 'volonte';

                if(dAtt.afflictiondef) {
                    update[`system.attaque.${a}.-=afflictiondef`] = null;
                    update[`system.attaque.${a}.save.affliction.defense`] = dAtt.afflictiondef;
                } else if(!dAtt.afflictiondef) update[`system.attaque.${a}.save.affliction.defense`] = 10;

                if(dAtt.afflictioneffet) {
                    update[`system.attaque.${a}.-=afflictioneffet`] = null;
                    update[`system.attaque.${a}.save.affliction.effet`] = dAtt.afflictioneffet;
                } else if(!dAtt.afflictioneffet) update[`system.attaque.${a}.save.affliction.effet`] = 0;

                if(dAtt.defpassive) {
                    update[`system.attaque.${a}.-=defpassive`] = null;
                    update[`system.attaque.${a}.save.passive.type`] = dAtt.defpassive;
                } else if(!dAtt.defpassive) update[`system.attaque.${a}.save.passive.type`] = 'parade';

                if(dAtt.basedef) {
                    update[`system.attaque.${a}.-=basedef`] = null;
                    update[`system.attaque.${a}.save.dmg.defense`] = dAtt.basedef;
                    update[`system.attaque.${a}.save.other.defense`] = dAtt.basedef;
                } else if(!dAtt.basedef) {
                    update[`system.attaque.${a}.save.dmg.defense`] = 15;
                    update[`system.attaque.${a}.save.other.defense`] = 15;
                }

                if(dAtt.effet) {
                    update[`system.attaque.${a}.save.dmg.effet`] = dAtt.effet;
                } else if(!dAtt.effet) update[`system.attaque.${a}.save.dmg.effet`] = 0;

                if(dAtt.skill) {
                    update[`system.attaque.${a}.-=skill`] = null;
                    update[`system.attaque.${a}.links.skill`] = dAtt.skill;
                } else if(!dAtt.skill) update[`system.attaque.${a}.links.skill`] = '';

                if(dAtt.pwr) {
                    update[`system.attaque.${a}.-=pwr`] = null;
                    update[`system.attaque.${a}.links.pwr`] = dAtt.pwr;
                } else if(!dAtt.pwr) update[`system.attaque.${a}.links.pwr`] = '';

                if(dAtt.noatk) {
                    update[`system.attaque.${a}.-=noatk`] = null;
                    update[`system.attaque.${a}.settings.noatk`] = dAtt.noatk;
                } else if(!dAtt.noatk) update[`system.attaque.${a}.settings.noatk`] = false;

                if(dAtt.nocrit) {
                    update[`system.attaque.${a}.-=nocrit`] = null;
                    update[`system.attaque.${a}.settings.nocrit`] = dAtt.nocrit;
                } else if(!dAtt.nocrit) update[`system.attaque.${a}.settings.nocrit`] = false;

                if(typeof dAtt.area === 'boolean' || dAtt.area instanceof Boolean) {
                    update[`system.attaque.${a}.-=area`] = null;
                    update[`system.attaque.${a}.area.has`] = dAtt.area;
                } else if(!dAtt.area) update[`system.attaque.${a}.area.has`] = false;

                if(typeof (dAtt?.mod?.area ?? false) === 'number' || (dAtt?.mod?.area ?? false) instanceof Number) {
                    update[`system.attaque.${a}.mod.-=area`] = null;
                    update[`system.attaque.${a}.area.esquive`] = dAtt?.mod?.area ?? 0;
                } else if(!dAtt?.mod?.area ?? false) update[`system.attaque.${a}.area.esquive`] = 0;

                update[`system.attaque.${a}.save.other.defense`] = 15;
                update[`system.attaque.${a}.links.ability`] = '';
            }
        }
        return update;
    }

    static async _migrationItems(item, options = { force:false }) {
        const update = {};
        const data = item.system;

        if (options?.force || MigrationMM3.needUpdate("1.26.0")) {
            if(item.type === 'pouvoir') {
                update[`system.effetsprincipaux`] = "";
            }
        }

        if (options?.force || MigrationMM3.needUpdate("1.32.0")) {
            const effects = item.effects;
            const listVariantes = data.listEffectsVariantes;
            let updateItm = {};
            let updateEff = [];

            for(let e of effects) {
                const variante = item.type === 'talent' ? 'e0' : e.name;
                const name = item.type === 'talent' ? item.name : listVariantes[e.name];
                updateEff.push({
                    "_id":e.id,
                    icon:'',
                    flags:{
                        variante:variante
                    },
                    name:name
                });
            }

            await item.updateEmbeddedDocuments('ActiveEffect', updateEff);

        }

        if (options?.force || MigrationMM3.needUpdate("1.32.11")) {
            let itmUpdate = [];

            for(let effect of item.effects) {

                for(let change of effect.changes) {
                    let key = change.key;

                    if(key.includes('effects.total')) {
                        change.key = key.replaceAll('effects.total', 'bonuses');
                    } else if(key.includes('.effectsranks.')) {
                        change.key = key.replaceAll('.effectsranks.', '.ranks.');
                    }
                }

                itmUpdate.push({
                    "_id":effect.id,
                    changes:effect.changes,
                });
            }

            if(itmUpdate.length > 0) item.updateEmbeddedDocuments("ActiveEffect", itmUpdate);
        }

        return update;
    }
 }