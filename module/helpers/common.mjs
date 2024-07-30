import {
  EditAttaque,
} from "../dialog/edit-attaque.mjs";

export const listFont = {
  "Arial":"Arial",
  "Arial Narrow":"Arial Narrow",
  "Signika":"Signika",
  "Creepster":"Creepster",
  "Poppins":"Poppins",
  "Roboto":"Roboto",
  "Roboto Condensed":"Roboto Condensed",
  "Roboto Mono":"Roboto Mono",
  "Tektur":"Tektur",
  "Josefin Sans":"Josefin Sans",
  "Bebas Neue":"Bebas Neue",
  "Goldman":"Goldman",
  "Anton":"Anton",
  "Patrick Hand SC":"Patrick Hand SC",
  "Pirata One":"Pirata One",
  "Prompt":"Prompt",
  "Teko":"Teko",
  "Russo One":"Russo One",
  "Righteous":"Righteous",
  "Pathway Gothic One":"Pathway Gothic One",
  "Quantico":"Quantico",
  "Staatliches":"Staatliches",
  "Secular One":"Secular One",
};

export const listBg = [
  "bleuclair",
  "violetclair",
  "violet",
  "bleufonce"
];

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
  let add = true;
  let newDescription = itm.system.notes;
  let listPwrName = [];
  let listPwrDetails = {};

  if(alternate !== null) {
    if(Array.isArray(alternate)) {
      for(let aPwr of alternate) {
        if(itm.system.link !== "") add = false;

        const pPowers = await processPowers(actor, aPwr, add, isOtherPower, itm._id, costNull);
        listPwrDetails = foundry.utils.mergeObject(listPwrDetails, pPowers.listPwrDetails);
        listPwrName = listPwrName.concat(pPowers.listPwrName);
        listTalents = listTalents.concat(pPowers.talents);

        if(add === false) {
          newDescription += `<h3>${aPwr.name}</h3>`;
          newDescription += `<p>${aPwr.description}</p>`;
          newDescription += `<p>${aPwr.summary}</p>`;
        }
      }
    } else {
      if(itm.system.link !== "") add = false;

      const pPowers = await processPowers(actor, alternate, add, isOtherPower, itm._id, costNull);
      listPwrDetails = foundry.utils.mergeObject(listPwrDetails, pPowers.listPwrDetails);
      listPwrName = listPwrName.concat(pPowers.listPwrName);
      listTalents = listTalents.concat(pPowers.talents);

      if(add === false) {
        newDescription += `<h3>${alternate.name}</h3>`;
        newDescription += `<p>${alternate.description}</p>`;
        newDescription += `<p>${alternate.summary}</p>`;
      }
    }
  }

  if(itm.system.link !== "") actor.items.get(itm._id).update({[`system.notes`]:newDescription});

  return {
    powerDetails:listPwrDetails,
    powerName:listPwrName,
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
        const pName = pwr.name.replace('.', ' ');
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

        listPwrName.push(pName);
        listPwrDetails[pName] = {
          ranks:pwr.ranks
        };

        if(createItm) {
          const ranks = pwr.ranks;
          const cost = pwr.cost.value;
          const costCalc = costCalculate(ranks, cost);
          const calc = costCalc.parrang;
          const mod = costCalc.mod;
          let name = pwr.name.split(':');

          let itm = {
            name: name[0],
            type: 'pouvoir',
            img: "systems/mutants-and-masterminds-3e/assets/icons/pouvoir.svg",
            system:{
              effetsprincipaux:name.slice(1).join(', '),
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
          listPwrName = listPwrName.concat(oPwr.powerName);
          listPwrName = listPwrName.concat(aPwr.powerName);
          listPwrDetails = foundry.utils.mergeObject(listPwrDetails, oPwr.powerDetails);
          listPwrDetails = foundry.utils.mergeObject(listPwrDetails, aPwr.powerDetails);
          listBonusTalent = listBonusTalent.concat(oPwr.talents);
          listBonusTalent = listBonusTalent.concat(aPwr.talents);

          const modPwrO = countPwr(pwr, "otherpowers");
          const modPwrA = countPwr(pwr, "alternatepowers");
          const totalMod = modPwrO+modPwrA;

          if(totalMod > 0 && !costNull) await itemCreate.update({[`system.cout.divers`]:itm.system.cout.divers-totalMod});
          else if(totalMod > 0 && link !== "") await actor.items.get(link).update({[`system.cout.divers`]:actor.items.get(link).system.cout.divers-totalMod});

          const total = itemCreate.system.cout.total;
          if(total > 1 && (pwr?.alternatepowers?.power ?? null) == null) listPwrWhoCanLostCost.push(itemCreate._id);

          listPwrDetails[pName]._id = itemCreate._id;
        } else {
          pwrName = pName;
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
      let tempName = pwr.name.replaceAll('(', '').replaceAll(')', '').replaceAll('.', '');
      listPwrName.push(tempName);
      listPwrDetails[tempName] = {
        ranks:pwr.ranks,
        elements:pwr.elements,
      };

      if(createItm) {
        const ranks = pwr.ranks;
        const cost = pwr.cost.value;
        const costCalc = costCalculate(ranks, cost);
        const calc = costCalc.parrang;
        const mod = costCalc.mod;
        let name = pwr.name.split(':');

        let itm = {
          name: name[0],
          type: 'pouvoir',
          img: "systems/mutants-and-masterminds-3e/assets/icons/pouvoir.svg",
          system:{
            effetsprincipaux:name.slice(1).join(', '),
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
        listPwrName = listPwrName.concat(oPwr.powerName);
        listPwrName = listPwrName.concat(aPwr.powerName);
        listPwrDetails = foundry.utils.mergeObject(listPwrDetails, oPwr.powerDetails);
        listPwrDetails = foundry.utils.mergeObject(listPwrDetails, aPwr.powerDetails);
        listBonusTalent = listBonusTalent.concat(oPwr.talents);
        listBonusTalent = listBonusTalent.concat(aPwr.talents);

        const modPwrO = countPwr(pwr, "otherpowers");
        const modPwrA = countPwr(pwr, "alternatepowers");
        const totalMod = modPwrO+modPwrA;

        if(totalMod > 0 && !costNull) itemCreate.update({[`system.cout.divers`]:itemCreate.system.cout.divers-totalMod});
        else if(totalMod > 0 && link !== "") actor.items.get(link).update({[`system.cout.divers`]:actor.items.get(link).system.cout.divers-totalMod});

        const total = itemCreate.system.cout.total;
        if(total > 5 && (pwr?.alternatepowers?.power ?? null) == null) listPwrWhoCanLostCost.push(itemCreate._id);
        listPwrDetails[tempName]._id = itemCreate._id;
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

export async function processImport(actor, data, actorType='personnage') {
  const attributes = data.attributes.attribute;
  const attacks = data.attacks?.attack ?? null;
  const skills = data.skills.skill;
  const defenses = data.defenses.defense;
  const talents = data.advantages?.advantage ?? null;
  const pouvoirs = data.powers?.power ?? null;
  const complications = data.complications?.complication ?? null;
  const equipements = data.gear?.item ?? null;
  const langues = data.languages?.language ?? null;
  const resources = data?.resources?.resource ?? null;
  const update = {};
  const attributsTRA = {
    "Strength":"force",
    "Stamina":"endurance",
    "Agility":"agilite",
    "Dexterity":"dexterite",
    "Fighting":"combativite",
    "Awareness":"sensibilite",
    "Presence":"presence",
    "Intellect":"intelligence",
  };
  const attributsShort = {
    "STR":"for",
    "STA":"end",
    "AGI":"agi",
    "DEX":"dex",
    "FGT":"cbt",
    "AWA":"sns",
    "PRE":"prs",
    "INT":"int"
  };
  const skillsTRA = {
    "Acrobaties":"acrobaties",
    "Acrobatics":"acrobaties",
    "Athlétisme":"athletisme",
    "Athletics":"athletisme",
    "Discrétion":"discretion",
    "Stealth":"discretion",
    "Duperie":"duperie",
    "Deception":"duperie",
    "Habileté":"habilete",
    "Sleight of Hand":"habilete",
    "Intimidation":"intimidation",
    "Intimidation":"intimidation",
    "Investigation":"investigation",
    "Investigation":"investigation",
    "Perception":"perception",
    "Perception":"perception",
    "Perspicacité":"perspicacite",
    "Insight":"perspicacite",
    "Persuasion":"persuasion",
    "Persuasion":"persuasion",
    "Soins médicaux":"soins",
    "Treatment":"soins",
    "Technologie":"technologie",
    "Technology":"technologie",
    "Véhicules":"vehicules",
    "Vehicles":"vehicules",
    "Expertise":"expertise",
    "Expertise":"expertise",
    "Combat au contact":"combatcontact",
    "Close Combat":"combatcontact",
    "Combat à distance":"combatdistance",
    "Ranged Combat":"combatdistance",
  };
  const defensesTRA = {
    "Defense":"defense",
    "Dodge":"esquive",
    "Parry":"parade",
    "Fortitude":"vigueur",
    "Toughness":"robustesse",
    "Will":"volonte"
  };
  const tailleTRA = {
    "Miniscule":"Insignifiante",
    "-":"infime",
    "Diminutive":"minuscule",
    "Tiny":"minime",
    "Small":"petite",
    "Medium":"intermediaire",
    "Large":"grand",
    "Huge":"enorme",
    "Gargantuan":"gigantesque",
    "Colossal":"colossal",
    "Awesome":"titanesque",
  };
  let listBonusTalent = [];
  let listSkill = {
    combatcontact:{},
    combatdistance:{},
    expertise:{}
  }
  let alreadyAddAttack = [];
  let listAttack = {};
  let listCpc = {}
  let DCAttacks = {};
  let powerNames = [];
  let powerDetails = {};
  let listLangues = [];
  let endurance = 0;
  let combativite = 0;
  let sensibilite = 0;
  let agilite = 0;
  let totalAttrDef = {};

  if(actorType === 'personnage') {
    for(let attr of attributes) {
      if(attributsTRA[attr.name] === 'agilite') agilite = Number(attr.modified);
      if(attributsTRA[attr.name] === 'endurance') endurance = Number(attr.modified);
      if(attributsTRA[attr.name] === 'combativite') combativite = Number(attr.modified);
      if(attributsTRA[attr.name] === 'sensibilite') sensibilite = Number(attr.modified);

      update[`system.caracteristique.${attributsTRA[attr.name]}.base`] = Math.max(Number(attr.base), -5);
      update[`system.caracteristique.${attributsTRA[attr.name]}.divers`] = attr.text === '-' ? 0 : Number(attr.modified)-Number(attr.base);
      update[`system.caracteristique.${attributsTRA[attr.name]}.absente`] = attr.text === '-' && attr.cost.value === '-10' ? true : false;
    }

    totalAttrDef['Dodge'] = agilite;
    totalAttrDef['Parry'] = combativite;
    totalAttrDef['Fort'] = endurance;
    totalAttrDef['Tou'] = endurance;
    totalAttrDef['Will'] = sensibilite;
  } else if(actorType === 'vehicule') {
    for(let attr of attributes) {
      if(attributsTRA[attr.name] === 'force') {
        update[`system.caracteristique.${attributsTRA[attr.name]}.rang`] = Number(attr.cost.value);
      }
    }
  }

  if(actorType === 'personnage') {
    for(let def of defenses) {
      update[`system.defense.${defensesTRA[def.name]}.base`] = Number(def.cost.value);
      update[`system.defense.${defensesTRA[def.name]}.divers`] = Math.max(Number(def.modified)-(Number(def.cost.value)+totalAttrDef[def.abbr]), 0);
    }
  } else if(actorType === 'vehicule') {
    for(let def of defenses) {
      if(defensesTRA[def.name] === 'robustesse' || defensesTRA[def.name] === 'defense') {
        update[`system.caracteristique.${defensesTRA[def.name]}.rang`] = Number(def.cost.value);
     }
    }
  } else if(actorType === 'qg') {
    for(let def of defenses) {
      if(defensesTRA[def.name] === 'robustesse' || defensesTRA[def.name] === 'defense') {
        update[`system.${defensesTRA[def.name]}`] = (Number(def.cost.value)*2)+6;
     }
    }
  }

  const prcPwrs = await processPowers(actor, pouvoirs, true);
  const listPwrWhoCanLostCost = prcPwrs.listPwrWhoCanLostCost;
  listBonusTalent = listBonusTalent.concat(prcPwrs.talents);
  powerNames = powerNames.concat(prcPwrs.listPwrName);
  powerDetails = foundry.utils.mergeObject(powerDetails, prcPwrs.listPwrDetails);

  if(resources !== null && actorType === 'personnage') {
    const ppusedPwr = Number(resources[1].spent)
    const ppusedPwrActor = actor.system.pp.pouvoirs;
    let ppDiff = ppusedPwrActor-ppusedPwr;

    if(ppusedPwr < ppusedPwrActor) {
      for(let pwr of listPwrWhoCanLostCost) {
        const getItm = actor.items.get(pwr);
        const resteCout = Number(getItm.system.cout.total);

        if((resteCout-ppDiff) < 1) {
          await getItm.update({[`system.cout.divers`]:getItm.system.cout.divers-Math.max((resteCout-ppDiff), 1)});
          ppDiff -= Math.max((resteCout-ppDiff), 1);
        } else {
          await getItm.update({[`system.cout.divers`]:getItm.system.cout.divers-ppDiff});
          break;
        }
      }
    }
  }

  if(langues !== null && actorType === 'personnage') {
    if(Array.isArray(langues)) {
      for(let lang of langues) {
        listLangues.push(lang.name);
      }
    }
  }

  if(complications !== null && actorType === 'personnage') {
    if(Array.isArray(complications)) {
      for(let cpc of complications) {
        const length = Object.keys(listCpc).length;

        listCpc[length] = {
          label:cpc.name,
          description:cpc.description,
        }
      }
    } else {
      const length = Object.keys(listCpc).length;

      listCpc[length] = {
        label:complications.name,
        description:complications.description,
      }
    }
  }

  if(equipements !== null && actorType === 'personnage') {
    if(Array.isArray(equipements)) {
      for(let eqp of equipements) {
        if(!eqp.name.includes('Dropped to Ground') && !eqp.name.includes('Grab') && !eqp.name.includes('Unarmed') && !eqp.name.includes('Throw')) {
          let eqpDdescription = `<p>${eqp.description}</p>`
          const eqpArray = eqp?.componentitems?.item ?? null;

          if(eqpArray !== null) {
            if(Array.isArray(eqpArray)) {
              for(let eArray of eqpArray) {
                const eqpPwr = eArray?.componentpowers?.power ?? null;
                const prcEqpPwr = await processPowers(actor, eqpPwr, false);
                const prcEqpPwrName = prcEqpPwr.name;
                const prcEqpPwrDesc = prcEqpPwr.description;
                powerNames = powerNames.concat(prcEqpPwr.listPwrName);
                powerDetails = foundry.utils.mergeObject(powerDetails, prcEqpPwr.listPwrDetails);

                eqpDdescription += `<h2>${prcEqpPwrName === '' ? eArray.name : prcEqpPwrName}</h2><p>${prcEqpPwrDesc == '' ? eArray.description : prcEqpPwrDesc}</p>`;
                listBonusTalent = listBonusTalent.concat(prcEqpPwr.talents);
              }
            }
            else {
              const eqpPwr = eqpArray?.componentpowers?.power ?? null;
              const prcEqpPwr = await processPowers(actor, eqpPwr, false);
              const prcEqpPwrName = prcEqpPwr.name;
              const prcEqpPwrDesc = prcEqpPwr.description;
              powerNames = powerNames.concat(prcEqpPwr.listPwrName);
              powerDetails = foundry.utils.mergeObject(powerDetails, prcEqpPwr.listPwrDetails);

              eqpDdescription += `<h2>${prcEqpPwrName === '' ? eqpArray.name : prcEqpPwrName}</h2><p>${prcEqpPwrDesc == '' ? eqpArray.description : prcEqpPwrDesc}</p>`;
              listBonusTalent = listBonusTalent.concat(prcEqpPwr.talents);
            }
          }


          let itm = {
            name: eqp.name,
            type: 'equipement',
            img: "systems/mutants-and-masterminds-3e/assets/icons/equipement.svg",
            system:{
              description:eqpDdescription,
              cout:Number(eqp.cost.value)
            }
          };

          await Item.create(itm, {parent: actor});
        }
      }
    } else {
      if(!equipements.name.includes('Dropped to Ground') && !equipements.name.includes('Grab') && !equipements.name.includes('Unarmed') && !equipements.name.includes('Throw')) {
        let eqpDdescription = `<p>${equipements.description}</p>`
        const eqpArray = equipements?.componentitems?.item ?? null;
        if(eqpArray !== null) {
          if(Array.isArray(eqpArray)) {
            for(let eArray of eqpArray) {
              const eqpPwr = eArray?.componentpowers?.power ?? null;
              const prcEqpPwr = await processPowers(actor, eqpPwr, false);
              const prcEqpPwrName = prcEqpPwr.name;
              const prcEqpPwrDesc = prcEqpPwr.description;
              powerNames = powerNames.concat(prcEqpPwr.listPwrName);
              powerDetails = foundry.utils.mergeObject(powerDetails, prcEqpPwr.listPwrDetails);

              eqpDdescription += `<h2>${prcEqpPwrName === '' ? eArray.name : prcEqpPwrName}</h2><p>${prcEqpPwrDesc == '' ? eArray.description : prcEqpPwrDesc}</p>`;
              listBonusTalent = listBonusTalent.concat(prcEqpPwr.talents);
            }
          }
          else {
            const eqpPwr = eqpArray?.componentpowers?.power ?? null;
            const prcEqpPwr = await processPowers(actor, eqpPwr, false);
            const prcEqpPwrName = prcEqpPwr.name;
            const prcEqpPwrDesc = prcEqpPwr.description;
            powerNames = powerNames.concat(prcEqpPwr.listPwrName);
            powerDetails = foundry.utils.mergeObject(powerDetails, prcEqpPwr.listPwrDetails);

            eqpDdescription += `<h2>${prcEqpPwrName === '' ? eqpArray.name : prcEqpPwrName}</h2><p>${prcEqpPwrDesc == '' ? eqpArray.description : prcEqpPwrDesc}</p>`;
            listBonusTalent = listBonusTalent.concat(prcEqpPwr.talents);
          }
        }

        let itm = {
          name: equipements.name,
          type: 'equipement',
          img: "systems/mutants-and-masterminds-3e/assets/icons/equipement.svg",
          system:{
            description:eqpDdescription,
            cout:Number(equipements.cost.value)
          }
        };

        await Item.create(itm, {parent: actor});
      }
    }
  } else if((equipements !== null && actorType === 'vehicule') || (equipements !== null && actorType === 'qg')) {
    if(Array.isArray(equipements)) {
      for(let eqp of equipements) {
        if(!eqp.name.includes('Dropped to Ground') && !eqp.name.includes('Grab') && !eqp.name.includes('Unarmed') && !eqp.name.includes('Throw')) {
          let eqpDdescription = `<p>${eqp.description}</p>`
          const eqpArray = eqp?.componentitems?.item ?? null;

          if(eqpArray !== null) {
            if(Array.isArray(eqpArray)) {
              for(let eArray of eqpArray) {
                const eqpPwr = eArray?.componentpowers?.power ?? null;
                const prcEqpPwr = await processPowers(actor, eqpPwr, false);
                const prcEqpPwrName = prcEqpPwr.name;
                const prcEqpPwrDesc = prcEqpPwr.description;
                powerNames = powerNames.concat(prcEqpPwr.listPwrName);
                powerDetails = foundry.utils.mergeObject(powerDetails, prcEqpPwr.listPwrDetails);

                eqpDdescription += `<h2>${prcEqpPwrName === '' ? eArray.name : prcEqpPwrName}</h2><p>${prcEqpPwrDesc == '' ? eArray.description : prcEqpPwrDesc}</p>`;
                listBonusTalent = listBonusTalent.concat(prcEqpPwr.talents);
              }
            }
            else {
              const eqpPwr = eqpArray?.componentpowers?.power ?? null;
              const prcEqpPwr = await processPowers(actor, eqpPwr, false);
              const prcEqpPwrName = prcEqpPwr.name;
              const prcEqpPwrDesc = prcEqpPwr.description;
              powerNames = powerNames.concat(prcEqpPwr.listPwrName);
              powerDetails = foundry.utils.mergeObject(powerDetails, prcEqpPwr.listPwrDetails);

              eqpDdescription += `<h2>${prcEqpPwrName === '' ? eqpArray.name : prcEqpPwrName}</h2><p>${prcEqpPwrDesc == '' ? eqpArray.description : prcEqpPwrDesc}</p>`;
              listBonusTalent = listBonusTalent.concat(prcEqpPwr.talents);
            }
          }

          if(update['system.particularite'] !== undefined) update[`system.particularite`] += `${eqp.name} : ${eqpDdescription}`;
          else update[`system.particularite`] = `${eqp.name} : ${eqpDdescription}`;
        }
      }
    } else {
      if(!equipements.name.includes('Dropped to Ground') && !equipements.name.includes('Grab') && !equipements.name.includes('Unarmed') && !equipements.name.includes('Throw')) {
        let eqpDdescription = `<p>${equipements.description}</p>`
        const eqpArray = equipements?.componentitems?.item ?? null;
        if(eqpArray !== null) {
          if(Array.isArray(eqpArray)) {
            for(let eArray of eqpArray) {
              const eqpPwr = eArray?.componentpowers?.power ?? null;
              const prcEqpPwr = await processPowers(actor, eqpPwr, false);
              const prcEqpPwrName = prcEqpPwr.name;
              const prcEqpPwrDesc = prcEqpPwr.description;
              powerNames = powerNames.concat(prcEqpPwr.listPwrName);
              powerDetails = foundry.utils.mergeObject(powerDetails, prcEqpPwr.listPwrDetails);

              eqpDdescription += `<h2>${prcEqpPwrName === '' ? eArray.name : prcEqpPwrName}</h2><p>${prcEqpPwrDesc == '' ? eArray.description : prcEqpPwrDesc}</p>`;
              listBonusTalent = listBonusTalent.concat(prcEqpPwr.talents);
            }
          }
          else {
            const eqpPwr = eqpArray?.componentpowers?.power ?? null;
            const prcEqpPwr = await processPowers(actor, eqpPwr, false);
            const prcEqpPwrName = prcEqpPwr.name;
            const prcEqpPwrDesc = prcEqpPwr.description;
            powerNames = powerNames.concat(prcEqpPwr.listPwrName);
            powerDetails = foundry.utils.mergeObject(powerDetails, prcEqpPwr.listPwrDetails);

            eqpDdescription += `<h2>${prcEqpPwrName === '' ? eqpArray.name : prcEqpPwrName}</h2><p>${prcEqpPwrDesc == '' ? eqpArray.description : prcEqpPwrDesc}</p>`;
            listBonusTalent = listBonusTalent.concat(prcEqpPwr.talents);
          }
        }

        if(update['system.particularite'] !== undefined) update[`system.particularite`] += `${eqp.name} : ${eqpDdescription}`;
        else update[`system.particularite`] = `${eqp.name} : ${eqpDdescription}`
      }
    }
  }

  if(talents !== null && actorType === 'personnage') {
    if(Array.isArray(talents)) {
      for(let tl of talents) {
        let itm = {
          name: tl.name.includes("Languages") !== false ? `${tl.name} (${listLangues.join(" / ")})` : tl.name,
          type: 'talent',
          img: "systems/mutants-and-masterminds-3e/assets/icons/talent.svg",
          system:{
            description:tl.description,
            rang:listBonusTalent.includes(tl.name) ? 0 : Number(tl.cost.value),
            equipement: tl.name.match("Équipement|Equipment|équipement|equipment/i") ? true : false
          }
        };

        await Item.create(itm, {parent: actor});
      }
    }
  }

  if(attacks !== null) {
    if(Array.isArray(attacks)) {
      for(let att of attacks) {
        DCAttacks[att.name.split(":")[0]] = Number(att.dc)-15;
      }
    } else {
      DCAttacks[attacks.name.split(":")[0]] = Number(attacks.dc)-15;
    }
  }

  const conditionsVOId = {
    "controlled":"controlled",
    "impaired":"decreased",
    "fatigued":"tired",
    "disabled":"disabled",
    "dazed":"dazed",
    "immobile":"stuck",
    "unaware":"insensitive",
    "debilitated":"invalid",
    "hindered":"slow",
    "defenseless":"defenseless",
    "transformed":"transformed",
    "vulnerable":"vulnerability",
    "staggered":"chanceling",
    "enthralled":"enthralled",
    "compelled":"eye",
    "exhausted":"exhausted",
    "bound":"tied",
    "dying":"dying",
    "incapacitated":"neutralized",
    "surprised":"surprised",
    "weakened":"downgrade",
    "prone":"prone",
    "blind":"blind",
    "asleep":"sleep",
    "restrained":"restrain",
    "paralyzed":"paralysis",
    "deaf":"deaf",
    "stunned":"stun"
  };

  const conditionsVFId = {
    "contrôlé":"controlled",
    "diminué":"decreased",
    "fatigué":"tired",
    "handicapé":"disabled",
    "hébété":"dazed",
    "immobilisé":"stuck",
    "insensible":"insensitive",
    "invalide":"invalid",
    "ralenti":"slow",
    "sans défense":"defenseless",
    "transformé":"transformed",
    "vulnérable":"vulnerability",
    "chancelant":"chanceling",
    "envoûté":"enthralled",
    "influencé":"eye",
    "épuisé":"exhausted",
    "ligoté":"tied",
    "mourant":"dying",
    "neutralisé":"neutralized",
    "surpris":"surprised",
    "affaibli":"downgrade",
    "à terre":"prone",
    "aveugle":"blind",
    "endormi":"sleep",
    "entravé":"restrain",
    "paralysé":"paralysis",
    "sourd":"deaf",
    "étourdi":"stun"
  };

  const resistVO = {
    "dodge":"esquive",
    "parry":"parade",
    "fortitude":"vigueur",
    "toughness":"robustesse",
    "will":"volonte",
  };

  const resistVF = {
    "esquive":"esquive",
    "parade":"parade",
    "vigueur":"vigueur",
    "robustesse":"robustesse",
    "volonté":"volonte",
  };

  if(actorType === 'personnage') {
    for(let skill of skills) {
      const skillName = skill.name.split(':')[0];
      const search = Object.keys(skillsTRA).reduce((a, b) => {
        return skillName.includes(b) ? b : a;
      }, "");
      const label = skillsTRA[search];

      if(label &&(label.includes('expertise') || label.includes('combatcontact') || label.includes('combatdistance'))) {
        const length = Object.keys(listSkill[label]).length;
        let lastLabel = skill.name.replace(`${skill.name.split(":")[0]}: `, '');
        if(label.includes('expertise')) {
          const searchcar = Object.keys(attributsShort).reduce((a, b) => {
            return skillName.includes(b) ? b : a;
          }, "INT");
          const car = attributsShort[searchcar];

          listSkill[label][length] = {
            "label":lastLabel,
            "total":0,
            "carac":0,
            "rang":Number(skill.cost.value)*2,
            "autre":0,
            "carCanChange":true,
            "car":car,
          }
        } else {
          const lengthAttack = Object.keys(listAttack).length;
          let randSkill = foundry.utils.randomID();
          let randAtk = foundry.utils.randomID();
          let lowercase = label.toLowerCase();
          let isDmg = false;
          let isAffliction = false;
          let save = 'robustesse';
          let basedef = 15;

          if(lowercase.includes('damage') || lowercase.includes('degats')) isDmg = true;
          if(lowercase.includes('affliction')) isAffliction = true;

          if(isAffliction && !isDmg) save = 'volonte';

          if(save !== 'robustesse') basedef = 10;

          listSkill[label][length] = {
            _id:randSkill,
            label:lastLabel,
            total:0,
            carac:0,
            rang:Number(skill.cost.value)*2,
            autre:0,
            idAtt:randAtk,
          }

          listAttack[lengthAttack] = {
            _id:randAtk,
            type:label,
            skill:randSkill,
            label:lastLabel,
            save:save,
            effet:DCAttacks?.[lastLabel] ?? undefined !== undefined ? DCAttacks[lastLabel] : 0,
            critique:20,
            text:"",
            noAtk:false,
            basedef:basedef,
            isDmg:isDmg,
            isAffliction:isAffliction,
          }

          alreadyAddAttack.push(lastLabel);
        }
      } else {
        if(label)
        update[`system.competence.${label}.rang`] = Number(skill.cost.value)*2;
      }
    }
  }

  if(attacks !== null) {
    if(Array.isArray(attacks)) {
      for(let att of attacks) {
        if(powerNames.includes(att.name)){
          const firstName = att.name.split(":")[0];
          const lastname = att.name.replace(`${firstName}: `, '');

          if(!alreadyAddAttack.includes(firstName)) {
            const lengthAttack = Object.keys(listAttack).length;
            let randAtk = foundry.utils.randomID();
            let isDmg = false;
            let isAffliction = false;
            let lowercase = att.name.toLowerCase();
            let pwrData = powerDetails[att.name];
            let afflictionechec = {
              e1:[],
              e2:[],
              e3:[]
            };
            let save = 'robustesse';
            let saveAffliction = 'volonte';
            let basedef = 15;

            if(lowercase.includes('damage') || lowercase.includes('degats')) isDmg = true;
            if(lowercase.includes('affliction')) isAffliction = true;

            if(isAffliction && !isDmg) save = 'volonte';

            if(isAffliction && (pwrData?._id ?? '') !== '') {
              const elements = pwrData?.elements ?? null;

              if(elements !== null) {
                const element = elements?.element ?? null;

                if(element !== null) {
                  let first = undefined;
                  let second = undefined;
                  let three = undefined;
                  let resist = undefined;

                  if(Array.isArray(element)) {
                    first = element?.find(f => f.name.includes('1st degree')) ?? undefined;
                    second = element?.find(f => f.name.includes('2nd degree')) ?? undefined;
                    three = element?.find(f => f.name.includes('3rd degree')) ?? undefined;
                    resist = element?.find(f => f.name.includes('Resisted by')) ?? undefined;
                  } else {
                    let toArray = Object.values(element);

                    first = toArray?.find(f => f.includes('1st degree')) ?? undefined;
                    second = toArray?.find(f => f.includes('2nd degree')) ?? undefined;
                    three = toArray?.find(f => f.includes('3rd degree')) ?? undefined;
                    resist = toArray?.find(f => f.includes('Resisted by')) ?? undefined;
                  }

                  let fInfo = first?.info ?? null;
                  let sInfo = second?.info ?? null;
                  let tInfo = three?.info ?? null;
                  let rInfo = resist?.info ?? null;
                  let split;
                  let condition;
                  let resistvs;

                  if(fInfo !== null) {
                    split = fInfo.split(',');

                    for(let s of split) {
                      condition = conditionsVOId[s.toLowerCase()];

                      if(condition === undefined) condition = conditionsVFId[s.toLowerCase()];
                      if(condition !== undefined) condition = getStatusData(condition);

                      if(condition !== undefined) afflictionechec.e1.push(condition);
                    }
                  }

                  if(sInfo !== null) {
                    split = sInfo.split(',');

                    for(let s of split) {
                      condition = conditionsVOId[s.toLowerCase()];

                      if(condition === undefined) condition = conditionsVFId[s.toLowerCase()];
                      if(condition !== undefined) condition = getStatusData(condition);

                      if(condition !== undefined) afflictionechec.e2.push(condition);
                    }
                  }

                  if(tInfo !== null) {
                    split = tInfo.split(',');

                    for(let s of split) {
                      condition = conditionsVOId[s.toLowerCase()];

                      if(condition === undefined) condition = conditionsVFId[s.toLowerCase()];
                      if(condition !== undefined) condition = getStatusData(condition);

                      if(condition !== undefined) afflictionechec.e3.push(condition);
                    }
                  }

                  if(rInfo !== null) {
                    resistvs = resistVO[rInfo.toLowerCase()];

                    if(resistvs === undefined) resistvs = resistVF[rInfo.toLowerCase()];
                    if(resistvs !== undefined && isAffliction && isDmg) saveAffliction = resistvs;
                    else if(resistvs !== undefined && isAffliction && !isDmg) save = resistvs;
                  }
                }
              }
            }

            if(save !== 'robustesse') basedef = 10;

            listAttack[lengthAttack] = {
              _id:randAtk,
              pwr:pwrData?._id ?? '',
              type:'other',
              save:save,
              saveAffliction:saveAffliction,
              afflictionechec:afflictionechec,
              label:firstName,
              attaque:Number(att.attack),
              effet:Number(powerDetails[att.name]?.ranks) ?? 0,
              critique:Number(att.crit),
              text:lastname,
              noAtk:false,
              basedef:basedef,
              isDmg:isDmg,
              isAffliction:isAffliction,
            }
          }
        } else {
          if(!alreadyAddAttack.includes(att.name)) {
            const firstName = att.name.split(":")[0];
            const lastname = att.name.replace(`${firstName}: `, '');
            const lengthAttack = Object.keys(listAttack).length;
            let randAtk = foundry.utils.randomID();
            let isDmg = false;
            let isAffliction = false;
            let lowercase = att.name.toLowerCase();
            let save = 'robustesse';
            let saveAffliction = 'volonte';
            let basedef = 15;

            if(lowercase.includes('damage') || lowercase.includes('degats')) isDmg = true;
            if(lowercase.includes('affliction')) isAffliction = true;

            if(isAffliction && !isDmg) save = 'volonte';

            if(save !== 'robustesse') basedef = 10;

            listAttack[lengthAttack] = {
              _id:randAtk,
              type:'other',
              save:save,
              saveAffliction:saveAffliction,
              label:firstName,
              attaque:Number(att.attack),
              effet:Number(att.dc)-15 ?? 0,
              critique:Number(att.crit),
              text:lastname,
              noAtk:false,
              basedef:basedef,
              isDmg:isDmg,
              isAffliction:isAffliction,
            }
          }
        }
      }
    } else {
      if(powerNames.includes(attacks.name)){
        const firstName = attacks.name.split(":")[0];
        const lastname = attacks.name.replace(`${firstName}: `, '');

        if(!alreadyAddAttack.includes(firstName)) {
          const lengthAttack = Object.keys(listAttack).length;
          let randAtk = foundry.utils.randomID();
          let isDmg = false;
          let isAffliction = false;
          let lowercase = attacks.name.toLowerCase();
          let pwrData = powerDetails[att.name];
          let afflictionechec = {
            e1:[],
            e2:[],
            e3:[]
          };
          let save = 'robustesse';
          let saveAffliction = 'volonte';
          let basedef = 15;

          if(lowercase.includes('damage') || lowercase.includes('degats')) isDmg = true;
          if(lowercase.includes('affliction')) isAffliction = true;

          if(isAffliction && !isDmg) save = 'volonte';

          if(isAffliction && (pwrData?._id ?? '') !== '') {
            const elements = pwrData?.elements ?? null;

            if(elements !== null) {
              const element = elements?.element ?? null;

              if(element !== null) {
                let first = element.find(f => f.name.includes('1st degree'));
                let second = element.find(f => f.name.includes('2nd degree'));
                let three = element.find(f => f.name.includes('3rd degree'));
                let resist = element.find(f => f.name.includes('Resisted by'));
                let fInfo = first?.info ?? null;
                let sInfo = second?.info ?? null;
                let tInfo = three?.info ?? null;
                let rInfo = resist?.info ?? null;
                let split;
                let condition;
                let resistvs;

                if(fInfo !== null) {
                  split = fInfo.split(',');

                  for(let s of split) {
                    condition = conditionsVOId[s.toLowerCase()];

                    if(condition === undefined) condition = conditionsVFId[s.toLowerCase()];
                    if(condition !== undefined) condition = getStatusData(condition);

                    if(condition !== undefined) afflictionechec.e1.push(condition);
                  }
                }

                if(sInfo !== null) {
                  split = sInfo.split(',');

                  for(let s of split) {
                    condition = conditionsVOId[s.toLowerCase()];

                    if(condition === undefined) condition = conditionsVFId[s.toLowerCase()];
                    if(condition !== undefined) condition = getStatusData(condition);

                    if(condition !== undefined) afflictionechec.e2.push(condition);
                  }
                }

                if(tInfo !== null) {
                  split = tInfo.split(',');

                  for(let s of split) {
                    condition = conditionsVOId[s.toLowerCase()];

                    if(condition === undefined) condition = conditionsVFId[s.toLowerCase()];
                    if(condition !== undefined) condition = getStatusData(condition);

                    if(condition !== undefined) afflictionechec.e3.push(condition);
                  }
                }

                if(rInfo !== null) {
                  resistvs = resistVO[rInfo.toLowerCase()];

                  if(resistvs === undefined) resistvs = resistVF[rInfo.toLowerCase()];
                  if(resistvs !== undefined && isAffliction && isDmg) saveAffliction = resistvs;
                  else if(resistvs !== undefined && isAffliction && !isDmg) save = resistvs;
                }
              }
            }
          }

          if(save !== 'robustesse') basedef = 10;

          listAttack[lengthAttack] = {
            _id:randAtk,
            pwr:powerDetails[att.name]?._id ?? '',
            type:'other',
            save:save,
            saveAffliction:saveAffliction,
            label:firstName,
            attaque:Number(attacks.attack),
            effet:Number(powerDetails[attacks.name]?.ranks) ?? 0,
            critique:Number(attacks.crit),
            text:lastname,
            noAtk:false,
            basedef:basedef,
            isDmg:isDmg,
            isAffliction:isAffliction,
          }
        }
      } else {
        if(!alreadyAddAttack.includes(attacks.name)) {
          const firstName = attacks.name.split(":")[0];
          const lastname = attacks.name.replace(`${firstName}: `, '');
          const lengthAttack = Object.keys(listAttack).length;
          let randAtk = foundry.utils.randomID();
          let isDmg = false;
          let isAffliction = false;
          let lowercase = attacks.name.toLowerCase();
          let save = 'robustesse';
          let saveAffliction = 'volonte';
          let basedef = 15;

          if(lowercase.includes('damage') || lowercase.includes('degats')) isDmg = true;
          if(lowercase.includes('affliction')) isAffliction = true;

          if(isAffliction && !isDmg) save = 'volonte';

          if(save !== 'robustesse') basedef = 10;

          listAttack[lengthAttack] = {
            _id:randAtk,
            type:'other',
            save:save,
            saveAffliction:saveAffliction,
            label:firstName,
            attaque:Number(attacks.attack),
            effet:Number(attacks.dc)-15 ?? 0,
            critique:Number(attacks.crit),
            text:lastname,
            noAtk:false,
            basedef:basedef,
            isDmg:isDmg,
            isAffliction:isAffliction,
          }
        }
      }
    }

  }

  const mesures = game.settings.get("mutants-and-masterminds-3e", "measuresystem");
  if(!data.personal.charheight){
    data.personal.charheight = {text:"6'0\""};
    data.personal.charweight = {text:"200 lbs"};
  }
  const height = data.personal.charheight.text;
  const heightParts = height.split("'");
  const feet = parseInt(heightParts[0]) * 0.3048;
  const inches = parseInt(heightParts[1]) * 0.0254;
  const heightInMeters = (feet + inches).toFixed(2);

  if(actorType === 'personnage') {
    update[`system.competence.combatcontact.list`] = listSkill.combatcontact;
    update[`system.competence.combatdistance.list`] = listSkill.combatdistance;
    update[`system.competence.expertise.list`] = listSkill.expertise;
    update[`system.complications`] = listCpc;
    update[`system.age`] = data.personal.age;
    update[`system.genre`] = data.personal.gender;
    update[`system.taille`] = mesures === 'metric' ? `${heightInMeters}m` : height;
    update[`system.poids`] = mesures === 'metric' ? `${Math.round(parseInt(data.personal.charweight.value)*0.4536)}kg` : data.personal.charweight.text;
    update[`system.historique`] = data.personal.description;
    update[`system.yeux`] = data.personal.eyes;
    update[`system.cheveux`] = data.personal.hair;
    update[`system.pp.base`] = Number(data.resources.startingpp);
    update[`system.puissance`] = Number(data.resources.currentpl);
    update[`system.initiative.base`] = Number(data.initiative.total)-agilite;
  } else {
    update[`system.initiative.base`] = Number(data.initiative.total);
    update[`system.description`] = data.personal.description;
  }

  if(actorType === 'vehicule' || actorType === 'qg') {
    update[`system.taille`] = tailleTRA[data.size.name];
    update[`system.cout.particularite`] = Number(data.resources.resource[3].spent)+Number(data.resources.resource[6].spent)+Number(data.resources.resource[7].spent);
  }

  update[`system.attaque`] = listAttack;
  update['name'] = data.name;

  await actor.update(update);
  normalizeData(actor, true);
}

export async function processMinions(actor, data) {
  const minions = data?.minions?.character ?? false;

  if(minions !== false) {
    if(Array.isArray(minions)) {
      for(let m of minions) {
        const type = m.nature;

        if(type === 'vehicle' || type === 'headquarters') {
          const acType = type === 'vehicle' ? "vehicule" : "qg";

          let minion = await Actor.create({
            name: `temp`,
            type: acType,
            permission:actor.ownership,
            folder:actor.folder
          });

          processImport(minion, m, acType)
        }
      }
    } else {
      const type = minions.nature;

      if(type === 'vehicle' || type === 'headquarters') {
        const acType = type === 'vehicle' ? "vehicule" : "qg";

        let minion = await Actor.create({
          name: `temp`,
          type: acType,
          permission:actor.ownership,
          folder:actor.folder
        });

        processImport(minion, minions, acType)
      }
    }
  }
}

// Process each character's data and create a new actor
export async function processCharacterData(characterData) {
  // Assuming processImport and processMinions are defined and handle the actor creation

  const actorData = {
    name: "temp",
    type: "personnage",
    ownership:{
      default:3
    }
    // ... include other necessary attributes or default values
  };

  // Create the actor
  let actor = await Actor.create(actorData);

  await processImport(actor, characterData);
  await processMinions(actor, characterData);

  let update = {};
  update[`ownership.default`] = 0;
  update[`prototypeToken.name`] = actor.name;

  await actor.update(update);
}

export function getActor(item) {
  return item.actor;
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

export function accessibility(actor, html) {
  const setting = game.settings.get("mutants-and-masterminds-3e", "font");
  const options = actor?.system?.accessibility ?? null;
  const font = options !== null ? options?.font ?? null : null;
  const fontOther = options !== null ? options?.fontOther ?? '' : '';
  const resized = ['Arial', "Poppins", "Roboto Mono", "Tektur", "Josefin Sans", "Goldman", "Prompt", "Russo One", "Righteous", "Quantico", "Secular One"];

  if(setting === 'default') {
    if(font !== null) {
      html.find('div.editor-content').css('font-family', font);
    }

    if(fontOther !== null || fontOther !== 'null') {
      html.find('input[type="text"]').css('font-family', fontOther);
      html.find('h4').css('font-family', fontOther);
      html.find('select').css('font-family', fontOther);
      html.find('a').css('font-family', fontOther);
      html.find('span').css('font-family', fontOther);



      if(resized.includes(fontOther)) html.find('a.item').css('font-size', '11px');
    }
  } else {
    html.find('div.editor-content').css('font-family', setting);
    html.find('input[type="text"]').css('font-family', setting);
    html.find('h4').css('font-family', setting);
    html.find('select').css('font-family', setting);
    html.find('a').css('font-family', setting);
    html.find('span').css('font-family', setting);
    html.find('.accessibilityFont').remove();

    if(resized.includes(setting)) html.find('a.item').css('font-size', '11px');
  }

  $(html.find('a.selected')).prepend(`<i class="fa-solid fa-hexagon-check"></i>`);
  $(html.find('nav.tabs a.active')).prepend(`<i class="fa-solid fa-hexagon-check"></i>`);
  html.find('nav.tabs a').click(ev => {
    const target = $(ev.currentTarget);

    $(html.find('nav.tabs a i')).remove();
    target.prepend(`<i class="fa-solid fa-hexagon-check"></i>`);
  });
}

export async function deletePrompt(actor, label) {
  const setting = game.settings.get("mutants-and-masterminds-3e", "font");
  const options = actor?.system?.accessibility ?? null;
  const fontOther = options !== null ? options?.fontOther ?? '' : '';
  const resized = ['Arial', "Poppins", "Roboto Mono", "Tektur", "Josefin Sans", "Goldman", "Prompt", "Russo One", "Righteous", "Quantico", "Secular One"];

  let usedFont = "";
  let usedSizeFont = "";

  if(setting === 'default') {
    if(fontOther !== null || fontOther !== 'null') {
      usedFont = fontOther;
      if(resized.includes(fontOther)) 'adaptedFont';
    }
  } else {
    usedFont = setting;
    if(resized.includes(setting)) usedSizeFont = 'adaptedFont';
  }

  let classes = ['dialog', 'mm3-dialog-delete'];

  classes.push(usedFont.replace(' ', ""));
  classes.push(usedSizeFont);

  const confirmation = await Dialog.confirm({
    title:game.i18n.localize("MM3.DIALOG.AskDelete"),
    content:`${label}`,
    options:{
      classes:classes
    }
  });

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        confirmation
      );
    }, 0);
  });
}

export function modPromptClasses(actor) {
  const setting = game.settings.get("mutants-and-masterminds-3e", "font");
  const options = actor?.system?.accessibility ?? null;
  const fontOther = options !== null ? options?.fontOther ?? '' : '';
  const resized = ['Arial', "Poppins", "Roboto Mono", "Tektur", "Josefin Sans", "Goldman", "Prompt", "Russo One", "Righteous", "Quantico", "Secular One"];

  let usedFont = "";
  let usedSizeFont = "";

  if(setting === 'default') {
    if(fontOther !== null || fontOther !== 'null') {
      usedFont = fontOther;
      if(resized.includes(fontOther)) 'adaptedFont';
    }
  } else {
    usedFont = setting;
    if(resized.includes(setting)) usedSizeFont = 'adaptedFont';
  }

  let classes = ['dialog', 'mm3-dialog-mod'];

  classes.push(usedFont.replace(' ', ""));
  classes.push(usedSizeFont);

  return classes;
}

export function setCombinedEffects(token, statusId, active) {
  if(active) {
    const version = game.version.split('.')[0];
    const listStatusEffect = CONFIG.statusEffects;
    let statusEffect;

    if(version < 11) {
      statusEffect = listStatusEffect.find((se) => se.id === statusId);
      if(statusEffect !== undefined) {
        const changes = statusEffect.changes;

        if(changes !== undefined) {
          let effectData = [];

          for(let c of changes) {
            const idSE = c.key;
            const exist = token.effects.find((se) => se.flags.core.statusId === idSE);
            const tSE = listStatusEffect.find((se) => se.id === idSE);

            if(exist === undefined && tSE !== undefined) {
              const dChanges = tSE?.changes ?? false;

              let nEffect = {
                name: game.i18n.localize(tSE.label),
                label: game.i18n.localize(tSE.label),
                icon: tSE.icon,
                "flags.core.statusId":idSE
              };

              if(dChanges !== false) {
                nEffect['changes'] = dChanges;
              }

              effectData.push(nEffect);
            }
          }

          if(effectData.length !== 0) token.createEmbeddedDocuments("ActiveEffect", effectData);
        }
      }
    } else {
      for(let s of statusId) {
        statusEffect = listStatusEffect.find((se) => se.id === s);

        if(statusEffect !== undefined) {
          const changes = statusEffect.changes;

          if(changes !== undefined) {
            let effectData = [];

            for(let c of changes) {
              const idSE = c.key;
              const exist = token.statuses.has(idSE);
              const tSE = listStatusEffect.find((se) => se.id === idSE);

              if(!exist && tSE !== undefined) {
                const dChanges = tSE?.changes ?? false;

                let nEffect = {
                  name: game.i18n.localize(tSE.label),
                  label: game.i18n.localize(tSE.label),
                  icon: tSE.icon,
                  statuses:[idSE]
                };

                if(dChanges !== false) {
                  nEffect['changes'] = dChanges;
                }

                effectData.push(nEffect);
              }
            }

            if(effectData.length !== 0) token.createEmbeddedDocuments("ActiveEffect", effectData);
          }
        }
      }
    }
  }
}

export async function dialogAsk(data={}) {
  return new Promise((resolve, reject) => {
    const askDD = data?.dd ?? false;
    const askMod = data?.mod ?? false;
    const askNiveauDialogOptions = {
      classes: ["dialog", "mm3-dialog"],
      width:450,
    };

    let title = '';
    let html = '';
    if(askDD) {
      title += game.i18n.localize("MM3.DIALOG.AskDD");
      html += `<span>${game.i18n.localize("MM3.DIALOG.DD")}</span><input type="number" class="dc" value="0" min="0"/>`;
    }
    if(askMod) {
      title += title !== '' ? ` / ${game.i18n.localize("MM3.DIALOG.TitleMod")}` : game.i18n.localize("MM3.DIALOG.TitleMod");
      html += `<span>${game.i18n.localize("MM3.DIALOG.AskMod")}</span><input type="number" class="mod" value="0" min="0"/>`;
    }

    new Dialog({
      title: title,
      content: html,
      buttons: {
        button1: {
          label: game.i18n.localize("MM3.ROLL.Valider"),
          callback: async (dataHtml) => {
            const ddfind = dataHtml?.find('.dc')?.val() ?? 0;
            const modfind = dataHtml?.find('.mod')?.val() ?? 0;

            let result = {};
            if(askDD) result['dd'] = Number(ddfind);
            if(askMod) result['mod'] = Number(modfind);

            resolve(result)
          },
          icon: `<i class="fas fa-check"></i>`
        },
        button2: {
          label: game.i18n.localize("MM3.ROLL.Annuler"),
          callback: async () => { resolve(0) },
          icon: `<i class="fas fa-times"></i>`
        }
      }
    }, askNiveauDialogOptions).render(true);
  });
}

//ROLL STANDARD
export async function rollStd(actor, name, score, dataKey={}) {
  const optDices = getDices();
  const dicesCrit = optDices.critique;
  const dicesBase = optDices.dices;
  const dicesFormula = optDices.formula;
  const shift = dataKey?.shift ?? false;
  const ruleDC = game.settings.get("mutants-and-masterminds-3e", "dcroll");
  const rMode = game.settings.get("core", "rollMode");
  const useShift = (ruleDC === "shift" && shift) || (ruleDC !== "shift" && !shift) ? true : false;
  const alt = dataKey?.alt ?? false;
  let total = score;
  let pRoll = {};
  let ask = false;
  let dd = 0;
  let mod = 0;

  if(useShift || alt) {
    ask = await dialogAsk({dd:useShift, mod:alt});

    dd = ask?.dd ?? 0;
    mod = ask?.mod ?? 0;
  }

  const roll = new Roll(`${dicesBase} + ${total} + ${mod}`);
  await roll.evaluate();

  const resultDie = roll.total-total;
  let formula = mod === 0 ? `${dicesFormula} + ${total}` : `${dicesFormula} + ${total} + ${mod}`;

  if(useShift) {
    let resultMarge = 0;
    let isCritique = false;

    if(dd > 0) resultMarge = ((roll.total-dd)/5);
    if(resultDie >= dicesCrit) isCritique = true;

    const finalMarge = resultMarge < 0 ? Math.abs(resultMarge)+1 : resultMarge+1;

    pRoll = {
      flavor:name === "" ? " - " : `${name}`,
      tooltip:await roll.getTooltip(),
      formula:formula,
      result:roll.total,
      isCritique:isCritique,
      vs:dd > 0 ? dd : false,
      isSuccess:roll.total >= dd ? true : false,
      hasMarge:dd > 0 ? true : false,
      resultMarge:isCritique ? Math.floor(finalMarge)+1 : Math.floor(finalMarge),
      successOrFail:resultMarge < 0 ? 'fail' : 'success',
    };
  } else {
    pRoll = {
      flavor:name === "" ? " - " : `${name}`,
      tooltip:await roll.getTooltip(),
      formula:formula,
      result:roll.total,
      isCritique:resultDie >= dicesCrit ? true : false,
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
  const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);

  await ChatMessage.create(msgData, {
    rollMode:rMode
  });
}

//ROLL VS DD
export async function rollVs(actor, name, score, vs, data={}, dataKey={}) {
  const optDices = getDices();
  const alt = dataKey?.alt ?? false;
  let ask = false;
  let mod = 0;

  if(alt) {
    ask = await dialogAsk({mod:alt});

    mod = ask?.mod ?? 0;
  }

  let toRoll = mod === 0 ? `${optDices.dices} + ${score}` : `${optDices.dices} + ${score} + ${mod}`;
  const save = new Roll(toRoll);
  await save.evaluate();

  const typeAtk = data?.typeAtk ?? false;
  const saveTotal = Number(save.total);
  const saveDices = saveTotal-score;
  const isCritique = saveDices === optDices.critique ? true : false;
  const margeBrut = vs-saveTotal;
  const hasMarge = margeBrut >= 0 && !isCritique ? true : false;
  const marge = margeBrut >= 0 && !isCritique ? Math.ceil(margeBrut / 5) : false;
  const dataAtk = data.atk;
  const dataStr = data.str;
  const token = data.tkn;
  let isSuccess = false;

  if(isCritique) isSuccess = true;
  else if(margeBrut < 0) isSuccess = true;

  const pRollSave = {
    flavor:name === "" ? " - " : `${name}`,
    tooltip:await save.getTooltip(),
    formula:mod === 0 ? `${optDices.formula} + ${score}` : `${optDices.formula} + ${score} + ${mod}`,
    result:save.total,
    isCritique:isCritique,
    vs:vs,
    isSuccess:isSuccess,
    hasMarge:hasMarge,
    resultMarge:marge,
    successOrFail:'fail',
  };

  if(typeAtk !== false && !isSuccess) {
    let listEtats = [];
    let update = [];
    let blessures = {};

    if(typeAtk === 'area') {
      const isDmg = dataAtk.isDmg;
      const isAffliction = dataAtk.isAffliction;
      const tgt = token.id;
      const saveAffliction = dataAtk.saveAffliction;
      const saveType = dataAtk.save;
      const btn = [];

      if(isDmg && isAffliction) {
        btn.push({
          typeAtk:'dmg',
          target:tgt,
          saveType:saveType,
          vs:Number(dataAtk.effet)+Number(dataStr.effet)+Number(dataAtk.basedef),
        },
        {
          typeAtk:'affliction',
          target:tgt,
          saveType:saveAffliction,
          vs:Number(dataAtk.afflictioneffet)+Number(dataStr.effet)+Number(dataAtk.afflictiondef),
        });
      } else if(isDmg) {
        btn.push({
          typeAtk:'dmg',
          target:tgt,
          saveType:saveType,
          vs:Number(dataAtk.effet)+Number(dataStr.effet)+Number(dataAtk.basedef),
        });
      } else if(isAffliction) {
        btn.push({
          typeAtk:'affliction',
          target:tgt,
          saveType:saveType,
          vs:Number(dataAtk.effet)+Number(dataStr.effet)+Number(dataAtk.basedef),
        });
      }

      pRollSave.btn = btn;
      pRollSave.dataAtk = JSON.stringify(dataAtk);
      pRollSave.dataStr = JSON.stringify(dataStr);
    }

    if(typeAtk === 'affliction') {
      if(marge === 1) {
        listEtats = dataAtk.afflictionechec.e1;
      } else if(marge === 2) {
        listEtats = dataAtk.afflictionechec.e2;
      } else if(marge >= 3) {
        listEtats = dataAtk.afflictionechec.e3;
      }

      for(let etat of listEtats) {
        const eId = etat.id !== undefined ? etat.id : etat.statuses[0];

        let status = await setStatus(actor, eId, false);
        if(status !== undefined) update.push(status);
      }

      if(update.length > 0) {
        await token.actor.createEmbeddedDocuments("ActiveEffect", update);
      }
    }

    if(typeAtk === 'dmg') {
      const blessure = Number(actor.system.blessure);
      const allEtats = CONFIG.statusEffects;

      if(marge === 1) {
        blessures[`system.blessure`] = blessure+Number(dataAtk?.dmgechec?.v1 ?? 1);
      } else if(marge === 2) {
        blessures[`system.blessure`] = blessure+Number(dataAtk?.dmgechec?.v2 ?? 1);
        listEtats.push(allEtats.find(eta => eta.id === 'dazed'));
      } else if(marge === 3 && !hasStatus(actor, 'chanceling')) {
        blessures[`system.blessure`] = blessure+Number(dataAtk?.dmgechec?.v3 ?? 1);
        listEtats.push(allEtats.find(eta => eta.id === 'chanceling'));
      } else if(marge >= 3) {
        listEtats.push(allEtats.find(eta => eta.id === 'neutralized'));
      }

      for(let etat of listEtats) {
        let status = await setStatus(actor, etat.id, false);
        if(status !== undefined) update.push(status);
      }

      if(update.length > 0) {
        await token.actor.createEmbeddedDocuments("ActiveEffect", update);
      }

      if(!foundry.utils.isEmpty(blessures)) {
        await token.actor.update(blessures);
      }
    }
  } else if(typeAtk !== false && typeAtk === 'area' && isSuccess) {

    const isDmg = dataAtk.isDmg;
    const isAffliction = dataAtk.isAffliction;
    const tgt = token.id;
    const saveAffliction = dataAtk.saveAffliction;
    const saveType = dataAtk.save;
    const dataStr = data.str;
    const btn = [];

    if(isDmg && isAffliction) {
      btn.push({
        typeAtk:'dmg',
        target:tgt,
        saveType:saveType,
        vs:Math.max(Math.floor(Number(dataAtk.effet)+Number(dataStr.effet)+Number(dataAtk.basedef)/2), 1),
      },
      {
        typeAtk:'affliction',
        target:tgt,
        saveType:saveAffliction,
        vs:Math.max(Math.floor(Number(dataAtk.afflictioneffet)+Number(dataStr.effet)+Number(dataAtk.afflictiondef)/2), 1),
      });
    } else if(isDmg) {
      btn.push({
        typeAtk:'dmg',
        target:tgt,
        saveType:saveType,
        vs:Math.max(Math.floor(Number(dataAtk.effet)+Number(dataStr.effet)+Number(dataAtk.basedef)/2), 1),
      });
    } else if(isAffliction) {
      btn.push({
        typeAtk:'affliction',
        target:tgt,
        saveType:saveType,
        vs:Math.max(Math.floor(Number(dataAtk.effet)+Number(dataStr.effet)+Number(dataAtk.basedef)/2), 1),
      });
    }

    pRollSave.btn = btn;
    pRollSave.dataAtk = JSON.stringify(dataAtk);
    pRollSave.dataStr = JSON.stringify(dataStr);
  }

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

//ROLL ATTAQUE AVEC CIBLE
export async function rollAtkTgt(actor, name, score, data, tgt, dataKey={}) {
  if(tgt === undefined) return;
  const optDices = getDices();
  const dicesBase = optDices.dices;
  const dicesFormula = optDices.formula;
  const token = canvas.scene.tokens.find(token => token.id === tgt);
  const alt = dataKey?.alt ?? false;

  let ask = false;
  let mod = 0;
  let total = score;

  if(alt) {
    ask = await dialogAsk({mod:alt});

    mod = ask?.mod ?? 0;
  }

  const dataCbt = data.attaque;
  const dataStr = data.strategie;
  const roll = new Roll(`${dicesBase} + ${total} + ${dataStr.attaque} + ${mod}`);
  await roll.evaluate();

  const tokenData = token.actor.system;
  const resultDie = roll.total-total-dataStr.attaque;
  const parade = Number(tokenData.ddparade);
  const esquive = Number(tokenData.ddesquive);
  const sCritique = dataCbt.critique;
  const noCrit = dataCbt.noCrit ? true : false;
  const isArea = dataCbt?.area ?? false;
  const defpassive = dataCbt?.defpassive ?? 'parade';
  const isDmg = dataCbt.isDmg;
  const isAffliction = dataCbt.isAffliction;
  const saveAffliction = dataCbt.saveAffliction;
  const saveType = dataCbt.save;
  const areaBase = parseInt(dataCbt?.basearea ?? 0);
  const areaMod = parseInt(dataCbt?.mod?.area ?? 0);

  let ddDefense = 0;
  let traType = "";
  let formula = mod === 0 ? `${dicesFormula} + ${total} + ${dataStr.attaque}` : `${dicesFormula} + ${total} + ${dataStr.attaque} + ${mod}`

  ddDefense = defpassive === 'parade' ? parade : esquive;
  traType = defpassive === 'parade' ? game.i18n.localize("MM3.DEFENSE.DDParade") : game.i18n.localize("MM3.DEFENSE.DDEsquive");

  let result = {
    hit:roll.total >= ddDefense && resultDie !== 1 ? true : false,
    crit:resultDie >= dataCbt.critique && !noCrit ? true : false,
  };
  let pRoll = {};

  if((roll.total >= ddDefense && resultDie !== 1) || (resultDie >= sCritique && !noCrit)) {
    let dSuccess = Math.floor(((roll.total - ddDefense)/5))+1;

    let btn = [];

    if(isArea) {
      btn.push({
        typeAtk:'area',
        target:tgt,
        saveType:'esquive',
        vs:dataCbt.pwr === "" ? Number(areaBase)+Number(dataStr.effet) : 10+Number(dataCbt.effet)+Number(dataStr.effet)+Number(areaMod),
      });
    }
    else if(isDmg && isAffliction) {
      btn.push({
        typeAtk:'dmg',
        target:tgt,
        saveType:saveType,
        vs:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
      },
      {
        typeAtk:'affliction',
        target:tgt,
        saveType:saveAffliction,
        vs:Number(dataCbt.afflictioneffet)+Number(dataStr.effet)+Number(dataCbt.afflictiondef),
      });
    } else if(isDmg) {
      btn.push({
        typeAtk:'dmg',
        target:tgt,
        saveType:saveType,
        vs:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
      });
    } else if(isAffliction) {
      btn.push({
        typeAtk:'affliction',
        target:tgt,
        saveType:saveType,
        vs:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
      });
    }

    pRoll = {
      flavor:name === "" ? " - " : `${name}`,
      tooltip:await roll.getTooltip(),
      formula:formula,
      result:roll.total,
      isCombat:true,
      isSuccess:true,
      defense:ddDefense,
      isCritique:resultDie >= sCritique && !noCrit ? true : false,
      degreSuccess:dSuccess,
      type:traType,
      text:dataCbt.text,
      tgtName:token.actor.name,
      dataAtk:JSON.stringify(dataCbt),
      dataStr:JSON.stringify(dataStr),
      btn:btn,
    };
  } else {
    pRoll = {
      flavor:`${name}`,
      tooltip:await roll.getTooltip(),
      formula:formula,
      result:roll.total,
      isCombat:true,
      isSuccess:false,
      defense:ddDefense,
      type:traType,
      text:dataCbt.text,
      tgtName:token.name,
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

  return result;
}

//ROLL AVEC CIBLE
export async function rollTgt(actor, name, data, tgt) {
  if(tgt === undefined) return;
  const actTgt = canvas.scene.tokens.find(token => token.id === tgt);
  const dataCbt = data.attaque;
  const dataStr = data.strategie;
  const isDmg = dataCbt.isDmg;
  const isAffliction = dataCbt.isAffliction;
  const isArea = dataCbt?.area ?? false;
  const saveAffliction = dataCbt.saveAffliction;
  const saveType = dataCbt.save;
  const areaBase = parseInt(dataCbt?.basearea ?? 0);
  const areaMod = parseInt(dataCbt?.mod?.area ?? 0);

  let pRoll = {};

  let btn = [];

  if(isArea) {
    btn.push({
      typeAtk:'area',
      target:tgt,
      saveType:'esquive',
      vs:dataCbt.pwr === "" ? Number(areaBase)+Number(dataStr.effet) : 10+Number(dataCbt.effet)+Number(dataStr.effet)+Number(areaMod),
    });
  }
  else if(isDmg && isAffliction) {
    btn.push({
      typeAtk:'dmg',
      target:tgt,
      saveType:saveType,
      vs:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
    },
    {
      typeAtk:'affliction',
      target:tgt,
      saveType:saveAffliction,
      vs:Number(dataCbt.afflictioneffet)+Number(dataStr.effet)+Number(dataCbt.afflictiondef),
    });
  } else if(isDmg) {
    btn.push({
      typeAtk:'dmg',
      target:tgt,
      saveType:saveType,
      vs:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
    });
  } else if(isAffliction) {
    btn.push({
      typeAtk:'affliction',
      target:tgt,
      saveType:saveType,
      vs:Number(dataCbt.effet)+Number(dataStr.effet)+Number(dataCbt.basedef),
    });
  }

  pRoll = {
    flavor:name === "" ? " - " : `${name}`,
    isCombat:true,
    isSuccess:true,
    text:dataCbt.text,
    tgtName:actTgt.name,
    dataAtk:JSON.stringify(dataCbt),
    dataStr:JSON.stringify(dataStr),
    btn:btn
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

//ROLL SANS JET D'ATTAQUE
export async function rollWAtk(actor, name, data) {
  const dataCbt = data.attaque;
  const dataStr = data.strategie;

  const pRoll = {
    flavor:name === "" ? " - " : `${name}`,
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

//ROLL ATTAQUE
export async function rollAtk(actor, name, score, data, dataKey={}) {
  const optDices = getDices();
  const dicesBase = optDices.dices;
  const dicesFormula = optDices.formula;

  const dataCbt = data.attaque;
  const dataStr = data.strategie;
  const noCrit = dataCbt.noCrit ? true : false;
  const alt = dataKey?.alt ?? false;

  let ask = false;
  let mod = 0;
  let total = score;

  if(alt) {
    ask = await dialogAsk({mod:alt});

    mod = ask?.mod ?? 0;
  }

  let formula = mod === 0 ? `${dicesFormula} + ${total} + ${dataStr.attaque}` : `${dicesFormula} + ${total} + ${dataStr.attaque} + ${mod}`;
  let fRoll = mod === 0 ? `${dicesBase} + ${total} + ${dataStr.attaque}` : `${dicesBase} + ${total} + ${dataStr.attaque} + ${mod}`;

  const roll = new Roll(fRoll);
  await roll.evaluate();

  const resultDie = roll.total-total-dataStr.attaque;

  const pRoll = {
    flavor:name === "" ? " - " : `${name}`,
    tooltip:await roll.getTooltip(),
    formula:formula,
    result:roll.total,
    isCritique:resultDie >= dataCbt.critique && !noCrit ? true : false,
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

//ROLL POUVOIR
export async function rollPwr(actor, id, dataKey={}) {
  const optDices = game.settings.get("mutants-and-masterminds-3e", "typeroll");
  const pwr = actor.items.filter(item => item.id === id)[0];
  const type = pwr.system.special;
  const rang = type === 'dynamique' ? actor.system.pwr[id].cout.rang : pwr.system.cout.rang;
  const name = pwr.name;
  const baseCrit = optDices === '3D6' ? 18 : 20;
  const alt = dataKey?.alt ?? false;
  let dices = `1D20`;
  let fDices = optDices === '3D20' ? '3D20' : '1D20';

  if(optDices === '3D20') dices = '3D20dldh';
  else if(optDices === '3D6') dices = '3D6';

  let ask = false;
  let mod = 0;

  if(alt) {
    ask = await dialogAsk({mod:alt});

    mod = ask?.mod ?? 0;
  }

  const formula = mod === 0 ? `${fDices} + ${rang}` : `${fDices} + ${rang} + ${mod}`;
  const fRoll = mod === 0 ? `${dices} + ${rang}` : `${dices} + ${rang} + ${mod}`;
  const roll = new Roll(fRoll);
  await roll.evaluate();
  const resultDie = roll.total-rang;

  const pRoll = {
    flavor:`${name}`,
    tooltip:await roll.getTooltip(),
    formula:formula,
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

export async function sendInChat(actor, itm) {
  let rank = 0;
  let labelrank = '';

  switch(itm.type) {
    case 'talent':
      labelrank = game.i18n.localize("MM3.Rang");
      rank = itm.system.rang;
      break;

    case 'equipement':
      labelrank = game.i18n.localize("MM3.Cout");
      rank = itm.system.cout;
      break;
  }

  const pData = {
    flavor:`${itm.name}`,
    labelrank:`${labelrank}`,
    rank:`${rank}`,
    description:`${itm.system.description}`
  };

  const msgData = {
    user: game.user.id,
    speaker: {
      actor: actor?.id || null,
      token: actor?.token?.id || null,
      alias: actor?.name || null,
    },
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    content: await renderTemplate('systems/mutants-and-masterminds-3e/templates/roll/msgdata.html', pData),
    sound: CONFIG.sounds.dice
  };

  const rMode = game.settings.get("core", "rollMode");
  await ChatMessage.create(msgData, {
    rollMode:rMode
  });
}

const metric = {
  "-5":"0.15",
  "-4":"0.50",
  "-3":"1",
  "-2":"2",
  "-1":"4",
  "0":"8",
  "1":"16",
  "2":"32",
  "3":"64",
  "4":"125",
  "5":"250",
  "6":"500",
  "7":"1000",
  "8":"2000",
  "9":"4000",
  "10":"8000",
  "11":"16000",
  "12":"32000",
  "13":"64000",
  "14":"125000",
  "15":"250000",
  "16":"500000",
  "17":"1000000",
  "18":"2000000",
  "19":"4000000",
  "20":"8000000",
  "21":"16000000",
  "22":"32000000",
  "23":"64000000",
  "24":"125000000",
  "25":"250000000",
  "26":"500000000",
  "27":"1000000000",
  "28":"2000000000",
  "29":"4000000000",
  "30":"8000000000",
};

const imperial = {
  "-5":"0.5",
  "-4":"1",
  "-3":"3",
  "-2":"6",
  "-1":"15",
  "0":"30",
  "1":"60",
  "2":"120",
  "3":"250",
  "4":"500",
  "5":"900",
  "6":"1800",
  "7":"2640",
  "8":"5280",
  "9":"10560",
  "10":"21120",
  "11":"42240",
  "12":"84480",
  "13":"158400",
  "14":"316800",
  "15":"633600",
  "16":"1320000",
  "17":"2640000",
  "18":"5280000",
  "19":"10560000",
  "20":"21120000",
  "21":"42240000",
  "22":"84480000",
  "23":"168960000",
  "24":"337920000",
  "25":"660000000",
  "26":"1320000000",
  "27":"2640000000",
  "28":"5280000000",
  "29":"10560000000",
  "30":"21120000000",
};

export function speedCalc(int) {
  const system = game.settings.get("mutants-and-masterminds-3e", "measuresystem");
  let used = system === 'metric' ? metric : imperial;
  let result;

  if(int <= 30) result = Number(used[int]);
  if(int > 30) {
    result = Number(used[30]);

    for(let i = 30;i < int;i++) {
      result = result*2;
    }
  }

  return result;
}

export function actualiseWAtt() {
  let eAtt = Object.values(ui.windows).filter((app) => app instanceof game.mm3.EditAttaque);

  for(let att of eAtt) {
    att.actualise();
  }
}

export function commonHTML(html, origin, data={}) {
  const hasItm = data?.hasItem ?? false;
  const hasAtk = data?.hasAtk ?? false;
  const hasPwr = data?.hasPwr ?? false;
  const hasStr = data?.hasStr ?? false;
  const hasPP = data?.hasPP ?? false;
  const hasSpd = data?.hasSpd ?? false;
  const hasRoll = data?.hasRoll ?? false;
  const hasAdd = data?.hasAdd ?? false;

  if(hasItm) {
    html.find('.item-edit').click(ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const item = origin.items.get(header.data("item-id"));

      item.sheet.render(true);
    });

    html.find('.item-delete').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const id = header.data("item-id");
      const item = origin.items.get(id);

      confirm = await deletePrompt(origin, item.name);
      if(!confirm) return;

      origin.update({[`system.pwr.-=${id}}`]:null});

      item.delete();
      header.slideUp(200, () => origin.render(false));
    });
  }

  if(hasAtk) {
    html.find('div.attaque i.editAtk').click(ev => {
      const target = $(ev.currentTarget);
      const id = target.data('id');
      const token = origin.token === null ? false : origin.token._id;
      const dataAtk = getAtk(origin, id);

      if(!dataAtk) return;

      const newAtk = new EditAttaque({
        id:id,
        actor:origin._id,
        token:token,
      });
      newAtk.render(true);
    });
  }

  if(hasPwr) {
    html.find('div.lPouvoirs select.link').change(async ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const cout = target.data('cout')-1;
      const val = target.val();

      if(val === '') origin.items.get(header.data("item-id")).update({[`system.link`]:val});
      else {
        const toLink = origin.items.get(val);
        const isDynamique = toLink.system.special === 'dynamique' ? true : false;
        const coutTotal = isDynamique ? toLink.system.cout.totalTheorique-1 : toLink.system.cout.total;

        if(val === 'principal') origin.items.get(header.data("item-id")).update({[`system.link`]:val});
        else if(coutTotal >= cout) origin.items.get(header.data("item-id")).update({[`system.link`]:val});
        else {
          origin.items.get(header.data("item-id")).update({[`system.link`]:''});
          target.val('');
        }
      }
    });

    html.find('a.rollPwr').click(async ev => {
      const target = $(ev.currentTarget);
      const id = target.data('id');
      const hasShift = ev.shiftKey;
      const hasAlt = ev.altKey;

      rollPwr(origin, id, {shift:hasShift, alt:hasAlt});
    });
  }

  if(hasStr) {
    html.find('a.saveLimiteStrategie').click(async ev => {
      let update = {};

      update['system.strategie.limite'] = origin.system.strategie.limite.query;

      origin.update(update);

      const rollMsgData = {
        user: game.user.id,
        speaker: {
          actor: origin?.id || null,
          token: origin?.token?.id || null,
          alias: origin?.name || null,
        },
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        content: game.i18n.localize('MM3.STRATEGIE.Changement'),
        sound: CONFIG.sounds.dice
      };

      const msgData = ChatMessage.applyRollMode(rollMsgData, 'blindroll');

      await ChatMessage.create(msgData, {
        rollMode:'blindroll'
      });
    });

    html.find('a.resetStrategie').click(async ev => {
      const update = {}

      update[`system.strategie`] = {
        'attaqueoutrance':{
          'attaque':0,
          'defense':0,
        },
        'attaquedefensive':{
          'attaque':0,
          'defense':0,
        },
        'attaqueprecision':{
          'attaque':0,
          'effet':0,
        },
        'attaquepuissance':{
          'attaque':0,
          'effet':0,
        },
        'etats':{
          'attaque':0,
          'effet':0,
        },
      };

      origin.update(update);
    });

    html.find('div.range a.str').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const value = parseInt(target.data('value'));
      const update = {}
      update[type] = value;

      origin.update(update);
    });
  }

  if(hasPP) {
    html.find('div.totalpp summary').click(async ev => {
      const target = $(ev.currentTarget);
      const value = target.data('value') ? false : true;

      origin.update({[`system.${data.ppName}.opened`]:value})
    });
  }

  if(hasSpd) {
    html.find('a.selectspeed').click(async ev => {
      const target = $(ev.currentTarget);
      const id = target.data('id');

      setSpeed(origin, id);
    });
  }

  if(hasRoll) {
    html.find('a.roll').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const name = target.data('name');
      const id = target.data('id');
      const strattaque = target.data('strattaque');
      const streffet = target.data('streffet');
      const tgt = game.user.targets.ids[0];
      const atk = game.mm3.getAtk(origin, id)?.data ?? {noAtk:true};
      const hasShift = ev.shiftKey;
      const hasAlt = ev.altKey;
      let total = Number(target.data('total'));

      if(type === 'attaque' && tgt !== undefined && atk.noAtk) {
        for(let t of game.user.targets.ids) {
          rollTgt(origin, name, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}}, t);
        }
      } else if(type === 'attaque' && tgt !== undefined && !atk.noAtk) {
        for(let t of game.user.targets.ids) {
          rollAtkTgt(origin, name, total, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}}, t, {alt:hasAlt});
        }
      } else if(type === 'attaque' && tgt === undefined && !atk.noAtk) rollAtk(origin, name, total, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}}, {alt:hasAlt});
      else if(type === 'attaque' && atk.noAtk) rollWAtk(origin, name, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}});
      else rollStd(origin, name, total, {shift:hasShift, alt:hasAlt});
    });
  }

  if(hasAdd) {
    html.find('a.add').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const what = target.data('what');

      const update = {};

      switch(type) {
        case 'complications':
          const dataComplication = Object.keys(origin.system.complications);
          const maxKeysComplication = dataComplication.length ? Math.max(...dataComplication) : 0;

          origin.update({[`system.complications.${maxKeysComplication+1}`]:{
            label:"",
            description:""
          }});
          break;

        case 'competence':
          const comp = origin.system.competence[what];
          const dataComp = Object.keys(comp.list);
          const maxKeysComp = dataComp.length > 0 ? Math.max(...dataComp) : 0;
          const modele = comp.modele;

          if(what === 'combatcontact' || what === 'combatdistance') {
            const attaque = origin.system?.attaque || {};
            const dataAttaque = Object.keys(attaque);
            const maxKeysAtt = dataAttaque.length > 0 ? Math.max(...dataAttaque) : 0;
            let randAtt = foundry.utils.randomID();
            let randSkill = foundry.utils.randomID();

            modele['idAtt'] = randAtt;
            modele['_id'] = randSkill;
            update[`system.attaque.${maxKeysAtt+1}`] = {
              _id:randAtt,
              type:what,
              skill:randSkill,
              pwr:'',
              save:'robustesse',
              effet:0,
              critique:20,
              text:"",
              noAtk:false,
              basedef:15,
              label:game.i18n.localize('MM3.Adefinir'),
              defpassive:what === 'combatcontact' ? 'parade' : 'esquive',
            };
          }

          update[`system.competence.${what}.list.${maxKeysComp+1}`] = modele;

          origin.update(update);
          break;

        case 'attaque':
          const attaque = origin.system?.attaque || {};
          const dataAttaque = Object.keys(attaque);
          const maxKeysAtt = dataAttaque.length > 0 ? Math.max(...dataAttaque) : 0;

          update[`system.attaque.${maxKeysAtt+1}`] = {
            _id:foundry.utils.randomID(),
            skill:'',
            pwr:'',
            type:'other',
            save:'robustesse',
            saveAffliction:'volonte',
            label:game.i18n.localize('MM3.Adefinir'),
            attaque:0,
            effet:0,
            critique:20,
            text:"",
            noAtk:false,
            afflictiondef:10,
            basedef:15,
            defpassive:'parade',
          };

          origin.update(update);
          break;

        case 'vitesse':
          const vitesse = origin.system?.vitesse.list || {};
          const dataLength = Object.keys(vitesse).length;

          update[`system.vitesse.list.v${dataLength+1}`] = {
            'canDel':true,
            'label':"",
            'rang':0,
            'round':0,
            'kmh':0
          }

          origin.update(update);
          break;
      }
    });

    html.find('i.delete').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const id = target.data('id');
      const what = target.data('what');
      const update = {};
      const getOrigin = origin.token === null ? origin : origin.token.actor;

      let confirm;
      let label;

      switch(type) {
        case 'complications':
          confirm = await deletePrompt(origin, origin.system.complications[id].label);
          if(!confirm) return;

          getOrigin.update({[`system.complications.-=${id}`]:null});
          break;

        case 'competence':
          if(what === 'combatcontact' || what === 'combatdistance') {
            const attaque = origin.system?.attaque || {};
            const keys = Object.keys(attaque);
            const indexAtt = keys.findIndex(key => {
              const item = attaque[key];
              return item.type === what && item.id === id;
            });

            label = origin.system.competence[what].list[id].label;

            if(indexAtt !== -1) update[`system.attaque.-=${keys[indexAtt]}`] = null;

            update[`system.competence.${what}.list.-=${id}`] = null;
          } else if(what === 'new') {
            label = origin.system.competence[id].label;

            update[`system.competence.-=${id}`] = null;
          } else {
            label = origin.system.competence[what].list[id].label;

            update[`system.competence.${what}.list.-=${id}`] = null;
          }

          confirm = await deletePrompt(origin, label);
          if(!confirm) return;

          getOrigin.update(update);
          break;

        case 'attaque':
          confirm = await deletePrompt(origin, origin.system.attaque[id].label);
          if(!confirm) return;

          update[`system.attaque.-=${id}`] = null;

          getOrigin.update(update);
          break;

        case 'vitesse':
          confirm = await deletePrompt(origin, origin.system.vitesse.list[id]?.label ?? game.i18n.localize('MM3.Vitesse'));
          if(!confirm) return;

          update[`system.vitesse.list.-=${id}`] = null;

          if(origin.system.vitesse.list[id].selected) update[`system.vitesse.list.base.selected`] = true;

          getOrigin.update(update);
          break;
      }
    });
  }

  html.find('a.sendInfos').click(async ev => {
    const header = $(ev.currentTarget).parents(".summary");
    const actor = origin;
    const item = actor.items.get(header.data("item-id"));

    sendInChat(actor, item);
  });
}

