export function getDices() {
  const optDices = game.settings.get("mutants-and-masterminds-3e", "typeroll");

  let dices = '1D20';
  let formula = '1D20';  
  let critique = '20';

  if(optDices === '3D20') { 
    dices = '3D20dldh'; 
    formula = '3D20';
    critique = '20';
  } else if(optDices === '3D6') { 
    dices = '3D6';
    formula = '3D6'
    critique = '18';
  }

  return {dices:dices, formula:formula, critique:critique};
}

export function getFullCarac(carac){
    let result = "";

    switch(carac) {
      case 'for':
        result = 'force';
        break;

      case 'agi':
        result = 'agilite';
        break;

      case 'cbt':
        result = 'combativite';
        break;

      case 'sns':
        result = 'sensibilite';
        break;

      case 'end':
        result = 'endurance';
        break;

      case 'dex':
        result = 'dexterite';
        break;

      case 'int':
        result = 'intelligence';
        break;

      case 'prs':
        result = 'presence';
        break;
    }

    return result;
}

export async function rollStd(actor, name, score) {
  const optDices = getDices();  
  const dicesCrit = optDices.critique;
  const dicesBase = optDices.dices;
  const dicesFormula = optDices.formula;
  let pRoll = {};

  const roll = new Roll(`${dicesBase} + ${score}`);
  roll.evaluate({async:false});

  const resultDie = roll.total-score;

  pRoll = {
    flavor:`${name}`,
    tooltip:await roll.getTooltip(),
    formula:`${dicesFormula} + ${score}`,
    result:roll.total,
    isCritique:resultDie >= dicesCrit ? true : false,
  };

  const rollMsgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls:[roll],
    content: await renderTemplate('systems/mutants-and-masterminds-3e/templates/roll/std.html', pRoll),
    sound: CONFIG.sounds.dice
  };

  const rMode = game.settings.get("core", "rollMode");
  const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

  await ChatMessage.create(msgData, {
    rollMode:rMode
  });
}

export async function rollVs(actor, name, score, vs) {
  const optDices = getDices();  
  const save = new Roll(`${optDices.dices} + ${score}`);
  save.evaluate({async:false});

  const saveTotal = Number(save.total);
  const saveDices = saveTotal-score;
  const isCritique = saveDices === optDices.critique ? true : false;
  const margeBrut = vs-saveTotal;
  const hasMarge = margeBrut >= 0 && !isCritique ? true : false;
  const marge = margeBrut >= 0 && !isCritique ? Math.floor(margeBrut / 5)+1 : false;
  let isSuccess = false;

  if(isCritique) isSuccess = true;
  else if(margeBrut < 0) isSuccess = true;

  const pRollSave = {
    flavor:`${name}`,
    tooltip:await save.getTooltip(),
    formula:`${optDices.formula} + ${score}`,
    result:save.total,
    isCritique:isCritique,
    vs:vs,
    isSuccess:isSuccess,
    hasMarge:hasMarge,
    resultMarge:marge
  };

  const saveMsgData = {
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
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
}

export async function rollAtkTgt(actor, name, score, data, tgt) {
  if(tgt === undefined) return;
  const optDices = getDices();
  const dicesBase = optDices.dices;
  const dicesFormula = optDices.formula;
  const token = canvas.scene.tokens.find(token => token.id === tgt);
  
  const dataCbt = data.attaque;
  const dataStr = data.strategie;
  const roll = new Roll(`${dicesBase} + ${score} + ${dataStr.attaque}`);
  roll.evaluate({async:false});

  const tokenData = token.actor.system;

  const resultDie = roll.total-score-dataStr.attaque;

  const parade = Number(tokenData.ddparade);
  const esquive = Number(tokenData.ddesquive);

  let ddDefense = 0;
  let traType = "";

  if(dataCbt.type === 'other') {
    const defpassive = dataCbt?.defpassive ?? 'parade';

    ddDefense = defpassive === 'parade' ? parade : esquive;
    traType = defpassive === 'parade' ? game.i18n.localize("MM3.DEFENSE.DDParade") : game.i18n.localize("MM3.DEFENSE.DDEsquive");
  } else {
    ddDefense = dataCbt.type === 'combatcontact' ? parade : esquive;
    traType = dataCbt.type === 'combatcontact' ? game.i18n.localize("MM3.DEFENSE.DDParade") : game.i18n.localize("MM3.DEFENSE.DDEsquive");
  }

  const saveType = dataCbt.save;

  let pRoll = {};
  
  if((roll.total >= ddDefense && resultDie !== 1) || resultDie >= dataCbt.critique) {
    pRoll = {
      flavor:`${name}`,
      tooltip:await roll.getTooltip(),
      formula:`${dicesFormula} + ${score} + ${dataStr.attaque}`,
      result:roll.total,
      isCombat:true,
      isSuccess:true,
      defense:ddDefense,
      isCritique:resultDie >= dataCbt.critique ? true : false,
      type:traType,
      text:dataCbt.text,
      btn:{
        target:tgt,
        saveType:saveType,
        vs:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
      }
    };
  } else {
    pRoll = {
      flavor:`${name}`,
      tooltip:await roll.getTooltip(),
      formula:`${dicesFormula} + ${score} + ${dataStr.attaque}`,
      result:roll.total,
      isCombat:true,
      isSuccess:false,
      defense:ddDefense,
      type:traType,
      text:dataCbt.text
    };
  }

  const rollMsgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls:[roll],
    content: await renderTemplate('systems/mutants-and-masterminds-3e/templates/roll/std.html', pRoll),
    sound: CONFIG.sounds.dice
  };

  const rMode = game.settings.get("core", "rollMode");
  const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

  await ChatMessage.create(msgData, {
    rollMode:rMode
  });
}

