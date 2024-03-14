// Import document classes.
import { MM3Actor } from "./documents/actor.mjs";
import { MM3Item } from "./documents/item.mjs";

// Import sheet classes.
import { PersonnageActorSheet } from "./sheets/personnage-actor-sheet.mjs";
import { VehiculeActorSheet } from "./sheets/vehicule-actor-sheet.mjs";
import { QGActorSheet } from "./sheets/qg-actor-sheet.mjs";
import { ModificateurItemSheet } from "./sheets/modificateur-item-sheet.mjs";
import { PouvoirItemSheet } from "./sheets/pouvoir-item-sheet.mjs";
import { TalentItemSheet } from "./sheets/talent-item-sheet.mjs";
import { EquipementItemSheet } from "./sheets/equipement-item-sheet.mjs";

// Import helper/utility classes and constants.
import { RegisterHandlebars } from "./helpers/handlebars.mjs";
import { RegisterSettings } from "./settings.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { MM3 } from "./helpers/config.mjs";
import toggler from './helpers/toggler.js';
import { measureDistances } from "./helpers/canvas.mjs";


import { 
  rollAtkTgt,
  rollAtk,
  rollStd,
  rollPwr,
  rollTgt,
  rollWAtk,
  rollVs,
  accessibility,
  getFullCarac,
  listBg,
  speedCalc,
  setCombinedEffects,
  getDataSubSkill,
  getAtk,
  setStatus,
  hasStatus,
  deleteStatus,
  setSpeed,
  processCharacterData,
  xml2json,
  parseXML
} from "./helpers/common.mjs";

import {
  EditAttaque,
} from "./dialog/edit-attaque.mjs";

import { MigrationMM3 } from "./migration.mjs";

import { parseInput, } from "./parse_simple_character.mjs";
//import cheerio from 'cheerio';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.mm3 = {
    applications: {
      PersonnageActorSheet,
      VehiculeActorSheet,
      QGActorSheet,
      ModificateurItemSheet,
      PouvoirItemSheet,
      TalentItemSheet,
      EquipementItemSheet,
    },
    documents:{
      MM3Actor,
      MM3Item,
    },
    parseInput,
    EditAttaque,
    getDataSubSkill,
    getAtk,
    RollMacro,
    RollMacroPwr,
    setStatus,
    hasStatus,
    deleteStatus,
    setSpeed,
    config:MM3
  };

  // Add custom constants for configuration.
  CONFIG.MM3 = MM3;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  RegisterHandlebars();
  RegisterSettings();

  const optDices = game.settings.get("mutants-and-masterminds-3e", "typeroll");
  let dices = optDices;

  if(optDices === '3D20') dices = "3D20dldh";

  CONFIG.Combat.initiative = {
    formula: dices+"+@initiative.total",
    decimals: 2
  };

  CONFIG.statusEffects = [{
      id:'dead',
    label:'EFFECT.StatusDead',
    icon:'icons/svg/skull.svg'
  },
  {
    id:'downgrade',
    label:'MM3.STATUS.Downgrade',
    icon:"icons/svg/downgrade.svg"
  },
  {
    id:'controlled',
    label:'MM3.STATUS.Controlled',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/controlled.svg"
  },
  {
    id:'decreased',
    label:'MM3.STATUS.Decreased',
    icon:"icons/svg/degen.svg"
  },
  {
    id:'tired',
    label:'MM3.STATUS.Tired',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/tired.svg",
    changes:[{
      key:'slow',
      mode:0,
      value:0
    }]
  },
  {
    id:'dazed',
    label:'MM3.STATUS.Dazed',
    icon:"icons/svg/daze.svg"
  },
  {
    id:'stuck',
    label:'MM3.STATUS.Stuck',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/stuck.svg"
  },
  {
    id:'eye',
    label:'MM3.STATUS.Influenced',
    icon:"icons/svg/eye.svg"
  },
  {
    id:'insensitive',
    label:'MM3.STATUS.Insensitive',
    icon:"icons/svg/invisible.svg"
  },
  {
    id:'invalid',
    label:'MM3.STATUS.Invalid',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/invalid.svg"
  },
  {
    id:'slow',
    label:'MM3.STATUS.Slow',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/slow.svg"
  },
  {
    id:'defenseless',
    label:'MM3.STATUS.Defenseless',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/defenseless.svg",
    changes:[{
      key: `esquive`,
      mode: 0,
      priority: 1,
      value: 2
    },
    {
      key: `parade`,
      mode: 0,
      priority: 1,
      value: 2
    }]
  },
  {
    id:'transformed',
    label:'MM3.STATUS.Transformed',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/transformed.svg"
  },
  {
    id:'vulnerability',
    label:'MM3.STATUS.Vulnerability',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/vulnerability.svg",
    changes:[{
      key: `esquive`,
      mode: 0,
      priority: 1,
      value: 2
    },
    {
      key: `parade`,
      mode: 0,
      priority: 1,
      value: 2
    }]
  },
  {
    id:'prone',
    label:'MM3.STATUS.Prone',
    icon:"icons/svg/falling.svg",
    changes:[{
      key:'slow',
      mode:0,
      value:0
    }]
  },
  {
    id:'blind',
    label:'MM3.STATUS.Blind',
    icon:"icons/svg/blind.svg",
    changes:[{
      key:'slow',
      mode:0,
      value:0
    },
    {
      key:'insensitive',
      mode:0,
      value:0
    },
    {
      key:'vulnerability',
      mode:0,
      value:0
    }]
  },
  {
    id:'chanceling',
    label:'MM3.STATUS.Chanceling',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/chanceling.svg",
    changes:[{
      key:'slow',
      mode:0,
      value:0
    },
    {
      key:'dazed',
      mode:0,
      value:0
    }]
  },
  {
    id:'sleep',
    label:'MM3.STATUS.Asleep',
    icon:"icons/svg/sleep.svg",
    changes:[{
      key:'defenseless',
      mode:0,
      value:0
    },
    {
      key:'insensitive',
      mode:0,
      value:0
    },
    {
      key:'stun',
      mode:0,
      value:0
    }]
  },
  {
    id:'restrain',
    label:'MM3.STATUS.Restrained',
    icon:"icons/svg/net.svg",
    changes:[{
      key:'slow',
      mode:0,
      value:0
    },
    {
      key:'vulnerability',
      mode:0,
      value:0
    }]
  },
  {
    id:'enthralled',
    label:'MM3.STATUS.Enthralled',
    icon:"icons/svg/sun.svg",
    changes:[{
      key:'stun',
      mode:0,
      value:0
    }]
  },
  {
    id:'exhausted',
    label:'MM3.STATUS.Exhausted',
    icon:"icons/svg/unconscious.svg",
    changes:[{
      key:'slow',
      mode:0,
      value:0
    },
    {
      key:'decreased',
      mode:0,
      value:0
    }]
  },
  {
    id:'tied',
    label:'MM3.STATUS.Tied',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/tied.svg",
    changes:[{
      key:'defenseless',
      mode:0,
      value:0
    },
    {
      key:'decreased',
      mode:0,
      value:0
    },
    {
      key:'stuck',
      mode:0,
      value:0
    }]
  },
  {
    id:'dying',
    label:'MM3.STATUS.Dying',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/dying.svg",
    changes:[{
      key:'neutralized',
      mode:0,
      value:0
    }]
  },
  {
    id:'neutralized',
    label:'MM3.STATUS.Neutralized',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/neutralized.svg",
    changes:[{
      key:'defenseless',
      mode:0,
      value:0
    },
    {
      key:'stun',
      mode:0,
      value:0
    },
    {
      key:'insensitive',
      mode:0,
      value:0
    }]
  },
  {
    id:'paralysis',
    label:'MM3.STATUS.Paralysis',
    icon:"icons/svg/paralysis.svg",
    changes:[{
      key:'defenseless',
      mode:0,
      value:0
    },
    {
      key:'stuck',
      mode:0,
      value:0
    },
    {
      key:'stun',
      mode:0,
      value:0
    }]
  },
  {
    id:'deaf',
    label:'MM3.STATUS.Deaf',
    icon:"icons/svg/deaf.svg"
  },
  {
    id:'surprised',
    label:'MM3.STATUS.Surprised',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/surprised.svg",
    changes:[{
      key:'vulnerability',
      mode:0,
      value:0
    },
    {
      key:'stun',
      mode:0,
      value:0
    }]
  },
  {
    id:'stun',
    label:'MM3.STATUS.Stunned',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/stunned.svg"
  },
  {
    id:'disabled',
    label:'MM3.STATUS.Disabled',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/disabled.svg"
  }];  

  CONFIG.specialStatusEffects = {
    BLIND:"blind",
    DEFEATED:"neutralized",
    INVISIBLE:"invisible",
    ASLEEP:"sleep",
    BOUND:"tied",
    DYING:"dying",
    ENTRANCED:"enthralled",
    EXHAUSTED:"exhausted",
    INCAPACITATED:"neutralized",
    PARALYZED:"paralysis",
    PRONE:"prone",
    RESTRAINED:"restrain",
    STAGGERED:"chanceling",
    SURPRISED:"surprised",
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = MM3Actor;
  CONFIG.Item.documentClass = MM3Item;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);

  Actors.registerSheet("mutants-and-masterminds-3e", PersonnageActorSheet, {
    types: ["personnage"],
    makeDefault: true
  });

  Actors.registerSheet("mutants-and-masterminds-3e", VehiculeActorSheet, {
    types: ["vehicule"],
    makeDefault: true
  });

  Actors.registerSheet("mutants-and-masterminds-3e", QGActorSheet, {
    types: ["qg"],
    makeDefault: true
  });
  
  Items.registerSheet("mutants-and-masterminds-3e", ModificateurItemSheet, {
    types: ["modificateur"],
    makeDefault: true
  });
  
  Items.registerSheet("mutants-and-masterminds-3e", PouvoirItemSheet, {
    types: ["pouvoir"],
    makeDefault: true
  });

  Items.registerSheet("mutants-and-masterminds-3e", TalentItemSheet, {
    types: ["talent"],
    makeDefault: true
  });

  Items.registerSheet("mutants-and-masterminds-3e", EquipementItemSheet, {
    types: ["equipement"],
    makeDefault: true
  });  

  game.settings.register("mutants-and-masterminds-3e", "systemVersion", {
    name: "Version du Système",
    scope: "world",
    config: false,
    type: String,
    default: 0,
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', async function () {
  let status = {};
  
  for(let i of CONFIG.statusEffects) {
    status[game.i18n.localize(i.label)] = i;
  };

  const sortStatus = Object.keys(status).sort(function (a, b) {
    return a.localeCompare(b);
  });

  let sortedStatus = [];

  for(let i of sortStatus) {
    sortedStatus.push(status[i]);
  }

  CONFIG.statusEffects = sortedStatus;
  
  Object.defineProperty(game.user, "isFirstGM", {
    get: function () {
        return game.user.isGM && game.user.id === game.users.find((u) => u.active && u.isGM)?.id;
    },
  });

  if (game.user.isFirstGM && MigrationMM3.needUpdate(MigrationMM3.NEEDED_VERSION)) {
    MigrationMM3.migrateWorld({ force: false }).then();
  }

  Hooks.on("hotbarDrop", (bar, data, slot) => createMacro(bar, data, slot));

  const whatMenu = game.settings.get("mutants-and-masterminds-3e", "menu");
  $("div#interface").removeClass(listBg);
  $("div#interface").addClass(whatMenu);
});

