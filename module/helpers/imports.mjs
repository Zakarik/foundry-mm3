
export function addJabImportButtonToActorDirectory(setting) {
    let addHtml = ``;

    if(setting !== 'default') {
      addHtml += `style='font-family:"${setting}"'`;
    }

    $("section#actors footer.action-buttons").append(`<button class='import-simple' ${addHtml}>${game.i18n.localize("MM3.IMPORTATIONS.JabsBtn")}</button>`);

    $("section#actors footer.action-buttons button.import-simple").on( "click", async function() {
      const whatMenu = game.settings.get("mutants-and-masterminds-3e", "menu");

      let html = ``;

        /*html+=`
        <label for="import-simple" ${addHtml}>Choose folder to import json files</label>
        <input type="file" id="import-simple" name="import-simple" class="import-all" accept="text/txt" webkitdirectory mozdirectory>
        </p>
        `*/

        html+=`<label for ="import-simple-text" ${addHtml}>${game.i18n.localize("MM3.IMPORTATIONS.JabsDescription")}
        <textarea id="import-simple-text" name="import-simple-text" rows="40" cols="50"></textarea>
      `;

      const dOptions = {
        classes: ["mm3-import-all", whatMenu],
      };

      if(setting !== 'default') {
        dOptions.classes.push(setting);
      }

      let d = new Dialog({
        title: game.i18n.localize("MM3.IMPORTATIONS.JabsTitle"),
        content:html,
        buttons: {
        /* commented out as we don't want to open up web site crawling without the website's permission
          one: {
           label: "Start Import From Folder",
           callback: async (html) => {

              const files = html.find('#import-simple')[0].files;
              for (let i = 0; i < files.length; i++) {
                try{
                const target = files[i];
                const file = await readTextFromFile(target);
                const actorJson = JSON.parse(file, "\t");

                let characterData = convertToProcessableCharacterData(actorJson)
                await processCharacterData(characterData);
              }
              catch (error) {
                ui.notifications.error(error + error.stack);
                console.log(error + error.stack);
                console.log
                continue
              }
            }

            }


          },*/
          two:{
            label: game.i18n.localize("MM3.IMPORTATIONS.JabsValider"),
            callback: async (html) => {
              const text = html.find('#import-simple-text')[0].value;
              const actorJson = parseInput(text);
              let characterData = convertToProcessableCharacterData(actorJson)
              await processCharacterData(characterData);
            }
          }
      }
      },
      dOptions);
      d.render(true);
    });
}

