export class MigrationMM3 {
    static NEEDED_VERSION = "1.4.1";

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

        return update;
    }

    static _migrationItems(item, options = { force:false }) {
        const update = {};

        return update;
    }
 }