Hooks.on('renderActorDirectory', async function () {
  if(!game.user.isGM) return;
  const setting = game.settings.get("mutants-and-masterminds-3e", "font");
  let addHtml = ``;

  if(setting !== 'default') {
    addHtml += `style='font-family:"${setting}"'`;
  }

  $("section#actors footer.action-buttons").append(`<button class='import-all' ${addHtml}>${game.i18n.localize('MM3.IMPORTATIONS.Portfolio')}</button>`);

  $("section#actors footer.action-buttons button.import-all").on( "click", async function() {
    const whatMenu = game.settings.get("mutants-and-masterminds-3e", "menu");    

    const html = `
      <label for="import-portfolio" ${addHtml}>${game.i18n.localize('MM3.IMPORTATIONS.ChoisirPortfolio')}</label>
      <input type="file" id="import-portfolio" name="import-portfolio" class="import-all" accept="text/xml">
    `;

    const dOptions = {
      classes: ["mm3-import-all", whatMenu],
    };

    if(setting !== 'default') {
      dOptions.classes.push(setting);
    }

    let d = new Dialog({
      title: game.i18n.localize('MM3.IMPORTATIONS.Portfolio'),
      content:html,
      buttons: {
        one: {
         label: game.i18n.localize('MM3.IMPORTATIONS.Importer'),
         callback: async (html) => {
            try {
              const target = html.find('#import-portfolio')[0].files[0];
              const file = await readTextFromFile(target);
              let temp = file.replace(/&quot;/g, '#quot;');
              temp = temp.replace(/&[^;]+;/g, '');
          
              if (temp[0] == "\"") { // Remove the wrapping doublequotes
                temp = temp.substr(1, temp.length - 2);
              }
          
              const json = JSON.parse(xml2json(parseXML(temp), "\t"));
              const data = json.document.public.character;

              if(Array.isArray(data)) {
                // Iterate over each character in the DC file and create a new   actor
                for (const characterData of data) {
                  await processCharacterData(characterData);
                }
              } else {
                await processCharacterData(data);              
              }

            } catch (error) {
              ui.notifications.error(game.i18n.localize('MM3.IMPORTATIONS.PortfolioError'));
            }
          }
        }
      }
    },
    dOptions);
    d.render(true);
  });

  addJabImportButtonToActorDirectory(setting);
  addCreateAttackFomPowerButtonToActorDirectory(settings);

});

async function CreateAttackForAllCharacters(){
  // Loop through all actors in the game
  game.actors.contents.forEach(actor => {
    // Check if the actor is in a folder and if that folder is expanded (open)
  if (actor.folder && actor.folder.expanded) {
    // Assuming CreateAttacksFromPowers is a method on the actor or globally available
    CreateAttacksFromPowers(actor,true).then(() => {
        console.log(`CreateAttacksFromPowers applied to ${actor.name}`);
      }).catch(err => {
        console.error(`Error applying CreateAttacksFromPowers to ${actor.name}:`, err);
      });
    }
  });
}
window.CreateAttackForAllCharacters = CreateAttackForAllCharacters; 