function convertToProcessableCharacterData(parsedData){
let characterData ={};
characterData.attributes = {};

characterData.attributes.attribute = [];
characterData.active = "yes";
characterData.nature = "normal";
characterData.role=parsedData.role;
characterData.type= "";
characterData.name = parsedData.name + "(Jab's Build)";
characterData.de

characterData.powerpoints={};
if(parsedData.total==null){
    // likely a bogus file
    return characterData;
}
characterData.powerpoints.text = parsedData.total.total+" PP";
characterData.powerpoints = parsedData.total.total;

characterData.powerLevel = {};
characterData.powerLevel.value = parsedData.powerLevel;
characterData.powerLevel.text = "PL "+parsedData.powerLevel;

characterData.resources={};
characterData.resources.resource=  [];
characterData.resources.resource.push({name:"Abilities",spent:parsedData.total.abilities});
characterData.resources.resource.push({name:"Powers",spent:parsedData.total.powers});
characterData.resources.resource.push({name:"Advantages",spent:parsedData.total.advantages});
characterData.resources.resource.push({name:"Skills",spent:parsedData.total.skills});
characterData.resources.resource.push({name:"Defenses",spent:parsedData.total.defenses});

characterData.resources.currentpl = parsedData.powerLevel;

characterData.personal={};
characterData.attributes={}
characterData.attributes.attribute=[];
characterData.attributes.attribute.push(
    {
    name:"Strength",
    base:parsedData.strength.base,
    text:parsedData.strength.base,
    modified:parsedData.strength.totalWithPowers ==0? parsedData.strength.base : parsedData.strength.totalWithPowers,
    cost:{}
});
characterData.attributes.attribute.push({name:"Stamina",base:parsedData.stamina.base,text:parsedData.stamina.base, modified:parsedData.stamina.totalWithPowers==null? parsedData.stamina.base : parsedData.stamina.totalWithPowers,cost:{} });
characterData.attributes.attribute.push({name:"Agility",base:parsedData.agility.base,text:parsedData.agility.base,  modified: parsedData.agility.totalWithPowers==null? parsedData.agility.base : parsedData.agility.totalWithPowers,cost:{} });
characterData.attributes.attribute.push({name:"Dexterity",base:parsedData.dexterity.base,text:parsedData.dexterity.base, modified:parsedData.dexterity.totalWithPowers==null? parsedData.dexterity.base : parsedData.dexterity.totalWithPowers,cost:{} });
characterData.attributes.attribute.push({name:"Fighting",base:parsedData.fighting.base,text:parsedData.fighting.base, modified:parsedData.fighting.totalWithPowers==null? parsedData.fighting.base : parsedData.fighting.totalWithPowers,cost:{} });
characterData.attributes.attribute.push({name:"Intellect",base:parsedData.intelligence.base,text:parsedData.intelligence.base, modified:parsedData.intelligence.totalWithPowers==null? parsedData.intelligence.base : parsedData.intelligence.totalWithPowers,cost:{} });
characterData.attributes.attribute.push({name:"Awareness",base:parsedData.awareness.base,text:parsedData.awareness.base, modified:parsedData.awareness.totalWithPowers==null? parsedData.awareness.base : parsedData.awareness.totalWithPowers,cost:{} });
characterData.attributes.attribute.push({name:"Presence",base:parsedData.presence.base,text:parsedData.presence.base, modified:parsedData.presence.totalWithPowers==null? parsedData.presence.base : parsedData.presence.totalWithPowers,cost:{} });
characterData.attributes.attribute.push({name:"Strength",base:parsedData.strength.base,text:parsedData.strength.base, modified:parsedData.strength.totalWithPowers==null? parsedData.strength.base : parsedData.strength.totalWithPowers,cost:{} });

characterData.defenses={};
characterData.defenses.defense=[];
//loop over parsedData.defenses and add to characterData.defenses.defense


for (let i = 0; i < parsedData.defenses[0].defenseTypes.length; i++) {
    let cost={};
    let defense = parsedData.defenses[0].defenseTypes[i];

    let firstDefenseNumber = defense.defenseNumber;
    let secondDefenseNumber = 0;
    let defenseModifiers = defense.defenseModifiers;

    if (defenseModifiers.length==2)
    {
        firstDefenseNumber = defenseModifiers[0].modifier;
        secondDefenseNumber = defenseModifiers[1].modifier;
        cost.value = secondDefenseNumber - firstDefenseNumber
        cost.value = secondDefenseNumber - cost.value - defense.defenseNumber;

    }
    else
    {
    if (defenseModifiers.length==1)
    {
        secondDefenseNumber = defenseModifiers[0].modifier;
        cost.value = secondDefenseNumber - defense.defenseNumber
        //cost.value = secondDefenseNumber - cost.value - defense.defenseNumber


    }
    }
    if(secondDefenseNumber==0)
    {
    secondDefenseNumber = firstDefenseNumber;
    }

    if (defenseModifiers.length==0)
    {
    let defenseBaseStat;
    if(defense.defenseType=="Dodge")
    {
        defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Agility");
    }
    if(defense.defenseType=="Parry")
    {
        defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Fighting");
    }
    if(defense.defenseType=="Fortitude")
    {
        defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Stamina");
    }
    if(defense.defenseType=="Toughness")
    {
        defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Stamina");
    }
    if(defense.defenseType=="Will")
    {
        defenseBaseStat = characterData.attributes.attribute.find(element => element.name === "Awareness");
    }
    //secondDefenseNumber = defenseBaseStat.modified;
    cost.value =   defense.defenseNumber - defenseBaseStat.modified


    }

    characterData.defenses.defense.push({name:defense.defenseType,  abbr: defense.defenseType, base: firstDefenseNumber, modified: secondDefenseNumber, impervious: 0, text: firstDefenseNumber+"/"+secondDefenseNumber, cost: cost});
    //to do check impervious
}

characterData.initiative={};
let initiative =null;
try{
    initiative = parsedData.offense.find(element => element.name === "Initiative");
}catch(error){
}
let attackWithPower =0;
if(initiative!=null){
    attackWithPower = initiative.attackWithPower;
    if(attackWithPower==0)
    {
    attackWithPower = initiative.attack;
    }
}
characterData.initiative.total = attackWithPower;


characterData.attacks={};
characterData.attacks.attack=[];

for (let i = 0; i < parsedData.offense.length; i++) {
    let attack = parsedData.offense[i];
    if(attack!=null && attack.name!="Initiative"){

    characterData.attacks.attack.push({name:attack.name, attack:attack.attack, effect:attack.effect,
        area:attack.area, type:attack.type, range:attack.range, effectType:attack.effectType, damageClass:attack.damageClass});
    }
}
characterData.skills={};
characterData.skills.skill=[];
for (let i = 0; i < parsedData.skills.length; i++) {
    let skill = parsedData.skills[i];
    if(skill!=null){
    let power = skill.powerName;
    let value="";

    if(power){
        value = "+" + skill.totalWithStat +"/" + skill.totalWithPower
    }
    else{
        value = "+" + skill.totalWithStat
    }
    let cost = {};
    cost.value = skill.ranks / 2;
    let attrbonus = skill.totalWithStat - skill.ranks;
    characterData.skills.skill.push({name:skill.name, attrbonus:attrbonus, value, base:skill.ranks, description:"", cost:cost});
    }
}
characterData.advantages={};
characterData.advantages.advantage=[];
for (let i = 0; i < parsedData.advantages.length; i++) {
    let advantage = parsedData.advantages[i];
    if(advantage!=null){
    let advantageName = advantage.name;
    if(advantage.rank!=null){
        advantageName = advantage.name +" "+ advantageName.rank;
    }
    else{
        advantageName = advantage.name;
    }

    let cost={ value:advantage.rank};

    characterData.advantages.advantage.push({name:advantageName, ranks:advantage.rank, description:"", cost:cost});
    }
}
//TO DO figure out advantage category

characterData.powers={};
characterData.powers.power=[];
convertPowersToCharacterData(characterData.powers.power, parsedData.powers.powers, characterData);


characterData.gear={}
characterData.gear.item=[];

for (let i = 0; i < parsedData.equipment.length; i++) {
    let equipment = parsedData.equipment[i];
    if(equipment!=null){

    characterData.gear.item.push({name:equipment.name, description:"", cost:{text:"", value:""}});
    }
}

characterData.complications={};
characterData.complications.complication=[];
for (let i = 0; i < parsedData.complications.length; i++) {
    let complication = parsedData.complications[i];
    if(complication!=null){
    characterData.complications.complication.push({name:complication.name, description: complication.subject +","+ complication.description});
    }
}

return characterData;
}

