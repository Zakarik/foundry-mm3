

//module.exports = { parseInput}
   
game.mm = {
    parsing:parseInput
}
    
    


// Example usage
// Ensure to load th
   
export function parseInput(input) {
    const parsedData = parseTopAttributes(input);

    // Initialize arrays and objects for each section
    parsedData.skills = [];
    parsedData.powers = [];
    parsedData.advantages = [];
    parsedData.defenses = [];
    parsedData.complications = [];
    parsedData.equipment = []; 

    const lines = input.split('\n');
    // Parse attributes right after top-level attributes
    Object.assign(parsedData, parseAttributes(input));

    let currentSection = '';
    let currentParentPower = null;
    let potentialBasePower = null;
    parsedData.offense=[];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line === '') continue; // Skip empty lines

        // Detect section headers
        if (line.includes('Total: Abilities:')) {
            currentSection = 'total';
            parsedData.total = parseTotal(line);
                    currentSection = '';
                    break;
        }
        else if (line.includes('Skills:')) {
            currentSection = 'skills';
        } else if (line.trim()=='Powers:') {
            currentSection = 'powers';
        } else if (line.includes('Advantages:')) {
            currentSection = 'advantages';
        } else if (line.includes('Defenses:')) {
            currentSection = 'defenses';
        } else if (line.includes('Complications:')) {
            currentSection = 'complications';
        } else if (line.trim()=='Equipment:') {
            currentSection = 'equipment';
        }
        else if (line.includes('Offense:')) {
            currentSection = 'offenses';
        }
        

        
        else if (currentSection) {
            // Continue parsing content based on current section
            switch (currentSection) {
                case 'skills':
                    if (line.match(/([A-Za-z\s\(\)]+)\s(\d+)\s\(\+(\d+)/)) { // Check if line is a skill
                        parsedData.skills.push(parseSkill(line));
                    } else {
                        currentSection = ''; // Reset section if line is not a skill
                    }
                    break;
                case 'powers':
                    currentParentPower = parsePowers(input, "Powers:");
                    for(let l = 0; l < currentParentPower.powers.length; l++){  
                        if(parsedData.powers.constructor=== Array){
                            parsedData.powers={powers:[]}
                        }
                        parsedData.powers.powers.push(currentParentPower.powers[l]);
                    }
                    currentSection = '';
                    break
                case 'advantages':
                    if (!line.match(/^\s*$/)) { // If the line is not empty
                        parsedData.advantages = parseAdvantages(line);
                        currentSection = ''; // Reset section when encountering an empty line
                    }
                    break;
                case 'defenses':
                    const defense = parseDefense(line);
                    if (defense) parsedData.defenses.push(defense);
                    break;
                case 'complications':
                    parsedData.complications = parseComplications(input);
                    //parsedData.complications.push(line.trim());
                    break;
                case 'equipment':
                    currentParentPower = parsePowers(input, "Equipment:");
                    for(let l = 0; l < currentParentPower.powers.length; l++){  
                        if(parsedData.powers.constructor=== Array){
                            parsedData.powers={powers:[]}
                        }
                        parsedData.powers.powers.push(currentParentPower.powers[l]);
                    }
                    
                    currentSection = ''; 
                    break; 
                case 'offenses':
                    parsedData.offense.push(parseOffense(line));
                    break
   
                    
}              
            }
        }

        // Add any remaining potential base power at the end of the powers section
        if (potentialBasePower) {
            currentParentPower.childPowers.push(potentialBasePower);
        }
    

    return parsedData;
}