export function getPwr(actor, id) {
  return actor.items.get(id);
}

export function getDataSubSkill(actor, skill, id) {
  const data = actor.system;
  let foundSkill = null;

  if(skill === 'other') return foundSkill;

  for (let key in data.competence[skill].list) {
      let obj = data.competence[skill].list[key];

      if (obj._id === id) {
        foundSkill = obj;
          break;
      }
  }

  return foundSkill;
}

export function getAtk(actor, id) {
  const data = actor.system;
  let foundAtk = null;

  for (let key in data.attaque) {
      let obj = data.attaque[key];

      if (obj._id === id) {
        foundAtk = {
          key:key,
          data:obj
        };
          break;
      }
  }

  return foundAtk;
}

export async function setStatus(actor, statusId, autoAdd=true) {
  const version = game.version.split('.')[0];
  let status = CONFIG.statusEffects.find((se) => se.id === statusId);
  let changes = status?.changes ?? false
  let hasCondition = false;
  let update = undefined;

  if(version < 11) {
    hasCondition = hasStatus(actor, statusId);

    if(!hasCondition) {
      update = {
        name: game.i18n.localize(status.label),
        label: game.i18n.localize(status.label),
        icon: status.icon,
        "flags.core.statusId":status.id,
      };

      if(changes !== false) update['changes'] = changes;
    }
  } else {
    hasCondition = hasStatus(actor, statusId);

    if(!hasCondition) {
      update = {
        name: game.i18n.localize(status.label),
        label: game.i18n.localize(status.label),
        icon: status.icon,
        statuses:[status.id]
      };

      if(changes !== false) update['changes'] = changes;
    }
  }

  if(update !== undefined) {
    if(Object.entries(update).length > 0 && autoAdd) {
      await actor.createEmbeddedDocuments("ActiveEffect", [update]);
    }
  }

  return update;
}

