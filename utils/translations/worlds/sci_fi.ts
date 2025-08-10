
export const sciFiWorld = {
  name: "Sci-Fi",
  description: "Galactic empires, cybernetics, and alien worlds. The future is now.",
  currencyName: "Credits",
  currencyOptions: [],
  races: {
    Human: { 
      description: "Adaptable colonists, skilled in diplomacy. +2 Trade, +2 Persuasion, +1 Intelligence.", 
      bonuses: { trade: 2, persuasion: 2, intelligence: 1 },
      availableClasses: ['Starship Pilot', 'Envoy', 'Colonial Ranger', 'Smuggler', 'Xeno-biologist', 'Federation Diplomat', 'Data Broker', 'Ship\'s Surgeon', 'Corporate Enforcer', 'Astro-Archaeologist', 'Megacorp Auditor', 'Old Earth Cultist']
    },
    Cyborg: { 
      description: "Enhanced by technology, a blend of flesh and steel. +3 Strength, +2 Intelligence.", 
      bonuses: { strength: 3, intelligence: 2 },
      availableClasses: ['Integrated Juggernaut', 'Spectre', 'Combat Hacker', 'Grav-Brawler', 'Tech-Scrapper', 'Bio-Tinker', 'Ghostwire Infiltrator', 'Cyber-Slinger']
    },
    'Zoltan': { 
      description: "Beings of pure energy, fast and brilliant. +3 Intelligence, +2 Speed.", 
      bonuses: { intelligence: 3, speed: 2 },
      availableClasses: ['Psion', 'Ion Weaver', 'Star-Prophet', 'Phase Technician', 'Terraformer', 'Void-Dancer', 'Living Battery']
    },
    "K'tharr": { 
      description: "A feline warrior race, agile and perceptive. +3 Dexterity, +2 Perception.", 
      bonuses: { dexterity: 3, perception: 2 },
      availableClasses: ['Xenohunter', 'Pride Leader', 'Silent Stalker', 'Spectre', 'Sun-Dancer', 'Void-Dancer', 'Smuggler']
    },
    'Rockman': { 
      description: "Crystalline silicon-based lifeforms, incredibly durable but slow. +4 Constitution, +1 Strength.", 
      bonuses: { constitution: 4, strength: 1 },
      availableClasses: ['Crystal Sage', 'Shard-Hurler', 'Grav-Brawler', 'Astro-Archaeologist', 'Geothermal Engineer', 'Terraformer']
    },
    'Mantis': { 
      description: "Insectoid hunters, revered for their lightning-fast reflexes and combat prowess. +3 Speed, +2 Dexterity.", 
      bonuses: { speed: 3, dexterity: 2 },
      availableClasses: ['Xenohunter', 'Hive Blade', 'Pheromone Warrior', 'Void-Dancer', 'Zero-G Brawler', 'Spectre', 'Swarm Caller']
    },
    'Engi': { 
      description: "A symbiotic race of organic beings and nanites, the Engi are unparalleled engineers and problem-solvers. +3 Intelligence, +2 Trade.", 
      bonuses: { intelligence: 3, trade: 2 },
      availableClasses: ['Tech-Scrapper', 'Nanite Surgeon', 'Bio-Tinker', 'Drone Controller', 'Terraformer', 'Ship\'s Surgeon', 'System Corruptor']
    },
    'The Void-Touched': { 
      description: "Beings forever changed by exposure to raw hyperspace, their minds are powerful but their bodies are frail. +3 Wisdom, +2 Intelligence.", 
      bonuses: { wisdom: 3, intelligence: 2 },
      availableClasses: ['Psion', 'Star-Prophet', 'Reality Warper', 'Meme-Weaver', 'Thought Eater', 'Xeno-Linguist', 'Oracle of the Void']
    },
    'Symbiote': { 
      description: "A composite being of two organisms in perfect harmony, one providing brute strength, the other tactical intellect. +3 Strength, +2 Intelligence.", 
      bonuses: { strength: 3, intelligence: 2 },
      availableClasses: ['Grav-Brawler', 'Psion', 'Dual-Mind Tactician', 'Corporate Enforcer', 'Biotic Brawler', 'Host Jumper']
    },
    'The Archivist': { 
      description: "A crystalline, silicon-based lifeform dedicated to preserving all universal knowledge, possessing immense memory and processing power. +4 Intelligence, +1 Wisdom.", 
      bonuses: { intelligence: 4, wisdom: 1 },
      availableClasses: ['Astro-Archaeologist', 'Lorekeeper Prime', 'Data-Scourge', 'Xeno-Linguist', 'Pattern Analyst', 'Data Broker', 'Star-Prophet']
    },
    'Uplifted Cephalopod': { 
      description: 'A cephalopod species granted sapience through advanced genetic engineering. They perceive the world through a unique lens, possessing multiple brains and incredible problem-solving skills, but their aquatic origins make them clumsy outside of low-gravity environments. +3 Intelligence, +2 Wisdom.', 
      bonuses: { intelligence: 3, wisdom: 2 },
      availableClasses: ['Psion', 'Chromatophore Artist', 'Xeno-biologist', 'Deep Thinker', 'Xeno-Linguist', 'Ink Adept', 'Data Broker']
    },
    'Nanite Collective': { 
      description: 'Not a single organism, but a sapient swarm of nanites that can form a humanoid shape. They are incredibly resilient and can reconfigure their bodies, but lack the nuance of organic emotion. +3 Constitution, +2 Intelligence.', 
      bonuses: { constitution: 3, intelligence: 2 },
      availableClasses: ['Tech-Scrapper', 'Formshaper', 'Replicator Swarm', 'Terraformer', 'Gray Goo Infiltrator', 'Spectre']
    },
    'High-Gravity Human': { 
      description: 'Humans born and raised on a high-gravity world. Their bodies are dense and powerfully built, making them exceptionally strong and durable, though their reflexes can be slower in standard gravity. +3 Strength, +2 Constitution.', 
      bonuses: { strength: 3, constitution: 2 },
      availableClasses: ['Soldier', 'Kinetic Juggernaut', 'Grav-Brawler', 'Anchor Guard', 'Corporate Enforcer', 'Asteroid Miner']
    },
    'Phase-Walker': { 
      description: 'Beings with a natural, unstable connection to other dimensions. They can briefly phase out of reality, making them incredibly elusive and difficult to track, but this instability makes them physically fragile. +3 Dexterity, +2 Luck.', 
      bonuses: { dexterity: 3, luck: 2 },
      availableClasses: ['Spectre', 'Blink Striker', 'Void-Dancer', 'Dimension-Thief', 'Smuggler', 'Echo Knight', 'Rogue Trader']
    },
    'Dominion Symbiote': { 
      description: 'A parasitic species that takes control of a host body. While the host provides physical form, the symbiote possesses a cunning, manipulative intellect and a thirst for power. +3 Persuasion, +2 Intelligence.', 
      bonuses: { persuasion: 3, intelligence: 2 },
      availableClasses: ['Psion', 'Puppet Master', 'Meme-Weaver', 'Body Snatcher', 'Envoy', 'Ego Devourer', 'Data Broker']
    },
    'Geode': { 
      description: 'Silicon-based lifeforms with crystalline bodies. Geodes are incredibly durable and process information with cold, deliberate logic, making them thoughtful but slow to act. +3 Constitution, +2 Wisdom.', 
      bonuses: { constitution: 3, wisdom: 2 },
      availableClasses: ['Astro-Archaeologist', 'Resonance Priest', 'Star-Prophet', 'Light Bender', 'Memory Crystal', 'Terraformer']
    },
    'Thran Hivemind': { 
      description: 'Insectoid beings linked by a collective consciousness. While individuals are simple, the hive acts as one, excelling at coordinated tasks and understanding complex systems. +3 Perception, +2 Trade.', 
      bonuses: { perception: 3, trade: 2 },
      availableClasses: ['Tech-Scrapper', 'Swarm Tactician', 'Data Broker', 'Builder Drone', 'Envoy', 'Queen\'s Guard']
    },
    'Lumin': { 
      description: 'Beings of sentient plasma held within sophisticated containment suits. They are incredibly fast and seem to bend probability, but their physical forms are inherently unstable. +3 Speed, +2 Luck.', 
      bonuses: { speed: 3, luck: 2 },
      availableClasses: ['Starship Pilot', 'Solar Flare', 'Void-Dancer', 'Starlight Weaver', 'Psion', 'Gravity Well', 'Smuggler']
    },
    'Nautilid': { 
      description: 'Amphibious humanoids evolved in the crushing depths of high-pressure oceans. Their bodies are dense and powerful, built to withstand extreme environments. +3 Constitution, +2 Strength.', 
      bonuses: { constitution: 3, strength: 2 },
      availableClasses: ['Soldier', 'Abyssal Knight', 'Corporate Enforcer', 'Bioluminescent Mystic', 'Grav-Brawler', 'Hydromancer', 'Terraformer']
    },
    'Silvanite': { 
      description: 'Mobile, sentient plant-based organisms. They have a deep, almost spiritual connection to the life cycles of the galaxy and possess immense patience and insight. +3 Faith, +2 Wisdom.', 
      bonuses: { faith: 3, wisdom: 2 },
      availableClasses: ['Star-Prophet', 'Thorn Lasher', 'Xeno-biologist', 'Root Shaper', 'Terraformer', 'Pollen Dreamer', 'Envoy']
    },
  },
  classes: {
    Soldier: { description: "A veteran of stellar warfare. Bonus: +2 Dexterity, +1 Constitution.", bonuses: { dexterity: 2, constitution: 1 } },
    Psion: { description: "A powerful telepath, bending minds to their will. Bonus: +3 Wisdom, +1 Persuasion.", bonuses: { wisdom: 3, persuasion: 1 } },
    'Tech-Scrapper': { description: "A resourceful engineer who can fix anything. Bonus: +3 Intelligence.", bonuses: { intelligence: 3 } },
    'Starship Pilot': { description: "An ace navigator with nerves of steel, at home in the cockpit of a starfighter. Bonus: +2 Speed, +1 Perception.", bonuses: { speed: 2, perception: 1 } },
    'Smuggler': { description: "A crafty operator who knows how to move goods and people under the radar. Bonus: +2 Luck, +1 Trade.", bonuses: { luck: 2, trade: 1 } },
    'Xeno-biologist': { description: "A scientist dedicated to the study of alien life, from microbes to megafauna. Bonus: +2 Wisdom, +1 Intelligence.", bonuses: { wisdom: 2, intelligence: 1 } },
    'Envoy': { description: "A galactic diplomat, trained in negotiation, protocol, and interstellar law. Bonus: +2 Persuasion, +1 Intelligence.", bonuses: { persuasion: 2, intelligence: 1 } },
    'Rogue Trader': { description: "A freelance explorer, merchant, and sometimes-privateer with a warrant to operate beyond the fringes of civilized space. Bonus: +2 Trade, +1 Persuasion.", bonuses: { trade: 2, persuasion: 1 } },
    'Xenohunter': { description: "A specialist in tracking and capturing or eliminating dangerous alien megafauna for research, profit, or safety. Bonus: +2 Perception, +1 Dexterity.", bonuses: { perception: 2, dexterity: 1 } },
    'Grav-Brawler': { description: "A warrior who utilizes personal gravity manipulators for bone-crushing strength and surprising mobility on the battlefield. Bonus: +2 Strength, +1 Speed.", bonuses: { strength: 2, speed: 1 } },
    'Astro-Archaeologist': { description: 'A scholar who delves into the ruins of precursor civilizations, seeking knowledge and lost technology. They are experts in history, xeno-linguistics, and spotting hidden details. Bonus: +2 Perception, +1 Intelligence.', bonuses: { perception: 2, intelligence: 1 } },
    'Bio-Tinker': { description: 'A rogue scientist who manipulates genetics and biology, often with little regard for ethics. They can create biological concoctions and perform field surgery with makeshift tools. Bonus: +2 Intelligence, +1 Wisdom.', bonuses: { intelligence: 2, wisdom: 1 } },
    'Meme-Weaver': { description: 'A social engineer who understands and manipulates cultural symbols, information, and beliefs to influence entire populations. Their weapon is weaponized information. Bonus: +2 Persuasion, +1 Attractiveness.', bonuses: { persuasion: 2, attractiveness: 1 } },
    'Void-Dancer': { description: 'A zero-g combat specialist, graceful and deadly in three-dimensional space. They utilize micro-thrusters and grappling hooks to turn any environment into their personal playground. Bonus: +2 Speed, +1 Dexterity.', bonuses: { speed: 2, dexterity: 1 } },
    'Xeno-Linguist': { description: 'A specialist in deciphering alien languages and understanding extraterrestrial cultures, making first contact possible. Bonus: +2 Intelligence, +1 Persuasion.', bonuses: { intelligence: 2, persuasion: 1 } },
    'Corporate Enforcer': { description: 'A heavily-armed and armored agent of a mega-corporation, tasked with protecting assets and eliminating rivals by any means necessary. Bonus: +2 Strength, +1 Constitution.', bonuses: { strength: 2, constitution: 1 } },
    'Star-Prophet': { description: 'A mystic who interprets cosmic phenomena—starlight, nebula patterns, black hole emissions—to divine the future and navigate fate. Bonus: +2 Faith, +1 Wisdom.', bonuses: { faith: 2, wisdom: 1 } },
    'Data Broker': { description: 'An information trafficker who operates in the grey markets of the galaxy, buying and selling secrets, access codes, and classified intel. Bonus: +2 Trade, +1 Luck.', bonuses: { trade: 2, luck: 1 } },
    'Terraformer': { description: 'An exo-engineer who wields planetary-scale technology to reshape worlds, from adjusting atmospheres to redirecting rivers. Bonus: +2 Intelligence, +1 Wisdom.', bonuses: { intelligence: 2, wisdom: 1 } },
    'Zero-G Brawler': { description: 'A warrior who has mastered combat in the disorienting environment of zero gravity, using momentum and anchor points to their advantage. Bonus: +2 Dexterity, +1 Speed.', bonuses: { dexterity: 2, speed: 1 } },
    'Cyber-Slinger': { description: 'A charismatic outlaw blending fast-draw cybernetic weapons with social hacking skills to get out of—and into—trouble. Bonus: +2 Attractiveness, +1 Dexterity.', bonuses: { attractiveness: 2, dexterity: 1 } },
    'Ship\'s Surgeon': { description: 'A medic specializing in the unique traumas of space: cybernetic rejection, alien parasites, explosive decompression, and advanced field surgery. Bonus: +2 Wisdom, +1 Intelligence.', bonuses: { wisdom: 2, intelligence: 1 } },
    'Spectre': { description: "An augmented ghost in the machine. Utilizes advanced cloaking technology, cybernetic enhancements, and silenced energy weapons to eliminate targets with cold, digital precision. They are corporate phantoms and political tools. Bonus: +2 Dexterity, +1 Speed.", bonuses: { dexterity: 2, speed: 1 } },

    // New Unique Classes
    'Federation Diplomat': { description: "A master of interstellar politics, capable of navigating the complex bureaucracies of galactic governments. Bonus: +2 Persuasion, +1 Intelligence.", bonuses: { persuasion: 2, intelligence: 1 } },
    'Colonial Ranger': { description: "A rugged survivalist and scout, specializing in exploring and taming newly discovered, often hostile, worlds. Bonus: +2 Perception, +1 Constitution.", bonuses: { perception: 2, constitution: 1 } },
    'Megacorp Auditor': { description: "A corporate agent who wields financial data and influence as weapons, navigating the cutthroat world of corporate espionage. Bonus: +2 Trade, +1 Wisdom.", bonuses: { trade: 2, wisdom: 1 } },
    'Old Earth Cultist': { description: "A believer in humanity's lost origins, possessing strange, often esoteric, knowledge about a forgotten past. Bonus: +2 Faith, +1 Luck.", bonuses: { faith: 2, luck: 1 } },
    'Integrated Juggernaut': { description: "A walking fortress, their body almost entirely replaced with heavy combat cybernetics, sacrificing speed for overwhelming power. Bonus: +2 Strength, +1 Constitution.", bonuses: { strength: 2, constitution: 1 } },
    'Combat Hacker': { description: "Uses their neural interface to disrupt enemy technology on the battlefield, disabling weapons and turning machines against their masters. Bonus: +2 Intelligence, +1 Dexterity.", bonuses: { intelligence: 2, dexterity: 1 } },
    'Ghostwire Infiltrator': { description: "A stealth operative who can jack into systems directly via neural links, becoming a ghost in the machine. Bonus: +2 Dexterity, +1 Intelligence.", bonuses: { dexterity: 2, intelligence: 1 } },
    'Ion Weaver': { description: "Manipulates raw energy to create defensive shields or project disruptive ionic blasts. Bonus: +2 Intelligence, +1 Faith.", bonuses: { intelligence: 2, faith: 1 } },
    'Phase Technician': { description: "An expert in energy states who can temporarily shift their form to pass through solid matter or become immune to physical harm. Bonus: +2 Intelligence, +1 Luck.", bonuses: { intelligence: 2, luck: 1 } },
    'Living Battery': { description: "Can channel their own energy to supercharge allied technology or overload enemy systems with a devastating surge. Bonus: +2 Constitution, +1 Wisdom.", bonuses: { constitution: 2, wisdom: 1 } },
    'Pride Leader': { description: "A charismatic warrior who leads their K'tharr clan through a combination of physical prowess and social dominance. Bonus: +2 Strength, +1 Persuasion.", bonuses: { strength: 2, persuasion: 1 } },
    'Silent Stalker': { description: "An ambush predator who specializes in silent, single-strike takedowns with bladed weapons. Bonus: +2 Dexterity, +1 Perception.", bonuses: { dexterity: 2, perception: 1 } },
    'Sun-Dancer': { description: "A ritualistic warrior who fights with a graceful, almost hypnotic style, following ancient traditions of their sun-worshipping ancestors. Bonus: +2 Dexterity, +1 Faith.", bonuses: { dexterity: 2, faith: 1 } },
    'Crystal Sage': { description: "A Rockman who has existed for millennia, their crystalline mind holding vast stores of geological and historical knowledge. Bonus: +2 Wisdom, +1 Constitution.", bonuses: { wisdom: 2, constitution: 1 } },
    'Shard-Hurler': { description: "Can break off and psychokinetically launch razor-sharp fragments of their own crystalline body as deadly projectiles. Bonus: +2 Strength, +1 Dexterity.", bonuses: { strength: 2, dexterity: 1 } },
    'Geothermal Engineer': { description: "Understands planetary geology and can tap into geothermal vents for power or to create environmental hazards. Bonus: +2 Intelligence, +1 Constitution.", bonuses: { intelligence: 2, constitution: 1 } },
    'Pheromone Warrior': { description: "Can emit complex pheromones to create effects of fear, calm, or confusion in organic enemies, or to bolster the morale of their hive. Bonus: +2 Attractiveness, +1 Wisdom.", bonuses: { attractiveness: 2, wisdom: 1 } },
    'Hive Blade': { description: "A duelist who has mastered fighting with four razor-sharp limbs in a dizzying dance of death. Bonus: +2 Dexterity, +1 Speed.", bonuses: { dexterity: 2, speed: 1 } },
    'Swarm Caller': { description: "A specialized Mantis who can summon swarms of smaller, non-sapient insectoids to harass and distract foes. Bonus: +2 Faith, +1 Intelligence.", bonuses: { faith: 2, intelligence: 1 } },
    'Nanite Surgeon': { description: "Can use their own nanites to perform incredibly precise repairs on both technology and organic tissue. Bonus: +2 Wisdom, +1 Intelligence.", bonuses: { wisdom: 2, intelligence: 1 } },
    'Drone Controller': { description: "Commands a small fleet of semi-autonomous drones for reconnaissance, repair, or combat. Bonus: +2 Intelligence, +1 Perception.", bonuses: { intelligence: 2, perception: 1 } },
    'System Corruptor': { description: "Can infect enemy computer systems or even cybernetics with a disruptive cloud of their own nanites, causing malfunctions. Bonus: +2 Intelligence, +1 Luck.", bonuses: { intelligence: 2, luck: 1 } },
    'Reality Warper': { description: "Can subtly bend the laws of probability around them, creating minor illusions, convenient coincidences, or inexplicable bad luck for their enemies. Bonus: +2 Wisdom, +1 Luck.", bonuses: { wisdom: 2, luck: 1 } },
    'Thought Eater': { description: "A psychic vampire who can drain mental energy or even specific memories from their targets to sustain themselves. Bonus: +2 Faith, +1 Constitution.", bonuses: { faith: 2, constitution: 1 } },
    'Oracle of the Void': { description: "Can gaze into the chaotic energies of hyperspace to glean forbidden knowledge or glimpse possible futures, at great risk to their sanity. Bonus: +2 Wisdom, +1 Intelligence.", bonuses: { wisdom: 2, intelligence: 1 } },
    'Dual-Mind Tactician': { description: "The two minds of the Symbiote work in perfect concert, allowing for unparalleled tactical analysis and processing of battlefield information. Bonus: +2 Intelligence, +1 Perception.", bonuses: { intelligence: 2, perception: 1 } },
    'Biotic Brawler': { description: "The host's physical form is enhanced by the symbiote, granting them powerful bio-enhanced melee attacks and rapid regeneration. Bonus: +2 Strength, +1 Constitution.", bonuses: { strength: 2, constitution: 1 } },
    'Host Jumper': { description: "The intellectual symbiote can temporarily detach its consciousness to another willing or weakened host, controlling their actions. Bonus: +2 Persuasion, +1 Luck.", bonuses: { persuasion: 2, luck: 1 } },
    'Lorekeeper Prime': { description: "The highest rank of Archivist, their crystalline mind serves as a living library for the knowledge of entire lost civilizations. Bonus: +2 Intelligence, +1 Wisdom.", bonuses: { intelligence: 2, wisdom: 1 } },
    'Data-Scourge': { description: "An Archivist who has turned to more aggressive methods, capable of violently extracting information from both digital systems and organic minds. Bonus: +2 Intelligence, +1 Strength.", bonuses: { intelligence: 2, strength: 1 } },
    'Pattern Analyst': { description: "Can perceive and analyze vast patterns in data, history, and even cosmic background radiation to predict future events with uncanny accuracy. Bonus: +2 Perception, +1 Intelligence.", bonuses: { perception: 2, intelligence: 1 } },
    'Chromatophore Artist': { description: "Uses their highly advanced skin cells to create complex, mesmerizing, or terrifying light patterns, capable of communication, camouflage, or hypnosis. Bonus: +2 Attractiveness, +1 Intelligence.", bonuses: { attractiveness: 2, intelligence: 1 } },
    'Deep Thinker': { description: "A philosopher of the abyssal oceans, with profound insights into alien psychologies and the nature of consciousness. Bonus: +2 Wisdom, +1 Persuasion.", bonuses: { wisdom: 2, persuasion: 1 } },
    'Ink Adept': { description: "Can produce a variety of specialized bio-chemical inks, each with different effects such as poison, paralysis, or a thick smokescreen. Bonus: +2 Dexterity, +1 Intelligence.", bonuses: { dexterity: 2, intelligence: 1 } },
    'Replicator Swarm': { description: "Can consume raw materials to rapidly construct temporary copies of simple tools or create a defensive barrier of replicated matter. Bonus: +2 Trade, +1 Intelligence.", bonuses: { trade: 2, intelligence: 1 } },
    'Formshaper': { description: "A master at reconfiguring their swarm into complex and convincing shapes, making them an unparalleled infiltrator and mimic. Bonus: +2 Dexterity, +1 Attractiveness.", bonuses: { dexterity: 2, attractiveness: 1 } },
    'Gray Goo Infiltrator': { description: "Can break down their cohesive form into a near-liquid state of nanites, allowing them to seep through cracks, vents, and other small openings. Bonus: +2 Dexterity, +1 Luck.", bonuses: { dexterity: 2, luck: 1 } },
    'Kinetic Juggernaut': { description: "Can absorb and store kinetic energy from impacts, then release it in a single, devastating blow. Bonus: +2 Strength, +1 Constitution.", bonuses: { strength: 2, constitution: 1 } },
    'Anchor Guard': { description: "Excels at holding a single position against all odds, their high-gravity physiology making them nearly immovable. Bonus: +2 Constitution, +1 Wisdom.", bonuses: { constitution: 2, wisdom: 1 } },
    'Asteroid Miner': { description: "Accustomed to the crushing forces and hard labor of mining in high-gravity asteroid belts, they are incredibly strong and resilient. Bonus: +2 Strength, +1 Trade.", bonuses: { strength: 2, trade: 1 } },
    'Blink Striker': { description: "Fights by rapidly phasing in and out of reality for unpredictable, disorienting attacks. Bonus: +2 Dexterity, +1 Speed.", bonuses: { dexterity: 2, speed: 1 } },
    'Dimension-Thief': { description: "Can briefly reach into an adjacent dimension to pull out small, random, and often strange objects. Bonus: +2 Luck, +1 Dexterity.", bonuses: { luck: 2, dexterity: 1 } },
    'Echo Knight': { description: "Can leave behind temporary, phased echoes of themselves to distract and confuse their enemies. Bonus: +2 Wisdom, +1 Dexterity.", bonuses: { wisdom: 2, dexterity: 1 } },
    'Puppet Master': { description: "Excels at controlling multiple hosts simultaneously or influencing large groups of people through subtle psychic suggestion. Bonus: +2 Persuasion, +1 Intelligence.", bonuses: { persuasion: 2, intelligence: 1 } },
    'Body Snatcher': { description: "Specializes in the covert and permanent takeover of important individuals to further the Dominion's goals. Bonus: +2 Perception, +1 Persuasion.", bonuses: { perception: 2, persuasion: 1 } },
    'Ego Devourer': { description: "Gains power and knowledge by completely consuming the memories and personalities of their hosts. Bonus: +2 Wisdom, +1 Faith.", bonuses: { wisdom: 2, faith: 1 } },
    'Resonance Priest': { description: "Uses the natural resonant frequencies of their crystalline body to create vibrations that can heal allies or shatter enemy armor. Bonus: +2 Faith, +1 Wisdom.", bonuses: { faith: 2, wisdom: 1 } },
    'Light Bender': { description: "Can precisely refract light through their crystal form to create dazzling illusions or focus it into a damaging energy beam. Bonus: +2 Intelligence, +1 Dexterity.", bonuses: { intelligence: 2, dexterity: 1 } },
    'Memory Crystal': { description: "A Geode whose purpose is to be a living, incorruptible archive of a specific set of knowledge, such as a star map or a culture's history. Bonus: +2 Intelligence, +1 Constitution.", bonuses: { intelligence: 2, constitution: 1 } },
    'Swarm Tactician': { description: "A specialized drone that serves as a nexus for the hivemind in battle, coordinating the actions of thousands of individuals at once. Bonus: +2 Intelligence, +1 Perception.", bonuses: { intelligence: 2, perception: 1 } },
    'Builder Drone': { description: "Can rapidly construct defensive structures or bridges from a hardened, secreted resin. Bonus: +2 Constitution, +1 Intelligence.", bonuses: { constitution: 2, intelligence: 1 } },
    'Queen\'s Guard': { description: "An oversized, heavily armored drone bred for the sole purpose of defending the hive's queen. Bonus: +2 Strength, +1 Constitution.", bonuses: { strength: 2, constitution: 1 } },
    'Solar Flare': { description: "Can release a burst of intense plasma energy, damaging and temporarily blinding nearby foes. Bonus: +2 Strength, +1 Faith.", bonuses: { strength: 2, faith: 1 } },
    'Starlight Weaver': { description: "Can manipulate their plasma form to create intricate, hard-light constructs or convincing illusions. Bonus: +2 Intelligence, +1 Dexterity.", bonuses: { intelligence: 2, dexterity: 1 } },
    'Gravity Well': { description: "Can momentarily alter their own density to create a localized gravity field, slowing enemies or pulling them closer. Bonus: +2 Constitution, +1 Wisdom.", bonuses: { constitution: 2, wisdom: 1 } },
    'Abyssal Knight': { description: "A heavily armored warrior adapted to the crushing pressures of the deep sea, their armor serving as a personal submersible. Bonus: +2 Constitution, +1 Strength.", bonuses: { constitution: 2, strength: 1 } },
    'Bioluminescent Mystic': { description: "Uses complex patterns of bioluminescence to communicate, hypnotize foes, or channel psionic energy. Bonus: +2 Attractiveness, +1 Faith.", bonuses: { attractiveness: 2, faith: 1 } },
    'Hydromancer': { description: "Can psionically manipulate water and pressure, creating crushing currents or protective barriers. Bonus: +2 Wisdom, +1 Intelligence.", bonuses: { wisdom: 2, intelligence: 1 } },
    'Thorn Lasher': { description: "Can rapidly grow and launch volleys of razor-sharp thorns from their body. Bonus: +2 Dexterity, +1 Strength.", bonuses: { dexterity: 2, strength: 1 } },
    'Root Shaper': { description: "Can command nearby plant life or their own root systems to entangle foes, create difficult terrain, or reinforce structures. Bonus: +2 Wisdom, +1 Constitution.", bonuses: { wisdom: 2, constitution: 1 } },
    'Pollen Dreamer': { description: "Can release clouds of specialized pollen that can induce sleep, confusion, or even rapid healing in those who inhale it. Bonus: +2 Faith, +1 Attractiveness.", bonuses: { faith: 2, attractiveness: 1 } },
  }
};