function parseOffense(line) {

    const initiativeRegex = /Initiative\s\+(\d+)/;

    const offenseRegex = /([^\+]+)\s\+(\d+)(?:\s([^()]+))?\s\(\+(\d+)\s([^,]+),\sDC\s(\d+)\)/;

const match = line.match(offenseRegex);
    if (match) {
        return {
            name: match[1].trim(), // Name of the attack
            attack: parseInt(match[2]), // Attack bonus number
            area: match[3] ? match[3].trim() : '', // Optional area text
            effect: parseInt(match[4]), // Damage value
            effectType: match[5].trim(), // Damage type
            damageClass: parseInt(match[6]) // Damage class value
        }
    } else {
        const initiativeMatch = line.match(initiativeRegex);
        if (initiativeMatch) {
            let name = "Initiative";
            let attack = parseInt(initiativeMatch[1]);
            let attackWithPower = 0;
            let power = "";
            if(initiativeMatch[2]){
                attackWithPower = initiativeMatch[2];
            }
            if(initiativeMatch[3]){
                power = initiativeMatch[3].trim();
            }
            return {
                name: "Initiative",
                attack: attack,
                attackWithPower: attackWithPower ,
                power: power
            };
           
        }
    }
    return null;
}

function parseEquipment(input) {
    const equipment = [];
    const equipmentPattern = /^([^\(]+)\s*(?:\(([^)]+)\))?\s*(?:\((\d+)\))?$/;

    // Split the input into lines
    const lines = input.split('\n');

    // Find the index of the line that starts with 'Equipment:'
    let equipmentStartIndex = lines.findIndex(line => line.trim().startsWith('Equipment:'));

    // Check if the 'Equipment:' section exists
    if (equipmentStartIndex !== -1) {
        // Increase the index to start from the next line after 'Equipment:'
        equipmentStartIndex++;

        // Process each line from the start index to the end of the section or file
        for (let i = equipmentStartIndex; i < lines.length; i++) {
            // Check if the next section has started or if the line is empty, break the loop
            if (lines[i].trim() === '' || /^[A-Za-z]+:/.test(lines[i].trim())) {
                break;
            }

            // Apply the pattern matching
            const match = lines[i].trim().match(equipmentPattern);
            if (match) {
                const name = match[1].trim();
                let effects = [];
                
                if (match[2] && isNaN(match[2])) {
                    effects = match[2].split(',').map(effect => effect.trim());
                }
                let rank;
                if(match[3]){
                    rank = match[3] ? parseInt(match[3], 10) : null;
                }
                else if(match[2] && !isNaN(match[2])){
                    rank = match[2] ? parseInt(match[2], 10) : null;
                }
                
                
                equipment.push({ name, effects, rank });
            }
        }
    }

    return equipment;
}




// Remaining functions (parseTopAttributes, parseAttributes, parseSkill, parsePower, parseDefense, convertToDataObject) stay the same

function parseAdvantages(line) {
    const advantages = [];
    let currentAdvantage = '';
    let bracketCount = 0;

    for (const char of line) {
        if (char === '(') {
            bracketCount++;
        } else if (char === ')') {
            bracketCount--;
        }

        if (char === ',' && bracketCount === 0) {
            // End of an advantage
            advantages.push(parseSingleAdvantage(currentAdvantage.trim()));
            currentAdvantage = '';
        } else {
            currentAdvantage += char;
        }
    }

    // Add the last advantage if there is any
    if (currentAdvantage.trim()) {
        advantages.push(parseSingleAdvantage(currentAdvantage.trim()));
    }

    return advantages.filter(Boolean); // Filter out null or undefined values
}

