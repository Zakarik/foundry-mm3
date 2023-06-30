
import toggler from '../helpers/toggler.js';
import {
  rollAtkTgt,
  rollAtk,
  rollStd,
  rollPwr,
} from "../helpers/common.mjs";

/**
 * @extends {ActorSheet}
 */
export class VehiculeActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mm3", "sheet", "actor", "vehicule"],
      template: "systems/mutants-and-masterminds-3e/templates/vehicule-actor-sheet.html",
      width: 850,
      height: 450,
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

    this._prepareList(context);

    return context;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
   get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/mutants-and-masterminds-3e/templates/limited-vehicule-sheet.html";
    }
    return this.options.template;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    toggler.init(this.id, html);

    html.find('.pouvoirs .mod i').hover(ev => {
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
      const item = this.actor.items.get(header.data("item-id"));

      item.delete();
      header.slideUp(200, () => this.render(false));
    });

    html.find('div.totalpp summary').click(async ev => {
      const target = $(ev.currentTarget);
      const value = target.data('value') ? false : true;

      this.actor.update({[`system.cout.opened`]:value})
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

      if(type === 'attaque' && tgt !== undefined) rollAtkTgt(this.actor, name, total, {attaque:this.actor.system.attaque[id], strategie:{attaque:strattaque, effet:streffet}}, tgt);
      else if(type === 'attaque') rollAtk(this.actor, name, total, {attaque:this.actor.system.attaque[id], strategie:{attaque:strattaque, effet:streffet}});
      else rollStd(this.actor, name, total);
    });

    html.find('a.rollPwr').click(async ev => {
      const target = $(ev.currentTarget);
      const id = target.data('id');

      rollPwr(this.actor, id);
    });
  }

  /* -------------------------------------------- */
  _prepareCharacterItems(context) {
    const actor = context.actor;
    const items = context.items;
    const pouvoirs = items.filter(item => item.type === 'pouvoir');
    const pwr = [];
    const pwrAlternatif = {};
    const pwrDynamique = {};
    const pwrStandard = {};
    
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
      }
    }

    actor.pouvoirs = pwr;
    actor.pwrStandard = pwrStandard;
    actor.pwrAlternatif = pwrAlternatif;
    actor.pwrDynamique = pwrDynamique;
  }

  _prepareList(context) {
    const fullList = ['Tailles'];
    const toAdd = {};

    for(let l of fullList) {
      const tra = CONFIG.MM3[l.toLowerCase()];
      const list = {};

      for(let t in tra) {
        list[t] = game.i18n.localize(tra[t]);
      }

      /*const sortedList = Object.keys(list).sort((a, b) => {
        if (list[a] < list[b]) {
          return -1;
        }
        if (list[a] > list[b]) {
          return 1;
        }
        return 0;
      }).reduce((obj, key) => {
        obj[key] = list[key];
        return obj;
      }, {});*/

      toAdd[`list${l}`] = list;
    }

    context.systemData = mergeObject(context.systemData, toAdd);
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

    if(itemData[0].type === 'modificateur' || itemData[0].type === 'equipement' || itemData[0].type === 'talent') return;

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
    const author = $(li)?.data("author");

    // Create drag data
    const dragData = {
      actorId: this.actor.id,
      sceneId: this.actor.isToken ? canvas.scene?.id : null,
      tokenId: this.actor.isToken ? this.actor.token.id : null,
      label:label,
      type:type,
      what:what,
      id:id,
      author:author
    };

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }
}