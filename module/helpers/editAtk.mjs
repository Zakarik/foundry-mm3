import toggler from './toggler.js';

export class editAtk {
    /*
    Les options possibles sont :
    - Type d'attaque : typeAtk
    - Compétences (Combat contact / Combat distance) : skill
    - Pouvoirs : pwr
    - Effets de zone : area
    - Bouton "Pas de jet d'attaque" : noatk
    - Bouton "Pas de critique" : nocrit
    - Base du jet de défense : baseDef
    - Jet de sauvegarde : save
    - Gestion des dégâts : dmg
    */
    constructor(actor, id, options=[]) {
        this.actor = actor;
        this.type = 'none';
        this.atk = game.mm3.getAtk(actor, id);
        this.options = options;
        this.skills = [];
    }

    get allStatus() {
        const getData = CONFIG.statusEffects.map(effect => ({
            key:effect.id,
            label:game.i18n.localize(effect.label),
        })).sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'accent' }));

        return getData;
    }

    get html() {
        const selectedOptions = this.options;
        const type = this.type;
        const dataAtk = this.atk.data;
        const etats = this.allStatus;
        const allData = [];
        const listSkill = [];
        const defenses = [{
            key:'esquive',
            label:`${game.i18n.localize("MM3.DEFENSE.Esquive")}`,
            },
            {
            key:'parade',
            label:`${game.i18n.localize("MM3.DEFENSE.Parade")}`,
            },
            {
            key:'vigueur',
            label:`${game.i18n.localize("MM3.DEFENSE.Vigueur")}`,
            },
            {
            key:'robustesse',
            label:`${game.i18n.localize("MM3.DEFENSE.Robustesse")}`,
            },
            {
            key:'volonte',
            label:`${game.i18n.localize("MM3.DEFENSE.Volonte")}`,
        }]
        const options = {
            label:dataAtk.label,
            data:[]
        };

        if(selectedOptions.includes('typeAtk')) {
            allData.push({
                type:'select',
                class:'typeatk dualcol',
                selected:type,
                blank:null,
                list:[{
                key:'none',
                label:`${game.i18n.localize("MM3.ROLL.Typeattaque")} : ${game.i18n.localize("MM3.ROLL.TYPE.Autre")}`,
                },
                {
                key:'affliction',
                label:`${game.i18n.localize("MM3.ROLL.Typeattaque")} : ${game.i18n.localize("MM3.ROLL.TYPE.Affliction")}`,
                },
                {
                key:'dmg',
                label:`${game.i18n.localize("MM3.ROLL.Typeattaque")} : ${game.i18n.localize("MM3.ROLL.TYPE.Degats")}`,
                },
                {
                key:'afflictiondmg',
                label:`${game.i18n.localize("MM3.ROLL.Typeattaque")} : ${game.i18n.localize("MM3.ROLL.TYPE.Affliction")} +  ${game.i18n.localize("MM3.ROLL.TYPE.Degats")}`,
                }]
            });
        }

        if(selectedOptions.includes('ability') && this.actor.type === 'personnage') {
            const allAby = CONFIG.MM3.LIST.Caracteristiques;
            let listAby = []

            for(let aby of allAby) {
                listAby.push({
                    key:aby,
                    label:game.i18n.localize(CONFIG.MM3.caracteristiques[aby]),
                })
            }

            allData.push({
                type:'check',
                class:this.#dataExist(dataAtk.links.ability) ? 'ability selected btntoggler' : 'ability btntoggler',
                toggle:'abytoggler',
                label:game.i18n.localize("MM3.SPECIAL.AbyLie"),
            },
            {
                type:'select',
                class:this.#dataExist(dataAtk.links.ability) ? 'abychoice abytoggler' : 'abychoice hide abytoggler',
                selected:dataAtk?.links?.ability ?? 'force',
                list:listAby,
            });
        }

        if(selectedOptions.includes('skill')) {
            const allSkill = this.actor.system.competence;
            const cc = allSkill?.combatcontact?.list ?? {};
            const rc = allSkill?.combatdistance?.list ?? {};

            for(let c in cc) {
                let d = cc[c];

                listSkill.push({
                    key:d._id,
                    type:'combatcontact',
                    label:`${game.i18n.localize("MM3.COMPETENCES.Combatcontact")} : ${d.label}`,
                })
            }

            for(let c in rc) {
                let d = rc[c];

                listSkill.push({
                    key:d._id,
                    type:'combatdistance',
                    label:`${game.i18n.localize("MM3.COMPETENCES.Combatdistance")} : ${d.label}`,
                })
            }

            if(listSkill.length > 0) {
                this.skills = listSkill;

                allData.push({
                type:'check',
                class:this.#dataExist(dataAtk.links.skill) ? 'skill selected btntoggler' : 'skill btntoggler',
                toggle:'skilltoggler',
                label:game.i18n.localize("MM3.SPECIAL.CompLie"),
                },
                {
                type:'select',
                class:dataAtk.links.skill === '' ? 'skillchoice hide skilltoggler' : 'skillchoice skilltoggler',
                selected:dataAtk.links.skill,
                blank:`- ${game.i18n.localize("MM3.Choisir")} -`,
                list:listSkill,
                sort:true,
                });
            }

        }

        if(selectedOptions.includes('pwr')) {
            const allPwr = this.actor.items.filter(pwr => pwr.type === 'pouvoir');
            const listPwr = [];

            for(let p in allPwr) {
                let d = allPwr[p];

                listPwr.push({
                key:d._id,
                label:d.name,
                })
            }

            if(listPwr.length > 0) {
                allData.push({
                type:'check',
                class:this.#dataExist(dataAtk.links.pwr) ? 'pwr selected btntoggler' : 'pwr btntoggler',
                toggle:'pwrtoggler',
                label:game.i18n.localize("MM3.SPECIAL.PwrLie"),
                },
                {
                type:'select',
                class:'pwrchoice hide pwrtoggler notwithstr',
                selected:dataAtk.links.pwr,
                blank:`- ${game.i18n.localize("MM3.Choisir")} -`,
                list:listPwr,
                sort:true,
                });
            }
        }

        if(selectedOptions.includes('area')) {
            allData.push({
                type:'check',
                class:this.#dataExist(dataAtk.area.has) ? 'area btntoggler selected' : 'area btntoggler',
                toggle:'areatoggler',
                label:game.i18n.localize("MM3.ROLL.Effetzone"),
            },
            {
                type:'input',
                class:dataAtk.area.has ? 'areaDodge areatoggler' : 'areaDodge hide areatoggler',
                label:game.i18n.localize("MM3.ROLL.ModEsquive"),
                value:dataAtk.area.esquive,
                min:0,
            });
        }

        if(selectedOptions.includes('noatk')) {
            allData.push({
                type:'check',
                class:this.#dataExist(dataAtk.settings.noatk) ? 'noatk btntoggler selected' : 'noatk btntoggler',
                toggle:'modatk',
                label:game.i18n.localize("MM3.ROLL.Pasattaque"),
            });
        }

        if(selectedOptions.includes('nocrit')) {
            allData.push({
                type:'check',
                class:this.#dataExist(dataAtk.settings.nocrit) ? 'nocrit simplebtn selected' : 'nocrit simplebtn',
                label:game.i18n.localize("MM3.ROLL.Pascritique"),
            });
        }

        if(selectedOptions.includes('baseDef')) {
            allData.push({
                type:'input',
                class:'basedefense',
                label:game.i18n.localize("MM3.ROLL.DEFENSE.Basedefense"),
                value:dataAtk?.save?.other?.defense ?? 0,
                min:0,
            });
        }

        if(selectedOptions.includes('modAtk')) {
            allData.push({
                type:'input',
                class:this.#dataExist(dataAtk.settings.noatk) || this.#dataExist(dataAtk.links.skill) || listSkill.length !== 0 ? 'modatk' : 'hide modatk',
                label:game.i18n.localize("MM3.ATTAQUE.ModAttaque"),
                value:dataAtk?.mod?.atk ?? 0,
            });
        }

        if(selectedOptions.includes('modEff')) {
            allData.push({
                type:'input',
                class:'modeff',
                label:game.i18n.localize("MM3.ATTAQUE.ModEffet"),
                value:dataAtk?.mod?.eff ?? 0,
            });
        }

        if(selectedOptions.includes('save')) {
            allData.push({
                type:'select',
                class:'save',
                selected:dataAtk?.save?.other?.type ?? 'robustesse',
                blank:null,
                title:game.i18n.localize("MM3.DEFENSE.Label"),
                list:defenses
            });
        }

        if(selectedOptions.includes('defpassive')) {
            allData.push({
                type:'select',
                class:'defpassive dualcol',
                selected:dataAtk?.save?.passive?.type ?? 'parade',
                title:game.i18n.localize("MM3.DEFENSE.Label"),
                list:[{
                    key:'esquive',
                    label:`${game.i18n.localize("MM3.DEFENSE.Jetattaquevs")} ${game.i18n.localize("MM3.DEFENSE.Esquive")}`,
                    },
                    {
                    key:'parade',
                    label:`${game.i18n.localize("MM3.DEFENSE.Jetattaquevs")} ${game.i18n.localize("MM3.DEFENSE.Parade")}`,
                    }
                ]
            });
        }

        if(selectedOptions.includes('affliction')) {
            allData.push({
                type:'repeat',
                object:'affliction',
                class:type === 'affliction' || type === 'afflictiondmg' ? 'repeat' : 'repeat hidden',
                label:game.i18n.localize('MM3.ROLL.TYPE.Affliction'),
                selected:dataAtk?.save?.affliction?.type ?? 'volonte',
                defenses:defenses,
                basedefense:dataAtk?.save?.affliction?.defense ?? 10,
                effet:dataAtk?.save?.dmg?.effet ?? 0,
                list:dataAtk.repeat.affliction.map(aff => ({
                    value:aff?.value ?? 0,
                    status:aff?.status ?? [],
                    etats:etats.filter(etat => !aff.status.includes(etat.key)),
                })),
            });
        }

        if(selectedOptions.includes('dmg')) {
            allData.push({
                type:'repeat',
                object:'dmg',
                class:type === 'dmg' || type === 'afflictiondmg' ? 'repeat' : 'repeat hidden',
                label:game.i18n.localize('MM3.ROLL.TYPE.Degats'),
                selected:dataAtk?.save?.dmg?.type ?? 'robustesse',
                defenses:defenses,
                basedefense:dataAtk?.save?.dmg?.defense ?? 15,
                effet:dataAtk?.save?.dmg?.effet ?? 0,
                list:dataAtk.repeat.dmg.map(dmg => ({
                    value:dmg?.value ?? 1,
                    status:dmg?.status ?? [],
                    etats:etats.filter(etat => !dmg.status.includes(etat.key)),
                })),
            });
        }

        options.data = allData;

        return options;
    }

    async handleDialog() {
        const dataAtk = this.atk.data;

        if(dataAtk.isAffliction && dataAtk.isDmg) this.type = 'afflictiondmg';
        else if(dataAtk.isAffliction) this.type = 'affliction';
        else if(dataAtk.isDmg) this.type = 'dmg';

        let data = {}
        data.title = dataAtk.label;
        data.content = await renderTemplate('systems/mutants-and-masterminds-3e/templates/dialog/edit.html', this.html);
        data.buttons = {
            one: {
                icon: null,
                label: game.i18n.localize("MM3.SaveEdit"),
                callback: (html) => this.#validate(html),
            },
            two: {
                icon: null,
                label: game.i18n.localize("MM3.Annuler"),
            }
        };

        const dialog = new Dialog({
            title:dataAtk.label,
            content:await renderTemplate('systems/mutants-and-masterminds-3e/templates/dialog/edit.html', this.html),
            buttons:{
                one: {
                    icon: null,
                    label: game.i18n.localize("MM3.SaveEdit"),
                    callback: (html) => this.#validate(html),
                },
                two: {
                    icon: null,
                    label: game.i18n.localize("MM3.Annuler"),
                }
            },
            default:'one',
            render:html => this.#render(html)
        }, {
            classes:['dialog-edit'],
            height:500,
            width:500,
            resizable:true,
        }).render(true);
    }

    async #validate(html) {
        const label = html.find(`section.header input.label`).val();
        const body = html.find(`section.body`)

        const typeatk = $(body.find(`select.typeatk`)).val();
        const hasAbility = $(body.find(`a.ability`)).hasClass('selected');
        const ability = $(body.find(`select.abychoice`)).val() || 'force';
        const hasSkill = $(body.find(`a.skill`)).hasClass('selected');
        const skill = $(body.find(`select.skillchoice`)).val() || '';
        const hasPwr = $(body.find(`a.pwr`)).hasClass('selected') || false;
        const pwr = $(body.find(`select.pwrchoice`)).val() || '';
        const noatk = $(body.find(`a.noatk`)).hasClass('selected') || false;
        const nocrit = $(body.find(`a.nocrit`)).hasClass('selected') || false;
        const blockStatusDmg = body.find(`div.repeat.dmg`);
        const listStatusDmg = blockStatusDmg.find('div.data div.line');
        const blockStatusAffliction = body.find(`div.repeat.affliction`);
        const listStatusAffliction = blockStatusAffliction.find('div.data div.line');
        const hasArea = $(body.find(`a.area`)).hasClass('selected') || false;
        const areaDodge = $(body.find(`.areaDodge input`)).val();
        const modAtk = $(body.find(`.modatk input`)).val();
        const modEff = $(body.find(`.modeff input`)).val();
        const baseDef = $(body.find(`.basedefense input`)).val();
        const defPassive = $(body.find(`select.defpassive`)).val();
        const typeDefOther = $(body.find(`select.save`)).val();

        const baseDefAffliction = $(blockStatusAffliction.find('div.innerData .rbasedefense input')).val();
        const effetAffliction = $(blockStatusAffliction.find('div.innerData .rangeff input')).val();
        const typeDefAffliction = $(blockStatusAffliction.find('div.innerData .rtypedefense')).val();

        const baseDefDmg = $(blockStatusDmg.find('div.innerData .rbasedefense input')).val();
        const effetDmg = $(blockStatusDmg.find('div.innerData .rangeff input')).val();
        const typeDefDmg = $(blockStatusDmg.find('div.innerData .rtypedefense')).val();

        const std = `system.attaque.${this.atk.key}`;
        let update = {};

        update[`${std}.label`] = label;

        switch(typeatk) {
            case 'affliction':
                update[`${std}.isAffliction`] = true;
                update[`${std}.isDmg`] = false;
                break;

            case 'dmg':
                update[`${std}.isAffliction`] = false;
                update[`${std}.isDmg`] = true;
                break;

            case 'afflictiondmg':
                update[`${std}.isAffliction`] = true;
                update[`${std}.isDmg`] = true;
                break;

            default:
                update[`${std}.isAffliction`] = false;
                update[`${std}.isDmg`] = false;
                break;
        }

        if(hasAbility) {
            update[`${std}.links.ability`] = ability;
        } else update[`${std}.links.ability`] = '';

        if(hasSkill) {
            update[`${std}.links.skill`] = skill;
            update[`${std}.type`] = this.skills.find(itm => itm.key === skill).type;
        } else {
            update[`${std}.links.skill`] = '';
            update[`${std}.type`] = 'other';
        }

        if(noatk) update[`${std}.settings.noatk`] = noatk;
        else update[`${std}.settings.noatk`] = noatk;

        if(nocrit) update[`${std}.settings.nocrit`] = nocrit;
        else update[`${std}.settings.nocrit`] = false;

        if(hasPwr) update[`${std}.links.pwr`] = pwr;
        else update[`${std}.links.pwr`] = '';

        if(typeDefDmg) update[`${std}.save.dmg.type`] = typeDefDmg;
        if(baseDefDmg) update[`${std}.save.dmg.defense`] = baseDefDmg;
        if(effetDmg) update[`${std}.save.dmg.effet`] = effetDmg;

        let dmg = [];

        for(let s of listStatusDmg) {
            let status = [];

            for(let as of $(s).find('div.status span')) {
                status.push($(as).data('status'));
            }

            dmg.push({
                value:parseInt($(s).find('div.value input').val()),
                status:status,
            })
        }

        if(dmg.length > 0) update[`${std}.repeat.dmg`] = dmg;

        if(typeDefAffliction) update[`${std}.save.affliction.type`] = typeDefAffliction;
        if(baseDefAffliction) update[`${std}.save.affliction.defense`] = baseDefAffliction;
        if(effetAffliction) update[`${std}.save.affliction.effet`] = effetAffliction;

        let affliction = [];

        for(let s of listStatusAffliction) {
            let status = [];

            for(let as of $(s).find('div.status span')) {
                status.push($(as).data('status'));
            }

            affliction.push({
                value:parseInt($(s).find('div.value input').val()),
                status:status,
            });
        }

        if(affliction.length > 0) update[`${std}.repeat.affliction`] = affliction;

        if(hasArea) {
            update[`${std}.area.has`] = hasArea;
            update[`${std}.area.esquive`] = areaDodge;
        } else update[`${std}.area.has`] = false;

        if(!noatk) update[`${std}.mod.atk`] = modAtk;

        update[`${std}.mod.eff`] = modEff;
        update[`${std}.save.other.defense`] = baseDef;
        update[`${std}.save.other.type`] = typeDefOther;
        update[`${std}.save.passive.type`] = defPassive;

        this.actor.update(update);
    }

    #render(html) {
        toggler.init(this.actor.id, html);

        this.#statusDelete(html, html, '.repeat ');
        this.#toggleModAtt(html);
        this.#toggleRangEff(html);
        this.#toggleMod(html);
        this.#toggleBtn(html);

        html.find('.repeat div.add a.btn').click(async ev => {
            const target = $(ev.currentTarget);
            const header = target.parents('.repeat');
            const line = target.parents('.line');
            const type = header.data('type');
            const lvl = line.data('index');
            const select = html.find(`div.${type} div.data div.line.l${lvl} div.add select`).val();
            const result = this.#getTranslationStatus(select);

            const newhtml = html.find(`div.${type} div.data div.line.l${lvl} div.status`).append(
            `<span data-status="${select}">
                ${game.i18n.localize(result)}
                <i class="fa-solid fa-trash-xmark delete" data-status="${select}"></i>
            </span>`);

            this.#statusDelete(html, newhtml);

            $(html.find(`div.${type} div.data div.line.l${lvl} div.add select`)).find(`option[value='${select}']`).remove();
        });

        html.find('section.body a.btntoggler').click(async ev => {
            const target = $(ev.currentTarget);
            const toggler = target.data('toggler');
            const toToggle = target.siblings(`.${toggler}`);
            const clsToggle = target.hasClass('realhidden') ? 'hidden' : 'hide';

            target.toggleClass('selected');

            if(toggler === 'modatk') this.#toggleModAtt(html);
            else $(toToggle).toggleClass(clsToggle);
        });

        html.find('section.body select.skillchoice').change(async ev => {
            this.#toggleModAtt(html);
        });

        html.find('section.body select.typeatk').change(async ev => {
            const target = $(ev.currentTarget);
            const type = target.val();
            const dmg = $(html.find('.repeat.dmg'));
            const affliction = $(html.find('.repeat.affliction'));

            switch(type) {
                case 'dmg':
                    dmg.removeClass('hidden');

                    if(!affliction.hasClass('hidden')) affliction.addClass('hidden');
                    break;
                case 'affliction':
                    affliction.removeClass('hidden');

                    if(!dmg.hasClass('hidden')) dmg.addClass('hidden');
                    break;
                case 'afflictiondmg':
                    dmg.removeClass('hidden');
                    affliction.removeClass('hidden');
                    break;

                default:
                    if(!dmg.hasClass('hidden')) dmg.addClass('hidden');
                    if(!affliction.hasClass('hidden')) affliction.addClass('hidden');
                    break;
            }

            this.#toggleMod(html);
            this.#toggleRangEff(html);
        });

        html.find('section.body a.skill.btntoggler').click(async ev => {
            this.#toggleModAtt(html);
        });

        html.find('section.body a.pwr.btntoggler').click(async ev => {
            this.#toggleRangEff(html);
        });

        html.find('section.body a.ability.btntoggler').click(async ev => {
            this.#toggleRangEff(html);
        });

        html.find('section.body a.simplebtn').click(async ev => {
            const target = $(ev.currentTarget);

            target.toggleClass('selected');
        });
    }

    #getTranslationStatus(raw) {
        let result = raw.charAt(0).toUpperCase() + raw.slice(1);

        switch(result) {
            case 'Dead':
                result = `EFFECT.StatusDead`;
                break;

            case 'Impaired':
                result = `MM3.STATUS.Decreased`;
                break;

            case 'Fatigued':
                result = `MM3.STATUS.Tired`;
                break;

            case 'Immobile':
                result = `MM3.STATUS.Stuck`;
                break;

            case 'Unaware':
                result = `MM3.STATUS.Insensitive`;
                break;

            case 'Debilitated':
                result = `MM3.STATUS.Invalid`;
                break;

            case 'Vulnerable':
                result = `MM3.STATUS.Vulnerability`;
                break;

            case 'Staggered':
                result = `MM3.STATUS.Chanceling`;
                break;

            case 'Entranced':
                result = `MM3.STATUS.Enthralled`;
                break;

            case 'Compelled':
                result = `MM3.STATUS.Influenced`;
                break;

            case 'Bound':
                result = `MM3.STATUS.Tied`;
                break;

            case 'Incapacitated':
                result = `MM3.STATUS.Neutralized`;
                break;

            case 'Weakened':
                result = `MM3.STATUS.Downgrade`;
                break;

            case 'Paralyzed':
                result = `MM3.STATUS.Paralysis`;
                break;

            case 'Stun':
                result = `MM3.STATUS.Stunned`;
                break;

            default:
                result = `MM3.STATUS.${result}`;
                break;

        }

        return result;
    }

    #statusDelete(html, innerHtml, beforeHtml='') {
        innerHtml.find(`${beforeHtml}i.delete`).click(async ev => {
            const target = $(ev.currentTarget);
            const header = target.parents('.repeat');
            const line = target.parents('.line');
            const type = header.data('type');
            const lvl = line.data('index');
            const status = target.data('status');
            const findStatus = html.find(`div.${type} div.data div.line.l${lvl} div.status`);
            const allSpan = findStatus.find(`span`);
            const select = findStatus.siblings(`.add`).find('select');
            const allStatus = this.allStatus;
            let exist = [];

            for(let a of allSpan) {
                const d = $(a).data('status');

                if(d === status) $(a).remove();
                else exist.push(d);
            }

            const filteredStatus = allStatus.filter(status => !exist.includes(status.key));
            $(select).find('option').remove();
            $(select).append(`<option value="" selected></option>`);

            for(let status of filteredStatus) {
                $(select).append(`<option value="${status.key}">${status.label}</option>`);
            }
        });
    }

    #toggleModAtt(html) {
        const skill = $(html.find('section.body a.btntoggler.skill'));
        const skillchoice = $(html.find('section.body select.skillchoice'));
        const noatk = $(html.find('section.body a.noatk')).hasClass('selected');
        const modatk = $(html.find('section.body .modatk'));
        const defpassive = $(html.find('section.body .defpassive'));
        const type = $(html.find('section.body .typeatk')).val();

        if(skill.hasClass('selected') && skillchoice.val() !== '' && !noatk) modatk.removeClass(['hide', 'hidden']);
        else if(!skill.hasClass('selected')) {
            modatk.addClass('hide');

            if(type === 'dmg' || type === 'affliction' || type === 'afflictiondmg' && !modatk.hasClass('hidden')) modatk.addClass('hidden');
        }
        else if(noatk && !modatk.hasClass('hide')) {
            modatk.addClass('hide');

            if(type === 'dmg' || type === 'affliction' || type === 'afflictiondmg' && !modatk.hasClass('hidden')) modatk.addClass('hidden');
        } else if(skill.hasClass('selected') && skillchoice.val() === '') {
            modatk.addClass('hide');

            if(type === 'dmg' || type === 'affliction' || type === 'afflictiondmg' && !modatk.hasClass('hidden')) modatk.addClass('hidden');
        }

        if(noatk && !defpassive.hasClass('hidden')) defpassive.addClass('hidden');
        else if(!noatk) defpassive.removeClass('hidden');
    }

    #toggleRangEff(html) {
        const pwr = $(html.find('section.body a.btntoggler.pwr')).hasClass('selected');
        const ability = $(html.find('section.body a.btntoggler.ability')).hasClass('selected');
        const abychoice = $(html.find('section.body select.pwrchoice'));
        const pwrchoice = $(html.find('section.body select.pwrchoice'));
        const rangeff = $(html.find('section.body .rangeff'));
        const type = $(html.find('section.body .typeatk')).val();

        if(type === 'dmg' || type === 'affliction') {
            if((pwr && pwrchoice !== '') || (ability && abychoice !== '')) {
                for(let re of rangeff) {
                    if(!$(re).hasClass('hidden')) $(re).addClass('hidden');
                }
            }
            else {
                for(let re of rangeff) {
                    $(re).removeClass('hidden');
                }
            }
        } else if(type === 'afflictiondmg') {
            for(let re of rangeff) {
                $(re).removeClass('hidden');
            }
        }
    }

    #toggleMod(html) {
        const type = $(html.find('section.body .typeatk')).val();
        const defense = $(html.find('section.body .basedefense'));
        const save = $(html.find('section.body .save'));
        const modeff = $(html.find('section.body .modeff'));
        const modatk = $(html.find('section.body .modatk'));

        switch(type) {
            case 'dmg':
            case 'affliction':
            case 'afflictiondmg':
                if(!defense.hasClass('hidden')) defense.addClass('hidden');
                if(!save.hasClass('hidden')) save.addClass('hidden');
                if(!modeff.hasClass('hidden')) modeff.addClass('hidden');
                if(modatk.hasClass('hide')) modatk.addClass('hidden');
                break;

            default:
                if(defense.hasClass('hidden')) defense.removeClass('hidden');
                if(save.hasClass('hidden')) save.removeClass('hidden');
                if(modeff.hasClass('hidden')) modeff.removeClass('hidden');
                if(modatk.hasClass('hidden')) modatk.removeClass('hidden');
                break;
        }
    }

    #toggleBtn(html) {
        const target = $(html.find('section.body a.btntoggler'));

        console.warn(target);

        for(let btn of target) {
            const toggler = $(btn).data('toggler');
            const toToggle = $(btn).siblings(`.${toggler}`);
            const clsToggle = $(btn).hasClass('realhidden') ? 'hidden' : 'hide';

            if($(btn).hasClass('selected')) {
                if(toggler === 'modatk') this.#toggleModAtt(html);
                else $(toToggle).removeClass(clsToggle);
            }
        }
    }

    #dataExist(data) {
        let result = true;

        if(data === '' || !data) result = false;

        return result;
    }
}