export async function deleteStatus(actor, statusId) {
  const version = game.version.split('.')[0];

  if(version < 11) {
    const existingEffects = actor.effects.filter((effect) => effect.flags.core?.statusId === statusId);

    for (const effect of existingEffects) {
        await effect.delete();
    }
  } else {
    const existingEffects = actor.effects.filter((effect) => effect.statuses.has(statusId));

    for (const effect of existingEffects) {
        await effect.delete();
    }
  }
}

export function getStatusData(statusId) {
  const version = game.version.split('.')[0];
  let status = CONFIG.statusEffects.find((se) => se.id === statusId);
  let changes = status?.changes ?? false
  let update = undefined;

  if(version < 11) {
    update = {
      name: game.i18n.localize(status.label),
      label: game.i18n.localize(status.label),
      icon: status.icon,
      "flags.core.statusId":status.id,
    };

    if(changes !== false) update['changes'] = changes;
  } else {
    update = {
      name: game.i18n.localize(status.label),
      label: game.i18n.localize(status.label),
      icon: status.icon,
      statuses:[status.id]
    };

    if(changes !== false) update['changes'] = changes;
  }

  return update;
}

export function hasStatus(actor, statusId) {
  const version = game.version.split('.')[0];
  let hasCondition = false;
  if(version < 11) {
    hasCondition = actor.effects.find((effect) => effect.flags?.core?.statusId === statusId);
  } else {
    hasCondition = actor.effects.find((effect) => effect.statuses.has(statusId))
  }

  return hasCondition;
}

