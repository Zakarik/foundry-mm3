
import toggler from '../helpers/toggler.js';
import {
  xml2json,
  parseXML,
  processImport,
  accessibility,
  processMinions,
  speedCalc,
  commonHTML,
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
    this.__preparePhisicalDescription(context)
    context.systemData = context.data.system;
    this._prepareCompetences(context);

    if(game.settings.get("mutants-and-masterminds-3e", "stackeddmg")) context.systemData.stackeddmg = true;

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

    html.find('.item-create').click(this._onItemCreate.bind(this));
    commonHTML(html, this.actor, {hasItem:true, hasAtk:true, hasPwr:true, hasStr:true, hasPP:true, ppName:'pp', hasSpd:true, hasRoll:true, hasAdd:true});

    html.find('.pwrActivate').click(async ev => {
      const target = $(ev.currentTarget);
      const header = target.parents('.summary');
      const id = header.data('item-id');
      const item = this.actor.items.get(id);
      const isActive = item.system?.activate ?? false;
      const value = isActive ? false : true;
      const link = item.system?.link ?? '';
      let linksFilter = [];

      if(value) {
        linksFilter = this.actor.items.filter(itm =>
          (itm.system.link === link && itm._id !== id && link !== '' && (item.system.special === 'alternatif' || itm.system.special === 'alternatif')) ||
          (itm._id === item.system.link && item.system.special === 'alternatif') ||
          (itm.system.link === item._id && itm.system.special === 'alternatif'));

        for(let l of linksFilter) {
          l.update({['system.activate']:false});
        }
      }

      await item.update({[`system.activate`]:value});
    });

    html.find('.variantepwr').change(async ev => {
      const target = $(ev.currentTarget);
      const header = target.parents('.summary');
      const id = header.data('item-id');
      const item = this.actor.items.get(id);

      item.update({[`system.effectsVarianteSelected`]:target.val()});
    });

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

    html.find('span.switchIdentite').click(async ev => {
      const target = $(ev.currentTarget);
      const value = target.data("value") ? false : true;

      this.actor.update({[`system.identite.secret`]:value});
    });

    html.find('a.btnAbs').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const what = target.data('what');
      const value = target?.data('value') ?? false ? false : true;
      let update = {};

      update[`system.${type}.${what}.absente`] = value;

      await this.actor.update(update);
    });

    html.find('div.pouvoirs a.filtre').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');

      this.actor.update({[`system.filtre`]:type});
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
          else if((data.special === 'standard' && data.link !== "")) {
            if(!pwrLink?.[data.link]) {
              data.link = '';
              pwr.push(i)
            }  else pwrLink[data.link].push(i);
          }
          else if((data.special === 'alternatif' && data.link !== "")) {
            if(!pwrAlternatif?.[data.link]) {
              data.link = '';
              pwr.push(i)
            }  else pwrAlternatif[data.link].push(i);
          }
          else if((data.special === 'dynamique' && data.link !== "")) {
            if(!pwrDynamique?.[data.link]) {
              data.link = '';
              pwr.push(i)
            }  else pwrDynamique[data.link].push(i);
          }

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

      if(canAdd || isNew) {
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
__preparePhisicalDescription(context) {
  const mesureSystem = game.settings.get("mutants-and-masterminds-3e", "measuresystem");

  // --- DEFAULT VALUES ---
  if (!context.data.system.taille?.trim()) {
    context.data.system.taille = mesureSystem === "metric" ? "1.80m" : "6'0";
  }
  if (!context.data.system.poids?.trim()) {
    context.data.system.poids = mesureSystem === "metric" ? "90kg" : "200 lbs";
  }

  const heightStr = context.data.system.taille.trim().toLowerCase();
  const weightStr = context.data.system.poids.trim().toLowerCase();

  // --- HEIGHT PARSING ---
  let heightMeters = 0;

  if (heightStr.includes("'")) {
    // format like 6'2
    const parts = heightStr.split("'");
    const feet = parseInt(parts[0]) || 0;
    const inches = parseInt(parts[1]) || 0;
    heightMeters = feet * 0.3048 + inches * 0.0254;
  } else if (heightStr.endsWith("cm")) {
    const cm = parseFloat(heightStr.replace(/[^\d.,]/g, '').replace(',', '.'));
    heightMeters = cm / 100;
  } else if (heightStr.endsWith("m")) {
    heightMeters = parseFloat(heightStr.replace(/[^\d.,]/g, '').replace(',', '.'));
  } else {
    // fallback: assume number in meters
    heightMeters = parseFloat(heightStr.replace(',', '.')) || 0;
  }

  // --- WEIGHT PARSING ---
  let weightKg = 0;

  if (weightStr.includes("lb")) {
    const lbs = parseFloat(weightStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    weightKg = lbs * 0.45359237;
  } else if (weightStr.endsWith("kg")) {
    weightKg = parseFloat(weightStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  } else {
    // fallback assume numeric already in kg
    weightKg = parseFloat(weightStr.replace(',', '.')) || 0;
  }

  // --- OUTPUT BASED ON SYSTEM ---
  if (mesureSystem === "metric") {
    context.data.system.taille = `${heightMeters.toFixed(2)}m`;
    context.data.system.poids = `${Math.round(weightKg)}kg`;
  } else {
    const totalInches = heightMeters / 0.0254;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    const lbs = Math.round(weightKg / 0.45359237);
    context.data.system.taille = `${feet}'${inches}`;
    context.data.system.poids = `${lbs} lbs`;
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
      let type = li.dataset.type;
      let hasId;

      switch(type) {
        case 'attaque':
        case 'complications':
          const attaque = this.actor.system[li.dataset.type][sort];

          dragData = {
            type:type,
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