async function CreateAttacksFromPowers(actor = canvas.tokens.controlled[0]?.actor, deleteExistingAttacks = true){
  if (!actor) {
    console.log("No actor selected.");
    return;
  }
  let context={}
  context.actor = actor;
  context.items = actor.items;

  new PersonnageActorSheet()._prepareCharacterItems(context);
  
  if(deleteExistingAttacks){
    await deleteAllAttacks(actor);
  }

  
  let characterPowers = actor.pouvoirs;
  let linkedPowers = actor.pwrLink;
  console.log("linked power " + linkedPowers);
 
  for (let power of characterPowers) {
    console.log("power " + power);
    let linkedPower = actor.pwrLink[power._id]
    if(linkedPower.length > 0 ){
      for (let key = 0; key < linkedPower.length; key++) {
        let childPower = linkedPower[key];
        await createAttackDetailsFromPower(childPower,actor);
      }
    }
    if(power.system.effetsprincipaux!=""){
      await createAttackDetailsFromPower(power,actor)
   }
  }

  await createUnarmedAttack(actor)
}    
window.CreateAttacksFromPowers = CreateAttacksFromPowers; 

async function deleteAllAttacks(selectedActor) {
  const attackKeys = Object.keys(selectedActor.system.attaque);
  let updateData = {};
  attackKeys.forEach(key => {
    updateData[`system.attaque.-=${key}`] = null;
  });
  await selectedActor.update(updateData);
  game.actors.set(selectedActor._id, selectedActor);
}

async function createUnarmedAttack(actor){
  const attacks = actor.system.attaque;
  let attackName ="Close Combat (Unarmed)";
  let unarmedCombatSkill = findSkillByLabel(actor.system.competence.combatcontact, attackName);
  if(!unarmedCombatSkill){
    attackName ="Unarmed"
    unarmedCombatSkill = findSkillByLabel(actor.system.competence.combatcontact, attackName);
  }
  let effect = actor.system.caracteristique.force.total;
  
  let characterPowers = actor.pouvoirs;
  for (let power of characterPowers) {
    let linkedPower = actor.pwrLink[power._id]
    if(linkedPower.length > 0 ){
      for (let key = 0; key < linkedPower.length; key++) {
        let childPower = linkedPower[key];
        if(childPower.system.effetsprincipaux.toLowerCase().includes("STR Strength-Damage")){
          effect += childPower.system.cout.rang;
        }
      }
    }
    else{
      if(power.system.effetsprincipaux.toLowerCase().includes("STR Strength-Damage")){
        effect += power.system.cout.rang;
      }
    }
  }
  await createAttack(actor,attackName, "combatcontact", 15, effect, 'robustesse', 20, false,true, unarmedCombatSkill)

}
let linkNextPower =false;

function getSaveFromPower(powerConfig)
{
  if(powerConfig.resistance=="Toughness")
    {
      return 'robustesse';
    }
    else {
      if(powerConfig.resistance=="Fortitude")
      {
        return'vigueur';
      }
      else if(powerConfig.resistance=="Will"){
        return 'volonte';
      }
      else if(powerConfig.resistance=="Dodge"){
        return 'esquive';
      }
    }
}
async function createAttackDetailsFromPower( matchingPower, actor)    { 
  let effectName = matchingPower.system.effetsprincipaux
  if(effectName==""){
    effectName = matchingPower.name
  }
  let isAffliction = false;
  let isDamage = false;
  let basedef = 0;
 
  let type='combatcontact'

  const powersConfig = [
    { name: "Affliction", range: "Close", resistance: "Fortitude" },
    { name: "Blast", range: "Ranged", resistance: "Toughness" },
    { name: "Damage", range: "Close", resistance: "Toughness" },
    { name: "Dazzle", range: "Ranged", resistance: "Will" },
    { name: "Energy Aura", range: "Close", resistance: "Toughness" },
    { name: "Energy Control", range: "Ranged", resistance: "Toughness" },
    { name: "Magic", range: "Ranged", resistance: "Toughness" },
    { name: "Mental Blast", range: "Perception", resistance: "Will" },
    { name: "Mind Control", range: "Perception", resistance: "Will" },
    { name: "Nullify", range: "Ranged", resistance: "Will" },
    { name: "Sleep", range: "Ranged", resistance: "Fortitude" },
    { name: "Snare", range: "Ranged", resistance: "Dodge" },
    { name: "Strike", range: "Close", resistance: "Toughness" },
    { name: "Suffocation", range: "Ranged", resistance: "Fortitude" },
  ];
  
  let combatSkill = null;
  let powerConfig = powersConfig.find(power => effectName.toLowerCase().includes(power.name.toLowerCase()));
  let afflictions =undefined;
  if(powerConfig){
    let save= getSaveFromPower(powerConfig);
    if(save=='robustesse')
    {
      isDamage = true;
      basedef = 15;
      if(linkNextPower==true)
      {
        saveLinkedAttack(actor, matchingPower);
        return; 
      }
    }
    else {
      isAffliction = true;
      basedef = 10;
      afflictions = determineAffliction(powerConfig, matchingPower)
      if (matchingPower.system.effets.includes("Linked to")){
        
        linkNextPower = true;
      }
    }
    let isArea = getAreaFromPower(matchingPower);
  
    
    if(powerConfig.range=="Close"){
      type = "combatcontact"
      combatSkill = findSkillByLabel(actor.system.competence.combatcontact, matchingPower.name);
      if(!combatSkill){
        if(actor.system.competence.combatcontact.list[0]!=undefined){
        combatSkill =  actor.system.competence.combatcontact.list[0];
        }
      }
    }
    else if(powerConfig.range=="Ranged"){
      type = "combatdistance"
      combatSkill = findSkillByLabel(actor.system.competence.combatdistance, matchingPower.name);
      if(!combatSkill){
        if(actor.system.competence.combatdistance.list[0]!=undefined){
          combatSkill = actor.system.competence.combatdistance.list[0];
        }
      }
    }
    else if(powerConfig.range=="Perception"){
      type = "combatperception"
    }
    if(!isAffliction && !isDamage){
      return;
    }
      await createAttack(actor,matchingPower.name, type, basedef, matchingPower.system.cout.rang, save, 20,isAffliction,isDamage, combatSkill,isArea, afflictions, matchingPower._id)
    }
}

function saveLinkedAttack(actor, matchingPower) {
  let lastAttackKey = findAttackLastAttackKey(actor.system.attaque);
  let updates = {};
  let linkedAttack = actor.system.attaque[lastAttackKey];
  linkNextPower = true;
  linkedAttack.isDmg = true;
  linkedAttack.afflictioneffet = actor.system.attaque[lastAttackKey].effet;
  linkedAttack.effet = matchingPower.system.cout.rang;
  linkedAttack.saveAffliction = actor.system.attaque[lastAttackKey].save;
  linkedAttack.afflictiondef = actor.system.attaque[lastAttackKey].basedef;
  linkedAttack.basedef = 15;
  linkedAttack.save = "robustesse";

  updates[`system.attaque.${lastAttackKey}`] = linkedAttack;
  actor.update(updates);
  game.actors.set(actor._id, actor);
  linkNextPower = false;
}

