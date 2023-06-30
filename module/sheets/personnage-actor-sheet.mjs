
import toggler from '../helpers/toggler.js';
import {
  rollAtkTgt,
  rollAtk,
  rollStd,
  rollPwr,
  rollTgt,
  rollWAtk,
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
      const cout = target.data('cout');
      const val = target.val();

      if(val === '') this.actor.items.get(header.data("item-id")).update({[`system.link`]:val});
      else {
        const toLink = this.actor.items.get(val);

        if(val === 'principal') this.actor.items.get(header.data("item-id")).update({[`system.link`]:val});
        else if(toLink.system.cout.total >= cout) this.actor.items.get(header.data("item-id")).update({[`system.link`]:val});
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
        "equipement": "systems/mutants-and-masterminds-3e/assets/icons/equipment.svg",
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