function parseSingleAdvantage(advantage) {
    // Regex to flexibly handle advantage formats with an optional rank and optional bracketed content
    let  advantageRegex = /^([A-Za-z\s\-\']+)(\s\d+)?(\s\([^\)]+\))?$/;

    let match = advantage.match(advantageRegex);
    if (match) {
        return {
            name: match[1].trim() + (match[3] ? match[3] : ''), // Full advantage name, including any bracketed content
            rank: match[2] ? parseInt(match[2].trim()) : null // Rank, if present
        };
    } 
    else {
        advantageRegex = /^([A-Za-z\s\-\']+)\s\[(\d+)\]$/
        match = advantage.match(advantageRegex);
        if (match) {
            return {
                name: match[1].trim() + (match[3] ? match[3] : ''), // Full advantage name, including any bracketed content
                rank: match[2] ? parseInt(match[2].trim()) : null // Rank, if present
            };
        }
        else{
            console.error(`Error parsing advantage: ${advantage}`);
            return null;
        }
    }
}

let emptyAdvantageLine = "";
function parsePowers(input, powerType) {
    const separator = '--separator--';
    input = input.replace(/^\s*[\r\n]+/gm, '\n' + separator + '\n');

    const lines = input.split('\n').filter(line => line.trim() !== '');
    const powers = []; // Initialize an array to hold all powers
    let parentPower = null;
    let nextLineMustBeCLient = false; // Flag to track if the previous line was a parent power

    let atPower=false;
    for (let i = 0; i < lines.length; i++) {

        let line = lines[i].trim(); // Trim each line to remove leading and trailing whitespace
    
        if (line === powerType ){//"Powers:") {
            atPower = true; // Exit the loop if the current line is exactly "Powers:"
            continue;
        }
        if(atPower==false){
            continue;
        }       
        if(line==separator){
            nextLineMustBeCLient = false;
            continue
        }
        //test if line starts with a quoted string, and then an unquoted string, excluding brtacketed content or numbers
        if (line.startsWith('Equipment:') || line.startsWith('Offense:') || line.startsWith('Defenses:') || line.startsWith('Power:')) {
            break; // Exit the loop as we are done with powers
        }

        const emptyAdvantageLineRegex = /^Enhanced Advantages?\s(\d+)(:)?$/;
        if (emptyAdvantageLineRegex.test(line)){
            emptyAdvantageLine = line;
            continue;
        }
        if(emptyAdvantageLine!=""){
            line = emptyAdvantageLine + line;
            emptyAdvantageLine = "";

        }
        let power = parsePowerDetails(line);

        if(power.name==power.alias)
        {
            parentPower = power;
            if (parentPower) {
                powers.push(parentPower);
                if (parentPower.linkedTo) {
                    powers.push(parentPower.linkedTo);
                }
             }
            nextLineMustBeCLient = true
        }
        else{
            if (line.startsWith('"')) {
                if(nextLineMustBeCLient==false)
                {
                    parentPower = power;
                    if (parentPower) {powers.push(parentPower);
                        if (parentPower.linkedTo) {
                            powers.push(parentPower.linkedTo);
                        }
                    }
                }
                else
                { 
                    parseChildPower(line, parentPower);
                }
            }
            else{
                if(parentPower!=null){
                    parseChildPower(line, parentPower);
                }
                else{
                    if (power) {
                        powers.push(power);
                        if (power.linkedTo) {
                            powers.push(power.linkedTo);
                        }}
                }
            }
        }
           
        continue;
    }
    return { powers };
}

function parseChildPower(line, currentPower) {
    let isAlternateEffect = line.startsWith('AE:');
    let isDynamicAlternateEffect = line.startsWith('Dynamic AE:');
    if (isAlternateEffect || isDynamicAlternateEffect) {
        line = line.replace(/^(?:AE:|Dynamic AE:)\s*/, '');
    }
    
    const power = parsePowerDetails(line);
    if (power) {
        power.isAlternateEffect = isDynamicAlternateEffect ? 'Dynamic' : (isAlternateEffect ? 'AE' : 'base');
        if(currentPower.children==undefined)
        {   
            currentPower.children=[];
        }
        currentPower.children.push(power);
        if (power.linkedTo) {
            currentPower.children.push(power.linkedTo);
        }
    }
}

function parseAlias(line) {
    let aliasPattern = /^"([^"]+)"/
    let aliasMatch = line.match(aliasPattern);

    let alias = aliasMatch ? aliasMatch[1] : null;
    if (alias) {
        line = line.replace(/^"([^"]+)"/, '').trim();
    }
    if(line=='')
    {
        line=alias;
    } 
    return {alias:alias,line:line};
}

function parsePowerName(line, alias) {
    const namePattern = /^([^\(]*?)(?=\s\(|\s\d+|$)/;
    const nameMatch = line.match(namePattern);

    let name="";
    if(nameMatch!=null){
        if (!nameMatch) {
            name = alias;
            name = name.replace(/'/g, '')
            //throw new Error('Invalid format for power');
        }
        else{
            name = nameMatch[0].trim(); // Name is the entire matched group
        }
    }
    return name;
}

function parseRank(line, name) {
    // Find the rank, which should be the first number following the name
    const rankPattern = new RegExp(`(?<=${name}\\s)\\d+`);
    const rankMatch = line.match(rankPattern);
    const rank = rankMatch ? parseInt(rankMatch[0], 10) : null;
    return rank;
}

function parseNumberWithCommas(str) {
    // Remove commas and convert to number
    const number = parseFloat(str.replace(/,/g, ''));
    return number;
}

function extractCategoryItems(text, category) {
    let regex;
    switch (category.toLowerCase()) {
        case 'feats':
            regex = /Feats:\s*([^)(]+)\)/;
            break;
        case 'flaws':
            regex = /Flaws:\s*([^)(]+)\)/;
            break;
        case 'extras':
            regex = /Extras:\s*([^)(]+)\)/;
            break;
        default:
            return [];
    }

    const match = text.match(regex);
    return match ? match[1].split(',').map(item => item.trim()) : [];
}
function parseModifiers(line, type) {
    let modifiersMatch= extractCategoryItems(line, type);
    let modifiersMatched=false;
    if(modifiersMatch.length>0){
        modifiersMatched=true;
    }
    const withoutPrefixPattern = /\(([^)]+)\)/;
    if (modifiersMatch== null || modifiersMatch.length==0) {
        modifiersMatch = line.match(withoutPrefixPattern);


        if(modifiersMatch){
            if(modifiersMatch[0].includes('Flaws:') || modifiersMatch[0].includes('Extras:') || modifiersMatch[0].includes('Feats:')){
                return [];
            }
            modifiersMatch = modifiersMatch[1].split(',').map(item => item.trim());
        }

        //first word cant be number
        if(modifiersMatch){
            let firstWord;
            if(modifiersMatch.length==1){
                firstWord = modifiersMatch[0].split(' ')[0];
            }
            else{
                firstWord = modifiersMatch[1].split(' ')[0];
            }
            firstWord = parseNumberWithCommas(firstWord);
            if(!isNaN(firstWord)){
                return [];
            }
        }
    }
   
    let modifiers = [];
    let modifierValue = null;
    if (modifiersMatch!=null && modifiersMatch.length > 0) {
     //   const modifierStrings = modifiersMatch[1].split(',');
        for (let i = 0; i < modifiersMatch.length; i++) {
            let modifierName;
            let parts = modifiersMatch[i].trim().match(/(.*)([+-]\d+(\/\d+)?)/);
            if(parts == null){
                parts = modifiersMatch[i].trim().match(/([A-Za-z]+)\s(\d+)/);
                if(parts != null){
                    modifierName = parts[1].trim();
                    modifierValue = parseInt(parts[2], 10);
                    
                }else{
                    parts = ["", modifiersMatch[i].trim()];;
                }
            }
            if (parts !== null && parts.length > 1) {
                modifierName = parts[1].trim();
                 modifierValue = null;

                if (parts.length > 2) {
                    if (parts[2].includes('/')) {
                        const fractionParts = parts[2].split('/');
                        modifierValue = parseInt(fractionParts[0], 10) / parseInt(fractionParts[1], 10);
                    } else {
                        modifierValue = parseInt(parts[2], 10);
                    }
                }
                if (modifiersMatched==true){
                    modifiers.push({ name: modifierName, modifier: modifierValue });
                }
                else if (modifierValue < 0 && type === 'flaws'){ 
                    modifiers.push({ name: modifierName, modifier: modifierValue });
                }
                else if (type === 'extras' && (modifierValue >= 0 ||modifierValue == null || modifierValue == undefined))
                { 
                    modifiers.push({ name: modifierName, modifier: modifierValue });
                }
            }
         }
    }
    return modifiers;
}

