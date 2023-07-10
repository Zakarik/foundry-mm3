
import toggler from '../helpers/toggler.js';
import {
  xml2json,
  parseXML,
  rollAtkTgt,
  rollAtk,
  rollStd,
  rollPwr,
  rollTgt,
  rollWAtk,
  processPowers
} from "../helpers/common.mjs";

/**
 * @extends {ActorSheet}
 */
export class PersonnageActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mm3", "sheet", "actor", "personnage"],
      template: "systems/mutants-and-masterminds-3e/templates/personnage-actor-sheet.html",
      width: 850,
      height: 720,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "informations"}],
      dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    this._prepareCharacterItems(context);

    context.systemData = context.data.system;
    this._prepareCompetences(context);

    return context;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
   get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/mutants-and-masterminds-3e/templates/limited-personnage-sheet.html";
    }
    return this.options.template;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    toggler.init(this.id, html);

    html.find('.lPouvoirs .mod i').hover(ev => {
      const hover = ev.currentTarget;
      const target = $(hover).find('div.infoExt');
      const parent = $(hover).parents('span.text');
      target.css({
        'display': 'block',
        'margin-top': `-${target.height()+10}px`,
        'margin-left': `-${parent.width()-10}px`,
        'width': `${parent.width()-10}px`
      });
    }, ev => {
      const hover = ev.currentTarget;
      const target = $(hover).find('div.infoExt');
      target.css({
        'display': 'none'
      });
    });

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    html.find('.import').change(async ev => {
      const target = ev.target.files[0];
      const file = await readTextFromFile(target);
      let temp = file.replace(/&quot;/g, '#quot;');
      if (temp[0] == "\"") { // remove the wrapping doublequotes
        temp = temp.substr(1, temp.length - 2);
      }

      const json = JSON.parse(xml2json(parseXML(temp), "\t"));
      const data = json.document.public.character;
      const attributes = data.attributes.attribute;
      const attacks = data.attacks?.attack ?? null;
      const skills = data.skills.skill;
      const defenses = data.defenses.defense;
      const talents = data.advantages.advantage;
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
        "Véhicules":"vehicule",
        "Vehicles":"vehicules",
        "Expertise":"expertise",
        "Expertise":"expertise",
        "Combat au contact":"combatcontact",
        "Close Combat":"combatcontact",
        "Combat à distance":"combatdistance",
        "Ranged Combat":"combatdistance",
      };
      const defensesTRA = {
        "Dodge":"esquive",
        "Parry":"parade",
        "Fortitude":"vigueur",
        "Toughness":"robustesse",
        "Will":"volonte"
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
      
      for(let attr of attributes) {
        if(attributsTRA[attr.name] === 'agilite') agilite = Number(attr.modified);
        if(attributsTRA[attr.name] === 'endurance') endurance = Number(attr.modified);
        if(attributsTRA[attr.name] === 'combativite') combativite = Number(attr.modified);
        if(attributsTRA[attr.name] === 'sensibilite') sensibilite = Number(attr.modified);
        update[`system.caracteristique.${attributsTRA[attr.name]}.base`] = Math.max(Number(attr.base), -5);
        update[`system.caracteristique.${attributsTRA[attr.name]}.divers`] = attr.text === '-' ? 0 : Number(attr.modified)-Number(attr.base);
      }

      totalAttrDef['Dodge'] = agilite;
      totalAttrDef['Parry'] = combativite;
      totalAttrDef['Fort'] = endurance;
      totalAttrDef['Tou'] = endurance;
      totalAttrDef['Will'] = sensibilite;

      for(let def of defenses) {
        update[`system.defense.${defensesTRA[def.name]}.base`] = Number(def.cost.value);
        update[`system.defense.${defensesTRA[def.name]}.divers`] = Math.max(Number(def.modified)-(Number(def.cost.value)+totalAttrDef[def.abbr]), 0);
      }

      const prcPwrs = await processPowers(this.actor, pouvoirs, true);
      const listPwrWhoCanLostCost = prcPwrs.listPwrWhoCanLostCost;
      listBonusTalent = listBonusTalent.concat(prcPwrs.talents);
      powerNames = powerNames.concat(prcPwrs.listPwrName);
      powerDetails = foundry.utils.mergeObject(powerDetails, prcPwrs.listPwrDetails);

      if(resources !== null) {
        const ppusedPwr = Number(resources[1].spent)
        const ppusedPwrActor = this.actor.system.pp.pouvoirs;
        let ppDiff = ppusedPwrActor-ppusedPwr;

        if(ppusedPwr < ppusedPwrActor) {
          for(let pwr of listPwrWhoCanLostCost) {
            const getItm = this.actor.items.get(pwr);
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

      if(langues !== null) {
        if(Array.isArray(langues)) {
          for(let lang of langues) {
            listLangues.push(lang.name);
          }
        }
      }

      if(complications !== null) {
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

      if(equipements !== null) {        
        if(Array.isArray(equipements)) {
          for(let eqp of equipements) {
            if(!eqp.name.includes('Dropped to Ground') && !eqp.name.includes('Grab') && !eqp.name.includes('Unarmed') && !eqp.name.includes('Throw')) {
              let eqpDdescription = `<p>${eqp.description}</p>`
              const eqpArray = eqp?.componentitems?.item ?? null;

              if(eqpArray !== null) {
                if(Array.isArray(eqpArray)) {
                  for(let eArray of eqpArray) {
                    const eqpPwr = eArray?.componentpowers?.power ?? null;
                    const prcEqpPwr = await processPowers(this.actor, eqpPwr, false);
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
                  const prcEqpPwr = await processPowers(this.actor, eqpPwr, false);
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
    
              await Item.create(itm, {parent: this.actor});            
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
                  const prcEqpPwr = await processPowers(this.actor, eqpPwr, false);
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
                const prcEqpPwr = await processPowers(this.actor, eqpPwr, false);
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
  
            await Item.create(itm, {parent: this.actor});            
          }
        }
      }

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

          await Item.create(itm, {parent: this.actor});
        }
      }

      if(attacks !== null) {
        for(let att of attacks) {
          DCAttacks[att.name.split(":")[0]] = Number(att.dc)-15;
        }
      }

      for(let skill of skills) {
        const label = skillsTRA[skill.name.split(':')[0]];

        if(label.includes('expertise') || label.includes('combatcontact') || label.includes('combatdistance')) {
          const length = Object.keys(listSkill[label]).length;
          let lastLabel = skill.name.replace(`${skill.name.split(":")[0]}: `, '');
          if(label.includes('expertise')) {
            listSkill[label][length] = {
              "label":lastLabel,
              "total":0,
              "carac":0,
              "rang":Number(skill.cost.value)*2,
              "autre":0,
              "carCanChange":true,
              "car":"int",
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

      if(attacks !== null) {
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
          }
        }
      }

      update[`system.competence.combatcontact.list`] = listSkill.combatcontact;
      update[`system.competence.combatdistance.list`] = listSkill.combatdistance;
      update[`system.competence.expertise.list`] = listSkill.expertise;
      update[`system.complications`] = listCpc;
      update[`system.attaque`] = listAttack;
      update['name'] = data.name;
      update[`system.age`] = data.personal.age;
      update[`system.genre`] = data.personal.gender;
      update[`system.taille`] = data.personal.charheight.text;
      update[`system.poids`] = data.personal.charweight.text;
      update[`system.historique`] = data.personal.description;
      update[`system.yeux`] = data.personal.eyes;
      update[`system.cheveux`] = data.personal.hair;
      update[`system.pp.base`] = Number(data.resources.startingpp);
      update[`system.puissance`] = Number(data.resources.currentpl);
      update[`system.initiative.base`] = Number(data.initiative.total)-agilite;

      this.actor.update(update);
    });

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.item-edit').click(ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));

      item.sheet.render(true);
    });

    html.find('.item-delete').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const id = header.data("item-id");
      const item = this.actor.items.get(id);

      this.actor.update({[`system.pwr.-=${id}}`]:null});

      item.delete();
      header.slideUp(200, () => this.render(false));
    });

    html.find('span.switchIdentite').click(async ev => {
      const target = $(ev.currentTarget);
      const value = target.data("value") ? false : true;

      this.actor.update({[`system.identite.secret`]:value});
    });

    html.find('i.delete').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const id = target.data('id');
      const what = target.data('what');

      const update = {};

      switch(type) {
        case 'complications':
          this.actor.update({[`system.complications.-=${id}`]:null});
          break;
          
        case 'competence':
          update[`system.competence.${what}.list.-=${id}`] = null;

          if(what === 'combatcontact' || what === 'combatdistance') {
            const attaque = this.actor.system?.attaque || {};
            const keys = Object.keys(attaque);
            const indexAtt = keys.findIndex(key => {
              const item = attaque[key];
              return item.type === what && item.id === id;
            });

            if(indexAtt !== -1) update[`system.attaque.-=${keys[indexAtt]}`] = null;
          }

          this.actor.update(update);
          break;
      
        case 'attaque':
          update[`system.attaque.-=${id}`] = null;

          this.actor.update(update);
          break;
      }
    });

    html.find('a.add').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const what = target.data('what');

      const update = {};

      switch(type) {
        case 'complications':
          const dataComplication = Object.keys(this.actor.system.complications);
          const maxKeysComplication = dataComplication.length ? Math.max(...dataComplication) : 0;
          
          this.actor.update({[`system.complications.${maxKeysComplication+1}`]:{
            label:"",
            description:""
          }});
          break;
          
        case 'competence':
          const comp = this.actor.system.competence[what];
          const dataComp = Object.keys(comp.list);
          const maxKeysComp = dataComp.length > 0 ? Math.max(...dataComp) : 0;
          const modele = comp.modele;          

          if(what === 'combatcontact' || what === 'combatdistance') {
            const attaque = this.actor.system?.attaque || {};
            const dataAttaque = Object.keys(attaque);
            const maxKeysAtt = dataAttaque.length > 0 ? Math.max(...dataAttaque) : 0;

            modele['idAtt'] = maxKeysAtt;
            update[`system.attaque.${maxKeysAtt+1}`] = {
              type:what,
              id:maxKeysComp+1,
              save:'robustesse',
              effet:0,
              critique:20,
              text:"",
              noAtk:false,
              basedef:15
            };
          }

          update[`system.competence.${what}.list.${maxKeysComp+1}`] = modele;

          this.actor.update(update);
          break;
        
        case 'attaque':
          const attaque = this.actor.system?.attaque || {};
          const dataAttaque = Object.keys(attaque);
          const maxKeysAtt = dataAttaque.length > 0 ? Math.max(...dataAttaque) : 0;

          update[`system.attaque.${maxKeysAtt+1}`] = {
            type:'other',
            id:-1,
            save:'robustesse',
            label:game.i18n.localize('MM3.Adefinir'),
            attaque:0,
            effet:0,
            critique:20,
            text:"",
            noAtk:false,
            basedef:15
          };

          this.actor.update(update);
          break;
      }
    });

    html.find('a.roll').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const name = target.data('name');
      const total = target.data('total');
      const id = target.data('id');
      const strattaque = target.data('strattaque');
      const streffet = target.data('streffet');
      const tgt = game.user.targets.ids[0];
      const atk = this.actor.system.attaque[id];

      if(type === 'attaque' && tgt !== undefined && atk.noAtk) rollTgt(this.actor, name, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}}, tgt);
      else if(type === 'attaque' && tgt !== undefined && !atk.noAtk) rollAtkTgt(this.actor, name, total, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}}, tgt);
      else if(type === 'attaque' && tgt === undefined && !atk.noAtk) rollAtk(this.actor, name, total, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}});
      else if(type === 'attaque' && atk.noAtk) rollWAtk(this.actor, name, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}});
      else rollStd(this.actor, name, total);
    });

    html.find('div.attaque i.editAtk').click(ev => {
      const target = $(ev.currentTarget);
      const id = target.data('id');
      const value = target.data('value') ? false : true;

      this.actor.update({[`system.attaque.${id}.edit`]:value});
    });

    html.find('div.attaque .noAtk').click(ev => {
      const target = $(ev.currentTarget);
      const id = target.data('id');
      const value = target.data('value') ? false : true;

      this.actor.update({[`system.attaque.${id}.noAtk`]:value});
    });

    html.find('div.attaque select.defense').change(async ev => {
      const target = $(ev.currentTarget);
      const id = target.data('id');
      const value = target.val();
      let newValue = 10;

      if(value === 'robustesse') newValue = 15;

      $(html.find(`div.attaque div.specialline input.basedef${id}`)).val(newValue);
    });

    html.find('a.rollPwr').click(async ev => {
      const target = $(ev.currentTarget);
      const id = target.data('id');

      rollPwr(this.actor, id);
    });

    html.find('div.strategie input').change(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const mod = target.data('value');
      const value = Number(target.val());

      const update = {};
    
      switch(type) {
        case 'attaqueprecision':
        case 'attaquepuissance':
          if(mod === 'attaque') update[`system.strategie.${type}.effet`] = value*-1;
          else if(mod === 'effet') update[`system.strategie.${type}.attaque`] = value*-1;

          this.actor.update(update);
          break;

        case 'attaqueoutrance':
        case 'attaquedefensive':
          if(mod === 'attaque') update[`system.strategie.${type}.defense`] = value*-1;
          else if(mod === 'defense') update[`system.strategie.${type}.attaque`] = value*-1;

          this.actor.update(update);
          break;
      }
    });

    html.find('div.pouvoirs a.filtre').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');

      this.actor.update({[`system.filtre`]:type});
    });

    html.find('div.lPouvoirs select.link').change(async ev => {
      const target = $(ev.currentTarget);
      const header = target.parents(".summary");
      const cout = target.data('cout')-1;
      const val = target.val();

      if(val === '') this.actor.items.get(header.data("item-id")).update({[`system.link`]:val});
      else {
        const toLink = this.actor.items.get(val);
        const isDynamique = toLink.system.special === 'dynamique' ? true : false;
        const coutTotal = isDynamique ? toLink.system.cout.totalTheorique-1 : toLink.system.cout.total;

        if(val === 'principal') this.actor.items.get(header.data("item-id")).update({[`system.link`]:val});
        else if(coutTotal >= cout) this.actor.items.get(header.data("item-id")).update({[`system.link`]:val});
        else {
          this.actor.items.get(header.data("item-id")).update({[`system.link`]:''});
          target.val('');
        }
      }
    });

    html.find('div.totalpp summary').click(async ev => {
      const target = $(ev.currentTarget);
      const value = target.data('value') ? false : true;

      this.actor.update({[`system.pp.opened`]:value})
    });
  }

  /* -------------------------------------------- */
  _prepareCharacterItems(context) {
    const actor = context.actor;
    const items = context.items;
    const pouvoirs = items.filter(item => item.type === 'pouvoir');
    const pwr = [];    
    const talent = [];
    const equipement = [];
    const pwrStandard = {};
    const pwrAlternatif = {};
    const pwrDynamique = {};

    for(let p of pouvoirs) {
      pwrAlternatif[p._id] = [];
      pwrDynamique[p._id] = [];
    }

    for(let i of items) {
      const type = i.type;
      const data = i.system;

      switch(type) {
        case 'pouvoir':
          if(data.special === 'standard' || 
          (data.special === 'alternatif' && data.link === "") || 
          (data.special === 'dynamique' && data.link === "")) pwr.push(i);
          else if((data.special === 'alternatif' && data.link !== "")) pwrAlternatif[data.link].push(i);
          else if((data.special === 'dynamique' && data.link !== "")) pwrDynamique[data.link].push(i);
          
          if(data.special === 'standard' || (data.special === 'dynamique' && data.link === '')) pwrStandard[i._id] = i.name;
          break;

        case 'talent':
          talent.push(i);
          break;

        case 'equipement':
          equipement.push(i);
          break;
      }
    }

    actor.talents = talent;
    actor.equipements = equipement;
    actor.pouvoirs = pwr;
    actor.pwrStandard = pwrStandard;
    actor.pwrAlternatif = pwrAlternatif;
    actor.pwrDynamique = pwrDynamique;
  }

  _prepareCompetences(context) {
    const data = context.data.system.competence;
    const keys = Object.keys(data);
    const list = {};
    keys.forEach(key => {
      const get = data[key];
      const canAdd = get?.canAdd || false;

      list[key] = {
        label:game.i18n.localize(CONFIG.MM3.competences[key]),
        total:get?.total || 0,
        carac:get?.carac || 0,
        car:get.car,
        rang:get.rang,
        autre:get.autre,
        canAdd:canAdd,
      }

      if(canAdd) {
        list[key].list = get?.list || {};
      }      
    });

    const sortedList = Object.keys(list).sort((a, b) => {
      if (list[a].label < list[b].label) {
        return -1;
      }
      if (list[a].label > list[b].label) {
        return 1;
      }
      return 0;
    }).reduce((obj, key) => {
      obj[key] = list[key];
      return obj;
    }, {});


    context.systemData.competence.list = sortedList;
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `${game.i18n.localize(`ITEM.Type${type.capitalize()}`)}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
      img: {
        "equipement": "systems/mutants-and-masterminds-3e/assets/icons/equipement.svg",
        "modificateur": "systems/mutants-and-masterminds-3e/assets/icons/modificateur.svg",
        "pouvoir": "systems/mutants-and-masterminds-3e/assets/icons/pouvoir.svg",
        "qg": "systems/mutants-and-masterminds-3e/assets/icons/qg.svg",
        "talent": "systems/mutants-and-masterminds-3e/assets/icons/talent.svg",
        "vehicule": "systems/mutants-and-masterminds-3e/assets/icons/vehicule.svg",
      }[type]
    };

    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  async _onDropItemCreate(itemData) {
    itemData = itemData instanceof Array ? itemData : [itemData];

    if(itemData[0].type === 'modificateur') return;

    const toCreate = await this.actor.createEmbeddedDocuments("Item", itemData);

    if(toCreate[0].type === 'pouvoir') {
      this.actor.update({[`system.pwr.${toCreate[0]._id}`]:{
        cout:{
          rang:0
        }
      }});
    }

    return toCreate;
  }

  _onDragStart(event) {
    const li = event.currentTarget;

    if ( event.target.classList.contains("content-link") ) return;

    const label = $(li)?.data("name") || "";
    const type = $(li)?.data("type");
    const what = $(li)?.data("what");
    const id = $(li)?.data("id");

    // Create drag data
    const dragData = {
      actorId: this.actor.id,
      sceneId: this.actor.isToken ? canvas.scene?.id : null,
      tokenId: this.actor.isToken ? this.actor.token.id : null,
      label:label,
      type:type,
      what:what,
      id:id
    };

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }
}