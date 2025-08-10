
export const trojanWarWorld = {
    name: "Trojan War",
    description: "An age of bronze-clad heroes and divine intervention. The epic conflict between the Achaean invaders and the proud defenders of Troy, where gods walk among mortals and legends are forged in blood and glory.",
    currencyOptions: [],
    races: { // Peoples
      Achaean: { 
        description: "A coalition of bronze-armored warriors from across the Hellenic world, driven by pride, glory, and the pursuit of arete (excellence). They are individualistic champions seeking immortal fame. +3 Strength, +2 Speed.", 
        bonuses: { strength: 3, speed: 2 },
        currencyName: "Bronze Talent",
        availableClasses: [
            'Myrmidon Champion', 'Agamemnon\'s Marshal', 'Odyssean Strategist', 'Ajax\'s Bulwark', 'Diomedes\' Fury', 
            'Nestor\'s Counsel', 'Calchas the Seer', 'Machaon the Healer', 'Rhapsode of the Epics', 'Master Shipwright', 
            'Achaean Scout', 'Bronze-smith', 'Chariot Driver', 'Psiloi Skirmisher', 'Veteran Hoplite', 
            'Oracle\'s Acolyte', 'Aegis-Bearer', 'Theurgist', 'Fatespinner', 'Heir of the Sea'
        ]
      },
      Trojan: {
        description: "The proud defenders of a magnificent city, blessed by the gods. They fight for their homes, their king, and their divine patrons with unwavering resolve and piety. +3 Constitution, +2 Faith.",
        bonuses: { constitution: 3, faith: 2 },
        currencyName: "Golden Stater",
        availableClasses: [
            'Trojan Prince', 'Wall Defender', 'Archer of Apollo', 'Priest of Troy', 'Hektor\'s Champion', 
            'Aeneas\' Hope', 'Cassandra\'s Truth', 'Dream-Interpreter', 'Trojan Scout', 'Aphrodite\'s Ward', 
            'Amazon Ally', 'River God\'s Acolyte', 'Lycian Archer', 'Thracian Mercenary', 'Citadel Guard', 
            'Royal Charioteer', 'Trojan Healer', 'Scion of Dardanus', 'Ares\' Fury', 'Gateskeeper'
        ]
      },
    },
    classes: {
      // Achaean Classes
      'Myrmidon Champion': { description: "An elite follower of Achilles, a warrior of supreme skill and ferocity, moving like a wolf on the battlefield. Bonus: +2 Strength, +1 Speed.", bonuses: { strength: 2, speed: 1 } },
      'Agamemnon\'s Marshal': { description: "A commander in the High King's army, tasked with maintaining order and leading troops through authority and tactical acumen. Bonus: +2 Persuasion, +1 Strength.", bonuses: { persuasion: 2, strength: 1 } },
      'Odyssean Strategist': { description: "A cunning and resourceful warrior in the mold of Odysseus, who wins battles with wits, trickery, and patience as much as with steel. Bonus: +2 Intelligence, +1 Wisdom.", bonuses: { intelligence: 2, wisdom: 1 } },
      'Ajax\'s Bulwark': { description: "A hulking warrior who stands like a tower on the battlefield, relying on immense strength and a massive shield to hold the line. Bonus: +2 Constitution, +1 Strength.", bonuses: { constitution: 2, strength: 1 } },
      'Diomedes\' Fury': { description: "A ferocious and divinely-favored warrior who throws themselves into the thick of the fight, seemingly unstoppable. Bonus: +2 Strength, +1 Faith.", bonuses: { strength: 2, faith: 1 } },
      'Nestor\'s Counsel': { description: "An old, wise advisor whose experience and eloquent words guide the war council, though their prime fighting days may be past. Bonus: +3 Wisdom.", bonuses: { wisdom: 3 } },
      'Calchas the Seer': { description: "A priest and prophet who reads the will of the gods in the entrails of sacrifices and the flight of birds, guiding the army's fate. Bonus: +2 Faith, +1 Perception.", bonuses: { faith: 2, perception: 1 } },
      'Machaon the Healer': { description: "A skilled physician descended from the god of medicine, expert at treating the grievous wounds of the battlefield. Bonus: +2 Wisdom, +1 Dexterity.", bonuses: { wisdom: 2, dexterity: 1 } },
      'Rhapsode of the Epics': { description: "A singer of tales who chronicles the deeds of heroes, ensuring their kleos (glory) will never be forgotten. Bonus: +2 Attractiveness, +1 Persuasion.", bonuses: { attractiveness: 2, persuasion: 1 } },
      'Master Shipwright': { description: "An expert craftsman who built and now maintains the thousand black ships of the Achaean fleet. Bonus: +2 Intelligence, +1 Trade.", bonuses: { intelligence: 2, trade: 1 } },
      'Achaean Scout': { description: "A swift and perceptive warrior who ranges ahead of the army, gathering information and skirmishing with enemy patrols. Bonus: +2 Perception, +1 Speed.", bonuses: { perception: 2, speed: 1 } },
      'Bronze-smith': { description: "An artisan who forges and repairs the bronze armor and weapons that are the lifeblood of the Achaean army. Bonus: +2 Strength, +1 Trade.", bonuses: { strength: 2, trade: 1 } },
      'Chariot Driver': { description: "A skilled driver who maneuvers the war chariot, positioning the hero they carry for the perfect attack or a swift escape. Bonus: +2 Speed, +1 Dexterity.", bonuses: { speed: 2, dexterity: 1 } },
      'Psiloi Skirmisher': { description: "A light infantryman, often a slinger or javelin-thrower, who harasses the enemy from a distance. Bonus: +2 Dexterity, +1 Perception.", bonuses: { dexterity: 2, perception: 1 } },
      'Veteran Hoplite': { description: "A hardened infantryman, a veteran of many battles, who stands firm in the shield wall. Bonus: +2 Constitution, +1 Strength.", bonuses: { constitution: 2, strength: 1 } },
      'Oracle\'s Acolyte': { description: "A keeper of rituals and sacred lore, serving the seers and interpreting the words of the gods. Bonus: +2 Faith, +1 Intelligence.", bonuses: { faith: 2, intelligence: 1 } },
      'Aegis-Bearer': { description: "A warrior blessed by Athena, whose shield can inspire terror in the enemy and deflect blows with uncanny luck. Bonus: +2 Faith, +1 Constitution.", bonuses: { faith: 2, constitution: 1 } },
      'Theurgist': { description: "A ritualist who can beseech or compel minor spirits and daimons for aid, channeling their minor powers. Bonus: +2 Intelligence, +1 Faith.", bonuses: { intelligence: 2, faith: 1 } },
      'Fatespinner': { description: "A warrior touched by the Fates, able to manipulate strands of luck on the battlefield for themselves or their allies. Bonus: +2 Luck, +1 Wisdom.", bonuses: { luck: 2, wisdom: 1 } },
      'Heir of the Sea': { description: "Blessed by Poseidon, this warrior fights with the fury of the waves, is an expert mariner, and can call upon the sea's power. Bonus: +2 Strength, +1 Speed.", bonuses: { strength: 2, speed: 1 } },

      // Trojan Classes
      'Trojan Prince': { description: "A member of the royal house of Troy, a leader of men who fights with noble bearing for the honor of his city. Bonus: +2 Persuasion, +1 Attractiveness.", bonuses: { persuasion: 2, attractiveness: 1 } },
      'Wall Defender': { description: "A veteran soldier of the Trojan garrison, whose life is dedicated to protecting the unbreachable walls of the city. Bonus: +2 Constitution, +1 Perception.", bonuses: { constitution: 2, perception: 1 } },
      'Archer of Apollo': { description: "A deadly archer who serves the god Apollo, Troy's divine protector, calling upon him for accuracy and plague-arrows. Bonus: +2 Dexterity, +1 Faith.", bonuses: { dexterity: 2, faith: 1 } },
      'Priest of Troy': { description: "A pious keeper of the city's sacred rites, who seeks to appease the gods and ensure their favor in the war. Bonus: +3 Faith.", bonuses: { faith: 3 } },
      'Hektor\'s Champion': { description: "An elite warrior chosen to fight in Hektor's own retinue, a model of Trojan valor and discipline. Bonus: +2 Strength, +1 Constitution.", bonuses: { strength: 2, constitution: 1 } },
      'Aeneas\' Hope': { description: "A Dardanian warrior following the pious Aeneas, destined for a future beyond the walls of Troy. Bonus: +2 Faith, +1 Constitution.", bonuses: { faith: 2, constitution: 1 } },
      'Cassandra\'s Truth': { description: "A cursed prophet whose true visions of doom are never believed. A figure of tragedy and desperate insight. Bonus: +2 Wisdom, +1 Luck.", bonuses: { wisdom: 2, luck: 1 } },
      'Dream-Interpreter': { description: "A mystic who can read omens and divine messages in dreams, advising leaders on the hidden will of the gods. Bonus: +2 Wisdom, +1 Faith.", bonuses: { wisdom: 2, faith: 1 } },
      'Trojan Scout': { description: "A swift warrior who ventures from the city to spy on the Achaean camp and disrupt their supply lines. Bonus: +2 Perception, +1 Dexterity.", bonuses: { perception: 2, dexterity: 1 } },
      'Aphrodite\'s Ward': { description: "A combatant whose divine beauty, a gift from Aphrodite, can charm and disorient foes in the heat of battle. Bonus: +2 Attractiveness, +1 Persuasion.", bonuses: { attractiveness: 2, persuasion: 1 } },
      'Amazon Ally': { description: "A warrior-woman from a distant land, who has come to fight for Troy out of honor and a thirst for glory. Bonus: +2 Dexterity, +1 Strength.", bonuses: { dexterity: 2, strength: 1 } },
      'River God\'s Acolyte': { description: "A mystic who tends to the spirits of the rivers Scamander and Simois, which protect Troy. Bonus: +2 Faith, +1 Wisdom.", bonuses: { faith: 2, wisdom: 1 } },
      'Lycian Archer': { description: "A skilled archer from the allied kingdom of Lycia, fighting for Troy under their noble kings. Bonus: +3 Dexterity.", bonuses: { dexterity: 3 } },
      'Thracian Mercenary': { description: "A fierce warrior from the wild lands of Thrace, hired to bolster the Trojan ranks. Bonus: +2 Strength, +1 Constitution.", bonuses: { strength: 2, constitution: 1 } },
      'Citadel Guard': { description: "An elite soldier tasked with guarding the upper city and the palace of Priam. Bonus: +2 Constitution, +1 Strength.", bonuses: { constitution: 2, strength: 1 } },
      'Royal Charioteer': { description: "The driver of a prince's war chariot, a position of great honor and skill. Bonus: +2 Speed, +1 Dexterity.", bonuses: { speed: 2, dexterity: 1 } },
      'Trojan Healer': { description: "A physician who uses knowledge of herbs and poultices to tend to the city's wounded defenders. Bonus: +2 Wisdom, +1 Intelligence.", bonuses: { wisdom: 2, intelligence: 1 } },
      'Scion of Dardanus': { description: "A noble with divine blood tracing back to the city's founder, able to inspire allies with their heroic presence. Bonus: +2 Attractiveness, +1 Faith.", bonuses: { attractiveness: 2, faith: 1 } },
      'Ares\' Fury': { description: "A warrior who enters a divine battle rage, channeling the bloodlust of the war god Ares himself, becoming a terrifying force of destruction. Bonus: +3 Strength.", bonuses: { strength: 3 } },
      'Gateskeeper': { description: "The veteran warrior in charge of the mighty Scaean Gate, holding the key to the city's defense. Bonus: +2 Perception, +1 Strength.", bonuses: { perception: 2, strength: 1 } },
    }
}
