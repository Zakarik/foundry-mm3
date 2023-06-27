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
  };

  // Add custom constants for configuration.
  CONFIG.MM3 = MM3;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  RegisterSettings();

  const dices = game.settings.get("mutants-and-masterminds-3e", "typeroll");

  CONFIG.Combat.initiative = {
    formula: dices+"+@initiative.total",
    decimals: 2
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
  
  Handlebars.registerHelper('concat', function(base, id, last) {
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

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.on('deleteItem', doc => toggler.clearForId(doc.id));
Hooks.on('deleteActor', doc => toggler.clearForId(doc.id));

Hooks.on('renderChatMessage', (message, html, data) => {
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

      const dices = game.settings.get("mutants-and-masterminds-3e", "typeroll");      
      const tokenData = token.actor.system;
      const saveScore = tokenData.defense[savetype].total;
      const formulaSave = `${dices} + ${saveScore}`;
      const save = new Roll(formulaSave);
      save.evaluate({async:false});

      const saveTotal = Number(save.total);
      const margeBrut = vs-saveTotal;
      const hasMarge = margeBrut >= 0 ? true : false;
      const marge = margeBrut >= 0 ? Math.floor(margeBrut / 5)+1 : false;

      const pRollSave = {
        flavor:`${game.i18n.localize(CONFIG.MM3.defenses[savetype])}`,
        tooltip:await save.getTooltip(),
        formula:formulaSave,
        result:save.total,
        isGM:game.user.isGM,
        vs:vs,
        hasMarge:hasMarge,
        resultMarge:marge
      };

      const saveMsgData = {
        speaker: {
          actor: token?.actor?.id || null,
          token: token?.actor?.token?.id || null,
          alias: token?.actor?.name || null,
        },
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls:[save],
        content: await renderTemplate('systems/mutants-and-masterminds-3e/templates/roll/std.html', pRollSave),
        sound: CONFIG.sounds.dice
      };
      const rMode = game.settings.get("core", "rollMode");
      const msgDataSave = ChatMessage.applyRollMode(saveMsgData, rMode);
    
      await ChatMessage.create(msgDataSave, {
        rollMode:rMode
      });
  });
});

/*Hooks.once("ready", NautilusHooks.ready);

Hooks.once("ready", async function() {
  Hooks.on("hotbarDrop", (bar, data, slot) => createMacro(bar, data, slot));
});

async function createMacro(bar, data, slot) {
  // Create the macro command

  const type = data.type;
  const label = data.label;
  const actorId = data.actorId;
  const wpnId = data.wpn;
  const aptitude = data.aptitude;
  const specialite = data.specialite;
  const command = type === 'vaisseaux' ? `game.nautilus.RollVaisseauxMacro("${actorId}", "${aptitude}", "${specialite}", "${wpnId}");` : `game.nautilus.RollPersonnageMacro("${actorId}", "${aptitude}", "${specialite}", "${wpnId}");`;

  let img = "";

  console.log(specialite);

  if(wpnId !== false) img = game.actors.get(actorId).items.get(wpnId).img;
  else if(specialite !== false) img = "systems/nautilus/assets/icons/dices.svg";

  let macro = await Macro.create({
    name: label,
    type: "script",
    img: img,
    command: command,
    flags: { "nautilus.attributMacro": true }
  });
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

async function RollPersonnageMacro(actorid, aptitude, spe, wpn) {
  const speaker = ChatMessage.getSpeaker();

  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  if (!actor) actor = game.actors.get(actorid);

  const type = actor.type;
  const getData = actor.system;
  const getDWpn = wpn === 'false' ? {} : actor.items.get(wpn);
  const key = aptitude;
  const data = getData.aptitudes[key];
  const label = game.i18n.localize(CONFIG.NAUTILUS.aptitudes[key]);
  const bValue = data.value
  const specialites = data.specialites;
  const pression = getData.pression.value;
  const sante = getData.sante.value;
  const getVM = getData.valeursmorales;
  const getNameWpn = wpn === 'false' ? "" : getDWpn.name;
  const getDataWpn = wpn === 'false' ? false : getDWpn.system;
  const vm = CONFIG.NAUTILUS.vm;
  const lvm = [`<option value="" selected></option>`];
  const tvm = [];
  const isContact = key === 'sebattre' ? true : false;
  let bvm = {};

  let specialite = "";

  if(Object.keys(specialites).length > 0) {
    if(!spe) {
      specialite = `<label class="spe"><input type="radio" class="specialite" name="specialite" value="aucune" checked /><span>${game.i18n.localize("NAUTILUS.ROLL.ASK.Aucune")}</span></label>`
    } else {
      specialite = `<label class="spe"><input type="radio" class="specialite" name="specialite" value="aucune" /><span>${game.i18n.localize("NAUTILUS.ROLL.ASK.Aucune")}</span></label>`
    }
  }


  for(let key in specialites) {
    const data = specialites[key];
    const name = data.name;
    const value = data.value;
    const description = data.description;

    if(spe !== false) {
      if(key === spe) specialite += `<label class="spe" title="${description}"><input type="radio" class="specialite" name="specialite" value="${key}" checked /><span>${name} ${value}R</span></label>`;
      else specialite += `<label class="spe" title="${description}"><input type="radio" class="specialite" name="specialite" value="${key}" /><span>${name} ${value}R</span></label>`;
    } else {
      specialite += `<label class="spe" title="${description}"><input type="radio" class="specialite" name="specialite" value="${key}" /><span>${name} ${value}R</span></label>`;
    }
  }

  if(type === 'heritier') {
    for(let key in vm) {
      const t = game.i18n.localize(vm[key]);
      tvm.push(t);
      bvm[t] = key;
    }

    tvm.sort();

    for(let i = 0;i < tvm.length;i++) {
      const translate = tvm[i];
      const brut = bvm[translate];

      if(+getVM[brut].value > 0) lvm.push(`<option value="${brut}">${translate}</option>`);

      if(brut === getVM.commune) lvm.push(`<option value="${brut}_cm">${translate} (${game.i18n.localize(`NAUTILUS.PERSONNAGE.VALEURSMORALES.Commune`)})</option>`);
    }
  }

  const dataAsk = {
    specialite:specialite,
    vm:lvm.length > 1 ? lvm.join(' ') : false
  };
  const dialogAsk = await renderTemplate("systems/nautilus/templates/ask/roll.html", dataAsk);
  const askOptions = {
    classes: ["nautilus-roll-ask"],
    width: 300,
  };

  let d = new Dialog({
    title: `${game.i18n.localize(`NAUTILUS.ROLL.ASK.LabelMS`)}`,
    content:dialogAsk,
    buttons: {
      one: {
      icon: '<i class="fas fa-check"></i>',
      label: `${game.i18n.localize(`NAUTILUS.ROLL.ASK.Roll`)}`,
      callback: async (event) => {
          const target = $(event);
          const mod = target?.find('input.mod').val();
          const speSelected = target?.find('[name="specialite"]:checked').val();
          const vmSelected = target?.find('select.uvm').val();
          const vmBonus = vmSelected !== '' && vmSelected !== undefined ? 1 : 0;

          let santeMalus = 0;

          if(type === 'heritier' && sante <= 3) {
            santeMalus = 1;
          } else if(type !== 'heritier' && getData.sante.list[`s${sante}`].malus !== 'false') {
            santeMalus = getData.sante.list[`s${sante}`].malus
          }

          const value = +bValue + +mod + vmBonus - santeMalus;
          const firstRoll = await game.nautilus.doRoll(value, pression);
          const firstTotal = firstRoll.roll.total;
          let formula = firstRoll.formula;

          if(speSelected !== undefined && speSelected !== 'aucune') {
            const speName = specialites[speSelected].name;
            const speValue = specialites[speSelected].value;
            const speLabel = wpn === 'false' ? `${speName} (${label})` : `${speName} (${label}) - ${getNameWpn}`;
            let mergeResults;

            if(firstTotal === value) {
              const explode = await game.nautilus.doRoll(speValue, pression, sante);
              mergeResults = [...firstRoll.roll.dice[0].results, ...explode.roll.dice[0].results];
              formula += ` (${game.i18n.localize(`NAUTILUS.ROLL.Base`)}) + ${explode.formula} (${game.i18n.localize(`NAUTILUS.ROLL.Specialite`)})`;

              let r1 = [];

              for(let i = 0;i < mergeResults.length;i++) {
                const dS = mergeResults[i];

                if(dS.result === 1) r1.push(i);
              }

              game.nautilus.personnages.createRollMsg(actor, speLabel, mergeResults, formula, firstTotal+explode.roll.total, specialites, r1, getDataWpn, vmSelected, isContact);
            } else {
              let toR = value-firstTotal;

              if(speValue < toR) toR = speValue;

              const relance = await game.nautilus.doRoll(toR, pression, sante);

              let r1 = [];
              let rO = [];
              let rF = [];

              for(let i = 0;i < firstRoll.roll.dice[0].results.length;i++) {
                const dS = firstRoll.roll.dice[0].results[i];

                rF.push(dS);

                if(dS.result === 1) r1.push(i);
                else if(dS.success === false) rO.push(i);
              }

              for(let i = 0;i < relance.roll.dice[0].results.length;i++) {
                if(r1.length !== 0) {
                  rF[r1[0]].active = false;
                  r1.splice(0, 1);
                  rF.push(relance.roll.dice[0].results[i]);
                } else {
                  rF[rO[0]].active = false;
                  rO.splice(0, 1);
                  rF.push(relance.roll.dice[0].results[i]);
                }
              }

              game.nautilus.personnages.createRollMsg(actor, speLabel, rF, formula, firstTotal+relance.roll.total, specialites, r1, getDataWpn, vmSelected, isContact);
            }

          } else {
            let r1 = [];

            for(let i = 0;i < firstRoll.roll.dice[0].results.length;i++) {
              const dS = firstRoll.roll.dice[0].results[i];

              if(dS.result === 1) r1.push(i);
            }

            const baseLabel = wpn === 'false' ? label : `${label} - ${getNameWpn}`;

            game.nautilus.personnages.createRollMsg(actor, baseLabel, firstRoll.roll.dice[0].results, formula, firstTotal, specialites, r1, getDataWpn, vmSelected, isContact);
          }
        }
      },
      two: {
      icon: '<i class="fas fa-times"></i>',
      label: `${game.i18n.localize(`NAUTILUS.ROLL.ASK.Cancel`)}`,
      callback: () => {}
      }
    },
    default: "two",
    },
    askOptions);
  d.render(true);
}

async function RollVaisseauxMacro(actorid, aptitude, spe, wpn) {
  const speaker = ChatMessage.getSpeaker();

  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  if (!actor) actor = game.actors.get(actorid);
  const gData = actor;
  const getData = gData.system;
  const listActors = game.actors;

  const lHeritiers = [];
  const lEquipage = [];
  const lRoll = {
    manoeuvre:{
      value:[0],
      maniabilite:[0],
      plonger:[0],
    },
    endurance:{
      value:[0],
      chasse:[0],
      coque:[0],
    },
    puissance:{
      value:[0],
      eperonnage:[0],
    },
    detection:{
      value:[0],
      fanal:[0]
    }
  };

  for(let i of listActors) {
    const type = i.type;

    switch(type) {
      case 'heritier':
        lHeritiers.push({name:i.name, role:i.system.role, id:i._id})
        break;

      case 'equipage':
        lEquipage.push({name:i.name, role:i.system.role, id:i._id})
        break;
    }
  }

  for (let i of actor.items) {
    if (i.type === 'amelioration' && getData.options.isnautilus) {
      const bRoll = i.system.roll;

      if(bRoll.actif) {
        if(bRoll.aptitude !== '' && bRoll.specialite === '') lRoll[bRoll.aptitude]['value'].push(bRoll.value);
        else if(bRoll.aptitude !== '' && bRoll.specialite !== '') lRoll[bRoll.aptitude][bRoll.specialite].push(bRoll.value);
      }
    }
  }

  const key = aptitude;
  const data = getData.aptitudes[key];
  const label = game.i18n.localize(CONFIG.NAUTILUS.aptitudes[key]);
  const bValue = data.value
  const specialites = data.specialites;
  const pression = getData.pression.value;
  const sante = getData.sante;
  const getDWpn = wpn !== 'false' ? actor.items.get(wpn) : {};

  const heritiers = lHeritiers.sort((a, b) => (a.name > b.name ? 1 : -1));
  const vm = CONFIG.NAUTILUS.vm;
  const lvm = [`<option value="" selected></option>`];
  const tvm = [];
  const lheritier = [`<option value="" selected></option>`];
  let bvm = {};
  let getNameWpn = '';
  let getDataWpn = false;

  if(wpn !== 'false') {
    getNameWpn = `<br/>${getDWpn.name}`;
    getDataWpn = getDWpn.type === 'armement' ? getDWpn.system : {degats:getDWpn.system.distance.degats};
  }

  let specialite = "";

  if(Object.keys(specialites).length > 0) {
    if(spe !== 'false') specialite = `<label class="spe"><input type="radio" class="specialite" name="specialite" value="aucune" /><span>${game.i18n.localize("NAUTILUS.ROLL.ASK.Aucune")}</span></label>`;
    else specialite = `<label class="spe"><input type="radio" class="specialite" name="specialite" value="aucune" checked /><span>${game.i18n.localize("NAUTILUS.ROLL.ASK.Aucune")}</span></label>`;
  }

  for(let key in specialites) {
    const name = specialites[key].name;
    const value = specialites[key].value;

    if(key === spe) {
      specialite += `<label class="spe"><input type="radio" class="specialite" name="specialite" value="${key}" checked/><span>${name} ${value}R</span></label>`;
    } else {
      specialite += `<label class="spe"><input type="radio" class="specialite" name="specialite" value="${key}" /><span>${name} ${value}R</span></label>`;
    }
  }

  for(let key in vm) {
    const t = game.i18n.localize(vm[key]);
    tvm.push(t);
    bvm[t] = key;
  }

  tvm.sort();

  for(let i = 0;i < tvm.length;i++) {
    const translate = tvm[i];
    const brut = bvm[translate];

    lvm.push(`<option value="${brut}">${translate}</option>`);
  }

  for(let i = 0;i < heritiers.length;i++) {
    lheritier.push(`<option value="${heritiers[i].id}">${heritiers[i].name} (${heritiers[i].role})</option>`);
  }

  const dataAsk = {
    specialite:specialite,
    vm:lvm.length > 1 ? lvm.join(' ') : false,
    heritiers:lheritier.join(' ')
  };
  const dialogAsk = await renderTemplate("systems/nautilus/templates/ask/roll-nautilus.html", dataAsk);
  const askOptions = {
    classes: ["nautilus-roll-nautilus-ask"],
    width: 450,
  };

  let d = new Dialog({
    title: `${game.i18n.localize(`NAUTILUS.ROLL.ASK.LabelMS`)}`,
    content:dialogAsk,
    buttons: {
      one: {
      icon: '<i class="fas fa-check"></i>',
      label: `${game.i18n.localize(`NAUTILUS.ROLL.ASK.Roll`)}`,
      callback: async (event) => {
          const target = $(event);
          const mod = target?.find('input.mod').val();
          const speSelected = target?.find('[name="specialite"]:checked').val();
          const heritierSelected = target?.find('select.heritier').val();
          const vmSelected = target?.find('select.uvm').val();
          const vmBonus = vmSelected !== '' && heritierSelected !== '' && vmSelected !== undefined ? 1 : 0;
          const santeMalus = sante.list[`s${sante.value}`].malus === 'false' ? 0 : +sante.list[`s${sante.value}`].malus;
          const amelioration = speSelected !== undefined && speSelected !== 'aucune' ? lRoll[key][specialites[speSelected].label].reduce((accumulator, currentValue) => accumulator + currentValue, 0) : lRoll[key].value.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
          const value = +bValue + +mod + vmBonus - santeMalus + amelioration;
          const firstRoll = await game.nautilus.doRoll(value, pression);
          const firstTotal = firstRoll.roll.total;
          const getHeritier = heritierSelected === '' ? '' : game.actors.get(heritierSelected);
          const getHeritierName = getHeritier !== '' ? `<br/>${getHeritier.name}` : '';
          let formula = firstRoll.formula;

          if(vmBonus === 1) {

            const getVM = getHeritier.system.valeursmorales[vmSelected];

            if(getVM.value > 0) { getHeritier.update({[`system.valeursmorales.${vmSelected}.value`]:+getVM.value-1}); }
            else {
              const baseData = {
                flavor:`${label}${getHeritierName}`,
                main:{
                  empty:true,
                  text:game.i18n.localize('NAUTILUS.ROLL.VMEpuisee')
                }
              };

              const msgData = {
                user: game.user.id,
                speaker: {
                  actor: this.actor?.id || null,
                  token: this.actor?.token?.id || null,
                  alias: this.actor?.name || null,
                },
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                content: await renderTemplate('systems/nautilus/templates/msg/roll.html', baseData),
                sound: CONFIG.sounds.dice
              };

              const rMode = game.settings.get("core", "rollMode");
              const msgTotalData = ChatMessage.applyRollMode(msgData, rMode);

              const msg = await ChatMessage.create(msgTotalData, {
                rollMode:rMode
              });

              return;
            }
          }

          if(speSelected !== undefined && speSelected !== 'aucune') {
            const speName = specialites[speSelected].name;
            const speValue = +specialites[speSelected].value;
            const speLabel = `${speName} (${label})${getHeritierName}${getNameWpn}`;
            let mergeResults;

            if(firstTotal === value) {
              const explode = await game.nautilus.doRoll(speValue, pression);
              mergeResults = [...firstRoll.roll.dice[0].results, ...explode.roll.dice[0].results];
              formula += ` (${game.i18n.localize(`NAUTILUS.ROLL.Base`)}) + ${explode.formula} (${game.i18n.localize(`NAUTILUS.ROLL.Specialite`)})`;

              let r1 = [];

              for(let i = 0;i < mergeResults.length;i++) {
                const dS = mergeResults[i];

                if(dS.result === 1) r1.push(i);
              }

              game.nautilus.vaisseaux.createRollMsg(actor, speLabel, mergeResults, formula, firstTotal+explode.roll.total, specialites, r1, getDataWpn, vmSelected);
            } else {
              let toR = value-firstTotal;

              if(speValue < toR) toR = speValue;

              const relance = await game.nautilus.doRoll(toR, pression);

              let r1 = [];
              let rO = [];
              let rF = [];

              for(let i = 0;i < firstRoll.roll.dice[0].results.length;i++) {
                const dS = firstRoll.roll.dice[0].results[i];

                rF.push(dS);

                if(dS.result === 1) r1.push(i);
                else if(dS.success === false) rO.push(i);
              }

              for(let i = 0;i < relance.roll.dice[0].results.length;i++) {
                if(r1.length !== 0) {
                  rF[r1[0]].active = false;
                  r1.splice(0, 1);
                  rF.push(relance.roll.dice[0].results[i]);
                } else {
                  rF[rO[0]].active = false;
                  rO.splice(0, 1);
                  rF.push(relance.roll.dice[0].results[i]);
                }
              }

              game.nautilus.vaisseaux.createRollMsg(actor, speLabel, rF, formula, firstTotal+relance.roll.total, specialites, r1, getDataWpn, vmSelected);
            }

          } else {
            let r1 = [];

            for(let i = 0;i < firstRoll.roll.dice[0].results.length;i++) {
              const dS = firstRoll.roll.dice[0].results[i];

              if(dS.result === 1) r1.push(i);
            }

            game.nautilus.vaisseaux.createRollMsg(actor, `${label}${getHeritierName}${getNameWpn}`, firstRoll.roll.dice[0].results, formula, firstTotal, specialites, r1, getDataWpn, vmSelected);
          }
        }
      },
      two: {
      icon: '<i class="fas fa-times"></i>',
      label: `${game.i18n.localize(`NAUTILUS.ROLL.ASK.Cancel`)}`,
      callback: () => {}
      }
    },
    default: "two",
    },
    askOptions);
  d.render(true);
}

async function doRoll(value, pression) {
  let val = value;

  if(val < 0) val = 0;

  const formula = `${val}D10>=${pression}`;

  let r = new Roll(`${val}D10cs>=${pression}`);

  await r.evaluate({async:true});

  return {roll:r, formula:formula};
}

async function createRollMsgPersonnage(actor, label, lDices, formula, total, specialites, r1, wpn=false, hasVm='', isContact=false) {
  const type = actor.type;
  const gForcer = +actor.system.bonus.contact;
  const gSante = actor.system.sante;
  const vSante = gSante.value;
  const lSante = type === 'heritier' ? gSante.list[`s${vSante}`].consequence : `${gSante.list[`s${vSante}`].notes}`;

  let dices = [];
  let spec = [];

  for (let key in specialites) {
    spec.push(`${specialites[key].name} ${specialites[key].value}R`);
  }

  for(let i = 0;i < lDices.length;i++) {
    const dS = lDices[i];

    if(dS.success) {
      dices.push(`<li class="roll die d10 success" data-num="${i}">${dS.result}</li>`);
    } else {
      if(!dS.active) dices.push(`<li class="roll die d10 discarded" data-num="${i}">${dS.result}</li>`);
      else dices.push(`<li class="roll die d10" data-num="${i}">${dS.result}</li>`);
    }
  }

  const tooltip = `
  <div class="dice-tooltip">
    <section class="tooltip-part">
        <div class="dice">
            <header class="part-header flexrow">
                <span class="part-formula">${formula}</span>

                <span class="part-total">${total}</span>
            </header>
            <ol class="dice-rolls">
                ${dices.join(' ')}
            </ol>
        </div>
    </section>
  </div>`;

  let result;

  if(total >= 5) result = game.i18n.localize(`NAUTILUS.ROLL.ReussiteExceptionnelle`);
  else if(total >= 2 && total <= 4) result = game.i18n.localize(`NAUTILUS.ROLL.ReussiteTotale`);
  else if(total == 1) result = game.i18n.localize(`NAUTILUS.ROLL.ReussitePartielle`);
  else if(total == 0 && r1.length == 0) result = game.i18n.localize(`NAUTILUS.ROLL.Echec`);
  else if(total == 0 && r1.length == 1) result = game.i18n.localize(`NAUTILUS.ROLL.EchecRetentissant`);
  else if(total == 0 && r1.length > 1) result = game.i18n.localize(`NAUTILUS.ROLL.EchecCatastrophique`);

  let labelVm = '';

  if(hasVm !== '') {
    if(hasVm.includes('_cm')) {
      labelVm = `${game.i18n.localize(`NAUTILUS.PERSONNAGE.VALEURSMORALES.CommuneUse`)} : ${game.i18n.localize(CONFIG.NAUTILUS.vm[hasVm.split('_')[0]])}`;
    } else {
      labelVm = `${game.i18n.localize(`NAUTILUS.PERSONNAGE.VALEURSMORALES.ShortUse`)} : ${game.i18n.localize(CONFIG.NAUTILUS.vm[hasVm])}`;
      actor.update({[`system.valeursmorales.${hasVm}.value`]:+actor.system.valeursmorales[hasVm].value-1});
    }
  }

  const dgtsBonus = isContact && type === 'heritier' ? gForcer : 0;

  const baseData = {
    flavor:`${label}`,
    main:{
      total:total,
      tooltip:tooltip,
      specialites:spec.join(' / '),
      result:result,
      sante:lSante,
      wpn:!wpn ? false : true,
      degats:!wpn ? false : Math.max(+wpn.degats + dgtsBonus, 0),
      description:!wpn ? false : wpn?.description,
      vm:hasVm === '' ? false : labelVm
    }
  };

  console.log(gForcer);

  const msgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    content: await renderTemplate('systems/nautilus/templates/msg/roll.html', baseData),
    sound: CONFIG.sounds.dice
  };

  const rMode = game.settings.get("core", "rollMode");
  const msgTotalData = ChatMessage.applyRollMode(msgData, rMode);

  const msg = await ChatMessage.create(msgTotalData, {
    rollMode:rMode
  });
}

async function createRollMsgVaisseaux(actor, label, lDices, formula, total, specialites, r1, wpn=false, hasVm='') {
  const vSante = actor.system.sante.value;
  const sante = actor.system.sante.list[`s${vSante}`].notes;

  let dices = [];
  let spec = [];

  for (let key in specialites) {
    const label = specialites[key].name;
    const value = specialites[key].value;
    spec.push(`${label} ${value}R`);
  }

  for(let i = 0;i < lDices.length;i++) {
    const dS = lDices[i];

    if(dS.success) {
      dices.push(`<li class="roll die d10 success" data-num="${i}">${dS.result}</li>`);
    } else {
      if(!dS.active) dices.push(`<li class="roll die d10 discarded" data-num="${i}">${dS.result}</li>`);
      else dices.push(`<li class="roll die d10" data-num="${i}">${dS.result}</li>`);
    }
  }

  const tooltip = `
  <div class="dice-tooltip">
    <section class="tooltip-part">
        <div class="dice">
            <header class="part-header flexrow">
                <span class="part-formula">${formula}</span>

                <span class="part-total">${total}</span>
            </header>
            <ol class="dice-rolls">
                ${dices.join(' ')}
            </ol>
        </div>
    </section>
  </div>`;

  let result;

  if(total >= 5) result = game.i18n.localize(`NAUTILUS.ROLL.ReussiteExceptionnelle`);
  else if(total >= 2 && total <= 4) result = game.i18n.localize(`NAUTILUS.ROLL.ReussiteTotale`);
  else if(total == 1) result = game.i18n.localize(`NAUTILUS.ROLL.ReussitePartielle`);
  else if(total == 0 && r1.length == 0) result = game.i18n.localize(`NAUTILUS.ROLL.Echec`);
  else if(total == 0 && r1.length == 1) result = game.i18n.localize(`NAUTILUS.ROLL.EchecRetentissant`);
  else if(total == 0 && r1.length > 1) result = game.i18n.localize(`NAUTILUS.ROLL.EchecCatastrophique`);

  let labelVm = '';

  if(hasVm !== '') {
    if(hasVm.includes('_cm')) {
      labelVm = `${game.i18n.localize(`NAUTILUS.PERSONNAGE.VALEURSMORALES.CommuneUse`)} : ${game.i18n.localize(CONFIG.NAUTILUS.vm[hasVm.split('_')[0]])}`;
    } else {
      labelVm = `${game.i18n.localize(`NAUTILUS.PERSONNAGE.VALEURSMORALES.ShortUse`)} : ${game.i18n.localize(CONFIG.NAUTILUS.vm[hasVm])}`;
    }
  }

  const baseData = {
    flavor:`${label}`,
    main:{
      total:total,
      tooltip:tooltip,
      specialites:spec.join(' / '),
      result:result,
      sante:sante,
      wpn:!wpn ? false : true,
      degats:!wpn ? false : wpn.degats,
      description:!wpn ? false : wpn?.description,
      vm:hasVm === '' ? false : labelVm
    }
  };

  const msgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    content: await renderTemplate('systems/nautilus/templates/msg/roll.html', baseData),
    sound: CONFIG.sounds.dice
  };

  const rMode = game.settings.get("core", "rollMode");
  const msgTotalData = ChatMessage.applyRollMode(msgData, rMode);

  const msg = await ChatMessage.create(msgTotalData, {
    rollMode:rMode
  });
}*/