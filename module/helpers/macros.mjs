import {
    rollAtkTgt,
    rollAtk,
    rollStd,
    rollPwr,
    rollTgt,
    rollWAtk,
  } from "./common.mjs";

export async function createMacro(bar, data, slot) {
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

export async function RollMacro(actorId, sceneId, tokenId, type, what, id, author, event) {
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

export async function RollMacroPwr(actorId, sceneId, tokenId, id, author, event) {
const actor = tokenId === 'null' ? game.actors.get(actorId) : game.scenes.get(sceneId).tokens.find(token => token.id === tokenId).actor;
const hasShift = event.shiftKey;
const hasAlt = event.altKey;

rollPwr(actor, id, {shift:hasShift, alt:hasAlt});
};