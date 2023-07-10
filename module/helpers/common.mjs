// Changes XML to JSON
export const xmlToJson = function (xml) {
  // Create the return object
  var obj = {};

  if (xml.nodeType == 1) { // element
      // do attributes
      if (xml.attributes.length > 0) {
          obj["@attributes"] = {};
          for (var j = 0; j < xml.attributes.length; j++) {
              var attribute = xml.attributes.item(j);
              obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
          }
      }
  } else if (xml.nodeType == 3) { // text
      obj = xml.nodeValue;
  }

  // do children
  if (xml.hasChildNodes()) {
      for (var i = 0; i < xml.childNodes.length; i++) {
          var item = xml.childNodes.item(i);
          var nodeName = item.nodeName;
          if (typeof (obj[nodeName]) == "undefined") {
              obj[nodeName] = xmlToJson(item);
          } else {
              if (typeof (obj[nodeName].push) == "undefined") {
                  var old = obj[nodeName];
                  obj[nodeName] = [];
                  obj[nodeName].push(old);
              }
              obj[nodeName].push(xmlToJson(item));
          }
      }
  }
  return obj;
};

export const parseXML = function (xml) {
  var dom = null;
  if (window.DOMParser) {
      try {
          dom = (new DOMParser()).parseFromString(xml, "text/xml");
      }
      catch (e) { dom = null; }
  }
  else if (window.ActiveXObject) {
      try {
          dom = new ActiveXObject('Microsoft.XMLDOM');
          dom.async = false;
          if (!dom.loadXML(xml)) // parse error ..

              window.alert(dom.parseError.reason + dom.parseError.srcText);
      }
      catch (e) { dom = null; }
  }
  else
      alert("cannot parse xml string!");
  return dom;
};

