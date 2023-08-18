
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
  processImport,
  sendInChat,
  accessibility,
  processMinions,
  deletePrompt,
  modPromptClasses,
  speedCalc,
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
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "caracteristiques"}],
      dragDrop: [{dragSelector: [".draggable", ".item", ".reorder"], dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    this._prepareCharacterItems(context);
    this._prepareSpeed(context);

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
    accessibility(this.actor, html);

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
      temp = temp.replace(/&[^;]+;/g, '');
      if (temp[0] == "\"") { // remove the wrapping doublequotes
        temp = temp.substr(1, temp.length - 2);
      }

      const json = JSON.parse(xml2json(parseXML(temp), "\t"));
      const data = json.document.public.character;
      processImport(this.actor, data);
      processMinions(this.actor, data);
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

      confirm = await deletePrompt(this.actor, item.name);
      if(!confirm) return;

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

      let confirm;
      let label;

      switch(type) {
        case 'complications':
          confirm = await deletePrompt(this.actor, this.actor.system.complications[id].label);
          if(!confirm) return;

          this.actor.update({[`system.complications.-=${id}`]:null});
          break;
          
        case 'competence':
          if(what === 'combatcontact' || what === 'combatdistance') {
            const attaque = this.actor.system?.attaque || {};
            const keys = Object.keys(attaque);
            const indexAtt = keys.findIndex(key => {
              const item = attaque[key];
              return item.type === what && item.id === id;
            });

            label = this.actor.system.competence[what].list[id].label;

            if(indexAtt !== -1) update[`system.attaque.-=${keys[indexAtt]}`] = null;

            update[`system.competence.${what}.list.-=${id}`] = null;
          } else if(what === 'new') {
            label = this.actor.system.competence[id].label;

            update[`system.competence.-=${id}`] = null;
          } else {
            label = this.actor.system.competence[what].list[id].label;

            update[`system.competence.${what}.list.-=${id}`] = null;
          }

          confirm = await deletePrompt(this.actor, label);
          if(!confirm) return;

          this.actor.update(update);
          break;
      
        case 'attaque':
          confirm = await deletePrompt(this.actor, this.actor.system.attaque[id].label);
          if(!confirm) return;

          update[`system.attaque.-=${id}`] = null;

          this.actor.update(update);
          break;

        case 'vitesse':
          confirm = await deletePrompt(this.actor, this.actor.system.vitesse.list[id]?.label ?? game.i18n.localize('MM3.Vitesse'));
          if(!confirm) return;

          update[`system.vitesse.list.-=${id}`] = null;

          if(this.actor.system.vitesse.list[id].selected) update[`system.vitesse.list.base.selected`] = true;

          this.actor.update(update);
          break;
      }
    });

    html.find('a.selectspeed').click(async ev => {
      const target = $(ev.currentTarget);
      const id = target.data('id');
      const data = this.actor.system.vitesse.list;

      let update = {};

      for(let v in data) {
        update[`system.vitesse.list.${v}.selected`] = false;
      }

      update[`system.vitesse.list.${id}.selected`] = true;

      this.actor.update(update);
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
          let comp = {};
          let dataComp = [];
          let maxKeysComp = 0;
          let modele = {};

          if(what === 'combatcontact' || what === 'combatdistance') {
            comp = this.actor.system.competence[what];
            dataComp = Object.keys(comp.list);
            maxKeysComp = dataComp.length > 0 ? Math.max(...dataComp) : 0;
            modele = comp.modele;  

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
              basedef:15,
              defpassive:what === 'combatcontact' ? 'parade' : 'esquive',
            };

            update[`system.competence.${what}.list.${maxKeysComp+1}`] = modele;
          } else if(what === 'new') {
            comp = this.actor.system.competence;
            dataComp = Object.keys(comp);
            maxKeysComp = dataComp.length;
            
            update[`system.competence.z${maxKeysComp}`] = {
              "carCanChange":true,
              "car":"for",
              "label":"",
              "rang":0,
              "autre":0,
              "new":true
            };
          } else {
            comp = this.actor.system.competence[what];
            dataComp = Object.keys(comp.list);
            maxKeysComp = dataComp.length > 0 ? Math.max(...dataComp) : 0;
            modele = comp.modele;  
            
            update[`system.competence.${what}.list.${maxKeysComp+1}`] = modele;
          }

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
            basedef:15,
            defpassive:'parade',
          };

          this.actor.update(update);
          break;
      
        case 'vitesse':
          const vitesse = this.actor.system?.vitesse.list || {};
          const dataLength = Object.keys(vitesse).length;

          update[`system.vitesse.list.v${dataLength+1}`] = {
            'canDel':true,
            'label':"",
            'rang':0,
            'round':0,
            'kmh':0
          }

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
      const hasShift = ev.shiftKey;

      if(type === 'attaque' && tgt !== undefined && atk.noAtk) rollTgt(this.actor, name, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}}, tgt);
      else if(type === 'attaque' && tgt !== undefined && !atk.noAtk) rollAtkTgt(this.actor, name, total, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}}, tgt);
      else if(type === 'attaque' && tgt === undefined && !atk.noAtk) rollAtk(this.actor, name, total, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}});
      else if(type === 'attaque' && atk.noAtk) rollWAtk(this.actor, name, {attaque:atk, strategie:{attaque:strattaque, effet:streffet}});
      else rollStd(this.actor, name, total, hasShift);
    });

    html.find('a.sendInfos').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const actor = this.actor;
      const item = actor.items.get(header.data("item-id"));

      sendInChat(actor, item);
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
      const hasShift = ev.shiftKey;

      if(hasShift) {
        const dialog = new Dialog({
          title:game.i18n.localize("MM3.DIALOG.AskMod"),
          content:`<span class='label'>${game.i18n.localize('MM3.Mod')}</span><input class='mod' type='number' value='0' />`,
          buttons: {
            one: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize('MM3.ROLL.Valider'),
              callback: (html) => {
                rollPwr(this.actor, id, $(html.find('input.mod')).val());
              }
            },
            two: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.localize('MM3.ROLL.Annuler'),
              callback: (html) => {}
            }
          },
        },
        {
          classes: modPromptClasses(this.actor)
        }).render(true); 
      } else {
        rollPwr(this.actor, id);
      }      
    });

    html.find('a.btnAbs').click(ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const what = target.data('what');
      const value = target?.data('value') ?? false ? false : true;

      this.actor.update({[`system.${type}.${what}.absente`]:value});
    });

    html.find('a.saveLimiteStrategie').click(async ev => {
      let update = {};

      update['system.strategie.limite'] = this.actor.system.strategie.limite.query;

      this.actor.update(update);

      const rollMsgData = {
        user: game.user.id,
        speaker: {
          actor: this.actor?.id || null,
          token: this.actor?.token?.id || null,
          alias: this.actor?.name || null,
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

    html.find('div.caracteristiques div.strategie input').change(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const mod = target.data('value');
      const max = target.data('max');
      const value = Number(target.val());
      const inpMax = Number(target.attr('max'));
      const inpMin = Number(target.attr('min'));
      const update = {};

      let newValue = 0;
      if((value*-1) < 0) newValue = Math.max((value*-1), max);
      else if((value*-1) > 0) newValue = Math.min((value*-1), max);
    
      switch(type) {
        case 'attaqueprecision':
          if(mod === 'attaque') {
            if(value > inpMax) {
              target.val(inpMax);
              newValue = inpMax*-1;
            }
            else if(value < 0) {
              target.val(0);
              newValue = 0;
            }

            update[`system.strategie.${type}.effet`] = newValue;
          }
          else if(mod === 'effet') {
            if(value < inpMin) {
              target.val(inpMin);
              newValue = inpMin*-1;
            } 
            else if(value > 0) {
              target.val(0);
              newValue = 0;
            }

            update[`system.strategie.${type}.attaque`] = newValue;
          }

          this.actor.update(update);
          break;

        case 'attaquepuissance':
          if(mod === 'attaque') {
            if(value < inpMin) {
              target.val(inpMin);
              newValue = inpMin*-1;
            } 
            else if(value > 0) {
              target.val(0);
              newValue = 0;
            }

            update[`system.strategie.${type}.effet`] = newValue;
          }
          else if(mod === 'effet') {
            if(value > inpMax) {
              target.val(inpMax);
              newValue = inpMax*-1;
            } 
            else if(value < 0) {
              target.val(0);
              newValue = 0;
            } 

            update[`system.strategie.${type}.attaque`] = newValue;
          }

          this.actor.update(update);
          break;

        case 'attaqueoutrance':
          if(mod === 'attaque') {
            if(value > inpMax) {
              target.val(inpMax);
              newValue = inpMax*-1;
            } 
            else if(value < 0) {
              target.val(0);
              newValue = 0;
            } 

            update[`system.strategie.${type}.defense`] = newValue;
          } 
          else if(mod === 'defense') {
            if(value < inpMin) {
              target.val(inpMin);
              newValue = inpMin*-1;
            } 
            else if(value > 0) {
              target.val(0);
              newValue = 0;
            }

            update[`system.strategie.${type}.attaque`] = newValue;
          }

          this.actor.update(update);
          break;

        case 'attaquedefensive':
          if(mod === 'attaque') {
            if(value < inpMin) {
              target.val(inpMin);
              newValue = inpMin*-1;
            } 
            else if(value > 0) {
              target.val(0);
              newValue = 0;
            }

            update[`system.strategie.${type}.defense`] = newValue;
          } 
          else if(mod === 'defense') {
            if(value > inpMax) {
              target.val(inpMax);
              newValue = inpMax*-1;
            } 
            else if(value < 0) {
              target.val(0);
              newValue = 0;
            } 

            update[`system.strategie.${type}.attaque`] = newValue;
          }

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

      this.actor.update(update);
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
    const pwrLink = {};
    const pwrAlternatif = {};
    const pwrDynamique = {};

    for(let p of pouvoirs) {
      pwrLink[p._id] = [];
      pwrAlternatif[p._id] = [];
      pwrDynamique[p._id] = [];
    }

    for(let i of items) {
      const type = i.type;
      const data = i.system;

      switch(type) {
        case 'pouvoir':
          if((data.special === 'standard' && data.link === "") || 
          (data.special === 'alternatif' && data.link === "") || 
          (data.special === 'dynamique' && data.link === "")) pwr.push(i);
          else if((data.special === 'standard' && data.link !== "")) pwrLink[data.link].push(i);
          else if((data.special === 'alternatif' && data.link !== "")) pwrAlternatif[data.link].push(i);
          else if((data.special === 'dynamique' && data.link !== "")) pwrDynamique[data.link].push(i);
          
          if((data.special === 'standard' && data.link === '') || (data.special === 'dynamique' && data.link === '')) pwrStandard[i._id] = i.name;
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
    actor.pwrLink = pwrLink;
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
      const carCanChange = get?.carCanChange || false;
      const isNew = get?.new || false;

      list[key] = {
        order:isNew ? 'zzzzzz' : game.i18n.localize(CONFIG.MM3.competences[key]),
        label:isNew ? get.label : game.i18n.localize(CONFIG.MM3.competences[key]),
        total:get?.total || 0,
        carac:get?.carac || 0,
        car:get.car,
        rang:get.rang,
        autre:get.autre,
        canAdd:canAdd,
        carCanChange:carCanChange,
        new:isNew,
      }

      if(canAdd) {
        list[key].list = get?.list || {};
      }      
    });

    const sortedList = Object.keys(list).sort((a, b) => {
      if (list[a].order < list[b].order) {
        return -1;
      }
      if (list[a].order > list[b].order) {
        return 1;
      }
      return 0;
    }).reduce((obj, key) => {      
      obj[key] = list[key];
      return obj;
    }, {});


    context.systemData.competence.list = sortedList;
  }

  _prepareSpeed(context) {
    const system = game.settings.get("mutants-and-masterminds-3e", "measuresystem");
    const data = context.data.system.vitesse.list;

    if(system === 'metric') {
      context.data.system.vitesse.mlabel2 = game.i18n.localize('MM3.VITESSE.Kmh');
      context.data.system.vitesse.mlabel1 = game.i18n.localize('MM3.VITESSE.Metre-short');
    } else {
      context.data.system.vitesse.mlabel2 = game.i18n.localize('MM3.VITESSE.Mph');
      context.data.system.vitesse.mlabel1 = game.i18n.localize('MM3.VITESSE.Pied-short');
    }

    for(let v in data) {
      const vData = data[v];
      const autotrade = vData?.autotrade ?? false;

      if(autotrade !== false) vData.label = game.i18n.localize(CONFIG.MM3.vitesse[autotrade]);

      if(game.settings.get("mutants-and-masterminds-3e", "speedcalculate")) {
        const rang = Number(vData.rang);
      
        data[v].round = speedCalc(rang).toLocaleString();
        data[v].kmh = (speedCalc(rang+9)/5280).toLocaleString();
      }
      else data[v].manuel = true;
    }    
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

    // Create drag data
    let dragData;

    // Owned Items
    if ( li.dataset.itemId ) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    // Active Effect
    if ( li.dataset.effectId ) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if(li.classList.contains('reorder')) {
      const sort = li.dataset.sort === undefined ? li.parentNode.dataset.sort : li.dataset.sort;

      switch(li.dataset.type) {
        case 'attaque':
        case 'complications':
          const attaque = this.actor.system[li.dataset.type][sort];

          dragData = {
            type:li.dataset.type,
            data:attaque,
            sort:sort,
          };
          break;
        case 'competence':
          const competence = this.actor.system[li.dataset.type][li.dataset.comp].list[sort];

          dragData = {
            type:li.dataset.type,
            comp:li.dataset.comp,
            data:competence,
            sort:sort,
          };
          break;
        case 'basecompetence':
          const basecompetence = this.actor.system.competence[sort];

          dragData = {
            type:li.dataset.type,
            data:basecompetence,
            sort:sort,
          };
          break;
      }
    }

    if(li.classList.contains('draggable')) {
      const label = $(li)?.data("name") || "";
      const type = $(li)?.data("type");
      const what = $(li)?.data("what");
      const id = $(li)?.data("id");

      // Create drag data
      dragData = {
        actorId: this.actor.id,
        sceneId: this.actor.isToken ? canvas.scene?.id : null,
        tokenId: this.actor.isToken ? this.actor.token.id : null,
        label:label,
        type:type,
        what:what,
        id:id
      };
    }

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  /** @inheritdoc */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    const dropType = event.target.dataset.type === undefined ? event.target.parentNode.dataset.type : event.target.dataset.type;
    const sort = event.target.dataset.sort === undefined ? event.target.parentNode.dataset.sort : event.target.dataset.sort;
    if ( allowed === false ) return;

    let tempTgt;
    let update = {};

    // Handle different data types
    switch ( data.type ) {
      case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
      case "attaque":
      case "complications":
        tempTgt = actor.system[data.type][sort];

        if(tempTgt === undefined || data.type !== dropType) return;
        
        update[`system.${data.type}.${sort}`] = data.data;
        update[`system.${data.type}.${data.sort}`] = tempTgt;
        actor.update(update);        
        break;
      case "competence":
        tempTgt = actor.system[data.type][data.comp].list[sort];

        if(tempTgt === undefined || data.type !== dropType) return;

        update[`system.${data.type}.${data.comp}.list.${sort}`] = data.data;
        update[`system.${data.type}.${data.comp}.list.${data.sort}`] = tempTgt;
        actor.update(update);        
        break;
      case 'basecompetence':
        tempTgt = actor.system.competence[sort];

        if(tempTgt === undefined || data.type !== dropType) return;

        update[`system.competence.${sort}`] = data.data;
        update[`system.competence.${data.sort}`] = tempTgt;
        actor.update(update);
        break;
    }
  }
}