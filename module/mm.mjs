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
import { RegisterSettings } from "./settings.mjs";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { MM3 } from "./helpers/config.mjs";
import toggler from './helpers/toggler.js';

import {
  rollAtkTgt,
  rollAtk,
  rollStd,
  rollPwr,
  rollTgt,
  rollWAtk,
  rollVs,
} from "./helpers/common.mjs";

import { MigrationMM3 } from "./migration.mjs";

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
    RollMacro,
    RollMacroPwr,
    config:MM3
  };

  // Add custom constants for configuration.
  CONFIG.MM3 = MM3;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
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
    icon:"systems/mutants-and-masterminds-3e/assets/icons/tired.svg"
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
    icon:"systems/mutants-and-masterminds-3e/assets/icons/defenseless.svg"
  },
  {
    id:'transformed',
    label:'MM3.STATUS.Transformed',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/transformed.svg"
  },
  {
    id:'vulnerability',
    label:'MM3.STATUS.Vulnerability',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/vulnerability.svg"
  },
  {
    id:'prone',
    label:'MM3.STATUS.Prone',
    icon:"icons/svg/falling.svg"
  },
  {
    id:'blind',
    label:'MM3.STATUS.Blind',
    icon:"icons/svg/blind.svg"
  },
  {
    id:'chanceling',
    label:'MM3.STATUS.Chanceling',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/chanceling.svg"
  },
  {
    id:'sleep',
    label:'MM3.STATUS.Asleep',
    icon:"icons/svg/sleep.svg"
  },
  {
    id:'restrain',
    label:'MM3.STATUS.Restrained',
    icon:"icons/svg/net.svg"
  },
  {
    id:'enthralled',
    label:'MM3.STATUS.Enthralled',
    icon:"icons/svg/sun.svg"
  },
  {
    id:'exhausted',
    label:'MM3.STATUS.Exhausted',
    icon:"icons/svg/unconscious.svg"
  },
  {
    id:'tied',
    label:'MM3.STATUS.Tied',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/tied.svg"
  },
  {
    id:'dying',
    label:'MM3.STATUS.Dying',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/dying.svg"
  },
  {
    id:'neutralized',
    label:'MM3.STATUS.Neutralized',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/neutralized.svg"
  },
  {
    id:'paralysis',
    label:'MM3.STATUS.Paralysis',
    icon:"icons/svg/paralysis.svg"
  },
  {
    id:'deaf',
    label:'MM3.STATUS.Deaf',
    icon:"icons/svg/deaf.svg"
  },
  {
    id:'surprised',
    label:'MM3.STATUS.Surprised',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/surprised.svg"
  },
  {
    id:'stun',
    label:'MM3.STATUS.Stunned',
    icon:"systems/mutants-and-masterminds-3e/assets/icons/stunned.svg"
  },
  ];

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

  Handlebars.registerHelper('translate', function(where, tra) {
    try {
      let translation = CONFIG.MM3;
      const levels = where.split(".");
      for(let i = 0; i < levels.length; i++) {
        translation = translation[levels[i]];
      }
      return game.i18n.localize(translation[tra]);

    } catch (error) {
      console.error(`Error translating ${tra} in ${where}: ${error}`);
      return "";
    }
  });
  
  Handlebars.registerHelper('mm3concat', function(base, id, last) {
    return `${base}.${id}.${last}`;
  });
  
  Handlebars.registerHelper('isHigherThan', function(base, compare) {
    return base > compare ? true : false;
  });

  Handlebars.registerHelper('isHigherOrEqual', function(base, compare) {
    return base >= compare ? true : false;
  });

  Handlebars.registerHelper('marge', function(base, toSubstract) {
    return Math.floor((base - toSubstract) / 5);
  });

  Handlebars.registerHelper('isValue', function(base, compare) {
    return base === compare ? true : false;
  }); 
  Handlebars.registerHelper('isNotValue', function(base, compare) {
    return base !== compare ? true : false;
  });

  Handlebars.registerHelper('getAtt', function(root, what, id, data) {
    return root.systemData.competence[what].list[id][data];
  });

  Handlebars.registerHelper('getPwrAlt', function(root, folder, key) {
    return root.actor[folder][key];
  });

  Handlebars.registerHelper('getPwr', function(root, id, what) {
    const result = root.systemData?.pwr?.[id]?.cout?.[what] ?? 0;

    return result;
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
  Object.defineProperty(game.user, "isFirstGM", {
    get: function () {
        return game.user.isGM && game.user.id === game.users.find((u) => u.active && u.isGM)?.id;
    },
  });

  if (game.user.isFirstGM && MigrationMM3.needUpdate(MigrationMM3.NEEDED_VERSION)) {
    MigrationMM3.migrateWorld({ force: false }).then();
  }

  Hooks.on("hotbarDrop", (bar, data, slot) => createMacro(bar, data, slot));
});