/*	This work is licensed under Creative Commons GNU LGPL License.

    License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
    Author:  Stefan Goessner/2006
    Web:     http://goessner.net/ 
*/
export const xml2json = function (xml, tab) {
  var X = {
      toObj: function (xml) {
          var o = {};
          if (xml.nodeType == 1) {   // element node ..
              if (xml.attributes.length)   // element with attributes  ..
                  for (var i = 0; i < xml.attributes.length; i++)
                      o["" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
              if (xml.firstChild) { // element has child nodes ..
                  var textChild = 0, cdataChild = 0, hasElementChild = false;
                  for (var n = xml.firstChild; n; n = n.nextSibling) {
                      if (n.nodeType == 1) hasElementChild = true;
                      else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                      else if (n.nodeType == 4) cdataChild++; // cdata section node
                  }
                  if (hasElementChild) {
                      if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                          X.removeWhite(xml);
                          for (var n = xml.firstChild; n; n = n.nextSibling) {
                              if (n.nodeType == 3)  // text node
                                  o["#text"] = X.escape(n.nodeValue);
                              else if (n.nodeType == 4)  // cdata node
                                  o["#cdata"] = X.escape(n.nodeValue);
                              else if (o[n.nodeName]) {  // multiple occurence of element ..
                                  if (o[n.nodeName] instanceof Array)
                                      o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                  else
                                      o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                              }
                              else  // first occurence of element..
                                  o[n.nodeName] = X.toObj(n);
                          }
                      }
                      else { // mixed content
                          if (!xml.attributes.length)
                              o = X.escape(X.innerXml(xml));
                          else
                              o["#text"] = X.escape(X.innerXml(xml));
                      }
                  }
                  else if (textChild) { // pure text
                      if (!xml.attributes.length)
                          o = X.escape(X.innerXml(xml));
                      else
                          o["#text"] = X.escape(X.innerXml(xml));
                  }
                  else if (cdataChild) { // cdata
                      if (cdataChild > 1)
                          o = X.escape(X.innerXml(xml));
                      else
                          for (var n = xml.firstChild; n; n = n.nextSibling)
                              o["#cdata"] = X.escape(n.nodeValue);
                  }
              }
              if (!xml.attributes.length && !xml.firstChild) o = null;
          }
          else if (xml.nodeType == 9) { // document.node
              o = X.toObj(xml.documentElement);
          }
          else
              alert("unhandled node type: " + xml.nodeType);
          return o;
      },
      toJson: function (o, name, ind) {
          var json = name ? ("\"" + name + "\"") : "";
          if (o instanceof Array) {
              for (var i = 0, n = o.length; i < n; i++)
                  o[i] = X.toJson(o[i], "", ind + "\t");
              json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
          }
          else if (o == null)
              json += (name && ":") + "null";
          else if (typeof (o) == "object") {
              var arr = [];
              for (var m in o)
                  arr[arr.length] = X.toJson(o[m], m, ind + "\t");
              json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
          }
          else if (typeof (o) == "string")
              json += (name && ":") + "\"" + o.toString() + "\"";
          else
              json += (name && ":") + o.toString();
          return json;
      },
      innerXml: function (node) {
          var s = ""
          if ("innerHTML" in node)
              s = node.innerHTML;
          else {
              var asXml = function (n) {
                  var s = "";
                  if (n.nodeType == 1) {
                      s += "<" + n.nodeName;
                      for (var i = 0; i < n.attributes.length; i++)
                          s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                      if (n.firstChild) {
                          s += ">";
                          for (var c = n.firstChild; c; c = c.nextSibling)
                              s += asXml(c);
                          s += "</" + n.nodeName + ">";
                      }
                      else
                          s += "/>";
                  }
                  else if (n.nodeType == 3)
                      s += n.nodeValue;
                  else if (n.nodeType == 4)
                      s += "<![CDATA[" + n.nodeValue + "]]>";
                  return s;
              };
              for (var c = node.firstChild; c; c = c.nextSibling)
                  s += asXml(c);
          }
          return s;
      },
      escape: function (txt) {
          return txt.replace(/[\\]/g, "\\\\")
              .replace(/[\"]/g, '\\"')
              .replace(/[\n]/g, '\\n')
              .replace(/[\r]/g, '\\r');
      },
      removeWhite: function (e) {
          e.normalize();
          for (var n = e.firstChild; n;) {
              if (n.nodeType == 3) {  // text node
                  if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                      var nxt = n.nextSibling;
                      e.removeChild(n);
                      n = nxt;
                  }
                  else
                      n = n.nextSibling;
              }
              else if (n.nodeType == 1) {  // element node
                  X.removeWhite(n);
                  n = n.nextSibling;
              }
              else                      // any other node
                  n = n.nextSibling;
          }
          return e;
      }
  };
  if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
  var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t").replace(/#quot;/g, "\\\"" );
  return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

function processChainedAdvantages(pwr) {
  let listBonusTalent = [];

  if(pwr.chainedadvantages?.chainedadvantage ?? null !== null) {
    if(Array.isArray(pwr.chainedadvantages.chainedadvantage)) {
      for(let adv of pwr.chainedadvantages.chainedadvantage) {
        listBonusTalent.push(adv.name);
      }
    } else {
      listBonusTalent.push(pwr.chainedadvantages.chainedadvantage.name);
    }    
  }
  
  return listBonusTalent;
}

function processTraitsMod(pwr) {
  let traitsMods = [];

  if(pwr?.traitmods?.traitmod ?? null !== null) {
    if(Array.isArray(pwr.traitmods.traitmod)) {
      for(let trait of pwr.traitmods.traitmod) {
        traitsMods.push(`${trait.name} ${trait.bonus}`);
      }
    } else {
      traitsMods.push(`${pwr.traitmods.traitmod.name} ${pwr.traitmods.traitmod.bonus}`);
    }
  }

  return `<p>${traitsMods.join(" / ")}</p>`;
}

function countPwr(objet, type, profondeur = 0) {
  const pwr = type === "otherpowers" ? objet?.otherpowers?.power ?? null : objet?.alternatepowers?.power ?? null;

  if(pwr !== null) {
    if(Array.isArray(pwr)) {
      for (let cle of pwr) {
        profondeur = Math.max(profondeur, countPwr(cle, type, profondeur + 1));
      }
    } else {
        profondeur = Math.max(profondeur, countPwr(pwr, type, profondeur + 1));
    } 
  }
  
  return profondeur;
}

async function processAlternatePower(actor, pwr, itm, otherpowers=false) {
  const alternate = otherpowers ? pwr?.otherpowers?.power ?? null : pwr?.alternatepowers?.power ?? null;
  const isOtherPower = otherpowers ? "standard" : "alternatif";
  const costNull = otherpowers ? true : false;
  let listTalents = [];

  if(alternate !== null) {
    if(Array.isArray(alternate)) {
      for(let aPwr of alternate) {
        const pPowers = await processPowers(actor, aPwr, true, isOtherPower, itm._id, costNull);
        listTalents = listTalents.concat(pPowers.talents);
      }
    } else {
      const pPowers = await processPowers(actor, alternate, true, isOtherPower, itm._id, costNull);
      listTalents = listTalents.concat(pPowers.talents);
    }
  } 

  return {
    talents:listTalents
  };
}

export async function processPowers(actor, pouvoirs, createItm=true, special="standard", link="", costNull=false) {
  let listBonusTalent = [];
  let listPwrName = [];
  let listPwrDetails = {};
  let listPwrWhoCanLostCost = [];
  let pwrName = '';
  let pwrDescription = '';

  if(pouvoirs !== null) {
    if(Array.isArray(pouvoirs)) {
      for(let pwr of pouvoirs) {
        const descriptors = {};
        const extras = {};
        const defauts = {};
        const pwrDescri = pwr.description === null ? "" : pwr.description;
        let description = pwrDescri !== "" ? `<p>${pwrDescri}</p>` : "";
        description += processTraitsMod(pwr);

        if(pwr.descriptors?.descriptor ?? null !== null) {
          if(Array.isArray(pwr.descriptors.descriptor)) {
            for(let dsc of pwr.descriptors.descriptor) {
              const index = Object.keys(descriptors).length;
              descriptors[index] = dsc.name
            }
          } else {
            const index = Object.keys(descriptors).length;
            descriptors[index] = pwr.descriptors.descriptor.name
          }
        }

        if(pwr.extras?.extra ?? null !== null) {
          if(Array.isArray(pwr.extras.extra)) {
            for(let xtr of pwr.extras.extra) {
              const index = Object.keys(extras).length;
              extras[index] = {
                name:xtr.name,
                data:{
                  type:"extra",
                  description:xtr.description,
                  cout:{
                    fixe:true,
                    rang:false,
                    value:0
                  }
                }
              }
            }
          } else {
            const index = Object.keys(extras).length;
              extras[index] = {
                name:pwr.extras.extra.name,
                data:{
                  type:"extra",
                  description:pwr.extras.extra.description,
                  cout:{
                    fixe:true,
                    rang:false,
                    value:0
                  }
                }
              }
          }
        }
        
        if(pwr.flaws?.flaw ?? null !== null) {
          if(Array.isArray(pwr.flaws.flaw)) {
            for(let xtr of pwr.flaws.flaw) {
              const index = Object.keys(defauts).length;
              defauts[index] = {
                name:xtr.name,
                data:{
                  type:"extra",
                  description:xtr.description,
                  cout:{
                    fixe:true,
                    rang:false,
                    value:0
                  }
                }
              }
            }
          } else {
            const index = Object.keys(defauts).length;
            defauts[index] = {
                name:pwr.flaws.flaw.name,
                data:{
                  type:"extra",
                  description:pwr.flaws.flaw.description,
                  cout:{
                    fixe:true,
                    rang:false,
                    value:0
                  }
                }
              }
          }
        }

        listBonusTalent = listBonusTalent.concat(processChainedAdvantages(pwr));

        listPwrName.push(pwr.name);
        listPwrDetails[pwr.name] = {
          ranks:pwr.ranks
        };

        if(createItm) {
          const ranks = pwr.ranks;
          const cost = pwr.cost.value;
          const costCalc = costCalculate(ranks, cost);
          const calc = costCalc.parrang;
          const mod = costCalc.mod;

          let itm = {
            name: pwr.name,
            type: 'pouvoir',
            img: "systems/mutants-and-masterminds-3e/assets/icons/pouvoir.svg",
            system:{
              special:special,
              link:link,
              descripteurs:descriptors,
              notes:`<p>${pwr.summary}</p>`,
              effets:description,
              extras:extras,
              defauts:defauts,
              cout:{
                rang:ranks,
                parrang:calc,
                divers:costNull ? mod-(mod+(ranks*calc))+1 : mod
              }
            }
          };
          const itemCreate = await Item.create(itm, {parent: actor});

          const oPwr = link === "" ? await processAlternatePower(actor, pwr, itemCreate, true) : await processAlternatePower(actor, pwr, itemCreate, true);
          const aPwr = link === "" ? await processAlternatePower(actor, pwr, itemCreate, false) : await processAlternatePower(actor, pwr, itemCreate, false);
          listBonusTalent = listBonusTalent.concat(oPwr.talents);
          listBonusTalent = listBonusTalent.concat(aPwr.talents);

          const modPwrO = countPwr(pwr, "otherpowers");
          const modPwrA = countPwr(pwr, "alternatepowers");
          const totalMod = modPwrO+modPwrA;

          if(totalMod > 0 && !costNull) await itemCreate.update({[`system.cout.divers`]:itemCreate.system.cout.divers-totalMod}); 
          else if(totalMod > 0 && link !== "") await actor.items.get(link).update({[`system.cout.divers`]:actor.items.get(link).system.cout.divers-totalMod});
          
          const total = itemCreate.system.cout.total;
          if(total > 5 && (pwr?.alternatepowers?.power ?? null) == null) listPwrWhoCanLostCost.push(itemCreate._id);
        } else {
          pwrName = pwr.name;
          pwrDescription = description;
        }
        
      }
    } else {
      const pwr = pouvoirs;
      const descriptors = {};
      const extras = {};
      const defauts = {};
      const pwrDescri = pwr.description === null ? "" : pwr.description;
      let description = pwrDescri !== "" ? `<p>${pwrDescri}</p>` : "";
      description += processTraitsMod(pwr);

      if(pwr.descriptors?.descriptor ?? null !== null) {
        if(Array.isArray(pwr.descriptors.descriptor)) {
          for(let dsc of pwr.descriptors.descriptor) {
            const index = Object.keys(descriptors).length;
            descriptors[index] = dsc.name
          }
        } else {
          const index = Object.keys(descriptors).length;
          descriptors[index] = pwr.descriptors.descriptor.name
        }
      }

      if(pwr.extras?.extra ?? null !== null) {
        if(Array.isArray(pwr.extras.extra)) {
          for(let xtr of pwr.extras.extra) {
            const index = Object.keys(extras).length;
            extras[index] = {
              name:xtr.name,
              data:{
                type:"extra",
                description:xtr.description,
                cout:{
                  fixe:true,
                  rang:false,
                  value:0
                }
              }
            }
          }
        } else {
          const index = Object.keys(extras).length;
            extras[index] = {
              name:pwr.extras.extra.name,
              data:{
                type:"extra",
                description:pwr.extras.extra.description,
                cout:{
                  fixe:true,
                  rang:false,
                  value:0
                }
              }
            }
        }
      }
      
      if(pwr.flaws?.flaw ?? null !== null) {
        if(Array.isArray(pwr.flaws.flaw)) {
          for(let xtr of pwr.flaws.flaw) {
            const index = Object.keys(defauts).length;
            defauts[index] = {
              name:xtr.name,
              data:{
                type:"extra",
                description:xtr.description,
                cout:{
                  fixe:true,
                  rang:false,
                  value:0
                }
              }
            }
          }
        } else {
          const index = Object.keys(defauts).length;
          defauts[index] = {
              name:pwr.flaws.flaw.name,
              data:{
                type:"extra",
                description:pwr.flaws.flaw.description,
                cout:{
                  fixe:true,
                  rang:false,
                  value:0
                }
              }
            }
        }
      }

      listBonusTalent = listBonusTalent.concat(processChainedAdvantages(pwr));
      listPwrName.push(pwr.name);
      listPwrDetails[pwr.name] = {
        ranks:pwr.ranks
      };

      if(createItm) {
        const ranks = pwr.ranks;
        const cost = pwr.cost.value;
        const costCalc = costCalculate(ranks, cost);
        const calc = costCalc.parrang;
        const mod = costCalc.mod;

        let itm = {
          name: pwr.name,
          type: 'pouvoir',
          img: "systems/mutants-and-masterminds-3e/assets/icons/pouvoir.svg",
          system:{
            special:special,
            link:link,
            descripteurs:descriptors,
            notes:`<p>${pwr.summary}</p>`,
            effets:description,
            extras:extras,
            defauts:defauts,
            cout:{
              rang:ranks,
              parrang:calc,
              divers:costNull ? mod-(mod+(ranks*calc))+1 : mod
            }
          }
        };

        const itemCreate = await Item.create(itm, {parent: actor});

        const oPwr = link === "" ? await processAlternatePower(actor, pwr, itemCreate, true) : await processAlternatePower(actor, pwr, itemCreate, true);
        const aPwr = link === "" ? await processAlternatePower(actor, pwr, itemCreate, false) : await processAlternatePower(actor, pwr, itemCreate, false);
        listBonusTalent = listBonusTalent.concat(oPwr.talents);
        listBonusTalent = listBonusTalent.concat(aPwr.talents);

        const modPwrO = countPwr(pwr, "otherpowers");
        const modPwrA = countPwr(pwr, "alternatepowers");
        const totalMod = modPwrO+modPwrA;

        if(totalMod > 0 && !costNull) itemCreate.update({[`system.cout.divers`]:itemCreate.system.cout.divers-totalMod});
        else if(totalMod > 0 && link !== "") actor.items.get(link).update({[`system.cout.divers`]:actor.items.get(link).system.cout.divers-totalMod});

        const total = itemCreate.system.cout.total;
        if(total > 5 && (pwr?.alternatepowers?.power ?? null) == null) listPwrWhoCanLostCost.push(itemCreate._id);
      } else {
        pwrName = pwr.name;
        pwrDescription = description;
      }    
    }
  }

  return {
    talents:listBonusTalent,
    name:pwrName,
    description:pwrDescription,
    listPwrName:listPwrName,
    listPwrDetails:listPwrDetails,
    listPwrWhoCanLostCost:listPwrWhoCanLostCost
  }
}

export function costCalculate(ranks, cost) {
  const calc = Math.max(Math.floor(Number(cost)/Number(ranks)), 1);
  const mod = Number(cost)-(Number(ranks)*calc);

  return {
    parrang:calc,
    mod:mod,
  }
}

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
  
  const defpassive = dataCbt?.defpassive ?? 'parade';

  ddDefense = defpassive === 'parade' ? parade : esquive;
  traType = defpassive === 'parade' ? game.i18n.localize("MM3.DEFENSE.DDParade") : game.i18n.localize("MM3.DEFENSE.DDEsquive");

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