export function setSpeed(actor, speedId) {
  const data = actor.system.vitesse.list;

  let update = {};

  for(let v in data) {
    update[`system.vitesse.list.${v}.selected`] = false;
  }

  update[`system.vitesse.list.${speedId}.selected`] = true;

  actor.update(update);
}

export function normalizeData(actor, force=false) {
  const ownership = actor.ownership?.[game.user] ?? 0;

  if(game.user.isGM || actor.ownership.default === 3 || ownership === 3) {
    const type = actor.type;
    const data = actor.system;
    const atk = data.attaque;
    const versioning = data?.version ?? 0;

    let update = {};
    let hasId;
    let rand;
    let listDistance = [];
    let listContact = [];
    let listAtk = [];

    if(versioning < 1 || force === true) {
      if(type === 'personnage') {
        const contact = data.competence.combatcontact.list;
        const distance = data.competence.combatdistance.list;

        for(let cc in contact) {
          let dataCc = contact[cc];
          hasId = dataCc?._id ?? false;

          if(hasId === false) {
            rand = foundry.utils.randomID();

            update[`system.competence.combatcontact.list.${cc}._id`] = rand;

            listContact.push({
              id:cc,
              _id:rand,
            });
          }
        }

        for(let rc in distance) {
          let dataRc = distance[rc];
          hasId = dataRc?._id ?? false;

          if(hasId === false) {
            rand = foundry.utils.randomID();

            update[`system.competence.combatdistance.list.${rc}._id`] = rand;

            listDistance.push({
              id:rc,
              _id:rand,
            });
          }
        }
      }

      for(let i = 0;i < Object.values(atk).length; i++) {
        let dataAtk = Object.values(atk)[i];
        hasId = dataAtk?._id ?? false

        if(hasId === false) {
          rand = foundry.utils.randomID();

          update[`system.attaque.${Object.keys(atk)[i]}._id`] = rand;

          listAtk.push({
            id:i,
            _id:rand,
            type:dataAtk.type,
          });
        }

        update[`system.attaque.${Object.keys(atk)[i]}.skill`] = dataAtk?.skill ?? '';
        update[`system.attaque.${Object.keys(atk)[i]}.pwr`] = dataAtk?.pwr ?? '';
        update[`system.attaque.${Object.keys(atk)[i]}.noCrit`] = dataAtk?.noCrit ?? false;
        update[`system.attaque.${Object.keys(atk)[i]}.isAffliction`] = dataAtk?.isAffliction ?? false;
        update[`system.attaque.${Object.keys(atk)[i]}.isDmg`] = dataAtk?.isDmg ?? false;
        update[`system.attaque.${Object.keys(atk)[i]}.saveAffliction`] = dataAtk?.saveAffliction ?? 'volonte';
        update[`system.attaque.${Object.keys(atk)[i]}.afflictiondef`] = dataAtk?.afflictiondef ?? 10;
        update[`system.attaque.${Object.keys(atk)[i]}.afflictioneffet`] = dataAtk?.afflictioneffet ?? 10;
        update[`system.attaque.${Object.keys(atk)[i]}.-=edit`] = null;
        update[`system.attaque.${Object.keys(atk)[i]}.afflictionechec`] = {
          e1:dataAtk?.afflictionechec?.e1 ?? [],
          e2:dataAtk?.afflictionechec?.e2 ?? [],
          e3:dataAtk?.afflictionechec?.e3 ?? [],
        };
        update[`system.attaque.${Object.keys(atk)[i]}.dmgechec`] = {
          v1:1,
          v2:1,
          v3:1,
        };
      }

      if(type === 'personnage') {
        const contact = data.competence.combatcontact.list;
        const distance = data.competence.combatdistance.list;

        for(let cc in contact) {
          let dataCc = contact[cc];
          let idAtt = dataCc.idAtt;
          let find = listAtk.find(a => a.id === idAtt && a.type === 'combatcontact')?._id ?? -1;

          if(find !== -1) {
            update[`system.competence.combatcontact.list.${cc}.idAtt`] = find;
          }
        }

        for(let rc in distance) {
          let dataRc = distance[rc];
          let idAtt = dataRc.idAtt;
          let find = listAtk.find(a => a.id === idAtt && a.type === 'combatdistance')?._id ?? -1;

          if(find !== -1) {
            update[`system.competence.combatdistance.list.${rc}.idAtt`] = find;
          }


        }
      }

      for(let a in atk) {
        let dataAtk = atk[a];
        let type = dataAtk.type;
        let find;

        if(type === 'combatcontact') {
          find = listContact.find(c => c.id === `${dataAtk.id}`)?._id ?? -1;

          if(find !== -1) {
            update[`system.attaque.${a}.skill`] = find;
          }

        } else if(type === 'combatdistance') {
          find = listDistance.find(c => c.id === `${dataAtk.id}`)?._id ?? -1;

          if(find !== -1) {
            update[`system.attaque.${a}.skill`] = find;
          }
        }

        update[`system.attaque.${a}.-=id`] = null;
      }

      update[`system.version`] = 1;
    }

    if(!foundry.utils.isEmpty(update) && actor._id !== null) {
      actor.update(update);
    }
  }
}

