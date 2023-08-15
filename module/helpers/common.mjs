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

          if(totalMod > 0 && !costNull) await itemCreate.update({[`system.cout.divers`]:itm.system.cout.divers-totalMod}); 
          else if(totalMod > 0 && link !== "") await actor.items.get(link).update({[`system.cout.divers`]:actor.items.get(link).system.cout.divers-totalMod});
          
          const total = itemCreate.system.cout.total;
          if(total > 1 && (pwr?.alternatepowers?.power ?? null) == null) listPwrWhoCanLostCost.push(itemCreate._id);
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
  
  if(actorType === 'personnage') {
    for(let skill of skills) {
      const skillName = skill.name.split(':')[0];
      const search = Object.keys(skillsTRA).reduce((a, b) => {
        return skillName.includes(b) ? b : a;
      }, "");
      const label = skillsTRA[search];
  
      if(label.includes('expertise') || label.includes('combatcontact') || label.includes('combatdistance')) {
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
  
          listSkill[label][length] = {
            "label":lastLabel,
            "total":0,
            "carac":0,
            "rang":Number(skill.cost.value)*2,
            "autre":0
          }
  
          listAttack[lengthAttack] = {
            type:label,
            id:length,
            save:'robustesse',
            effet:DCAttacks?.[lastLabel] ?? undefined !== undefined ? DCAttacks[lastLabel] : 0,
            critique:20,
            text:"",
            noAtk:false,
            basedef:15
          }
  
          alreadyAddAttack.push(lastLabel);
        }          
      } else {
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
            listAttack[lengthAttack] = {
              type:'other',
              id:-1,
              save:'robustesse',
              label:firstName,
              attaque:Number(att.attack),
              effet:Number(powerDetails[att.name]?.ranks) ?? 0,
              critique:Number(att.crit),
              text:lastname,
              noAtk:false,
              basedef:15
            }
          }
        } else {
          if(!alreadyAddAttack.includes(att.name)) {
            const firstName = att.name.split(":")[0];
            const lastname = att.name.replace(`${firstName}: `, '');
            const lengthAttack = Object.keys(listAttack).length;

            listAttack[lengthAttack] = {
              type:'other',
              id:-1,
              save:'robustesse',
              label:firstName,
              attaque:Number(att.attack),
              effet:Number(att.dc)-15 ?? 0,
              critique:Number(att.crit),
              text:lastname,
              noAtk:false,
              basedef:15
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
          listAttack[lengthAttack] = {
            type:'other',
            id:-1,
            save:'robustesse',
            label:firstName,
            attaque:Number(attacks.attack),
            effet:Number(powerDetails[attacks.name]?.ranks) ?? 0,
            critique:Number(attacks.crit),
            text:lastname,
            noAtk:false,
            basedef:15
          }
        }
      } else {
        if(!alreadyAddAttack.includes(attacks.name)) {
          const firstName = attacks.name.split(":")[0];
          const lastname = attacks.name.replace(`${firstName}: `, '');
          const lengthAttack = Object.keys(listAttack).length;
          
          listAttack[lengthAttack] = {
            type:'other',
            id:-1,
            save:'robustesse',
            label:firstName,
            attaque:Number(attacks.attack),
            effet:Number(attacks.dc)-15 ?? 0,
            critique:Number(attacks.crit),
            text:lastname,
            noAtk:false,
            basedef:15
          }
        }
      }
    }
    
  }

  const mesures = game.settings.get("mutants-and-masterminds-3e", "measuresystem");
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
  
  actor.update(update);
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