function parseFlaws(line) {
    return parseModifiers(line, 'flaws');
}

function parseExtras(line) {
    return parseModifiers(line, 'extras');
}

function parseFeats(line){
    return parseModifiers(line, 'feats');
}


function parseEnhancedSkills(input) {
    let skills = [];
    if (input.startsWith('Enhanced Skills')) {
        const skillRegex = /([A-Za-z\s]+)\s(\d+)\s\(\+(\d+)\)/g;
        let match;

        while ((match = skillRegex.exec(input)) !== null) {
            skills.push({
                name: match[1].trim(),
                ranks: parseInt(match[2], 10),
                totalWithStatAndPowers: parseInt(match[3], 10)
            });
        }
    }
    return skills;
}

const validDescriptors = [
    "Accidental", "Acid", "Air", "Alchemy", "Alien", "Anarchy", "Animal", "Armor",
    "Ballistic", "Bestowed", "Biological", "Bludgeoning", "Chaos", "Chemical", "Chi",
    "Cold", "Colors", "Cosmic", "Cutting", "Darkness", "Death", "Dimensions", "Divine",
    "Dream Dimension", "Dreams", "Earth", "Electricity", "Elemental", "Entropy", "Evil",
    "Extradimensional", "Fire", "Force", "Friction", "Good", "Gravity", "Ground", "Heat",
    "Ice", "Ideas", "Impression", "Inertia", "Invented", "Justice", "Kinetic", "Law",
    "Liberty", "Life", "Life Force", "Light", "Lightning", "Luck", "Magical", "Magnetic",
    "Martial", "Memes", "Mental", "Metahuman", "Mind", "Moral", "Morphic", "Mutant",
    "Mystic", "Natural", "Necromantic", "Nightmare", "Outsider", "Piercing", "Plant",
    "Preternatural", "Projectile", "Psionic", "Psychic", "Quantum Forces", "Radiant",
    "Radiation", "Sensory", "Shadow", "Skill", "Sleep", "Sonic", "Soul", "Sound", "Space",
    "Stone", "Talent", "Technological", "Telekinetic", "Thought", "Time", "Training",
    "Tyranny", "Undead", "Vibration", "Water", "Weather", "Wind"
];

