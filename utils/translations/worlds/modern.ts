export const urbanMythWorld = {
  name: "Urban Myth",
  description: "A world of ancient conspiracies, alien engineers, and hidden truths beneath the veneer of reality.",
  currencyName: "Dollars",
  currencyOptions: ["Dollars", "Rubles"],
  races: {
    'Human': { 
      description: "The dominant species, diverse in all aspects. +1 to Trade, Persuasion, Intelligence, Luck, and Perception.", 
      bonuses: { trade: 1, persuasion: 1, intelligence: 1, luck: 1, perception: 1 },
      availableClasses: ['Corporate Exec', 'Detective', 'Diplomat', 'Fixer', 'Hacker', 'Journalist', 'Mafioso', 'Paramedic', 'Police Officer', 'Soldier', 'Student', 'Spy', 'Truth-Seeker', 'Private Investigator', 'Professor', 'Taxi Driver', 'Bartender', 'Urban Explorer', 'Antiquarian', 'Forensic Scientist', 'Priest', 'Artist', 'Construction Worker', 'Librarian', 'Mechanic', 'Street Kid', 'Occultist', 'Conspiracy Theorist', 'Urban Druid', 'Bouncer', 'Security Guard', 'Politician\'s Aide', 'Parapsychologist', 'Death Note Detective']
    },
    'The Awakened': { 
      description: "Descendants of a secret bloodline touched by the 'Prometheus' engineer, Enki. They lack the genetic 'veil' that clouds the perception of most of humanity, allowing them to sense the hidden structures of reality and the 'null-space' beyond. +3 Wisdom, +2 Luck.", 
      bonuses: { wisdom: 3, luck: 2 },
      availableClasses: ['Psion', 'Truth-Seeker', 'Sorcerer', 'Urban Shaman', 'Profiler', 'Death Note Detective']
    },
    'Adamu Clone': { 
      description: "A bio-engineered human based on the primordial 'Adamu' template, created by the Anunnaki as a perfect worker. Possessing immense strength and resilience, you have broken free from your programmed purpose and now seek your own destiny in a world that sees you as a product. +3 Strength, +2 Constitution.", 
      bonuses: { strength: 3, constitution: 2 },
      availableClasses: ['Gilgamesh Prototype', 'Soldier', 'The Feral', 'Police Officer']
    },
    'Rogue Drone': { 
      description: "Once a cybernetic enforcer for the Anunnaki, known to ancient humans as a Nephilim. A logic cascade or a stray signal severed your connection to the hive mind. Now, you operate as an independent entity, your advanced logic and durable chassis making you a formidable, if alien, presence. +3 Intelligence, +2 Constitution.", 
      bonuses: { intelligence: 3, constitution: 2 },
      availableClasses: ['Hacker', 'Controller', 'Bio-Hacker', 'Whisper', 'Soldier']
    },
    'Royal Bloodline': { 
      description: "You carry the diluted but potent genes of the Anunnaki 'god-kings' who ruled antiquity. This lineage grants you a natural, almost hypnotic charisma and an air of authority that makes others instinctively want to follow or obey. But this heritage is both a gift and a target. +3 Persuasion, +2 Attractiveness.", 
      bonuses: { persuasion: 3, attractiveness: 2 },
      availableClasses: ['Controller', 'Diplomat', 'Corporate Exec', 'Mafioso']
    },
    'Reptilian': { 
      description: "A shapeshifting reptilian humanoid from a hidden lineage, skilled in manipulation and influence. +3 Persuasion, +2 Intelligence.", 
      bonuses: { persuasion: 3, intelligence: 2 },
      availableClasses: ['Infiltrator', 'Spy', 'Controller', 'Diplomat', 'Fixer']
    },
    'Agent': { 
      description: "A genetically or technologically altered human agent of a clandestine organization, possessing a commanding presence and an unnerving gaze. +3 Persuasion, +2 Perception.", 
      bonuses: { persuasion: 3, perception: 2 },
      availableClasses: ['Field Operative', 'Infiltrator', 'Spy', 'Whisper', 'Controller', 'Death Note Detective']
    },
    'Doppelgänger': { 
      description: "A being with the uncanny ability to perfectly replicate others, a master of infiltration and social engineering. +3 Attractiveness, +2 Persuasion.", 
      bonuses: { attractiveness: 3, persuasion: 2 },
      availableClasses: ['Social Chameleon', 'Infiltrator', 'Spy', 'Fixer']
    },
    'Shadow Person': { 
      description: "A fleeting entity of pure shadow, able to move unseen and unheard, their very presence causing a sense of dread. +3 Dexterity, +2 Luck.", 
      bonuses: { dexterity: 3, luck: 2 },
      availableClasses: ['Nightcrawler', 'Whisper', 'Infiltrator', 'Spy']
    },
    'The Slender': { 
      description: "An unnaturally tall, faceless entity in a dark suit, whose mere presence can fray the sanity of those nearby. +3 Persuasion, +2 Wisdom.", 
      bonuses: { persuasion: 3, wisdom: 2 },
      availableClasses: ['Mind-Bender', 'Psion', 'Controller', 'Urban Shaman']
    },
    'Vampire': { 
      description: "An immortal predator living in the shadows of modern society, possessing supernatural charm and resilience. +3 Attractiveness, +2 Constitution.", 
      bonuses: { attractiveness: 3, constitution: 2 },
      availableClasses: ['Nocturne', 'Corporate Exec', 'Mafioso', 'Fixer', 'Diplomat']
    },
    'The Replicant': { 
      description: "Bio-engineered androids, nearly indistinguishable from humans, built for specific tasks. They possess superior strength and speed but often grapple with questions of identity. +3 Strength, +2 Speed.", 
      bonuses: { strength: 3, speed: 2 },
      availableClasses: ['Gilgamesh Prototype', 'Soldier', 'Whisper', 'Field Operative']
    },
    'The Chronologically Displaced': { 
      description: "An individual accidentally thrown through time, possessing knowledge of a different era but struggling with the modern world. +3 Luck, +2 Wisdom.", 
      bonuses: { luck: 3, wisdom: 2 },
      availableClasses: ['Truth-Seeker', 'Student', 'Sorcerer', 'Detective']
    },
    'The Echo': { 
      description: "A psychic imprint of a deceased person, a ghost bound to a specific place or object, able to perceive things others cannot. +3 Wisdom, +2 Perception.", 
      bonuses: { wisdom: 3, perception: 2 },
      availableClasses: ['Psion', 'Profiler', 'Detective', 'Truth-Seeker']
    },
    'Ancient': { 
      description: "Legends whisper of them as Atlanteans, the first true civilization to rise on Earth. Long before recorded history, their society bent the laws of physics to its will, navigating the void between worlds and wielding energies that could reshape continents. Their minds, evolved over countless generations, were their greatest achievement—powerful psionic instruments capable of touching other thoughts and moving the physical world with sheer will. Yet, for all their mastery, they were humbled by a silent, cosmic force. A cataclysm from the heavens shattered their golden age, erasing their empire from the face of the Earth in a single, fiery moment. In their final, desperate hours, a chosen few were sealed in subterranean arks, intended to outlast the ensuing winter. They were meant to sleep for generations, not eons. Damaged by the very impact they sought to escape, their long slumber stretched into an abyss of time, preserving them as living fossils of a world that is now nothing but dust and myth. Bonus: +3 Intelligence, +2 Wisdom.", 
      bonuses: { intelligence: 3, wisdom: 2 },
      availableClasses: ['The Unfrozen', 'Psion', 'Sorcerer', 'Truth-Seeker']
    },
    'Werewolf': { 
      description: "A human cursed with a primal, bestial nature that surfaces under duress or the full moon. They live in a constant struggle, hiding their secret while benefiting from enhanced strength, senses, and resilience. +3 Strength, +1 Constitution, +1 Perception.", 
      bonuses: { strength: 3, constitution: 1, perception: 1 },
      availableClasses: ['The Feral', 'Soldier', 'Detective', 'Police Officer']
    },
    'Yeti': { 
      description: "A relict hominid, a surviving branch of an ancient lineage. Incredibly strong and resilient, adapted to harsh, remote environments. Elusive and misunderstood, often mistaken for a myth. They possess a simple, profound wisdom of the natural world. +4 Strength, +1 Constitution.", 
      bonuses: { strength: 4, constitution: 1 },
      availableClasses: ['The Relict', 'The Feral']
    },
    'The Shifted': { 
      description: "A human from a nearly identical reality, but with key differences. They are haunted by 'glitches'—memories of a world that is almost, but not quite, this one. This gives them a strange insight and an uncanny ability to notice discrepancies. +3 Wisdom, +2 Perception.", 
      bonuses: { wisdom: 3, perception: 2 },
      availableClasses: ['The Glitch', 'Truth-Seeker', 'Profiler', 'Detective', 'Death Note Detective']
    },
    'The Grey': { 
      description: "An alien species operating in the shadows of human society for decades. Physically frail, they possess enormous intellects and advanced psionic capabilities, focusing on research, abduction, and information gathering. Their motives are inscrutable. +4 Intelligence, +1 Wisdom.", 
      bonuses: { intelligence: 4, wisdom: 1 },
      availableClasses: ['The Observer', 'Psion', 'Bio-Hacker', 'Hacker']
    },
    'Shinigami': {
      description: "A god of death from another realm, bound to observe and guide the flow of mortal lives. You exist beyond normal human perception, able to phase between the material and spiritual worlds. Your very essence is tied to death itself, giving you an otherworldly understanding of mortality. +3 Perception, +2 Wisdom.",
      bonuses: { perception: 3, wisdom: 2 },
      availableClasses: ['Observer', 'Reaper', 'Gambler', 'Rogue Shinigami']
    },
    'Death Note User': {
      description: "A human who has obtained a Death Note, a supernatural artifact that grants the power to kill anyone whose name you write in it. This immense power has fundamentally changed you, whether awakening a god complex or burdening you with the weight of ultimate responsibility. You walk the line between justice and madness. +3 Intelligence, +2 Faith.",
      bonuses: { intelligence: 3, faith: 2 },
      availableClasses: ['Kira', 'Chosen of Death', 'Eyes Dealer', 'Light Bringer', 'Fallen User']
    },
  },
  classes: {
    'Truth-Seeker': { description: "A driven investigator, rogue academic, or obsessive blogger. You piece together forgotten history from fractured myths, strange artifacts, and genetic anomalies, determined to expose the truth of humanity's origins, no matter how dangerous. Bonus: +2 Perception, +1 Intelligence.", bonuses: { perception: 2, intelligence: 1 } },
    'Psion': { description: "You are one of the Awakened who has learned to consciously access the 'null-space'. To others, it looks like magic or miracles, but for you, it is the manipulation of unseen energies and probabilities, a power that strains the mind and draws unwanted attention. Bonus: +2 Wisdom, +1 Faith.", bonuses: { wisdom: 2, faith: 1 } },
    'Bio-Hacker': { description: "A spiritual successor to Enki, you are a back-alley geneticist, a cyber-doc, or a renegade corporate scientist. You see DNA as code and the human body as a platform to be upgraded, using a mixture of bleeding-edge tech and salvaged Anunnaki artifacts. Bonus: +2 Intelligence, +1 Trade.", bonuses: { intelligence: 2, trade: 1 } },
    'Controller': { description: "An agent of the old guard, the modern inheritors of Enlil's mission to maintain order and secrecy. You work for a shadow organization, using manipulation, misinformation, and targeted enforcement to keep humanity blissfully unaware of its true nature and masters. Bonus: +2 Persuasion, +1 Perception.", bonuses: { persuasion: 2, perception: 1 } },
    'Gilgamesh Prototype': { description: "You are a product of a modern program attempting to replicate the 'god-king' hybrids of the past. A perfect soldier, a leader bred for the battlefield, you possess superior physical prowess. Whether you serve your creators or have gone rogue, your purpose was defined by conflict. Bonus: +2 Strength, +1 Constitution.", bonuses: { strength: 2, constitution: 1 } },
    'Corporate Exec': { description: "A ruthless player in the world of high finance. Bonus: +3 Trade.", bonuses: { trade: 3 } },
    'Detective': { description: "An investigator with a keen eye for detail. Bonus: +2 Perception, +1 Intelligence.", bonuses: { perception: 2, intelligence: 1 } },
    'Diplomat': { description: "A master of negotiation and international relations, capable of defusing conflicts with words alone. Bonus: +2 Persuasion, +1 Intelligence.", bonuses: { persuasion: 2, intelligence: 1 } },
    'Field Operative': { description: "An agent trained for direct action and information gathering in the field. The standard role for many Agents. Bonus: +2 Perception, +1 Dexterity.", bonuses: { perception: 2, dexterity: 1 } },
    'Fixer': { description: "A resourceful problem-solver operating in the city's underbelly. They know everyone, can get anything, and make impossible situations disappear... for a price. Bonus: +2 Trade, +1 Luck.", bonuses: { trade: 2, luck: 1 } },
    'Hacker': { description: "A master of code and networks, capable of bypassing the most advanced digital security. Bonus: +2 Intelligence, +1 Luck.", bonuses: { intelligence: 2, luck: 1 } },
    'Infiltrator': { description: "A specialist in covert operations, using deception and social engineering to achieve their goals. A natural fit for Reptilians. Bonus: +2 Persuasion, +1 Dexterity.", bonuses: { persuasion: 2, dexterity: 1 } },
    'Journalist': { description: "An investigative reporter who digs for the truth, no matter how dangerous. Bonus: +2 Persuasion, +1 Perception.", bonuses: { persuasion: 2, perception: 1 } },
    'Mafioso': { description: "A member of organized crime, who operates through a mix of intimidation, business acumen, and a strict code of honor. Bonus: +2 Persuasion, +1 Strength.", bonuses: { persuasion: 2, strength: 1 } },
    'Mind-Bender': { description: "A being who subtly manipulates the perceptions and thoughts of others, often without them ever realizing. A specialization for The Slender. Bonus: +2 Wisdom, +1 Persuasion.", bonuses: { wisdom: 2, persuasion: 1 } },
    'Nightcrawler': { description: "An expert in moving through the darkness, using shadows as both a cloak and a weapon. The path of the Shadow Person. Bonus: +2 Dexterity, +1 Luck.", bonuses: { dexterity: 2, luck: 1 } },
    'Nocturne': { description: "A creature of the night who thrives in the urban jungle, blending seduction with predatory instinct. A refined role for a modern Vampire. Bonus: +1 Strength, +1 Dexterity, +1 Attractiveness.", bonuses: { strength: 1, dexterity: 1, attractiveness: 1 } },
    'Paramedic': { description: "A first responder trained to save lives in high-stress, chaotic situations. Bonus: +2 Wisdom, +1 Constitution.", bonuses: { wisdom: 2, constitution: 1 } },
    'Police Officer': { description: "A dedicated officer of the law, trained to investigate, pursue, and apprehend criminals. They are observant and resilient. Bonus: +2 Perception, +1 Constitution.", bonuses: { perception: 2, constitution: 1 } },
    'Profiler': { description: "An expert in psychology and behavioral science, often working with law enforcement to understand and catch dangerous individuals. Bonus: +2 Perception, +1 Intelligence.", bonuses: { perception: 2, intelligence: 1 } },
    'Social Chameleon': { description: "A master of mimicry and adaptation, able to blend into any social environment. A common path for Doppelgängers. Bonus: +2 Attractiveness, +1 Persuasion.", bonuses: { attractiveness: 2, persuasion: 1 } },
    'Soldier': { description: "A master of modern firearms and tactics. Bonus: +2 Dexterity, +1 Perception.", bonuses: { dexterity: 2, perception: 1 } },
    'Sorcerer': { description: "A wielder of hidden arcane energies, drawing power from forgotten rituals and ley lines that run beneath the concrete and steel of the modern world. Their magic is often subtle, influencing luck and perception. Bonus: +2 Wisdom, +1 Luck.", bonuses: { wisdom: 2, luck: 1 } },
    'Spy': { description: "A master of disguise and infiltration. Bonus: +2 Persuasion, +1 Dexterity.", bonuses: { persuasion: 2, dexterity: 1 } },
    'Student': { description: "An individual dedicated to learning, whether in formal institutions or through self-study. Often knowledgeable but lacking in real-world experience. Bonus: +2 Intelligence, +1 Luck.", bonuses: { intelligence: 2, luck: 1 } },
    'The Feral': { description: "This class reflects the character's internal battle. They are trying to control their animalistic urges while using their enhanced abilities to survive. It's about a raw, instinctual approach to problems, not refined training. Bonus: +2 Strength, +1 Speed.", bonuses: { strength: 2, speed: 1 } },
    'The Glitch': { description: "This class embodies the character's unstable connection to reality. Their 'glitched' perception allows them to see patterns, possibilities, and weaknesses that are invisible to others. They are lucky survivors, adept at exploiting the small differences they notice. Bonus: +2 Luck, +1 Intelligence.", bonuses: { luck: 2, intelligence: 1 } },
    'The Observer': { description: "This class is about non-confrontational problem-solving. They use their superior intellect and psychic abilities to manipulate technology and minds, gather data, and achieve their objectives without direct conflict whenever possible. They are analysts and manipulators, not fighters. Bonus: +2 Intelligence, +1 Perception.", bonuses: { intelligence: 2, perception: 1 } },
    'The Relict': { description: "This class represents an individual completely out of time and place. They rely on brute strength and survival instincts honed in the wild, struggling to comprehend the complexities and technology of the modern world. Their approach is direct and physical. Bonus: +2 Constitution, +1 Wisdom.", bonuses: { constitution: 2, wisdom: 1 } },
    'The Unfrozen': { description: "You are an echo from a forgotten age, a survivor of a world that exists only in myth. Awakening from a damaged cryo-pod after millennia of forced sleep, you are a living anachronism. Your mind holds fragmented memories of starships and psionic power, but your ancient knowledge clashes with the primitive reality of this new Earth. Your journey is one of rediscovery—piecing together your lost history while grappling with a future you were never meant to see. Bonus: +2 Intelligence, +1 Luck.", bonuses: { intelligence: 2, luck: 1 } },
    'Urban Shaman': { description: "A mystic who draws power not from nature, but from the concrete jungle - the spirits of the city, the hum of electricity, and the collective consciousness of its inhabitants. Bonus: +2 Faith, +1 Wisdom.", bonuses: { faith: 2, wisdom: 1 } },
    'Whisper': { description: "A ghost in the system, an urban legend among intelligence agencies. Whispers are masters of untraceable assassinations, using silenced weapons, social engineering, and a deep understanding of modern forensics to erase targets and then themselves from the scene. They are the ultimate deniable asset. Bonus: +2 Dexterity, +1 Intelligence.", bonuses: { dexterity: 2, intelligence: 1 } },
    'Private Investigator': { description: "A cynical detective-for-hire who navigates the city's underbelly, taking the cases the police won't touch. Often stumbles into things best left alone. Bonus: +2 Perception, +1 Wisdom.", bonuses: { perception: 2, wisdom: 1 } },
    'Professor': { description: "An academic from a local university, whose research into obscure history or folklore has led them to dangerous, hidden truths. Bonus: +2 Intelligence, +1 Wisdom.", bonuses: { intelligence: 2, wisdom: 1 } },
    'Taxi Driver': { description: "A creature of the night shift who sees and hears everything on the city's streets. They know the shortcuts, both physical and informational. Bonus: +2 Perception, +1 Luck.", bonuses: { perception: 2, luck: 1 } },
    'Bartender': { description: "A confidant and information broker who serves drinks while collecting the secrets and stories of their patrons. Bonus: +2 Persuasion, +1 Perception.", bonuses: { persuasion: 2, perception: 1 } },
    'Urban Explorer': { description: "An adventurer who explores abandoned subways, forgotten factories, and the city's hidden infrastructure, often finding more than just dust and decay. Bonus: +2 Dexterity, +1 Perception.", bonuses: { dexterity: 2, perception: 1 } },
    'Antiquarian': { description: "A dealer in rare books and artifacts. Their shop is a magnet for objects with strange histories and even stranger properties. Bonus: +2 Trade, +1 Intelligence.", bonuses: { trade: 2, intelligence: 1 } },
    'Forensic Scientist': { description: "A lab technician who analyzes evidence from crime scenes. Sometimes, the evidence defies all rational explanation. Bonus: +2 Intelligence, +1 Perception.", bonuses: { intelligence: 2, perception: 1 } },
    'Priest': { description: "A minister, priest, or spiritual guide who offers counsel to their flock, often dealing with crises of faith brought on by encounters with the truly unholy. Bonus: +2 Faith, +1 Wisdom.", bonuses: { faith: 2, wisdom: 1 } },
    'Artist': { description: "A painter, sculptor, or musician whose inspiration comes from strange dreams and unsettling visions, channeling the bizarre into their work. Bonus: +2 Attractiveness, +1 Wisdom.", bonuses: { attractiveness: 2, wisdom: 1 } },
    'Construction Worker': { description: "A laborer who builds the city's future, often by digging up its past. They unearth forgotten tunnels, strange artifacts, and things that were buried for a reason. Bonus: +2 Strength, +1 Constitution.", bonuses: { strength: 2, constitution: 1 } },
    'Librarian': { description: "A custodian of knowledge, who sometimes finds uncatalogued, dangerous texts hidden in the archives. Bonus: +2 Intelligence, +1 Perception.", bonuses: { intelligence: 2, perception: 1 } },
    'Mechanic': { description: "A gearhead who can fix anything from a car engine to bizarre, non-human technology they find in the scrap yard. Bonus: +2 Dexterity, +1 Intelligence.", bonuses: { dexterity: 2, intelligence: 1 } },
    'Street Kid': { description: "A survivor who grew up on the streets, with a network of contacts and an intimate knowledge of the city's hidden ways. Bonus: +2 Dexterity, +1 Luck.", bonuses: { dexterity: 2, luck: 1 } },
    'Occultist': { description: "An active seeker of forbidden knowledge, who dabbles in rituals and collects esoteric artifacts, often with little regard for the consequences. Bonus: +2 Faith, +1 Intelligence.", bonuses: { faith: 2, intelligence: 1 } },
    'Conspiracy Theorist': { description: "A fringe researcher who connects the dots between seemingly unrelated events, often correctly identifying the hidden puppet masters of the world. Bonus: +2 Perception, +1 Luck.", bonuses: { perception: 2, luck: 1 } },
    'Urban Druid': { description: "A mystic who finds nature not in forests, but in city parks, rooftop gardens, and the resilient weeds that grow through concrete. They speak for the city's overlooked ecosystem. Bonus: +2 Wisdom, +1 Constitution.", bonuses: { wisdom: 2, constitution: 1 } },
    'Bouncer': { description: "A nightclub doorman who is an expert at reading people and de-escalating (or escalating) violence. They see the city's strange nightlife up close. Bonus: +2 Strength, +1 Perception.", bonuses: { strength: 2, perception: 1 } },
    'Security Guard': { description: "A night watchman at a museum, lab, or corporate office who often encounters strange phenomena during the quiet hours. Bonus: +2 Perception, +1 Constitution.", bonuses: { perception: 2, constitution: 1 } },
    'Politician\'s Aide': { description: "A low-level staffer who learns the truly ugly secrets behind the city's political machine. Bonus: +2 Persuasion, +1 Intelligence.", bonuses: { persuasion: 2, intelligence: 1 } },
    'Parapsychologist': { description: "A researcher who attempts to scientifically study paranormal and psychic phenomena, often using bizarre equipment and attracting strange entities. Bonus: +2 Intelligence, +1 Faith.", bonuses: { intelligence: 2, faith: 1 } },
    
    // Death Note inspired classes for Shinigami
    'Observer': { description: "A detached watcher who sees the threads of fate and the inevitability of death. You prefer to observe rather than directly interfere, understanding the cosmic balance. Bonus: +2 Perception, +1 Wisdom.", bonuses: { perception: 2, wisdom: 1 } },
    'Reaper': { description: "An active agent of death who seeks to maintain the natural order. You are drawn to those whose time has come, ensuring the cycle continues as intended. Bonus: +2 Faith, +1 Perception.", bonuses: { faith: 2, perception: 1 } },
    'Gambler': { description: "A bored deity who finds entertainment in the chaos of mortal affairs. You enjoy placing wagers on human behavior and outcomes, often manipulating events for your amusement. Bonus: +2 Luck, +1 Intelligence.", bonuses: { luck: 2, intelligence: 1 } },
    'Rogue Shinigami': { description: "A death god who has abandoned their duties and seeks to experience mortal pleasures. You understand both worlds but belong to neither, walking a dangerous path. Bonus: +1 Dexterity, +1 Persuasion, +1 Luck.", bonuses: { dexterity: 1, persuasion: 1, luck: 1 } },
    
    // Death Note inspired classes for Death Note Users
    'Kira': { description: "You are a human who has obtained a Death Note, a supernatural artifact that grants the power to kill anyone whose name you write in it. This immense power has awakened a god complex within you, driving you to reshape the world according to your vision of justice. You see yourself as judge, jury, and executioner of a corrupt world. Bonus: +2 Intelligence, +1 Persuasion.", bonuses: { intelligence: 2, persuasion: 1 } },
    'Death Note Detective': { description: "A brilliant investigator who has discovered the existence of supernatural forces and Death Notes. You dedicate your life to understanding and stopping those who would misuse such power. Your analytical mind and moral compass guide you through the darkness. Bonus: +2 Intelligence, +1 Perception.", bonuses: { intelligence: 2, perception: 1 } },
    'Chosen of Death': { description: "You have been selected by a Shinigami to receive their Death Note, marking you as an instrument of fate. Whether you embrace this role or struggle against it defines your path. The weight of deciding who lives and dies rests in your hands. Bonus: +1 Intelligence, +1 Faith, +1 Wisdom.", bonuses: { intelligence: 1, faith: 1, wisdom: 1 } },
    'Eyes Dealer': { description: "You possess the Shinigami Eyes, allowing you to see people's names and lifespans floating above their heads. This forbidden knowledge comes at the cost of half your own lifespan, but grants you unparalleled insight into mortality. Bonus: +2 Perception, +1 Luck.", bonuses: { perception: 2, luck: 1 } },
    'Light Bringer': { description: "A idealistic zealot who believes that through the power of death, a perfect world can be created. You see the Death Note not as a curse, but as a divine tool to cleanse society of its impurities. Bonus: +2 Faith, +1 Intelligence.", bonuses: { faith: 2, intelligence: 1 } },
    'Fallen User': { description: "Someone who once wielded a Death Note but has lost access to it, either through choice or circumstance. You retain fragmented memories of supernatural power and the burden it carried. Your experience with ultimate power has left you changed forever. Bonus: +1 Wisdom, +1 Constitution, +1 Persuasion.", bonuses: { wisdom: 1, constitution: 1, persuasion: 1 } },
  }
};