export function getModBonus(actorData, data, items) {
  const surcharge = data?.surcharge?.total ?? false;
  const effects = data?.effects?.total ?? 0;
  const effectsRanks = data?.effectsranks ?? {};
  const surchargeRanks = data?.surchargeranks ?? {};
  let surchargeArray = [];
  let hasSurchargeRanks = false;
  let surchargeTotal = false;
  let surchargeRanksMax = 0;
  let total = 0;

  total += parseInt(effects);

  for(let e in effectsRanks) {
    const itm = items.find(itm => itm._id === e);
    const type = itm.type;
    const special = itm.system.special;
    const value = parseInt(effectsRanks[e]);
    let rang = 0;

    if(type === 'pouvoir') rang = special === 'dynamique' ? parseInt(actorData.system?.pwr?.[e]?.cout?.rang ?? 0) : parseInt(itm.system.cout.rang);
    else if(type === 'talent') rang = parseInt(itm.system.rang);

    total += value*rang;
  }

  for(let e in surchargeRanks) {
    const itm = items.find(itm => itm._id === e);
    const type = itm.type;
    const special = itm.system.special;
    const value = parseInt(surchargeRanks[e]);
    let rang = 0;

    if(type === 'pouvoir') rang = special === 'dynamique' ? parseInt(actorData.system?.pwr?.[e]?.cout?.rang ?? 0) : parseInt(itm.system.cout.rang);
    else if(type === 'talent') rang = parseInt(itm.system.rang);

    surchargeArray.push(value*rang);
  }

  if(surchargeArray.length > 0) {
    hasSurchargeRanks = true;
    surchargeRanksMax = Math.max(...surchargeArray);
  }

  if(surcharge !== false && hasSurchargeRanks) surchargeTotal = Math.max(surcharge, surchargeRanksMax);
  else if(surcharge !== false) surchargeTotal = surcharge;
  else if(hasSurchargeRanks) surchargeTotal = surchargeRanksMax;

  return {
    total:total,
    surcharge:surchargeTotal
  }
}