function convertPowersToCharacterData(powers, simplePowers, characterData){
if(simplePowers!=undefined && simplePowers!=null){
    for (let i = 0; i < simplePowers.length; i++) {
    let simplePower = simplePowers[i];
    if(simplePower!=null){
        let power = {};
        if(simplePower.alias){
        power.name = simplePower.alias + ":" + simplePower.name;

        }
        else{
        power.name = simplePower.name;
        }
        power.ranks = simplePower.rank;
        power.name = power.name + " " + power.ranks;
        power.cost = {text:"", value:""};
        power.descriptors ={};
        power.descriptors.descriptor = [];

        convertDescriptors(power, simplePower);
        if(simplePower.effect){

        power.descriptors.descriptor.push({name:simplePower.effect.value});
        power.description = simplePower.effect.value;
        }
        convertExtras(power, simplePower);
        convertFlaws(power, simplePower);
        convertFeats(power, simplePower);
        //parse childer in loop
        if(simplePower.children!=null){
        power.otherpowers = {};
        power.otherpowers.power = [];

        convertPowersToCharacterData(power.otherpowers.power, simplePower.children , characterData);
        }

        if(simplePower.affliction){
        let affliction = simplePower.affliction;
        if(affliction.resistedBy){
            if(power.description==undefined)
            {
            power.description='';
            }
            power.description+=" Affliction resisted by " + affliction.resistedBy + "; "
            for(let k =0; k < affliction.degrees.length; k++){
            let degree = affliction.degrees[k];
            if(degree!=null){
                power.description+="/"+ degree
            }
            }
        }

        }


        if(simplePower.advantages && simplePower.advantages[0]){
        power.chainedadvantages={};
        power.chainedadvantages.chainedadvantage=[];
        for (let i = 0; i < simplePower.advantages[0].length; i++) {
            let advantage = simplePower.advantages[0][i];
            if(advantage){
            let advantageName = simplePower.advantages[0][i].name;
            if(simplePower.advantages[0][i].rank!=null){
                advantageName = simplePower.advantages[0][i].name +" "+ simplePower.advantages[0][i].rank;
            }
            else{
                advantageName = simplePower.advantages[0][i].name;
            }
            let advantage = {name:advantageName, ranks:simplePower.advantages[0][i].rank, description:"", cost:{text:"", value:""}};
            power.chainedadvantages.chainedadvantage.push(advantage);
            characterData.advantages.advantage.push(advantage);
            }
        }
        }
        if(simplePower.childSkills){
        if(!power.description){
            power.description='';
        }
        for (let j =0; j < simplePower.childSkills.length; j++){
            let skill = simplePower.childSkills[j];
            power.description+=" "+ skill.name + " +" + skill.ranks + " (" + skill.totalWithStatAndPowers +" )";
        }

        }
        if(simplePower.linkedTo)
        {
        power.description +=" \n Linked to " + simplePower.linkedTo.name + " " + simplePower.linkedTo.rank

        }
        powers.push(power);
    }
    }
}
}