//ROLL STANDARD
export async function rollStd(actor, name, score, shift=false) {
  const optDices = getDices();  
  const dicesCrit = optDices.critique;
  const dicesBase = optDices.dices;
  const dicesFormula = optDices.formula;
  let pRoll = {};

  const roll = new Roll(`${dicesBase} + ${score}`);
  roll.evaluate({async:false});

  const resultDie = roll.total-score;
  const ruleDC = game.settings.get("mutants-and-masterminds-3e", "dcroll");
  const rMode = game.settings.get("core", "rollMode");

  if((ruleDC === "shift" && shift) || (ruleDC !== "shift" && !shift)) {
    const askNiveauDialogOptions = {classes: ["dialog", "mm3-dialog"]};

    await new Dialog({
      title: game.i18n.localize("MM3.ROLL.AskDD"),
      content: `<span>${game.i18n.localize("MM3.ROLL.DD")} ?</span><input type="number" class="dc" value="0" min="0"/>`,
      buttons: {
        button1: {
          label: game.i18n.localize("MM3.ROLL.Valider"),
          callback: async (dataHtml) => {
            const ddfind = dataHtml?.find('.dc')?.val() ?? 0;
            const dd = Number(ddfind);
            let resultMarge = 0;
            let isCritique = false;
            
            if(dd > 0) resultMarge = ((roll.total-dd)/5);
            if(resultDie >= dicesCrit) isCritique = true;

            const finalMarge = resultMarge < 0 ? Math.abs(resultMarge)+1 : resultMarge+1;

            pRoll = {
              flavor:name === "" ? " - " : `${name}`,
              tooltip:await roll.getTooltip(),
              formula:`${dicesFormula} + ${score}`,
              result:roll.total,
              isCritique:isCritique,
              vs:dd > 0 ? dd : false,
              isSuccess:roll.total >= dd ? true : false,
              hasMarge:dd > 0 ? true : false,
              resultMarge:isCritique ? Math.floor(finalMarge)+1 : Math.floor(finalMarge),
              successOrFail:resultMarge < 0 ? 'fail' : 'success',
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
          
            const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);
          
            await ChatMessage.create(msgData, {
              rollMode:rMode
            });
          },
          icon: `<i class="fas fa-check"></i>`
        },
        button2: {
          label: game.i18n.localize("MM3.ROLL.Annuler"),
          callback: async () => {},
          icon: `<i class="fas fa-times"></i>`
        }
      }
    }, askNiveauDialogOptions).render(true);
  } else {
    pRoll = {
      flavor:name === "" ? " - " : `${name}`,
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
    const msgData = ChatMessage.applyRollMode(rollMsgData, rMode);
  
    await ChatMessage.create(msgData, {
      rollMode:rMode
    });
  }
}

//ROLL VS DD
export async function rollVs(actor, name, score, vs, mod=0) {
  const optDices = getDices();  
  let toRoll = mod === 0 ? `${optDices.dices} + ${score}` : `${optDices.dices} + ${score} + ${mod}`;
  const save = new Roll(toRoll);
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
  const sCritique = dataCbt.critique;
  const defpassive = dataCbt?.defpassive ?? 'parade';
  const saveType = dataCbt.save;

  let ddDefense = 0;
  let traType = "";

  ddDefense = defpassive === 'parade' ? parade : esquive;
  traType = defpassive === 'parade' ? game.i18n.localize("MM3.DEFENSE.DDParade") : game.i18n.localize("MM3.DEFENSE.DDEsquive");    

  let pRoll = {};
  
  if((roll.total >= ddDefense && resultDie !== 1) || resultDie >= sCritique) {
    let dSuccess = Math.floor(((roll.total - ddDefense)/5))+1;

    pRoll = {
      flavor:name === "" ? " - " : `${name}`,
      tooltip:await roll.getTooltip(),
      formula:`${dicesFormula} + ${score} + ${dataStr.attaque}`,
      result:roll.total,
      isCombat:true,
      isSuccess:true,
      defense:ddDefense,
      isCritique:resultDie >= sCritique ? true : false,
      degreSuccess:dSuccess,
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

//ROLL AVEC CIBLE
export async function rollTgt(actor, name, data, tgt) {
  if(tgt === undefined) return;  
  const dataCbt = data.attaque;
  const dataStr = data.strategie;  
  const saveType = dataCbt.save;

  let pRoll = {};
  
  pRoll = {
    flavor:name === "" ? " - " : `${name}`,
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
    flavor:name === "" ? " - " : `${name}`,
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

//ROLL POUVOIR
export async function rollPwr(actor, id, mod=0) {
  const optDices = game.settings.get("mutants-and-masterminds-3e", "typeroll");
  const pwr = actor.items.filter(item => item.id === id)[0];
  const type = pwr.system.special;
  const rang = type === 'dynamique' ? actor.system.pwr[id].cout.rang : pwr.system.cout.rang;
  const name = pwr.name;
  const baseCrit = optDices === '3D6' ? 18 : 20;
  let dices = `1D20`;

  if(optDices === '3D20') dices = '3D20dldh';
  else if(optDices === '3D6') dices = '3D6';

  const formula = mod === 0 ? `${dices} + ${rang}` : `${dices} + ${rang} + ${mod}`;      
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