function findAttackLastAttackKey(attaque) {
  const highestKey = Math.max(...Object.keys(attaque).map(key => parseInt(key)));
  //const lastAttack = attaque[highestKey];
  return highestKey;
}

function getAreaFromPower(matchingPower){
  for (const key in matchingPower.system.extras) {
          const item =  matchingPower.system.extras[key];
          // Check if the item has a name property and if it includes "Area"
          if (item.name && item.name.includes("Area")) {
              return true
          }
    }
    return false; // Return null if no matching item is found
}

function determineAffliction(powerConfig, matchingPower){
  let effectName = matchingPower.system.effetsprincipaux
    if(effectName==""){
      effectName = matchingPower.name
    }
  let conditions=[];
  const presetAfflictions = [
    {power:"Dazzle",afflictions:{resistedBy:"Fortitude","e1":["Impaired"],"e2":["Disabled"],"e3":["Unaware"]}},
    {power:"Mind Control",afflictions:{resistedBy:"Will","e1":["Dazed"],"e2":["Compelled"],"e3":["Controlled"]}},
    {power:"Snare",afflictions:{resistedBy:"Dexterity", "e1":["Hindered","Vulnerable"],"e2":["Immobile","Defenseless"]}},
    {power:"Suffocation",afflictions:{resistedBy:"Fortitude","e1":["Dazed"],"e2":["Stunned"],"e3":["Incapacitated"]}},
  ]
  let presetAffliction = presetAfflictions.find(affliction => effectName.toLowerCase().includes(affliction.power.toLowerCase()));
  if(presetAffliction){
    conditions= presetAffliction.afflictions;
  }
  else{
    let details = matchingPower.system.effets;
    details = details.replace(/<[^>]*>/g, '')
    const pattern = /Affliction resisted by (.*?); \/([^\/\s]+)(?:\s[^\/]+)?\/([^\/\s]+)(?:\s[^\/]+)?(?:\/([^\/\s]+)(?:\s[^\/]+)?)?/;
    const match = details.match(pattern);
    if (match) {
        const result = {
            resistedBy: match[1]
        };
        // Assigning effects to numbered keys in the result object
        if (match[2]) result["e1"] =[ match[2].trim()];
        if (match[3]) result["e2"] =[ match[3].trim()];
        if (match[4]) result["e3"] =[ match[4].trim()];
        conditions = result;
    }
  }
  ["e1", "e2", "e3"].forEach(effect => {
    let tempConditions = []; // Temporary array to store the found status effects
    if(conditions[effect]){
      conditions[effect].forEach(condition => {
        const statusEffect = findStatusEffect(condition); // Assuming findStatusEffect is defined elsewhere
        if (statusEffect !== null) { // Check if statusEffect is not null before adding
          tempConditions.push(statusEffect);
        }
      });
    
      conditions[effect] = tempConditions; // Update the conditions with the found status effects
    }
  });
  return conditions;
}

function findStatusEffect(englishCondition) {
	let conditionTranslations = {
      "Controlled": "Controlled",
      "Impaired": "Decreased",
      "Fatigued": "Tired",
      "Disabled": "Disabled",
      "Dazed": "Dazed",
      "Immobile": "Stuck",
      "Unaware": "Insensitive",
      "Debilitated": "Invalid",
      "Hindered": "Slow",
      "Defenseless": "Defenseless",
      "Transformed": "Transformed",
      "Vulnerable": "Vulnerability",
      "Staggered": "Chanceling",
      "Entranced": "Enthralled",
      "Compelled": "Influenced",
      "Exhausted": "Exhausted",
      "Bound": "Tied",
      "Dying": "Dying",
      "Incapacitated": "Neutralized",
      "Surprised": "Surprised",
      "Weakened": "Downgrade",
      "Prone": "Prone",
      "Blind": "Blind",
      "Asleep": "Asleep",
      "Restrained": "Restrained",
      "Paralyzed": "Paralysis",
      "Deaf": "Deaf",
      "Stunned": "Stunned"
    };
    
  

  // Translate English condition to French
  const frenchCondition = conditionTranslations[englishCondition];
  
  // Prepare the search label by adding the prefix
  const searchLabel = `MM3.STATUS.${frenchCondition}`;

  // Find the corresponding status effect in CONFIG.statusEffects
  const statusEffect = CONFIG.statusEffects.find(effect => effect.label === searchLabel);

  // Return the found status effect, or null if not found
  return statusEffect || null;
}

function findSkillByLabel(skills, label) {
  for (const key in skills.list) {
      if (skills.list[key].label === label) {
          return skills.list[key];
      }
  }
  return null; 
}

async function createAttack(actor, label, type, baseDef, effet, save, critique,isAffliction,isDamage, skill,isArea=false, afflictions={"e1":[],"e1":[],"e1":[]}, pwr="") {
  // Create the new attack data
  let skillId = 0;
  let attaque = 0;
  if(skill){
    skillId = skill._id;
    attaque = skill.total;
  }  
  else{
    if(type == "combatcontact"){
      attaque = actor.system.caracteristique.combativite.total;
    }
    if(type == "combatdistance"){
      attaque = actor.system.caracteristique.dexterite.total;
    } 


  }

 
  let newAttackData = {_id:foundry.utils.randomID(),
    type: type,
    skill:undefined,
    pwr:pwr,
    area:isArea,
    save:save,
    skill:skillId,
    effet:effet,
    attaque:attaque,
    isAffliction:isAffliction,
    afflictionechec: afflictions,
    isDamage:isDamage,
    isDmg:isDamage,
    critique:critique,
    text:"",
    noAtk:false,
    basedef:baseDef,
    label:label,
    defpassive:'combatcontact'
};



// If the attack exists, update it; otherwise, add a new one
let existingAttackKey = null;
for (const [key, attack] of Object.entries(actor.system.attaque)) {
  if (attack.label === label) {
    existingAttackKey = key;
    break;
  }
}
let updates = {};
if (existingAttackKey) {
  updates[`system.attaque.${existingAttackKey}`] = newAttackData;
  await actor.update(updates);
} else {
  const attacks = actor.system.attaque;
  let newAttack ={}
  let attackKeys = Object.keys(attacks);
  let newKey = attackKeys.length > 0 ? Math.max(...attackKeys) : 0;   
  newAttack[`system.attaque.${newKey+1}`] = newAttackData
  console.log("new attack" + newAttackData)
  await actor.update(newAttack);
}



game.actors.set(actor._id , actor)

}