function parseDescriptors(line) {
    const descriptorPattern = /\(([^)]+)\)/g;
    let match;
    let descriptors = [];

    while ((match = descriptorPattern.exec(line)) !== null) {
        const potentialDescriptors = match[1].split(',').map(desc => desc.trim());
        const hasValidDescriptor = potentialDescriptors.some(desc => 
            validDescriptors.some(validDesc => desc.includes(validDesc))
        );

        if (hasValidDescriptor) {
            descriptors = descriptors.concat(potentialDescriptors.filter(desc => 
                !desc.includes("Flaws:") && !desc.includes("Extras:") && !desc.includes("Feats:"))
            );
        }
    }

    return descriptors;
}

function parsePowerDetails(line) {
    
    let results = parseAlias(line);
    let alias = results.alias;
    line = results.line;

    const costRegex  = /\[(\d+)\]$/;
  
    const match = line.match(costRegex);
    let cost =0;
    if(match){
        cost = parseInt(match[1], 10);
    }
    let name = parsePowerName(line, alias);
    let movementDetails = {};
    if (name.startsWith("Movement")) {
        movementDetails = parseMovementDetails(line);
        movementDetails.name = name;
        movementDetails.rank = parseRank(line, name);
        return movementDetails;
    }
    else{
        let childSkills = parseEnhancedSkills(line);
        
        let rank = parseRank(line, name);

        let descriptors = parseDescriptors(line);
        let flaws = parseFlaws(line);
        let extras = parseExtras(line);
        let feats = parseFeats(line);

        //parse effects
        let effect={};
        const effectsPattern = /\(([^)]+)\)/;
        const effectMmatch = line.match(effectsPattern);
        if(effectMmatch){
            let firstWord = effectMmatch[1].split(' ')[0];
            firstWord = parseNumberWithCommas(firstWord);
            if(!isNaN(firstWord) && firstWord!=effectMmatch[1]){
                effect ={
                    value: effectMmatch[1].trim()
                }
            }
        }
        
        //parse advantages obtained through powers
        const regex = /Enhanced Advantages \d+:/;
       let  advantages = [];
        if(line.startsWith('Enhanced Advantages') )
        {
            let advantageMatch=  line.replace(regex, '').trim();
            let advantagesFromPowers = parseAdvantages(advantageMatch);
           
            advantages.push(advantagesFromPowers);
            
        }

        //parse affliction information if  power is an affliction

        const afflictionRegex = /Affliction\s(\d+)\s\(([^;]+);\s([^)]+)\)/;
        const afflictionMatch = line.match(afflictionRegex);
        let affliction = {};
        if (afflictionMatch) {
            affliction.resistedBy = afflictionMatch[2].trim();
            affliction.degrees = afflictionMatch[3].split('/'); // Splitting the degrees into an array
        }

        let linkedTo = null;
        const linkedToIndex = line.indexOf('Linked to');
        if (linkedToIndex !== -1) {
            const textAfterLinkedTo = line.substring(linkedToIndex + 'Linked to'.length).trim();
            linkedTo = parsePowerDetails(textAfterLinkedTo);
        }



        return { name, rank, flaws, extras, alias, childSkills, descriptors, cost, effect, advantages, feats, affliction, linkedTo };
    }
        

    
}

