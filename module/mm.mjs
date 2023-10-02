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
} from "./helpers/common.mjs";

import {
  EditAttaque,
} from "./dialog/edit-attaque.mjs";

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
      const typeAtk = target.data('type');
      const hasAlt = ev.altKey;

      const token = canvas.scene.tokens.find(token => token.id === tgt);

      if(token.actor.ownership[game.user.id] !== 3 && token.actor.ownership.default !== 3) return;

      const tokenData = token.actor.system;
      const saveScore = tokenData.defense[savetype].total;
      const name = `${game.i18n.localize(CONFIG.MM3.defenses[savetype])}`;

      rollVs(token.actor, name, saveScore, vs, {typeAtk:typeAtk, atk:dataAtk, tkn:token}, {alt:hasAlt});      
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
  if(actor.type !== 'personnage') return;

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
  
  const atk = id === '-1' || id === -1 ? {noAtk:false} : game.mm3.getAtk(actor, id).data;
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