function addJabImportButtonToActorDirectory(setting) {
  let addHtml = ``;

  if(setting !== 'default') {
    addHtml += `style='font-family:"${setting}"'`;
  }

  $("section#actors footer.action-buttons").append(`<button class='import-simple' ${addHtml}>${game.i18n.localize("MM3.IMPORTATIONS.JabsBtn")}</button>`);

  $("section#actors footer.action-buttons button.import-simple").on( "click", async function() {
    const whatMenu = game.settings.get("mutants-and-masterminds-3e", "menu");    

    let html = ``;
    
      /*html+=`
      <label for="import-simple" ${addHtml}>Choose folder to import json files</label>
      <input type="file" id="import-simple" name="import-simple" class="import-all" accept="text/txt" webkitdirectory mozdirectory>
      </p>
      `*/
      
      html+=`<label for ="import-simple-text" ${addHtml}>${game.i18n.localize("MM3.IMPORTATIONS.JabsDescription")}
      <textarea id="import-simple-text" name="import-simple-text" rows="40" cols="50"></textarea>
    `;

    const dOptions = {
      classes: ["mm3-import-all", whatMenu],
    };

    if(setting !== 'default') {
      dOptions.classes.push(setting);
    }

    let d = new Dialog({
      title: game.i18n.localize("MM3.IMPORTATIONS.JabsTitle"),
      content:html,
      buttons: {
      /* commented out as we don't want to open up web site crawling without the website's permission
        one: {
         label: "Start Import From Folder",
         callback: async (html) => {
        
            const files = html.find('#import-simple')[0].files;
            for (let i = 0; i < files.length; i++) {  
              try{
              const target = files[i];
              const file = await readTextFromFile(target);
              const actorJson = JSON.parse(file, "\t");            
              
              let characterData = convertToProcessableCharacterData(actorJson)
              await processCharacterData(characterData);
            }
            catch (error) {
              ui.notifications.error(error + error.stack);
              console.log(error + error.stack);
              console.log
              continue
            } 
          } 
           
          }
        

        },*/
        two:{
          label: game.i18n.localize("MM3.IMPORTATIONS.JabsValider"),
          callback: async (html) => {
            const text = html.find('#import-simple-text')[0].value;
            const actorJson = parseInput(text);      
            let characterData = convertToProcessableCharacterData(actorJson)
            await processCharacterData(characterData);
          }
        }        
    }
    },
    dOptions);
    d.render(true);
  });
}

 
function addCreateAttackFomPowerButtonToActorDirectory(setting) {
  let addHtml = ``;

  if(setting !== 'default') {
    addHtml += `style='font-family:"${setting}"'`;
  }

  $("section#actors footer.action-buttons").append(`<button class='convert-attack' ${addHtml}>${game.i18n.localize("MM3.IMPORTATIONS.ConvertFrom")}</button>`);

  $("section#actors footer.action-buttons button.convert-attack").on( "click", async function() {
    new Dialog({
      title: "Warning",
      content: "<p>Warning this will replace attacks in all characters in open folders with ones converted from character abilities?</p>",
      buttons: {
        ok: {
          label: "OK",
          callback: () => CreateAttackForAllCharacters() 
        },
        cancel: {
          label: "Cancel",
          callback: () => console.log("User clicked OK.")
        }
      },
      default: "cancel",
     }).render(true);
    
  });
}