export async function rollTgt(actor, name, data, tgt) {
  if(tgt === undefined) return;  
  const dataCbt = data.attaque;
  const dataStr = data.strategie;  
  const saveType = dataCbt.save;

  let pRoll = {};
  
  pRoll = {
    flavor:`${name}`,
    isCombat:true,
    isSuccess:true,
    text:dataCbt.text,
    btn:{
      target:tgt,
      saveType:saveType,
      vs:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
    }
  };

  const rollMsgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    content: await renderTemplate('systems/mutants-and-masterminds-3e/templates/roll/std.html', pRoll),
    sound: CONFIG.sounds.dice
  };

  const rMode = game.settings.get("core", "rollMode");
  const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

  await ChatMessage.create(msgData, {
    rollMode:rMode
  });
}

export async function rollWAtk(actor, name, data) {
  const dataCbt = data.attaque;
  const dataStr = data.strategie;

  const pRoll = {
    flavor:`${name}`,
    effet:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
    text:dataCbt.text
  };

  const rollMsgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    content: await renderTemplate('systems/mutants-and-masterminds-3e/templates/roll/std.html', pRoll),
    sound: CONFIG.sounds.dice
  };

  const rMode = game.settings.get("core", "rollMode");
  const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

  await ChatMessage.create(msgData, {
    rollMode:rMode
  });
}

export async function rollAtk(actor, name, score, data) {
  const optDices = getDices();
  const dicesBase = optDices.dices;
  const dicesFormula = optDices.formula;

  const dataCbt = data.attaque;
  const dataStr = data.strategie;

  const roll = new Roll(`${dicesBase} + ${score} + ${dataStr.attaque}`);
  roll.evaluate({async:false});

  const resultDie = roll.total-score-dataStr.attaque;

  const pRoll = {
    flavor:`${name}`,
    tooltip:await roll.getTooltip(),
    formula:`${dicesFormula} + ${score} + ${dataStr.attaque}`,
    result:roll.total,
    isCritique:resultDie >= dataCbt.critique ? true : false,
    effet:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
    text:dataCbt.text
  };

  const rollMsgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls:[roll],
    content: await renderTemplate('systems/mutants-and-masterminds-3e/templates/roll/std.html', pRoll),
    sound: CONFIG.sounds.dice
  };

  const rMode = game.settings.get("core", "rollMode");
  const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

  await ChatMessage.create(msgData, {
    rollMode:rMode
  });
}

export async function rollPwr(actor, id) {
  const optDices = game.settings.get("mutants-and-masterminds-3e", "typeroll");
  const pwr = actor.items.filter(item => item.id === id)[0];
  const type = pwr.system.special;
  const rang = type === 'dynamique' ? actor.system.pwr[id].cout.rang : pwr.system.cout.rang;
  const name = pwr.name;
  const baseCrit = optDices === '3D6' ? 18 : 20;
  let dices = `1D20`;

  if(optDices === '3D20') dices = '3D20dldh';
  else if(optDices === '3D6') dices = '3D6';

  const formula = `${dices} + ${rang}`;      
  const roll = new Roll(formula);
  roll.evaluate({async:false});
  const resultDie = roll.total-rang;

  console.warn(pwr.system.descripteurs);

  const pRoll = {
    flavor:`${name}`,
    tooltip:await roll.getTooltip(),
    formula:optDices === '3D20' ? `3D20 + ${rang}` : formula,
    result:roll.total,
    isCritique:resultDie >= baseCrit ? true : false,
    action:pwr.system.action,
    portee:pwr.system.portee,
    duree:pwr.system.duree,
    descripteurs:Object.keys(pwr.system.descripteurs).length === 0 ? false : pwr.system.descripteurs,
    description:pwr.system.notes,
    effet:pwr.system.effets
  };

  const rollMsgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    rolls:[roll],
    content: await renderTemplate('systems/mutants-and-masterminds-3e/templates/roll/pwr.html', pRoll),
    sound: CONFIG.sounds.dice
  };

  const rMode = game.settings.get("core", "rollMode");
  const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

  await ChatMessage.create(msgData, {
    rollMode:rMode
  });
}