export function prepareEffects(item, context) {
  const system = context.data.system;

  system.effects = item.effects;
}

export async function updateEffects(item, id, name, changes) {
  const actor = getActor(item);

  await item.updateEmbeddedDocuments('ActiveEffect', [{
    "_id":id,
    icon:'',
    changes:changes,
  }]);

  if(actor !== null) {
    const getActorEffects = actor.effects.contents.find(itm => itm.origin.includes(item._id) && itm.flags.variante === name);

    await actor.updateEmbeddedDocuments('ActiveEffect', [{
      "_id":getActorEffects._id,
      icon:'',
      changes:changes,
    }]);
  }
}

export async function updateVarianteName(item, id, variante, name) {
  const actor = getActor(item);

  await item.updateEmbeddedDocuments('ActiveEffect', [{
    "_id":id,
    icon:'',
    name:name
  }]);

  if(actor !== null) {
    const getActorEffects = actor.effects.contents.find(itm => itm.origin.includes(item._id) && itm.flags.variante === variante);

    await actor.updateEmbeddedDocuments('ActiveEffect', [{
      "_id":getActorEffects._id,
      icon:'',
      name:name
    }]);
  }
}

export function createEffects(item, name, variante) {
  const actor = getActor(item);
  let updateItemEffects = {
    name: name,
    flags:{
      variante:variante
    },
    icon:'',
    changes:[],
    parent:item,
    disabled:true
  };

  item.createEmbeddedDocuments('ActiveEffect', [updateItemEffects]);

  if(actor !== null) {
    let updateActorEffects = {
      name: name,
      flags:{
        variante:variante
      },
      icon:'',
      changes:[],
      origin:`Actor.${actor._id}.Item.${item._id}`,
      disabled:true
    };

    actor.createEmbeddedDocuments('ActiveEffect', [updateActorEffects]);
  }
}