function convertToProcessableCharacterData(parsedData){
  let characterData ={};
  characterData.attributes = {};

  characterData.attributes.attribute = [];
  characterData.active = "yes";
  characterData.nature = "normal";
  characterData.role=parsedData.role;
  characterData.type= "";
  characterData.name = parsedData.name + "(Jab's Build)";
  characterData.de
  
  characterData.powerpoints={};
  if(parsedData.total==null){
    // likely a bogus file
    return characterData;
  }
  characterData.powerpoints.text = parsedData.total.total+" PP";
  characterData.powerpoints = parsedData.total.total;
  
  characterData.powerLevel = {};
  characterData.powerLevel.value = parsedData.powerLevel;
  characterData.powerLevel.text = "PL "+parsedData.powerLevel;

  characterData.resources={};
  characterData.resources.resource=  [];
  characterData.resources.resource.push({name:"Abilities",spent:parsedData.total.abilities});
  characterData.resources.resource.push({name:"Powers",spent:parsedData.total.powers});
  characterData.resources.resource.push({name:"Advantages",spent:parsedData.total.advantages});
  characterData.resources.resource.push({name:"Skills",spent:parsedData.total.skills});
  characterData.resources.resource.push({name:"Defenses",spent:parsedData.total.defenses});

  characterData.resources.currentpl = parsedData.powerLevel;
  
  characterData.personal={};
  characterData.attributes={}
  characterData.attributes.attribute=[];
  characterData.attributes.attribute.push(
    {
      name:"Strength",
      base:parsedData.strength.base,
      text:parsedData.strength.base, 
      modified:parsedData.strength.totalWithPowers ==0? parsedData.strength.base : parsedData.strength.totalWithPowers,
      cost:{} 
  });
  characterData.attributes.attribute.push({name:"Stamina",base:parsedData.stamina.base,text:parsedData.stamina.base, modified:parsedData.stamina.totalWithPowers==null? parsedData.stamina.base : parsedData.stamina.totalWithPowers,cost:{} });
  characterData.attributes.attribute.push({name:"Agility",base:parsedData.agility.base,text:parsedData.agility.base,  modified: parsedData.agility.totalWithPowers==null? parsedData.agility.base : parsedData.agility.totalWithPowers,cost:{} });
  characterData.attributes.attribute.push({name:"Dexterity",base:parsedData.dexterity.base,text:parsedData.dexterity.base, modified:parsedData.dexterity.totalWithPowers==null? parsedData.dexterity.base : parsedData.dexterity.totalWithPowers,cost:{} });
  characterData.attributes.attribute.push({name:"Fighting",base:parsedData.fighting.base,text:parsedData.fighting.base, modified:parsedData.fighting.totalWithPowers==null? parsedData.fighting.base : parsedData.fighting.totalWithPowers,cost:{} });
  characterData.attributes.attribute.push({name:"Intellect",base:parsedData.intelligence.base,text:parsedData.intelligence.base, modified:parsedData.intelligence.totalWithPowers==null? parsedData.intelligence.base : parsedData.intelligence.totalWithPowers,cost:{} });
  characterData.attributes.attribute.push({name:"Awareness",base:parsedData.awareness.base,text:parsedData.awareness.base, modified:parsedData.awareness.totalWithPowers==null? parsedData.awareness.base : parsedData.awareness.totalWithPowers,cost:{} });
  characterData.attributes.attribute.push({name:"Presence",base:parsedData.presence.base,text:parsedData.presence.base, modified:parsedData.presence.totalWithPowers==null? parsedData.presence.base : parsedData.presence.totalWithPowers,cost:{} });
  characterData.attributes.attribute.push({name:"Strength",base:parsedData.strength.base,text:parsedData.strength.base, modified:parsedData.strength.totalWithPowers==null? parsedData.strength.base : parsedData.strength.totalWithPowers,cost:{} });
  
  characterData.defenses={};
  characterData.defenses.defense=[];
  //loop over parsedData.defenses and add to characterData.defenses.defense


  for (let i = 0; i < parsedData.defenses[0].defenseTypes.length; i++) {
    let cost={};
    let defense = parsedData.defenses[0].defenseTypes[i];
    
    let firstDefenseNumber = defense.defenseNumber;
    let secondDefenseNumber = 0;
    let defenseModifiers = defense.defenseModifiers;

    if (defenseModifiers.length==2)
    {
        firstDefenseNumber = defenseModifiers[0].modifier;
        secondDefenseNumber = defenseModifiers[1].modifier;
        cost.value = secondDefenseNumber - firstDefenseNumber 
        cost.value = secondDefenseNumber - cost.value - defense.defenseNumber;

    }
    else
    {
      if (defenseModifiers.length==1)
      {
          secondDefenseNumber = defenseModifiers[0].modifier;
          cost.value = secondDefenseNumber - defense.defenseNumber
          //cost.value = secondDefenseNumber - cost.value - defense.defenseNumber
          

      }
    }
    if(secondDefenseNumber==0)
    {
      secondDefenseNumber = firstDefenseNumber;
    }

    if (defenseModifiers.length==0)
    {
      let defenseBaseStat;
      if(defense.defenseType=="Dodge")
      {
          defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Agility");
      }
      if(defense.defenseType=="Parry")
      {
          defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Fighting");
      }
      if(defense.defenseType=="Fortitude")
      {
          defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Stamina");
      }
      if(defense.defenseType=="Toughness")
      {
          defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Stamina");
      }
      if(defense.defenseType=="Will")
      {
          defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Awareness");
      }
      //secondDefenseNumber = defenseBaseStat.modified;
      cost.value =   defense.defenseNumber - defenseBaseStat.modified


    }

      characterData.defenses.defense.push({name:defense.defenseType,  abbr: defense.defenseType, base: firstDefenseNumber, modified: secondDefenseNumber, impervious: 0, text: firstDefenseNumber+"/"+secondDefenseNumber, cost: cost});
    //to do check impervious
  }

  characterData.initiative={};
  let initiative =null;
  try{
    initiative = parsedData.offense.find(element => element.name === "Initiative"); 
  }catch(error){
  }
  let attackWithPower =0; 
  if(initiative!=null){
    attackWithPower = initiative.attackWithPower;
    if(attackWithPower==0)
    {
      attackWithPower = initiative.attack;
    }
  }
  characterData.initiative.total = attackWithPower;


  characterData.attacks={};
  characterData.attacks.attack=[];
  
  for (let i = 0; i < parsedData.offense.length; i++) {
    let attack = parsedData.offense[i];
    if(attack!=null && attack.name!="Initiative"){

      characterData.attacks.attack.push({name:attack.name, attack:attack.attack, effect:attack.effect, 
        area:attack.area, type:attack.type, range:attack.range, effectType:attack.effectType, damageClass:attack.damageClass});
    }
  }
  characterData.skills={};
  characterData.skills.skill=[];
  for (let i = 0; i < parsedData.skills.length; i++) {
    let skill = parsedData.skills[i];
    if(skill!=null){
      let power = skill.powerName;
      let value="";
    
      if(power){
        value = "+" + skill.totalWithStat +"/" + skill.totalWithPower
      }
      else{
        value = "+" + skill.totalWithStat
      }
      let cost = {};
      cost.value = skill.ranks / 2;
      let attrbonus = skill.totalWithStat - skill.ranks;  
      characterData.skills.skill.push({name:skill.name, attrbonus:attrbonus, value, base:skill.ranks, description:"", cost:cost});
    }
  }
  characterData.advantages={};
  characterData.advantages.advantage=[];
  for (let i = 0; i < parsedData.advantages.length; i++) {
    let advantage = parsedData.advantages[i];
    if(advantage!=null){
      let advantageName = advantage.name;
      if(advantage.rank!=null){
        advantageName = advantage.name +" "+ advantageName.rank;
      }
      else{
        advantageName = advantage.name;
      }
      
      let cost={ value:advantage.rank};
    
      characterData.advantages.advantage.push({name:advantageName, ranks:advantage.rank, description:"", cost:cost});
    }
  }
  //TO DO figure out advantage category

  characterData.powers={};
  characterData.powers.power=[];
  convertPowersToCharacterData(characterData.powers.power, parsedData.powers.powers, characterData);
  
  
  characterData.gear={}
  characterData.gear.item=[];

  for (let i = 0; i < parsedData.equipment.length; i++) {
    let equipment = parsedData.equipment[i];
    if(equipment!=null){
      
      characterData.gear.item.push({name:equipment.name, description:"", cost:{text:"", value:""}});
    }
  }

  characterData.complications={};
  characterData.complications.complication=[];
  for (let i = 0; i < parsedData.complications.length; i++) {
    let complication = parsedData.complications[i];
    if(complication!=null){
      characterData.complications.complication.push({name:complication.name, description: complication.subject +","+ complication.description});
    }
  }

  return characterData;
}

function convertPowersToCharacterData(powers, simplePowers, characterData){
  if(simplePowers!=undefined && simplePowers!=null){
      for (let i = 0; i < simplePowers.length; i++) {
      let simplePower = simplePowers[i];
      if(simplePower!=null){
        let power = {};
        if(simplePower.alias){
          power.name = simplePower.alias + ":" + simplePower.name;

        }
        else{
          power.name = simplePower.name;
        }
        power.ranks = simplePower.rank;
        power.name = power.name + " " + power.ranks;
        power.cost = {text:"", value:""};
        power.descriptors ={};
        power.descriptors.descriptor = [];
       
        convertDescriptors(power, simplePower);
        if(simplePower.effect){
          
          power.descriptors.descriptor.push({name:simplePower.effect.value});
          power.description = simplePower.effect.value;
        }  
        convertExtras(power, simplePower);
        convertFlaws(power, simplePower);
        convertFeats(power, simplePower);
        //parse childer in loop
        if(simplePower.children!=null){
          power.otherpowers = {};
          power.otherpowers.power = [];
          
          convertPowersToCharacterData(power.otherpowers.power, simplePower.children , characterData);
        }

        if(simplePower.affliction){
          let affliction = simplePower.affliction;
          if(affliction.resistedBy){
            if(power.description==undefined)
            {
              power.description='';
            }
            power.description+=" Affliction resisted by " + affliction.resistedBy + "; " 
            for(let k =0; k < affliction.degrees.length; k++){
              let degree = affliction.degrees[k];
              if(degree!=null){
                power.description+="/"+ degree  
              }
            }
          }
          
        }
        

        if(simplePower.advantages && simplePower.advantages[0]){
          power.chainedadvantages={};
          power.chainedadvantages.chainedadvantage=[];
          for (let i = 0; i < simplePower.advantages[0].length; i++) {
            let advantage = simplePower.advantages[0][i];
            if(advantage){
              let advantageName = simplePower.advantages[0][i].name;
              if(simplePower.advantages[0][i].rank!=null){
                advantageName = simplePower.advantages[0][i].name +" "+ simplePower.advantages[0][i].rank;
              }
              else{
                advantageName = simplePower.advantages[0][i].name;
              }
              let advantage = {name:advantageName, ranks:simplePower.advantages[0][i].rank, description:"", cost:{text:"", value:""}};
              power.chainedadvantages.chainedadvantage.push(advantage);
              characterData.advantages.advantage.push(advantage);
            }
          }
        }
        if(simplePower.childSkills){
          if(!power.description){
            power.description='';
          }
          for (let j =0; j < simplePower.childSkills.length; j++){   
            let skill = simplePower.childSkills[j];
            power.description+=" "+ skill.name + " +" + skill.ranks + " (" + skill.totalWithStatAndPowers +" )";
          }
          
        }
        if(simplePower.linkedTo)
        {
          power.description +=" \n Linked to " + simplePower.linkedTo.name + " " + simplePower.linkedTo.rank 
          
        }
        powers.push(power);
      }
    }
  }
}

