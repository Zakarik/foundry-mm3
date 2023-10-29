
import toggler from '../helpers/toggler.js';
import {
  accessibility,
  speedCalc,
  commonHTML,
  actualiseWAtt,
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
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "details"}],
      dragDrop: [{dragSelector: [".draggable", ".reorder", ".item"], dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    this._prepareCharacterItems(context);
    this._prepareSpeed(context);

    context.systemData = context.data.system;
    this._prepareList(context);
    actualiseWAtt();

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
    accessibility(this.actor, html);

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
    commonHTML(html, this.actor, {hasItem:true, hasAtk:true, hasPwr:true, hasStr:true, strInput:`div.details div.strategie input`, hasPP:true, ppName:'cout', hasSpd:true, hasRoll:true, hasAdd:true});
  }

  /* -------------------------------------------- */
  _prepareCharacterItems(context) {
    const actor = context.actor;
    const items = context.items;
    const pouvoirs = items.filter(item => item.type === 'pouvoir');
    const pwr = [];
    const pwrLink = {};
    const pwrAlternatif = {};
    const pwrDynamique = {};
    const pwrStandard = {};
    
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
      }
    }

    actor.pouvoirs = pwr;
    actor.pwrLink = pwrLink;
    actor.pwrStandard = pwrStandard;
    actor.pwrAlternatif = pwrAlternatif;
    actor.pwrDynamique = pwrDynamique;
  }

  _prepareSpeed(context) {
    const system = game.settings.get("mutants-and-masterminds-3e", "measuresystem");
    const data = context.data.system.vitesse.list;
    let divide = 1000;

    if(system === 'metric') {
      context.data.system.vitesse.mlabel2 = game.i18n.localize('MM3.VITESSE.Kmh');
      context.data.system.vitesse.mlabel1 = game.i18n.localize('MM3.VITESSE.Metre-short');
    } else {
      context.data.system.vitesse.mlabel2 = game.i18n.localize('MM3.VITESSE.Mph');
      context.data.system.vitesse.mlabel1 = game.i18n.localize('MM3.VITESSE.Pied-short');
      divide = 5280;
    }

    for(let v in data) {
      const vData = data[v];
      const autotrade = vData?.autotrade ?? false;

      if(autotrade !== false) vData.label = game.i18n.localize(CONFIG.MM3.vitesse[autotrade]);

      if(game.settings.get("mutants-and-masterminds-3e", "speedcalculate")) {
        const rang = Number(vData.rang);
      
        data[v].round = speedCalc(rang).toLocaleString();
        data[v].kmh = (speedCalc(rang+9)/divide).toLocaleString();
      }
      else data[v].manuel = true;
    }    
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
      const author = $(li)?.data("author");
      const item = this.actor.items.get(id);

      // Create drag data
      dragData = {
        actorId: this.actor.id,
        sceneId: this.actor.isToken ? canvas.scene?.id : null,
        tokenId: this.actor.isToken ? this.actor.token.id : null,
        label:label,
        type:type,
        what:what,
        id:id,
        author:author,
        img:item?.img ?? "",
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