export function createEffectsWithChanges(item, name, changes, disabled) {
  const actor = getActor(item);
  let updateItemEffects = {
    name: name,
    flags:{
      variante:'e0'
    },
    icon:'',
    changes:changes,
    parent:item,
    disabled:disabled
  };

  item.createEmbeddedDocuments('ActiveEffect', [updateItemEffects]);

  if(actor !== null) {
    let updateActorEffects = {
      name: name,
      flags:{
        variante:'e0'
      },
      icon:'',
      changes:changes,
      origin:`Actor.${actor._id}.Item.${item._id}`,
      disabled:disabled
    };

    actor.createEmbeddedDocuments('ActiveEffect', [updateActorEffects]);
  }
}

export function deleteEffects(item, id, name) {
  const actor = getActor(item);

  item.deleteEmbeddedDocuments('ActiveEffect', [id]);

  if(actor !== null) {
    const getActorEffects = actor.effects.contents.find(itm => itm.origin.includes(item._id) && (itm.name === name || itm.label === name));

    actor.deleteEmbeddedDocuments('ActiveEffect', [getActorEffects._id]);
  }
}

export function createAllEffects(item, update, updateActor) {
  const actor = getActor(item);

  item.createEmbeddedDocuments('ActiveEffect', update);

  if(actor !== null) actor.createEmbeddedDocuments('ActiveEffect', updateActor);
}