function convertDescriptors(power, simplePower){
  power.descriptors = {};
  power.descriptors.descriptor = [];
  let descriptors = simplePower.descriptors;
  if(descriptors!=null && descriptors!=undefined){
    for (let i = 0; i < descriptors.length; i++) {
      let descriptor = descriptors[i];
      if(descriptor!=null){
        power.descriptors.descriptor.push({name:descriptor.name});
      }
    }
  }
}

function convertExtras(power, simplePower){
  power.extras = {};
  power.extras.extra = [];
  let extras = simplePower.extras;
  for (let i = 0; i < extras.length; i++) {
    let extra = extras[i];
    if(extra!=null){
      if(extra.modifier!=null){
        extra.name = extra.name + " " + extra.modifier;
      }
      power.extras.extra.push({name:extra.name});
      power.extras.extra.push({ranks:extra.modifier});
    }
  }
}

  function convertFlaws(power, simplePower){
    power.flaws = {};
    power.flaws.flaw = [];
    let flaws = simplePower.flaws;
    if(flaws!=null && flaws!=undefined){
      for (let i = 0; i < flaws.length; i++) {
        let flaw = flaws[i];
        if(flaw!=null){
          if(flaw.modifier!=null){
            flaw.name = flaw.name + " " + flaw.modifier;
          }
          
          power.flaws.flaw.push({name:flaw.name});
          power.flaws.flaw.push({ranks:flaw.modifier});
        }
      }
    }
  }

  function convertFeats(power, simplePower){
  let extras = simplePower.feats;
  if(extras){
    for (let i = 0; i < extras.length; i++) {
      let extra = extras[i];
      if(extra!=null){
        if(extra.modifier!=null){
          extra.name = extra.name + " " + extra.modifier;
        }
        power.extras.extra.push({name:extra.name});
        power.extras.extra.push({ranks:extra.modifier});
      }
    }
  }
}
  
Hooks.on('deleteItem', doc => toggler.clearForId(doc.id));
Hooks.on('deleteActor', doc => toggler.clearForId(doc.id));

Hooks.on('renderChatMessage', (message, html, data) => {
  const isInitiative = message?.flags?.core?.initiativeRoll ?? false;
  const toHide = $(html.find('div.toHide'));
  const btn = $(html.find('button.btnRoll'));
  const isExist = btn.length > 0 ? true : false;
  const user = game.user;

  accessibility(null, html)

  if(isExist && !user.isGM) {
    html.find('button.btnRoll').each(function() {
      const target = $(this);
      const tgt = target.data('target');
      const scene = canvas.scene;
  
      if(scene === null) return;
  
      const token = scene.tokens.find(token => token.id === tgt);
  
      if(token.actor.ownership[game.user.id] !== 3 && token.actor.ownership.default !== 3) target.parent().hide();
    });
  }

  if(toHide.length > 0 && !user.isGM) {
    for(let i = 0;i < toHide.length;i++) {
      $(toHide[i]).remove();
    }
  }

  html.find('button.btnRoll').click(async ev => {
      ev.stopPropagation();
      const target = $(ev.currentTarget);
      const tgt = target.data('target');
      const savetype = target.data('savetype');
      const vs = target.data('vs');
      const dataAtk = target.data('datk');
      const dataStr = target.data('dstr');
      const typeAtk = target.data('type');
      const hasAlt = ev.altKey;

      const token = canvas.scene.tokens.find(token => token.id === tgt);

      if(token.actor.ownership[game.user.id] !== 3 && token.actor.ownership.default !== 3) return;

      const tokenData = token.actor.system;
      const saveScore = tokenData.defense[savetype].total;
      const name = `${game.i18n.localize(CONFIG.MM3.defenses[savetype])}`;

      rollVs(token.actor, name, saveScore, vs, {typeAtk:typeAtk, atk:dataAtk, str:dataStr, tkn:token}, {alt:hasAlt});      
  });

  if(isInitiative) {
    $(html.find('span.flavor-text')).remove();
    $(html.find('div.dice-roll')).addClass('mm3-roll');
    $(html.find('div.dice-roll h4:last-of-type')).addClass('result');

    const diceFormula = $(html.find('div.dice-roll div.dice-formula'));
    const diceTotal = $(`<h4 class="dice-total flavor">${game.i18n.localize("MM3.ROLL.Initiative")} !</h4>`);
    const diceTotalFormula = $(`<h4 class="dice-total formula">${diceFormula.text().toUpperCase()}</h4>`);
    const diceResult = $(html.find('div.dice-roll h4.dice-total.result'));
    const diceBottom = $(`<h4 class="bottom"></h4>`);

    if(diceTotalFormula.text().toLowerCase().includes("3d20dldh")) {
      diceTotalFormula.text(diceTotalFormula.text().replace("3D20DLDH", "3D20"));
    }

    diceFormula.after(diceTotal);
    diceTotal.after(diceTotalFormula);
    diceResult.after(diceBottom);
    diceFormula.remove();
  }
});

Hooks.on('userConnected', (User, boolean) => {
  const whatMenu = game.settings.get("mutants-and-masterminds-3e", "menu");
  $("section#ui-left").removeClass(['bleuclair', 'violetclair', 'violet', 'bleufonce']);
  $("div#sidebar.app").removeClass(['bleuclair', 'violetclair', 'violet', 'bleufonce']);

  $("section#ui-left").addClass(whatMenu);
  $("div#sidebar.app").addClass(whatMenu);
});

Hooks.on("applyActiveEffect", async (actor, change) => {
  if(actor.type !== 'personnage' && this.permission !== 3) return;

  /*const scene = game.canvas.scene;
  
  const tp = [{
    x:Math.floor(actor.token.x+(scene.grid.size/2)),
    y:Math.floor(actor.token.y+(scene.grid.size/2)),
    distance:5,
    width:1,
    height:1,
  }];

  console.warn(tp);
  console.warn(actor.token);
  console.warn(game.canvas.scene);

  game.canvas.scene.createEmbeddedDocuments("MeasuredTemplate", tp)*/

  const version = game.version.split('.')[0];
  let status = "";
  if(version < 11) {
    status = foundry.utils.getProperty(change.effect, "flags.core.statusId");
    let defense;

    switch(status) {
      case 'vulnerability':
        defense = actor.system.defense[change.key];
        const carac = actor.system.caracteristique[getFullCarac(defense.car)];
        const caracTotal = carac.absente ? 0 : carac.base+carac.divers;
        const defTotal = defense.base+defense.divers+caracTotal;

        defense.other = -Math.floor(defTotal/2);
        break;

      case 'defenseless':
        defense = actor.system.defense[change.key];
        defense.defenseless = true;
        break;
    }
  } else {
    status = foundry.utils.getProperty(change.effect, "statuses");
    let defense;
    let carac;
    let caracTotal;
    let defTotal;

    for(let eff of status) {
      switch(eff) {
        case 'vulnerability':
          defense = actor.system.defense[change.key];
          carac = actor.system.caracteristique[getFullCarac(defense.car)];
          caracTotal = carac.absente ? 0 : carac.base+carac.divers;
          defTotal = defense.base+defense.divers+caracTotal;

          defense.other = -Math.floor(defTotal/2);
          break;
        
        case 'defenseless':
          defense = actor.system.defense[change.key];
          defense.defenseless = true;
          break;
      }
    }
  }
});

