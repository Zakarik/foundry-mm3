/**
 * @extends {ActorSheet}
 */
export class PouvoirItemSheet extends ItemSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mm3", "sheet", "item", "pouvoir"],
      template: "systems/mutants-and-masterminds-3e/templates/pouvoir-item-sheet.html",
      width: 850,
      height: 600,
      dragDrop: [{dragSelector: ".draggable", dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();

    context.systemData = context.data.system;
    this._prepareList(context);

    return context;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
   get template() {
    if (!game.user.isGM && this.item.limited) {
      return "systems/mutants-and-masterminds/templates/limited-sheet.html";
    }
    return this.options.template;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    html.find('.cout details summary').click(async ev => {
      const target = $(ev.currentTarget);
      const value = target.data("value") ? false : true;

      this.item.update({[`system.cout.details`]:value});
    });
    
    html.find('.modificateurs details summary div.before').click(async ev => {
      const target = $(ev.currentTarget);
      const mod = target.data("mod");
      const id = target.data("id");
      const value = target.data("value") ? false : true;

      this.item.update({[`system.${mod}.${id}.details`]:value});
    });
    
    html.find('a.add').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');

      switch(type) {
        case 'descripteurs':
          const dataDescripteurs = Object.keys(this.item.system.descripteurs);
          const maxKeysComplication = dataDescripteurs.length ? Math.max(...dataDescripteurs) : 0;
          
          this.item.update({[`system.descripteurs.${maxKeysComplication+1}`]:""});
          break;
      }
    });

    html.find('i.delete').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      const id = target.data('id');

      switch(type) {
        case 'descripteurs':

          this.item.update({[`system.descripteurs.-=${id}`]:null});
          break;

        case 'extras':
          this.item.update({[`system.extras.-=${id}`]:null});
          break;

        case 'defauts':
          this.item.update({[`system.defauts.-=${id}`]:null});
          break;
      }
    });

    html.find('a.btn').click(async ev => {
      const target = $(ev.currentTarget);
      const mod = target.data('mod');
      const id = target.data('id');
      const type = target.data('type');
      const value = target.data('value');
      const data = this.item.system[mod][id].data.cout;

      const update = {};

      if(type === 'fixe' && !data.rang && value) {
        update[`system.${mod}.${id}.data.cout.rang`] = true;
        update[`system.${mod}.${id}.data.cout.fixe`] = false;

        this.item.update(update);
      } else this.item.update({[`system.${mod}.${id}.data.cout.${type}`]:false});

      if(type === 'rang' && !data.fixe && value) {
        update[`system.${mod}.${id}.data.cout.rang`] = false;
        update[`system.${mod}.${id}.data.cout.fixe`] = true;

        this.item.update(update);
      } else this.item.update({[`system.${mod}.${id}.data.cout.${type}`]:false});

      if(!value) this.item.update({[`system.${mod}.${id}.data.cout.${type}`]:true});
    });
    
    html.find('a.special').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data('type');
      
      this.item.update({[`system.special`]:type});
    });
    
    html.find('i.create').click(async ev => {
      const target = $(ev.currentTarget);
      const mod = target.data('mod');
      const data = this.item.system[mod];

      const dataMod = Object.keys(data);
      const maxKeysMod = dataMod.length ? Math.max(...dataMod) : 0;
      
      this.item.update({[`system.${mod}.${maxKeysMod+1}`]:{
        name:"",
        data:{
          description:"",
          cout:{
            fixe:true,
            rang:false,
            value:0
          }
        }
      }});
    });
  }

  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const cls = getDocumentClass(data?.type);
    if ( !cls || !(cls.collectionName in Adventure.contentFields) ) return;
    const document = await cls.fromDropData(data);
    const getData = this.item.system;
    const type = document.type;

    if(type === 'modificateur') {
      const getType = document.system.type;
      const dataMod = Object.keys(getData[`${getType}s`]);
      const maxKeysMod = dataMod.length ? Math.max(...dataMod) : 0;      

      const update = {};
      update[`system.${getType}s.${maxKeysMod}`] = {
        name:document.name,
        data:document.system
      };

      this.item.update(update);
    }
  }

  _prepareList(context) {
    const fullList = ['Types', 'Actions', 'Portees', 'Durees'];
    const toAdd = {};

    for(let l of fullList) {
      const tra = CONFIG.MM3.pouvoirs[l.toLowerCase()];
      const list = {};

      for(let t in tra) {
        list[t] = game.i18n.localize(tra[t]);
      }

      const sortedList = Object.keys(list).sort((a, b) => {
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
      }, {});

      toAdd[`list${l}`] = sortedList;
    }

    context.systemData = mergeObject(context.systemData, toAdd);
  }
}