function parseMovementDetails(line) {
    const movementPattern = /\(([^)]+)\)/; // Regex to capture content within brackets
    const movementMatch = line.match(movementPattern);

    let extras = [];

    if (movementMatch) {
        const movementDetails = movementMatch[1].split(',').map(detail => detail.trim());

        for (const detail of movementDetails) {
            // Extract the name and rank (if any) for each extra
            const detailMatch = detail.match(/([\w\s-]+)(?:\s+(\d+))?/);
            if (detailMatch) {
                const name = detailMatch[1].trim();
                const rank = detailMatch[2] ? parseInt(detailMatch[2], 10) : undefined;
                extras.push({ name, rank });
            }
        }
    }

    return { extras };
}

function parseDefense(line) {
    // Trim the line to remove leading and trailing whitespace
    line = line.trim();

    // Regex for optional quoted name
    const nameRegex = /^"([^"]+)"\s*/;
    const nameMatch = line.match(nameRegex);
    let defenseName = nameMatch ? nameMatch[1] : "default";

    // Remove the name from the line for further parsing, if present
    const defenseData = nameMatch ? line.replace(nameMatch[0], "").trim() : line;

    // Regex for parsing defense details
    const defenseDetailRegex = /(\w+)\s\+(\d+)(?:\s\(([^)]+)\))?/g;
    let match;
    const defenseTypes = [];

    while ((match = defenseDetailRegex.exec(defenseData)) !== null) {
        const defenseType = match[1];
        const defenseNumber = parseInt(match[2]);
        const modifiersStr = match[3];
        let defenseModifiers = [];
        let defenseClass = null;

        if (modifiersStr) {
            modifiersStr.split(',').forEach(modifier => {
                if (modifier.trim().startsWith('DC')) {
                    defenseClass = parseInt(modifier.trim().split(' ')[1]);
                } else {
                    const modifierParts = modifier.trim().split(' ');
                    const modifierValue = parseInt(modifierParts[0]);
                    const description = modifierParts.slice(1).join(' ');
                    defenseModifiers.push({ modifier: modifierValue, description });
                }
            });
        }

        defenseTypes.push({
            defenseType,
            defenseNumber,
            defenseModifiers,
            defenseClass
        });
    }

    return {
        name: defenseName,
        defenseTypes: defenseTypes
    };
}

function parseTotal(input) {
    // Adjusted regex pattern to capture and ignore the second number after "Skills"
    const totalPattern = /^Total: Abilities: (\d+) \/ Skills: (\d+)--\d+ \/ Advantages: (\d+) \/ Powers: (\d+)(?: \+ [A-Za-z &\/-]+)? \/ Defenses: (\d+) \((\d+)(?: \+ [A-Za-z &\/-]+)?\)$/


    const match = input.match(totalPattern);
    if (match) {
        return {
            abilities: parseInt(match[1], 10),
            skills: parseInt(match[2], 10), // Only the first number after "Skills"
            advantages: parseInt(match[3], 10),
            powers: parseInt(match[4], 10),
            defenses: parseInt(match[5], 10),
            total: parseInt(match[6], 10)
        };
    }

    return null;
}