Hooks.on('deleteItem', doc => toggler.clearForId(doc.id));
Hooks.on('deleteActor', doc => toggler.clearForId(doc.id));

Hooks.on('renderChatMessage', (message, html, data) => {
  const isInitiative = message?.flags?.core?.initiativeRoll ?? false;
  const toHide = $(html.find('div.toHide'));
  const btn = $(html.find('button.btnRoll'));
  const isExist = btn.length > 0 ? true : false;
  const user = game.user;

  if(isExist && !user.isGM) {
    const target = $(btn[0]);
    const tgt = target.data('target');
    const token = canvas.scene.tokens.find(token => token.id === tgt);

    if(token.actor.ownership[game.user.id] !== 3 && token.actor.ownership.default !== 3) target.hide();
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

      const token = canvas.scene.tokens.find(token => token.id === tgt);

      if(token.actor.ownership[game.user.id] !== 3 && token.actor.ownership.default !== 3) return;

      const tokenData = token.actor.system;
      const saveScore = tokenData.defense[savetype].total;
      const name = `${game.i18n.localize(CONFIG.MM3.defenses[savetype])}`;

      rollVs(token.actor, name, saveScore, vs);
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

async function createMacro(bar, data, slot) {
  // Create the macro command
  const type = data.type;
  const label = data.label;
  const actorId = data.actorId;
  const sceneId = data.sceneId;
  const tokenId = data.tokenId;
  const what = data?.what ?? "";
  const id = data?.id ?? -1;
  const author = data?.author ?? 'personnage';
  const command = type === 'pouvoir' ? `game.mm3.RollMacroPwr("${actorId}", "${sceneId}", "${tokenId}", "${id}", "${author}");` : `game.mm3.RollMacro("${actorId}", "${sceneId}", "${tokenId}", "${type}", "${what}", "${id}", "${author}");`;

  let img = "";

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

async function RollMacro(actorId, sceneId, tokenId, type, what, id, author) {
  const actor = tokenId === 'null' ? game.actors.get(actorId) : game.scenes.get(sceneId).tokens.find(token => token.id === tokenId).actor;
  const data = actor.system;
  const tgt = game.user.targets.ids[0];
  const dataStr = data?.strategie?.total ?? {attaque:0, effet:0};
  const strategie = {attaque:dataStr.attaque, effet:dataStr.effet}
  
  const atk = id === '-1' || id === -1 ? {noAtk:false} : actor.system.attaque[id];
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
        name = game.i18n.localize(CONFIG.MM3.competences[what]);
        total = data[type][what].total;
      }
      break;
    
    case 'attaque':
      const typeAtk = atk.type;
      const idAtk = atk.id;

      if(typeAtk === 'combatcontact' || typeAtk === 'combatdistance') {
        name = data.competence[typeAtk].list[idAtk].label;
        total = data.competence[typeAtk].list[idAtk].total;
      } else if(typeAtk === 'other') {
        name = atk.label;
        total = atk.attaque;
      }
      break;
  }

  if(type === 'attaque' && tgt !== undefined && atk.noAtk) rollTgt(actor, name, {attaque:atk, strategie:strategie}, tgt);
  else if(type === 'attaque' && tgt !== undefined && !atk.noAtk) rollAtkTgt(actor, name, total, {attaque:atk, strategie:strategie}, tgt);
  else if(type === 'attaque' && tgt === undefined && !atk.noAtk) rollAtk(actor, name, total, {attaque:atk, strategie:strategie});
  else if(type === 'attaque' && atk.noAtk) rollWAtk(actor, name, {attaque:atk, strategie:strategie});
  else rollStd(actor, name, total);
};

async function RollMacroPwr(actorId, sceneId, tokenId, id, author) {
  const actor = tokenId === 'null' ? game.actors.get(actorId) : game.scenes.get(sceneId).tokens.find(token => token.id === tokenId).actor;
  
  rollPwr(actor, id);
};