export function deleteAllEffects(item, ids) {
  const actor = getActor(item);

  item.deleteEmbeddedDocuments('ActiveEffect', ids);

  if(actor !== null) actor.deleteEmbeddedDocuments('ActiveEffect', ids);
}

export function checkActiveOrUnactive(item) {
  const effects = item.effects;
  if(effects.size === 0) return;

  const variante = item.system.effectsVarianteSelected;
  const isactive = item.system?.activate ?? false;
  const nactive = isactive ? false : true;
  const actor = item.actor;

  let actorToUpdate = [];

  if(actor === '' || actor === null) return;
  if(actor.permission !== 3) return;

  const actorItem = actor.effects.find(itm => itm.origin.includes(item._id) && itm.flags.variante === variante && itm.disabled !== nactive);
  const actorItems = actor.effects.filter(itm => itm.origin.includes(item._id) && itm.flags.variante !== variante && itm.disabled !== true);

  if(actorItem !== undefined) actorToUpdate.push({"_id":actorItem._id,disabled:nactive});

  for(let e of actorItems) {
    actorToUpdate.push({"_id":e._id, disabled:true});
  }

  if(actorToUpdate.length > 0) actor.updateEmbeddedDocuments('ActiveEffect', actorToUpdate);
}

export function loadEffectsContext(context) {
  context.item.listMods = CONFIG.MM3.listmods;
  context.item.listSurcharge = {
    'surcharge':'MM3.EFFECTS.Surcharge',
    'surchargeranks':'MM3.EFFECTS.SurchargeRanks',
    'effectsranks':'MM3.EFFECTS.Ranks'
  };
}

export function loadEffectsHTML(html, item, permanent=false, single=false) {
  let disabled = permanent ? false : true;

  if(single) {
    html.find(`i.addMod`).click(async ev => {
      ev.preventDefault();
      const effects = item.effects;
      const size = effects.size;
      let effect;

      if(size === 0) {
        createEffectsWithChanges(item, item.name, [{
          key: "",
          mode: 2,
          priority: null,
          value: "0"
        }], disabled);
      } else {
        effect = item.effects.find(itm => itm.flags.variante === 'e0');
        const changes = effect?.changes ?? [];

        changes.push({
          key: "",
          mode: 2,
          priority: null,
          value: "0"
        });

        await updateEffects(item, effect._id, effect.flags.variante, changes);
      }
    });

    html.find(`input.varianteName`).blur(ev => {
      const effects = item.effects;
      const size = effects.size;
      const target = $(ev.currentTarget);

      if(size !== 0) {
        const effect = item.effects.find(itm => itm.flags.variante === 'e0');

        updateVarianteName(item, effect._id, effect.flags.variante, target.val());
      }
    });
  } else {
    html.find(`input.varianteName`).blur(ev => {
      const target = $(ev.currentTarget);
      const variante = target.data('name');
      const id = target.data('id');

      updateVarianteName(item, id, variante, target.val());
    });

    html.find(`i.addVMod`).click(ev => {
      ev.preventDefault();
      let listVariante = item.system?.listEffectsVariantes ?? {'e0':''};

      if(foundry.utils.isEmpty(listVariante)) listVariante = {'e0':''}

      const getArray = Object.keys(listVariante).map(v => parseInt(v.replace('e', '')));
      const max = Math.max(...getArray);
      const variante = `e${max+1}`;
      const name = `${game.i18n.localize('MM3.EFFECTS.Variante')} ${max+1}`;
      let update = {};

      if(item.effects.size === 0) update[`system.effectsVarianteSelected`] = variante;

      createEffects(item, name, variante);
      update[`system.listEffectsVariantes.${variante}`] = name;
      item.update(update);
    });

    html.find(`i.deleteVMod`).click(ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const id = target.data('id');
      const name = target.data('name');
      const selected = item.system.effectsVarianteSelected;
      let update = {};

      deleteEffects(item, id, name);

      if(name === selected) update['system.effectsVarianteSelected'] = 'e0';
      update[`system.listEffectsVariantes.-=${name}`] = null;

      item.update(update);
    });

    html.find(`i.addMod`).click(async ev => {
      ev.preventDefault();
      const target = $(ev.currentTarget);
      const id = target.data('id');
      const effect = item.effects.find(itm => itm._id === id);
      const changes = effect?.changes ?? [];

      changes.push({
        key: "",
        mode: 2,
        priority: null,
        value: "0"
      });

      await updateEffects(item, effect._id, effect.flags.variante, changes);
    });
  }

  html.find(`div.effectsBlock select.effect`).change(async ev => {
    ev.preventDefault();
    const target = $(ev.currentTarget);
    const id = target.data('id');
    const key = target.data('key');
    const value = target.val();
    let effect = item.effects.find(itm => itm._id === id);
    let changes = effect.changes;
    let split = changes[key].key.split('.');
    let k = `${value}.effects.total`;

    if(split[split.length-2] === 'effectsranks') k = `${value}.effects.${item._id}`;
    else if(split[split.length-2] === 'surchargeranks') k = `${value}.surchargeranks.${item._id}`;

    changes[key].key = k;

    await updateEffects(item, effect._id, effect.flags.variante, changes);
  });

  html.find(`div.effectsBlock select.surcharge`).change(async ev => {
    ev.preventDefault();
    const target = $(ev.currentTarget);
    const id = target.data('id');
    const key = target.data('key');
    const value = target.val();
    let effect = item.effects.find(itm => itm._id === id);
    let changes = effect.changes;
    let split = changes[key].key.split('.');

    if(value === 'surcharge') {
      split[split.length-2] = 'surcharge';
      split[split.length-1] = 'total';
      changes[key].mode = 5;
    }
    else if(value === 'surchargeranks') {
      split[split.length-2] = 'surchargeranks';
      split[split.length-1] = item._id;
      changes[key].mode = 5;
    }
    else if(value === 'effectsranks') {
      split[split.length-2] = 'effectsranks';
      split[split.length-1] = item._id;
      changes[key].mode = 2;
    }
    else {
      split[split.length-2] = 'effects';
      split[split.length-1] = 'total';
      changes[key].mode = 2;
    }

    changes[key].key = split.join('.');

    await updateEffects(item, effect._id, effect.flags.variante, changes);
  });

  html.find(`div.effectsBlock input`).blur(async ev => {
    ev.preventDefault();
    const target = $(ev.currentTarget);
    const id = target.data('id');
    const key = target.data('key');
    const value = target.val();
    let effect = item.effects.find(itm => itm._id === id);
    let changes = effect.changes;
    changes[key].value = value;

    await updateEffects(item, effect._id, effect.flags.variante, changes);
  });

  html.find(`i.deleteMod`).click(ev => {
    ev.preventDefault();
    const header = $(ev.currentTarget).parents(".effectsChanges");
    const key = header.data("key");
    const id = header.data("id");
    const effect = item.effects.find(effects => effects._id === id);
    effect.changes.splice(key, 1);

    updateEffects(item, id, effect.flags.variante, effect.changes);
  });

  html.find(`a.btnEdit`).click(ev => {
    ev.preventDefault();
    let edit = item.system?.edit ?? false;
    let value = edit ? false : true;
    let update = {};
    update[`system.edit`] = value;

    item.update({[`system.edit`]:value});
  });
}

export async function loadEffectsClose(item) {
  const form = item.sheet.form;
  const input = $($(form).find('input.effect'));
  const variantes = $($(form).find('input.varianteName'));

  for(let i of input) {
    const id = $(i).data('id');
    const key = $(i).data('key');
    const variante = $(i).data('name');
    const value = $(i).val();
    const effect = item.effects.find(itm => itm._id === id && itm.flags.variante === variante);

    let change = effect.changes[key];
    change.value = value;

    await updateEffects(item, id, variante, effect.changes);
  }

  for(let i of variantes) {
    const single = $(i).data('single');
    const value = $(i).val();

    if(single) {
      const effects = item.effects;
      const size = effects.size;

      if(size !== 0) {
        const effect = item.effects.find(itm => itm.flags.variante === 'e0');

        updateVarianteName(item, effect._id, effect.flags.variante, value);
      }
    } else {
      const id = $(i).data('id');
      const variante = $(i).data('name');

      updateVarianteName(item, id, variante, value)
    }
  }
}