function parseComplications(input) {
    const complications = [];
    const lines = input.split('\n');

    // Find the index of the line that starts with 'Complications:'
    let complicationsStartIndex = lines.findIndex(line => line.trim().startsWith('Complications:'));

    // Check if the 'Complications:' section exists
    if (complicationsStartIndex !== -1) {
        // Increase the index to start from the next line after 'Complications:'
        complicationsStartIndex++;

        for (let i = complicationsStartIndex; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().startsWith('Total: Abilities:')) {
                break;
            }
            if (line.trim() !== '') {
                const match = line.match(/^(.+?)(?:\s*\((.+?)\))?(?:\s*-\s*(.+))?$/);
                if (match) {
                    const name = match[1].trim();
                    if(name=='') continue;
                    const subject = match[2] ? match[2].trim() : "";
                    const description = match[3] ? match[3].trim() : "";

                    complications.push({
                        name,
                        subject,
                        description
                    });
                }
            }
        }
    }

    return complications;
}



function parseSkill(line) {
    // Regular expression to match the skill pattern
    // Example: "Acrobatics 4 (+12, +20 Spider-Sense)"
    const skillRegex = /([A-Za-z\s\(\)]+)\s(\d+)\s\(\+(\d+)(?:,\s\+(\d+)(?:\s([\w\s\-]+))?)?\)/;

    const match = line.match(skillRegex);
    if (match) {
        const skill = {
            name: match[1].trim(), // Skill name
            ranks: parseInt(match[2]), // Skill ranks
            totalWithStat: parseInt(match[3]) // Total with stat
        };

        // Check for optional total with stat and powers
        if ( match[5]) {
            skill.totalWithStatAndPowers = {
                value: parseInt(match[4]),
                powerName: match[5].trim()
            };
        }else{
            if (match[4] ) {
                skill.totalWithStatAndPowers = {
                    value: parseInt(match[4]),
                    };
            }
        }
        return skill;
    } else {
        console.error(`Error parsing skill: ${line}`);
        return null;
    }
}

// Placeholder function for converting parsed data to data object
function convertToDataObject(parsedData) {
// Implement conversion logic here...
// Return data object
}

function parseTopAttributes(input) {
    const parsedData = {
        name: '',
        role: '',
        powerLevel: '',
        // ... other properties
    };

    // Split the input by lines
    const lines = input.split('\n');

    // Parse the first line for the character's name
    parsedData.name = lines[0].trim();

    // Use a regular for loop for better control
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line === '') {
            continue; // Skip empty lines
        }

        if (line.startsWith('Role:')) {
            parsedData.role = line.split(':')[1].trim();
        } else if (line.includes('PL')) {
            let plMatch = line.match(/PL\s+(\d+)/);
            if (plMatch) {
                parsedData.powerLevel = plMatch[1];
            }
        }
        // ... Add logic for other sections if needed
    }

    return parsedData;
}

function parseAttributes(input) {
    const lines = input.split('\n');
    const attributesText = lines.join(' '); // Combine lines for easier parsing

    const attributes = {
        strength: { base: null, totalWithPowers: null },
        stamina: { base: null, totalWithPowers: null },
        agility: { base: null, totalWithPowers: null },
        fighting: { base: null, totalWithPowers: null },
        dexterity: { base: null, totalWithPowers: null },
        intelligence: { base: null, totalWithPowers: null },
        awareness: { base: null, totalWithPowers: null },
        presence: { base: null, totalWithPowers: null }
    };

    Object.keys(attributes).forEach(attr => {
        const regex = new RegExp(attr.toUpperCase() + '\\s(\\d+)(?:\\/(\\d+))?', 'i');
        const match = attributesText.match(regex);
        if (match) {
            attributes[attr].base = parseInt(match[1]);
            if (match[2]) {
                attributes[attr].totalWithPowers = parseInt(match[2]);
            }
        } else {
            console.error(`Error parsing ${attr}: Attribute not found or unexpected format.`);
        }
    });

    return attributes;
}


if (typeof window === 'undefined') {  
    
}
else
{
    window.MutantsAndMasterminds = {
        parseInput,
        convertToDataObject,
        parseEquipment
    };
}