Hooks.on("createActiveEffect", async (effect, data, id) => {
  if(effect.parent.permission !== 3) return;
  let statuses;

  const version = game.version.split('.')[0];
  if(version < 11) statuses = effect._statusId;
  else statuses = effect.statuses;

  setCombinedEffects(effect.parent, statuses, true);
});

async function createMacro(bar, data, slot) {
  if(data.type === 'Item' || foundry.utils.isEmpty(data)) return;
  // Create the macro command
  const type = data.type;
  const label = data.label;
  const actorId = data.actorId;
  const sceneId = data.sceneId;
  const tokenId = data.tokenId;
  const what = data?.what ?? "";
  const id = data?.id ?? -1;
  const author = data?.author ?? 'personnage';
  const command = type === 'pouvoir' ? `game.mm3.RollMacroPwr("${actorId}", "${sceneId}", "${tokenId}", "${id}", "${author}");` : `game.mm3.RollMacro("${actorId}", "${sceneId}", "${tokenId}", "${type}", "${what}", "${id}", "${author}", event);`;

  let img = data.img;
  if(img === "") img = "systems/mutants-and-masterminds-3e/assets/icons/dice.svg";

  let macro = await Macro.create({
    name: label,
    type: "script",
    img: img,
    command: command,
    flags: { "mm3.attributMacro": true }
  });
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

async function RollMacro(actorId, sceneId, tokenId, type, what, id, author, event) {
  console.warn(actorId, sceneId, tokenId);
  const actor = tokenId === 'null' ? game.actors.get(actorId) : game.scenes.get(sceneId).tokens.find(token => token.id === tokenId).actor;
  
  const data = actor.system;
  const tgt = game.user.targets.ids[0];
  const dataStr = data?.strategie?.total ?? {attaque:0, effet:0};
  const strategie = {attaque:dataStr.attaque, effet:dataStr.effet};
  const hasShift = event.shiftKey;
  const hasAlt = event.altKey;
  
  const atk = id === '-1' || id === -1 ? {noAtk:false} : game.mm3.getAtk(actor, id)?.data ?? "";
  let name = "";
  let total = 0;

  switch(type) {
    case 'caracteristique':
      name = author === 'vehicule' ? game.i18n.localize(CONFIG.MM3.vehicule[what]) : game.i18n.localize(CONFIG.MM3.caracteristiques[what]);
      total = data.caracteristique[what].total;
      break;
      
    case 'defense':
      name = game.i18n.localize(CONFIG.MM3.defenses[what]);
      total = data.defense[what].total;
      break;
    
    case 'competence':
      if(what === 'combatcontact' || what === 'combatdistance' || what === 'expertise') {
        name = data[type][what].list[id].label;
        total = data[type][what].list[id].total;
      } else {
        name = id === 'new' ? data[type][what].label : game.i18n.localize(CONFIG.MM3.competences[what]);
        total = data[type][what].total;
      }
      break;
    
    case 'attaque':
      const typeAtk = atk.type;
      const idSkill = atk.skill;

      if(typeAtk === 'combatcontact' || typeAtk === 'combatdistance') {
        let skill = game.mm3.getDataSubSkill(actor, typeAtk, idSkill);
        name = skill.label;
        total = skill.total;
      } else if(typeAtk === 'other') {
        name = atk.label;
        total = atk.attaque;
      }
      break;
  }

  let result = undefined;

  if(type === 'attaque' && tgt !== undefined && atk.noAtk) {
    for(let t of game.user.targets.ids) {
      rollTgt(actor, name, {attaque:atk, strategie:strategie}, t);
    }
  } else if(type === 'attaque' && tgt !== undefined && !atk.noAtk) {
    result = {};

    for(let t of game.user.targets.ids) {
      let roll = await rollAtkTgt(actor, name, total, {attaque:atk, strategie:strategie}, t, {alt:hasAlt});
      result[t] = roll;
    }
  } else if(type === 'attaque' && tgt === undefined && !atk.noAtk) rollAtk(actor, name, total, {attaque:atk, strategie:strategie}, {alt:hasAlt});
  else if(type === 'attaque' && atk.noAtk) rollWAtk(actor, name, {attaque:atk, strategie:strategie});
  else rollStd(actor, name, total, {shift:hasShift, alt:hasAlt});

  return result;
};

async function RollMacroPwr(actorId, sceneId, tokenId, id, author, event) {
  const actor = tokenId === 'null' ? game.actors.get(actorId) : game.scenes.get(sceneId).tokens.find(token => token.id === tokenId).actor;
  const hasShift = event.shiftKey;
  const hasAlt = event.altKey;
  
  rollPwr(actor, id, {shift:hasShift, alt:hasAlt});
};

Hooks.on("renderPause", function () {
  const whatPause = game.settings.get("mutants-and-masterminds-3e", "pauselogo");

  if(whatPause !== 'default') {
    $("#pause img").remove();
    $("#pause figcaption").remove();
    
    const pause = $("#pause video");
    
    if(pause.length === 0) $("#pause").append(`<video width="300" height="200" loop autoplay="autoplay"><source src="systems/mutants-and-masterminds-3e/assets/pause/${whatPause}.webm" type="video/webm" /></video>`);
    else $("#pause video").attr('src', `systems/mutants-and-masterminds-3e/assets/pause/${whatPause}.webm`);
    $("#pause video")[0].load();
    $("#pause video")[0].play();
  }  
});

Hooks.once("dragRuler.ready", (SpeedProvider) => {
  class MM3SpeedProvider extends SpeedProvider {
      get colors() {
          return [
              {id: "walk", default: 0x00FF00, name: "MM3.Base"},
          ]
      }

      getRanges(token) {
        const baseSpeed = token.actor.system.vitesse.actuel;
        const speed = game.settings.get("mutants-and-masterminds-3e", "speedcalculate") ? speedCalc(baseSpeed) : baseSpeed;

        const ranges = [
          {range: speed, color: "walk"},
        ]

        return ranges
      }
  }

  dragRuler.registerSystem("mutants-and-masterminds-3e", MM3SpeedProvider)
});

Hooks.on('renderTokenHUD', (hud, html, actor) => {
  let toUpdate = undefined;

  if(actor.bar1.attribute === 'blessure') toUpdate = 'bar1';
  if(actor.bar2.attribute === 'blessure') toUpdate = 'bar2';

  if(toUpdate !== undefined) html.find(`input[name="${toUpdate}.value"]`).prop("type", "number");
});

Hooks.on("canvasInit", function () {
  canvas.grid.diagonalRule = game.settings.get("mutants-and-masterminds-3e", "diagonalMovement");
  SquareGrid.prototype.measureDistances = measureDistances;
});