function convertDescriptors(power, simplePower){
power.descriptors = {};
power.descriptors.descriptor = [];
let descriptors = simplePower.descriptors;
if(descriptors!=null && descriptors!=undefined){
    for (let i = 0; i < descriptors.length; i++) {
    let descriptor = descriptors[i];
    if(descriptor!=null){
        power.descriptors.descriptor.push({name:descriptor.name});
    }
    }
}
}

function convertExtras(power, simplePower){
power.extras = {};
power.extras.extra = [];
let extras = simplePower.extras;
for (let i = 0; i < extras.length; i++) {
    let extra = extras[i];
    if(extra!=null){
    if(extra.modifier!=null){
        extra.name = extra.name + " " + extra.modifier;
    }
    power.extras.extra.push({name:extra.name});
    power.extras.extra.push({ranks:extra.modifier});
    }
}
}

function convertFlaws(power, simplePower){
    power.flaws = {};
    power.flaws.flaw = [];
    let flaws = simplePower.flaws;
    if(flaws!=null && flaws!=undefined){
    for (let i = 0; i < flaws.length; i++) {
        let flaw = flaws[i];
        if(flaw!=null){
        if(flaw.modifier!=null){
            flaw.name = flaw.name + " " + flaw.modifier;
        }

        power.flaws.flaw.push({name:flaw.name});
        power.flaws.flaw.push({ranks:flaw.modifier});
        }
    }
    }
}

function convertFeats(power, simplePower){
let extras = simplePower.feats;
if(extras){
    for (let i = 0; i < extras.length; i++) {
    let extra = extras[i];
    if(extra!=null){
        if(extra.modifier!=null){
        extra.name = extra.name + " " + extra.modifier;
        }
        power.extras.extra.push({name:extra.name});
        power.extras.extra.push({ranks:extra.modifier});
    }
    }
}
}