import {
    accessibility,
} from "../helpers/common.mjs";

export class EditAttaque extends FormApplication {
    constructor(object, options={}) {
        super(object, options);
        this.origin = game.mm3.getAtk(this.actor, this.object.id);
    }
  
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ['edit-attaque'],
        popOut: true,
        template: `systems/mutants-and-masterminds-3e/templates/dialog/edit-attaque.html`,
        sheetConfig: true,
        resizable:true,
        title:this.label,
        height:400,
        width:500
      });
    }

    get document() {
        return this.object;
    }

    get id() {
        return this.atk.data._id;
    }

    get atk() {
        const getAtk = game.mm3.getAtk(this.actor, this.object.id);

        let data = {
            key:getAtk.key,
            data:foundry.utils.mergeObject(getAtk.data, this.data?.atk ?? {}, {overwrite: true, recursive: true, insertValues: true}),
        }

        return data;
    }

    set atk(dAtk) {
        const getAtk = game.mm3.getAtk(this.actor, this.object.id);

        this.data.atk = foundry.utils.mergeObject(getAtk.data, dAtk, {overwrite: true, recursive: true, insertValues: true})            
    }

    get actor() {
        return game.actors.get(this.object.actor);
    }

    get label() {
        const atk = this.atk.data;
        let result = atk.label;
        let skill = atk?.skill ?? '';

        if(atk.pwr !== '' && atk.pwr !== undefined) result = this.actor.items.find(pwr => pwr._id === atk.pwr).name;
        else if(skill !== '' && atk.type !== '' && atk.skill !== undefined && atk.type !== undefined) result = game.mm3.getDataSubSkill(this.actor, atk.type, skill).label;
        else result = atk.label;

        return result;
    }

    get isLie() {
        let lie = false;

        if(this.lieOrCanBeSkill || this.lieOrCanBePwr) lie = true;

        return lie;
    }

    get listSkill() {
        const data = this.actor.system.competence;
        const cc = data.combatcontact.list;
        const rc = data.combatdistance.list;
        let list = {
            'combatcontact':[],
            'combatdistance':[],
        };

        for(let c in cc) {
            let d = cc[c];

            list.combatcontact.push({
                'label':d.label,
                '_id':d._id,
            });
        }

        for(let c in rc) {
            let d = rc[c];

            list.combatdistance.push({
                'label':d.label,
                '_id':d._id,
            });
        }

        return list;
    }

    get lieOrCanBeSkill() {
        const atk = this.data?.tempAtk ?? this.atk.data;
        let getSkill = false;
        let result = true;
        if(atk.skill !== '' && atk.type !== '' && atk.skill !== undefined && atk.type !== undefined) getSkill = game.mm3.getDataSubSkill(this.actor, atk.type, atk.skill)
        if(!getSkill && (!this.data?.canBeLieSkill ?? false)) result = false;

        return result;

    }

    get lieOrCanBePwr() {
        const atk = this.data?.tempAtk ?? this.atk.data;
        let result = true;
        let canBeLePwr = this.data?.canBeLiePwr ?? false;
        let pwr = atk?.pwr ?? "";

        if(!canBeLePwr && pwr === "") result = false;

        return result;
    }

    get listPwr() {
        return this.actor.items.filter(pwr => pwr.type === 'pouvoir');
    }

    get status() {
        return CONFIG.statusEffects;
    }

    get actualLink() {
        const dataAtk = this.data?.tempAtk ?? this.atk?.data;
        let result = "";

        result = `${dataAtk.type}/${dataAtk.skill}`;

        if(result === `/`) result = "";

        return result;
    }

    /**
     * @param {any} data
     */
    set dataAtk(data) {
        this.data.tempAtk = foundry.utils.mergeObject(this.data.tempAtk, data, {overwrite:true, recursive:true});
    }

    actualise() {
        this.render(true);
    }
  
    getData(options={}) {
        this.options.title = this.label;

        const alreadyTypeAtk = this.data?.setTypeAtk ?? false;
        const dataAtk = !alreadyTypeAtk ? this.data?.tempAtk ?? this.atk?.data ?? {} : {};
        const isDmg = dataAtk?.isDmg ?? false;
        const isAffliction = dataAtk?.isAffliction ?? false;
        let typeAtk = alreadyTypeAtk;

        if(isDmg && isAffliction && !alreadyTypeAtk) {
            typeAtk = 'afflictiondmg';
        } else if(isDmg && !alreadyTypeAtk) {
            typeAtk = 'dmg';
        } else if(isAffliction && !alreadyTypeAtk) {
            typeAtk = 'affliction';
        } else if(!isDmg && !isAffliction && !alreadyTypeAtk) {
            typeAtk = "none";
        }

        this.data = {
            skills:this.listSkill,
            actualLink:this.actualLink,
            tempAtk:{
                label:this.data?.tempAtk?.label ?? this.atk?.data?.label ?? '',
                pwr:this.data?.tempAtk?.pwr ?? this.atk?.data?.pwr ?? '',
                skill:this.data?.tempAtk?.skill ?? this.atk?.data?.skill ?? '',
                type:this.data?.tempAtk?.type ?? this.atk?.data?.type ?? '',
                defpassive:this.data?.tempAtk?.defpassive ?? this.atk?.data?.defpassive ?? 'parade',
                isAffliction:this.data?.tempAtk?.isAffliction ?? this.atk?.data?.isAffliction ?? false,
                isDmg:this.data?.tempAtk?.isDmg ?? this.atk?.data?.isDmg ?? false,
                basedef:this.data?.tempAtk?.basedef ?? this.atk?.data?.basedef ?? 0,
                effet:this.data?.tempAtk?.effet ?? this.atk?.data?.effet ?? 0,
                afflictiondef:this.data?.tempAtk?.afflictiondef ?? this.atk?.data?.afflictiondef ?? 0,
                afflictioneffet:this.data?.tempAtk?.afflictioneffet ?? this.atk?.data?.afflictioneffet ?? 0,
                mod:{
                    atk:this.data?.tempAtk?.mod?.atk ?? this.atk?.data?.mod?.atk ?? 0,
                    eff:this.data?.tempAtk?.mod?.eff ?? this.atk?.data?.mod?.eff ?? 0,
                },
                afflictionechec:{
                    e1:this.data?.tempAtk?.afflictionechec?.e1 ?? this.atk?.data?.afflictionechec?.e1 ?? [],
                    e2:this.data?.tempAtk?.afflictionechec?.e2 ?? this.atk?.data?.afflictionechec?.e2 ?? [],
                    e3:this.data?.tempAtk?.afflictionechec?.e3 ?? this.atk?.data?.afflictionechec?.e3 ?? [],
                },
                dmgechec:{
                    e1:this.data?.tempAtk?.dmgechec?.e1 ?? this.atk?.data?.dmgechec?.e1 ?? [],
                    e2:this.data?.tempAtk?.dmgechec?.e2 ?? this.atk?.data?.dmgechec?.e2 ?? [],
                    e3:this.data?.tempAtk?.dmgechec?.e3 ?? this.atk?.data?.dmgechec?.e3 ?? [],
                    e4:this.data?.tempAtk?.dmgechec?.e4 ?? this.atk?.data?.dmgechec?.e4 ?? [],
                    v1:this.data?.tempAtk?.dmgechec?.v1 ?? this.atk?.data?.dmgechec?.v1 ?? 1,
                    v2:this.data?.tempAtk?.dmgechec?.v2 ?? this.atk?.data?.dmgechec?.v2 ?? 1,
                    v3:this.data?.tempAtk?.dmgechec?.v3 ?? this.atk?.data?.dmgechec?.v3 ?? 1,
                    v4:this.data?.tempAtk?.dmgechec?.v4 ?? this.atk?.data?.dmgechec?.v4 ?? 1,
                },
                noAtk:this.data?.tempAtk?.noAtk ?? this.atk?.data?.noAtk ?? false,
                noCrit:this.data?.tempAtk?.noCrit ?? this.atk?.data?.noCrit ?? false,
                save:this.data?.tempAtk?.save ?? this.atk?.data?.save ?? 'robustesse',
                saveAffliction:this.data?.tempAtk?.saveAffliction ?? this.atk?.data?.saveAffliction ?? 'volonte',
            },
            atk:this.data?.atk ?? this.atk?.data ?? {},
            pwrs:this.listPwr,
            lie:this.isLie,
            canBeLiePwr:this.lieOrCanBePwr,
            canBeLieSkill:this.lieOrCanBeSkill,
            etats:this.status,
            setTypeAtk:typeAtk,
            degreeAffliction:{
                e1:this.data?.degreeAffliction?.e1 ?? "",
                e2:this.data?.degreeAffliction?.e2 ?? "",
                e3:this.data?.degreeAffliction?.e3 ?? "",
            },
            degreeDmg:{
                e1:this.data?.degreeDmg?.e1 ?? "",
                e2:this.data?.degreeDmg?.e2 ?? "",
                e3:this.data?.degreeDmg?.e3 ?? "",
                e4:this.data?.degreeDmg?.e4 ?? "",
            },
        };
        
        return {
            options: this.options,
            actor:this.actor,
            data:this.data,
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        accessibility(this.actor, html);

        html.find('input.label').change(ev => {
            const target = $(ev.currentTarget);
            const value = target.val();

            this.dataAtk = {
                label:value,
            }
        });

        html.find('a.linkpwr').click(ev => {
            const target = $(ev.currentTarget);
            const value = target.hasClass("selected") ? false : true;

            this.data.canBeLiePwr = value;
            
            if(!value) {
                this.dataAtk = {
                    pwr:'',
                    mod:{
                        eff:0,
                    }
                }

                if(this.data.tempAtk.skill !== '' && this.data.tempAtk.type !== '' && this.data.tempAtk.skill !== undefined && this.data.tempAtk.type !== undefined) {
                    this.dataAtk = {
                        label:game.mm3.getDataSubSkill(this.actor, this.data.tempAtk.type, this.data.tempAtk.skill).label,
                    }                
                }
            }

            this.render(true);
        });

        html.find('select.linkpwr').change(ev => {
            const target = $(ev.currentTarget);
            const value = target.val();

            if(value !== "") {
                this.dataAtk = {
                    pwr:value,
                    label:this.actor.items.find(pwr => pwr._id === value).name,
                }
            } else {
                this.dataAtk = {
                    pwr:'',
                }

                if(this.data.tempAtk.skill !== '' && this.data.tempAtk.type !== '' && this.data.tempAtk.skill !== undefined && this.data.tempAtk.type !== undefined) {
                    this.dataAtk = {
                        label:game.mm3.getDataSubSkill(this.actor, this.data.tempAtk.type, this.data.tempAtk.skill).label,
                    }
                }

                this.data.canBeLiePwr = true;
            }

            this.render(true);
        });

        html.find('a.linkskill').click(ev => {
            const target = $(ev.currentTarget);
            const value = target.hasClass("selected") ? false : true;

            this.data.canBeLieSkill = value;

            if(!value) {
                this.dataAtk = {
                    skill:'',
                    type:'other',
                    mod:{
                        atk:0,
                    }
                }

                if(this.data.tempAtk.pwr === '' || this.data.tempAtk.pwr === undefined) {
                    let subSkill = game.mm3.getDataSubSkill(this.actor, this.data.tempAtk.type, this.data.tempAtk.skill);

                    if(subSkill !== null) this.dataAtk = {
                        label:subSkill.label
                    }
                }
            }

            this.render(true);
        });

        html.find('select.linkskill').change(ev => {
            const target = $(ev.currentTarget);
            const value = target.val();
            const type = value.split('/')[0];
            const id = value.split('/')[1];

            if(value !== "") {
                this.dataAtk = {
                    skill:id,
                    type:type,
                    defpassive:type === 'combatcontact' ? 'parade' : 'esquive',
                }

                if(this.data.tempAtk.pwr === '' || this.data.tempAtk.pwr === undefined) {
                    let subSkill = game.mm3.getDataSubSkill(this.actor, type, id);

                    if(subSkill !== null) {
                        this.dataAtk = {
                            label:subSkill.label
                        }
                    }
                }
            } else {
                this.dataAtk = {
                    skill:'',
                    type:'other',
                }

                this.data.canBeLieSkill = true;
            }

            this.render(true);
        });
        
        html.find('a.noAtk').click(ev => {
            const target = $(ev.currentTarget);
            const value = target.hasClass("selected") ? false : true;

            this.dataAtk = {
                noAtk:value,
            }

            this.render(true);
        });

        html.find('a.noCrit').click(ev => {
            const target = $(ev.currentTarget);
            const value = target.hasClass("selected") ? false : true;

            this.dataAtk = {
                noCrit:value,
            }

            this.render(true);
        });

        html.find('select.selectDefense').change(ev => {
            const target = $(ev.currentTarget);
            const value = target.val();

            this.dataAtk = {
                defpassive:value,
            }

            this.render(true);
        });

        html.find('input.basedef').change(ev => {
            const target = $(ev.currentTarget);
            const value = target.val();

            this.dataAtk = {
                basedef:value,
            }
        });

        html.find('input.defense').change(ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const value = target.val();
            let defType = '';

            switch(type) {
                case 'dmg':
                    defType = 'basedef';
                    break;
                    
                case 'affliction':
                    defType = 'afflictiondef';
                    break;
            }

            this.dataAtk = {
                [defType]:value,
            }
        });

        html.find('select.defense').change(ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const value = target.val();
            let defType = '';
            let basedef = '';
            let newDef = 10;

            switch(type) {
                case 'dmg':
                    defType = 'save';
                    basedef = 'basedef';
                    break;
                    
                case 'affliction':
                    defType = 'saveAffliction';
                    basedef = 'afflictiondef';
                    break;
            }

            if(value === 'robustesse') newDef = 15;

            this.dataAtk = {
                [defType]:value,
                [basedef]:newDef,
            }

            this.render(true);
        });

        html.find('input.effet').change(ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const value = target.val();
            let defType = '';

            switch(type) {
                case 'dmg':
                    defType = 'effet';
                    break;
                    
                case 'affliction':
                    defType = 'afflictioneffet';
                    break;
            }

            this.dataAtk = {
                [defType]:value,
            }
        });

        html.find('input.mod').change(async ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const value = target.val();

            this.dataAtk = {
                mod:{
                    [type]:Number(value),
                }
            };
        });

        html.find('input.dmgValue').change(async ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const value = target.val();

            this.dataAtk = {
                dmgechec:{
                    [type]:Number(value),
                }
            };
        });

        html.find('span.etat i.delete').click(ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const id = target.data("id");
            const toDelete = this.data.tempAtk.afflictionechec[type];
            const updatedArray = toDelete.filter(obj => obj.id !== id);

            this.dataAtk = {
                afflictionechec:{
                    [type]:updatedArray,
                }
            }

            this.render(true);
        });

        html.find('span.etat i.deletedmg').click(ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const id = target.data("id");
            const toDelete = this.data.tempAtk.dmgechec[type];
            const updatedArray = toDelete.filter(obj => obj.id !== id);

            this.dataAtk = {
                dmgechec:{
                    [type]:updatedArray,
                }
            }

            this.render(true);
        });

        html.find('a.setDegreeAffliction').click(ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const toAdd = this.data.etats.find(k => k.id === this.data.degreeAffliction[type]);
            const atk = this.data?.tempAtk?.afflictionechec?.[type] ?? [];
            const concat = [...new Set(atk.concat(toAdd))];

            if(toAdd === undefined) return;

            this.dataAtk = {
                afflictionechec:{
                    [type]:concat,
                }
            }

            this.data.degreeAffliction[type] = "";

            this.render(true);
        });

        html.find('select.setDegreeAffliction').change(ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const value = target.val();

            this.data.degreeAffliction[type] = value;

            this.render(true);
        });

        html.find('a.setDegreeDmg').click(ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const toAdd = this.data.etats.find(k => k.id === this.data.degreeDmg[type]);
            const atk = this.data?.tempAtk?.dmgechec?.[type] ?? [];
            const concat = [...new Set(atk.concat(toAdd))];

            if(toAdd === undefined) return;

            this.dataAtk = {
                dmgechec:{
                    [type]:concat,
                }
            }

            this.data.degreeDmg[type] = "";

            this.render(true);
        });

        html.find('select.setDegreeDmg').change(ev => {
            const target = $(ev.currentTarget);
            const type = target.data("type");
            const value = target.val();

            this.data.degreeDmg[type] = value;

            this.render(true);
        });

        html.find('select.setTypeAtk').change(ev => {
            const target = $(ev.currentTarget);
            const value = target.val();

            this.data.setTypeAtk = value;

            if(value === 'afflictiondmg') {
                this.dataAtk = {
                    isAffliction:true,
                    isDmg:true,
                };
            } else if(value === 'dmg') {
                this.dataAtk = {
                    isAffliction:false,
                    isDmg:true,
                    afflictionechec:{
                        e1:[],
                        e2:[],
                        e3:[],
                    }
                };
            } else if(value === 'affliction') {
                this.dataAtk = {
                    isAffliction:true,
                    isDmg:false,
                    dmgechec:{
                        e1:[],
                        e2:[],
                        e3:[],
                        e4:[],
                    }
                };
            } else {
                this.dataAtk = {
                    isAffliction:false,
                    isDmg:false,
                    afflictionechec:{
                        e1:[],
                        e2:[],
                        e3:[],
                    },
                    dmgechec:{
                        e1:[],
                        e2:[],
                        e3:[],
                    }
                };
            }

            this.render(true);
        });

        html.find('button.cancel').click(this.close.bind(this));
        html.find('button.save').click(this.save.bind(this));
    }

    async activateEditor(name, options={}, initialContent="") {
        const editor = this.editors[name];
        options.document = this.document;
        if ( editor?.options.engine === "prosemirror" ) {
          options.plugins = foundry.utils.mergeObject({
            highlightDocumentMatches: ProseMirror.ProseMirrorHighlightMatchesPlugin.build(ProseMirror.defaultSchema)
          }, options.plugins);
        }
        return super.activateEditor(name, options, initialContent);
    }
  
    async _updateObject(event, formData) {}

    async save(options={}) {
        const id = this.id;
        const atk = game.mm3.getAtk(this.actor, id);
        let newData = foundry.utils.mergeObject(this.data.atk, this.data.tempAtk, {overwrite:true, recursive:true});
        
        this.actor.update({[`system.attaque.${atk.key}`]:newData});
    }

    async close(options={}) {
        await super.close(options);
        delete this.object.apps?.[this.appId];
    }
}