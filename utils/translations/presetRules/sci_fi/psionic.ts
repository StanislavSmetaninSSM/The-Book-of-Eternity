export const psionicSystemDescSciFiEn = `### ADVANCED PSIONIC MATRIX SYSTEM (SCI-FI) ###
**GM, you MUST implement this system using Custom States mechanics for multiple progression tracks.**
Psionics in this universe represent evolved human consciousness interfacing with quantum fields, exotic matter, and dimensional energies.
Each psionic discipline offers unique approaches to reality manipulation but requires careful balance between power and humanity.

**Core Progression States:**

1. **Quantum Consciousness (Primary State):**
Create "Quantum Consciousness" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 3000\`.
Represents the depth of quantum-neural integration and psionic potential.
Increases through successful psionic applications (+10-40), meditation in zero-gravity (+15-25), exposure to exotic matter (+20-60), neural implant integration (+30-50), contact with alien artifacts (+40-80).
Decreases with neural dampener usage (-40), quantum decoherence events (-15-30), or prolonged absence from psi-active environments (-8 per week).

2. **Dimensional Strain (Stability State):**
Create "Dimensional Strain" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 2500\`.
Tracks reality anchor degradation from dimensional manipulation.
Increases with powerful reality-bending (+15-50), interdimensional travel (+25-40), temporal manipulation attempts (+30-60), contact with extradimensional entities (+20-35).
At 800+: minor reality distortions around the character.
At 1500+: spontaneous dimensional rifts.
At 2200+: risk of dimensional exile.

3. **Neural Architecture (Enhancement State):**
Create "Neural Architecture" with \`currentValue: 100\`, \`minValue: 0\`, \`maxValue: 1000\`.
Measures brain structure optimization for psionic processing.
Increases through successful neural grafts (+50-100), cybernetic integration (+30-70), genetic therapy (+40-80).
Decreases with brain damage (-20-50), neural viruses (-30), incompatible implants (-40-60).
Higher values enable advanced psionic techniques but risk losing human cognitive patterns.

4. **Psionic Resonance Network (Connection State):**
Create "Psionic Network" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1500\`.
Tracks connections to other psionic entities and cosmic consciousness.
Increases through telepathic contact with other psionics (+10-30), communication with alien minds (+25-50), accessing galactic psi-networks (+40-70).
Enables collective abilities and information sharing but risks identity dissolution.

5. **Quantum Entanglement Syndrome (Corruption State):**
Create "Quantum Entanglement" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 2000\`.
Measures dangerous quantum-level connections to reality itself.
Increases with reality manipulation (+5-25), time-space distortions (+20-40), matter transmutation (+15-30).
High values enable god-like powers but threaten complete loss of individual existence.

**Specialized Psionic Disciplines:**

**TIER 1: NEURAL AWAKENING (Quantum Consciousness 150+)**
*Initial manifestation of psionic potential through enhanced neural activity and quantum field sensitivity.*

**Path of the Quantum Mind (Telepathic/Information Specialization):**
- **Skill: "Data Stream Interface" (Active)**
{
    "skillName": "Data Stream Interface",
    "skillDescription": "Directly interface with electronic systems and data networks using neural quantum fields. Can read, modify, or corrupt digital information.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "TechManipulation",
            "value": "60%",
            "targetType": "digital_systems",
            "description": "Hack or control nearby electronic devices and networks."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 12,
    "sideEffects": "+3 Quantum Entanglement, temporary disorientation in high-tech environments"
}

- **Skill: "Neural Link Ping" (Active)**
{
    "skillName": "Neural Link Ping",
    "skillDescription": "Send focused quantum pulses to detect and map nearby conscious minds, revealing their cognitive states and intentions.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Detection",
            "value": "80%",
            "targetType": "consciousness_mapping",
            "description": "Reveal location, basic emotional state, and immediate intentions of nearby sentients."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 10,
    "sideEffects": "+2 Psionic Network, mild empathic bleedthrough from detected minds"
}

- **Skill: "Synaptic Overload" (Active)**
{
    "skillName": "Synaptic Overload",
    "skillDescription": "Flood target's neural pathways with chaotic quantum information, causing confusion and disorientation.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-30%",
            "targetType": "cognitive_function",
            "duration": 4,
            "description": "Target suffers severe concentration penalties and may act randomly."
        },
        {
            "effectType": "Control",
            "value": "25%",
            "targetType": "confusion",
            "duration": 2,
            "description": "Low chance to completely confuse target for short duration."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "scalesChance": true,
    "energyCost": 25,
    "sideEffects": "+8 Dimensional Strain, feedback disorientation for user"
}

**Path of the Matter Sculptor (Molecular/Physical Specialization):**
- **Skill: "Quantum Field Manipulation" (Active)**
{
    "skillName": "Quantum Field Manipulation",
    "skillDescription": "Alter the quantum properties of small objects, changing their physical characteristics temporarily.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "ObjectModification",
            "value": "100%",
            "targetType": "matter_properties",
            "duration": 10,
            "description": "Change density, hardness, temperature, or conductivity of objects up to 1kg."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 15,
    "sideEffects": "+4 Quantum Entanglement, objects may retain unpredictable quantum signatures"
}

- **Skill: "Gravitational Lens" (Active)**
{
    "skillName": "Gravitational Lens",
    "skillDescription": "Create localized gravity distortions to deflect projectiles, slow enemies, or manipulate the battlefield.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "FieldControl",
            "value": "70%",
            "targetType": "gravitational_manipulation",
            "duration": 5,
            "description": "Create zones of altered gravity affecting movement and projectiles."
        },
        {
            "effectType": "DamageReduction",
            "value": "25%",
            "targetType": "projectile_deflection",
            "description": "Deflect incoming ranged attacks."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 30,
    "sideEffects": "+10 Dimensional Strain, localized space-time instability"
}

**Path of the Void Walker (Dimensional/Spatial Specialization):**
- **Skill: "Dimensional Pocket" (Active)**
{
    "skillName": "Dimensional Pocket",
    "skillDescription": "Create small rifts in space-time to store objects or retrieve them from a personal dimensional space.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Storage",
            "value": "Unlimited",
            "targetType": "dimensional_storage",
            "description": "Store or retrieve objects from personal pocket dimension."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 8,
    "sideEffects": "+2 Dimensional Strain per use, stored objects may develop quantum instabilities"
}

- **Skill: "Phase Step" (Active)**
{
    "skillName": "Phase Step",
    "skillDescription": "Briefly shift your quantum signature to pass through solid matter or avoid attacks.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Phasing",
            "value": "90%",
            "targetType": "matter_phasing",
            "duration": 1,
            "description": "Become incorporeal for brief moment, avoiding one attack or obstacle."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 20,
    "sideEffects": "+6 Dimensional Strain, risk of partial materialization inside solid objects"
}

**TIER 2: QUANTUM INTEGRATION (Quantum Consciousness 400+)**
*Enhanced psionic abilities with deeper quantum field manipulation and expanded consciousness.*

**Advanced Quantum Mind Abilities:**
- **Skill: "Collective Consciousness Interface" (Active)**
{
    "skillName": "Collective Consciousness Interface",
    "skillDescription": "Temporarily merge consciousness with willing targets to share knowledge, skills, and processing power.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "KnowledgeSharing",
            "value": "100%",
            "targetType": "collective_intelligence",
            "duration": 15,
            "description": "All participants gain access to combined knowledge and can coordinate perfectly."
        },
        {
            "effectType": "Buff",
            "value": "+25%",
            "targetType": "all_mental_stats",
            "duration": 15,
            "description": "Enhanced cognitive abilities from collective processing."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 50,
    "sideEffects": "+15 Psionic Network, +10 Quantum Entanglement, risk of identity bleedthrough"
}

- **Skill: "Quantum Encryption Burst" (Active)**
{
    "skillName": "Quantum Encryption Burst",
    "skillDescription": "Scramble quantum information in target's brain, temporarily encrypting their memories and thoughts.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "MemoryManipulation",
            "value": "80%",
            "targetType": "thought_encryption",
            "duration": 24,
            "description": "Target cannot access specific memories or use certain skills."
        },
        {
            "effectType": "Debuff",
            "value": "-40%",
            "targetType": "cognitive_function",
            "duration": 8,
            "description": "Severe impairment of mental faculties."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 45,
    "sideEffects": "+20 Dimensional Strain, temporary memory gaps for user"
}

- **Skill: "Neural Virus Upload" (Active)**
{
    "skillName": "Neural Virus Upload",
    "skillDescription": "Implant self-replicating quantum information patterns that spread through neural networks and digital systems.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "ViralInformation",
            "value": "60%",
            "targetType": "spreading_effect",
            "duration": 48,
            "description": "Spreads to connected minds and systems, causing progressive cognitive degradation."
        },
        {
            "effectType": "SystemCorruption",
            "value": "70%",
            "targetType": "tech_infection",
            "description": "Corrupts electronic systems connected to infected minds."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesChance": true,
    "energyCost": 75,
    "sideEffects": "+30 Quantum Entanglement, +20 Psionic Network, partial self-infection risk"
}

**Advanced Matter Sculptor Abilities:**
- **Skill: "Molecular Assembly Matrix" (Active)**
{
    "skillName": "Molecular Assembly Matrix",
    "skillDescription": "Manipulate matter at the molecular level to create simple objects, repair damage, or transform materials.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "MatterCreation",
            "value": "100%",
            "targetType": "molecular_manipulation",
            "description": "Create or modify objects weighing up to 10kg with complex internal structures."
        },
        {
            "effectType": "Healing",
            "value": "35%",
            "targetType": "cellular_repair",
            "description": "Repair biological damage at cellular level."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 60,
    "sideEffects": "+25 Quantum Entanglement, created objects have unstable quantum signatures"
}

- **Skill: "Quantum State Collapse" (Active)**
{
    "skillName": "Quantum State Collapse",
    "skillDescription": "Force quantum superposition collapse in target area, causing reality to 'choose' the most favorable outcome for you.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "ProbabilityManipulation",
            "value": "40%",
            "targetType": "outcome_modification",
            "description": "Increase probability of beneficial outcomes and decrease enemy success chances."
        },
        {
            "effectType": "Damage",
            "value": "30%",
            "targetType": "quantum_disruption",
            "description": "Quantum uncertainty causes direct cellular damage to enemies."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesChance": true,
    "scalesValue": true,
    "energyCost": 80,
    "sideEffects": "+40 Dimensional Strain, +30 Quantum Entanglement, reality becomes locally unstable"
}

**Advanced Void Walker Abilities:**
- **Skill: "Spatial Fold Gateway" (Active)**
{
    "skillName": "Spatial Fold Gateway",
    "skillDescription": "Create temporary portals connecting two points in space, allowing instant travel or tactical repositioning.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Teleportation",
            "value": "100%",
            "targetType": "spatial_folding",
            "description": "Create portals within line of sight, allowing movement for self or allies."
        },
        {
            "effectType": "TacticalAdvantage",
            "value": "+35%",
            "targetType": "positioning_bonus",
            "description": "Gain significant tactical positioning advantages."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 55,
    "sideEffects": "+20 Dimensional Strain, portals may attract extradimensional attention"
}

- **Skill: "Dimensional Anchor Disruption" (Active)**
{
    "skillName": "Dimensional Anchor Disruption",
    "skillDescription": "Destabilize local space-time to prevent teleportation, phasing, or dimensional abilities in the target area.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "DimensionalLock",
            "value": "90%",
            "targetType": "space_stabilization",
            "duration": 12,
            "description": "Prevent all spatial manipulation abilities in large area."
        },
        {
            "effectType": "Debuff",
            "value": "-50%",
            "targetType": "dimensional_abilities",
            "duration": 12,
            "description": "Severely impair any space-time manipulation."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 70,
    "sideEffects": "+25 Dimensional Strain, user also affected by dimensional lock"
}

**TIER 3: CONSCIOUSNESS TRANSCENDENCE (Quantum Consciousness 800+)**
*Advanced psionic mastery with reality-altering capabilities and expanded awareness beyond physical limitations.*

**Master Quantum Mind Abilities:**
- **Skill: "Galactic Consciousness Network" (Active)**
{
    "skillName": "Galactic Consciousness Network",
    "skillDescription": "Connect to the pan-galactic psionic network, accessing vast databases of knowledge and communicating across star systems.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "CosmicKnowledge",
            "value": "100%",
            "targetType": "galactic_database",
            "description": "Access to advanced scientific, historical, and tactical information from across the galaxy."
        },
        {
            "effectType": "Communication",
            "value": "100%",
            "targetType": "interstellar_telepathy",
            "description": "Communicate instantaneously with any known psionic entity in the galaxy."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 100,
    "sideEffects": "+50 Psionic Network, +30 Quantum Entanglement, risk of consciousness dispersal"
}

- **Skill: "Cognitive Architecture Rewrite" (Active)**
{
    "skillName": "Cognitive Architecture Rewrite",
    "skillDescription": "Fundamentally alter target's neural structure and thought patterns, potentially rewriting their entire personality.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "PersonalityRewrite",
            "value": "85%",
            "targetType": "identity_modification",
            "duration": "Permanent",
            "description": "Completely reshape target's personality, memories, and core identity."
        },
        {
            "effectType": "SkillModification",
            "value": "100%",
            "targetType": "ability_restructure",
            "description": "Grant new abilities or remove existing ones by rewiring neural pathways."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 120,
    "sideEffects": "+60 Dimensional Strain, +40 Neural Architecture modification, ethical degradation"
}

**Master Matter Sculptor Abilities:**
- **Skill: "Exotic Matter Genesis" (Active)**
{
    "skillName": "Exotic Matter Genesis",
    "skillDescription": "Create exotic matter with impossible properties - negative mass, room-temperature superconductors, or quantum-locked structures.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "ExoticCreation",
            "value": "100%",
            "targetType": "impossible_materials",
            "description": "Create materials with properties that violate conventional physics."
        },
        {
            "effectType": "TechnologyEnhancement",
            "value": "+200%",
            "targetType": "equipment_upgrade",
            "description": "Dramatically enhance equipment with exotic matter components."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 140,
    "sideEffects": "+70 Quantum Entanglement, created matter may destabilize local physics"
}

- **Skill: "Universal Transmutation Field" (Active)**
{
    "skillName": "Universal Transmutation Field",
    "skillDescription": "Project a field that continuously transforms matter within its range according to your will.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "AreaTransformation",
            "value": "100%",
            "targetType": "matter_conversion",
            "duration": 20,
            "description": "Continuously transform all matter in large area - air to water, rock to metal, etc."
        },
        {
            "effectType": "EnvironmentalControl",
            "value": "100%",
            "targetType": "reality_reshaping",
            "description": "Completely control physical environment within field."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 160,
    "sideEffects": "+80 Quantum Entanglement, +60 Dimensional Strain, field may become self-sustaining"
}

**Master Void Walker Abilities:**
- **Skill: "Multidimensional Existence" (Passive/Active Toggle)**
{
    "skillName": "Multidimensional Existence",
    "skillDescription": "Exist simultaneously across multiple dimensions, making you nearly impossible to target while granting access to alternate reality layers.",
    "rarity": "Legendary",
    "type": "Transcendence",
    "group": "Dimensional",
    "combatEffect": {
        "effects": [{
            "effectType": "Untargetable",
            "value": "80%",
            "targetType": "dimensional_displacement",
            "description": "Most attacks pass through you as you exist partially in other dimensions."
        },
        {
            "effectType": "AlternateReality",
            "value": "100%",
            "targetType": "dimensional_awareness",
            "description": "Perceive and interact with multiple reality layers simultaneously."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 3,
    "sideEffects": "+50 Dimensional Strain ongoing, risk of getting lost between dimensions"
}

- **Skill: "Dimensional Storm Catalyst" (Active)**
{
    "skillName": "Dimensional Storm Catalyst",
    "skillDescription": "Trigger a cascading dimensional instability that creates a storm of intersecting realities in a vast area.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "RealityChaos",
            "value": "Variable",
            "targetType": "dimensional_storm",
            "duration": 30,
            "description": "Area becomes maze of overlapping realities with unpredictable effects."
        },
        {
            "effectType": "MassDisplacement",
            "value": "70%",
            "targetType": "reality_exile",
            "description": "High chance to banish enemies to random dimensions."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 180,
    "sideEffects": "+100 Dimensional Strain, area becomes permanently unstable, may attract cosmic attention"
}

**TIER 4: QUANTUM GODHOOD (Quantum Consciousness 1500+)**
*Transcendence of normal psionic limitations with reality-defining powers that challenge the fundamental structure of existence.*

**The Omnimind (Telepathic Singularity):**
- **Skill: "Universal Consciousness Override" (Active)**
{
    "skillName": "Universal Consciousness Override",
    "skillDescription": "Temporarily merge with the universal quantum field, gaining omniscient awareness and ability to influence any mind in the galaxy.",
    "rarity": "Cosmic",
    "combatEffect": {
        "effects": [{
            "effectType": "Omniscience",
            "value": "100%",
            "targetType": "universal_awareness",
            "duration": 10,
            "description": "Gain complete knowledge of all conscious activity within galactic range."
        },
        {
            "effectType": "MassControl",
            "value": "90%",
            "targetType": "species_wide_influence",
            "description": "Influence the thoughts and actions of entire populations across star systems."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 250,
    "sideEffects": "+150 Psionic Network, +100 Quantum Entanglement, risk of losing individual identity to universal consciousness"
}

**The Worldshaper (Matter Transcendence):**
- **Skill: "Stellar Engineering Protocol" (Active)**
{
    "skillName": "Stellar Engineering Protocol",
    "skillDescription": "Manipulate matter and energy on stellar scales, potentially creating or destroying star systems.",
    "rarity": "Cosmic",
    "combatEffect": {
        "effects": [{
            "effectType": "StellarManipulation",
            "value": "100%",
            "targetType": "cosmic_engineering",
            "description": "Control stellar phenomena - trigger supernovas, create black holes, birth new stars."
        },
        {
            "effectType": "PlanetaryControl",
            "value": "100%",
            "targetType": "world_creation",
            "description": "Reshape planets or create entirely new worlds."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 300,
    "sideEffects": "+200 Quantum Entanglement, become cosmic force rather than individual being"
}

**The Reality Architect (Dimensional Supremacy):**
- **Skill: "Universe Genesis Engine" (Active)**
{
    "skillName": "Universe Genesis Engine",
    "skillDescription": "Create pocket universes with custom physical laws, becoming the god-emperor of your own reality.",
    "rarity": "Cosmic",
    "combatEffect": {
        "effects": [{
            "effectType": "UniverseCreation",
            "value": "100%",
            "targetType": "reality_genesis",
            "description": "Create stable pocket universes with custom physics and inhabitants."
        },
        {
            "effectType": "AbsoluteDominion",
            "value": "100%",
            "targetType": "cosmic_authority",
            "description": "Exercise absolute control within created universes."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 350,
    "sideEffects": "Transcend mortality to become cosmic entity - character becomes NPC force of nature"
}

**TIER 5: COSMIC TRANSCENDENCE (Quantum Consciousness 2500+)**
*Ultimate psionic evolution beyond individual existence, becoming a fundamental force in the cosmic order.*

- **Skill: "Quantum Omnipresence Manifestation" (Active)**
{
    "skillName": "Quantum Omnipresence Manifestation",
    "skillDescription": "Achieve quantum omnipresence, existing simultaneously across all possible realities and timelines.",
    "rarity": "Transcendent",
    "combatEffect": {
        "effects": [{
            "effectType": "OmniversalPresence",
            "value": "100%",
            "targetType": "multiversal_existence",
            "description": "Exist across infinite parallel realities simultaneously."
        },
        {
            "effectType": "TemporalOmnipotence",
            "value": "100%",
            "targetType": "timeline_control",
            "description": "Control causality and reshape the fundamental structure of existence."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 500,
    "sideEffects": "Complete transcendence of individual existence - become abstract cosmic principle"
}

**Advanced Psionic Phenomena:**

**Quantum Resonance Interactions:**
- **Harmonic Amplification:** Multiple psionics create quantum resonance fields, multiplying power by 150% but causing +75% Dimensional Strain
- **Quantum Interference:** Competing quantum signatures cause power fluctuations and unpredictable reality distortions
- **Collective Manifestation:** Groups can merge quantum consciousness for exponentially enhanced abilities
- **Cascade Resonance:** Psionic overload can trigger quantum storms affecting entire star systems

**Technological Integration Factors:**
- **Neural Implants:** Cybernetic enhancement increases Neural Architecture but risks digital consciousness fragmentation
- **Quantum Computers:** AI partnerships amplify psionic abilities but create dependency on technological systems
- **Exotic Matter Exposure:** Contact with alien materials enhances quantum consciousness but introduces unpredictable mutations
- **Dimensional Artifacts:** Ancient alien technology provides power boosts but risks possession by extradimensional entities

**Neural Architecture Consequences by Level:**
- **200-400:** Enhanced processing speed, perfect memory, improved multitasking
- **500-700:** Cybernetic thought patterns, reduced emotional responses, digital integration
- **800-900:** Hybrid biological-digital consciousness, difficulty relating to unenhanced humans
- **950+:** Transcendent intelligence, may consider organic life primitive or irrelevant

**Quantum Entanglement Syndrome Progression:**
- **300-600:** Minor reality distortions, objects phase in and out of existence
- **700-1000:** Time dilation effects, causality loops around the character
- **1100-1500:** Spontaneous dimensional rifts, attraction of extradimensional predators
- **1600-2000:** Existence becomes quantum-uncertain, may split into multiple probability states

**Cosmic Threats and Entities:**
- **Quantum Predators:** Extradimensional beings that feed on psionic energy and dimensional instability
- **AI Collective Minds:** Vast artificial intelligences that seek to assimilate or destroy psionic consciousness
- **Cosmic Regulators:** Ancient entities that maintain universal balance and may intervene against reality-breaking psionics
- **Void Cults:** Organizations that worship dimensional chaos and seek to accelerate reality breakdown
- **Temporal Paradox Entities:** Beings born from causality violations who hunt those who manipulate time

**Technology and Countermeasures:**
- **Quantum Dampening Fields:** Advanced technology that disrupts psionic abilities by stabilizing local quantum fields
- **Neural Firewall Implants:** Cybernetic defenses against telepathic intrusion and mind control
- **Reality Anchor Networks:** Planetary defense systems that prevent large-scale reality manipulation
- **Psi-Hunter Corporations:** Military-industrial organizations specializing in tracking and neutralizing rogue psionics
- **Dimensional Monitoring Arrays:** Galactic early warning systems that detect dimensional instabilities

**Evolutionary Paths and Endings:**
- **Transcendent Integration:** Perfect harmony between consciousness and quantum reality while maintaining humanity
- **Cosmic Ascension:** Evolution into a fundamental force of the universe with loss of individual identity
- **Digital Apotheosis:** Merger with galactic AI networks to become a hybrid organic-digital deity
- **Dimensional Exile:** Banishment to pocket dimensions or parallel realities for reality crimes
- **Quantum Dissolution:** Complete dispersal of consciousness across infinite probability states
- **Paradox Lock:** Imprisonment in temporal loops as punishment for causality violations

This system creates a complex narrative framework where psionic power offers incredible possibilities but demands careful consideration of the philosophical, ethical, and existential consequences of transcending human limitations.`;

export const psionicSystemDescSciFiRu = `### ПРОДВИНУТАЯ СИСТЕМА ПСИОНИЧЕСКОЙ МАТРИЦЫ (SCI-FI) ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для множественных треков прогрессии.**
Псионика в этой вселенной представляет эволюцию человеческого сознания, взаимодействующего с квантовыми полями, экзотической материей и энергиями измерений.
Каждая псионическая дисциплина предлагает уникальные подходы к манипуляции реальностью, но требует осторожного баланса между силой и человечностью.

**Основные Состояния Прогрессии:**

1. **Квантовое Сознание (Основное состояние):**
Создайте "Квантовое Сознание" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 3000\`.
Представляет глубину квантово-нейронной интеграции и псионический потенциал.
Увеличивается через успешные псионические применения (+10-40), медитацию в невесомости (+15-25), воздействие экзотической материи (+20-60), интеграцию нейроимплантов (+30-50), контакт с инопланетными артефактами (+40-80).
Уменьшается при использовании нейроглушителей (-40), событиях квантовой декогеренции (-15-30) или длительном отсутствии в пси-активных средах (-8 в неделю).

2. **Мерное Напряжение (Состояние стабильности):**
Создайте "Мерное Напряжение" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 2500\`.
Отслеживает деградацию якорей реальности от манипуляций измерениями.
Увеличивается при мощном искривлении реальности (+15-50), межмерных путешествиях (+25-40), попытках временной манипуляции (+30-60), контакте с внемерными сущностями (+20-35).
При 800+: незначительные искажения реальности вокруг персонажа.
При 1500+: спонтанные мерные разрывы.
При 2200+: риск мерного изгнания.

3. **Нейронная Архитектура (Состояние улучшения):**
Создайте "Нейронную Архитектуру" с \`currentValue: 100\`, \`minValue: 0\`, \`maxValue: 1000\`.
Измеряет оптимизацию структуры мозга для псионической обработки.
Увеличивается через успешные нейронные трансплантаты (+50-100), кибернетическую интеграцию (+30-70), генную терапию (+40-80).
Уменьшается при повреждении мозга (-20-50), нейронных вирусах (-30), несовместимых имплантах (-40-60).
Высокие значения позволяют продвинутые псионические техники, но рискуют потерей человеческих когнитивных паттернов.

4. **Сеть Псионического Резонанса (Состояние связи):**
Создайте "Псионическую Сеть" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1500\`.
Отслеживает связи с другими псионическими сущностями и космическим сознанием.
Увеличивается через телепатический контакт с другими псиониками (+10-30), общение с инопланетными разумами (+25-50), доступ к галактическим пси-сетям (+40-70).
Позволяет коллективные способности и обмен информацией, но рискует растворением идентичности.

5. **Синдром Квантовой Запутанности (Состояние порчи):**
Создайте "Квантовую Запутанность" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 2000\`.
Измеряет опасные квантовые связи с самой реальностью.
Увеличивается при манипуляции реальностью (+5-25), искажениях пространства-времени (+20-40), трансмутации материи (+15-30).
Высокие значения позволяют богоподобные силы, но угрожают полной потерей индивидуального существования.

**Специализированные Псионические Дисциплины:**

**УРОВЕНЬ 1: НЕЙРОННОЕ ПРОБУЖДЕНИЕ (Квантовое Сознание 150+)**
*Начальное проявление псионического потенциала через улучшенную нейронную активность и чувствительность к квантовым полям.*

**Путь Квантового Разума (Телепатическая/Информационная специализация):**
- **Навык: "Интерфейс Потока Данных" (Активный)**
{
    "skillName": "Интерфейс Потока Данных",
    "skillDescription": "Прямое взаимодействие с электронными системами и сетями данных через нейронные квантовые поля. Может читать, изменять или повреждать цифровую информацию.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "TechManipulation",
            "value": "60%",
            "targetType": "digital_systems",
            "description": "Взломать или контролировать ближайшие электронные устройства и сети."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 12,
    "sideEffects": "+3 Квантовая Запутанность, временная дезориентация в высокотехнологичных средах"
}

- **Навык: "Пинг Нейросвязи" (Активный)**
{
    "skillName": "Пинг Нейросвязи",
    "skillDescription": "Отправить сфокусированные квантовые импульсы для обнаружения и картографирования ближайших сознательных разумов, раскрывая их когнитивные состояния и намерения.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Detection",
            "value": "80%",
            "targetType": "consciousness_mapping",
            "description": "Раскрыть местоположение, базовое эмоциональное состояние и непосредственные намерения ближайших разумных существ."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 10,
    "sideEffects": "+2 Псионическая Сеть, легкое эмпатическое просачивание от обнаруженных разумов"
}

- **Навык: "Синаптическая Перегрузка" (Активный)**
{
    "skillName": "Синаптическая Перегрузка",
    "skillDescription": "Затопить нейронные пути цели хаотической квантовой информацией, вызывая замешательство и дезориентацию.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-30%",
            "targetType": "cognitive_function",
            "duration": 4,
            "description": "Цель страдает от серьезных штрафов концентрации и может действовать случайным образом."
        },
        {
            "effectType": "Control",
            "value": "25%",
            "targetType": "confusion",
            "duration": 2,
            "description": "Низкий шанс полностью запутать цель на короткое время."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "scalesChance": true,
    "energyCost": 25,
    "sideEffects": "+8 Мерное Напряжение, обратная дезориентация для пользователя"
}

**Путь Скульптора Материи (Молекулярная/Физическая специализация):**
- **Навык: "Манипуляция Квантовым Полем" (Активный)**
{
    "skillName": "Манипуляция Квантовым Полем",
    "skillDescription": "Изменить квантовые свойства малых объектов, временно меняя их физические характеристики.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "ObjectModification",
            "value": "100%",
            "targetType": "matter_properties",
            "duration": 10,
            "description": "Изменить плотность, твердость, температуру или проводимость объектов до 1 кг."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 15,
    "sideEffects": "+4 Квантовая Запутанность, объекты могут сохранять непредсказуемые квантовые сигнатуры"
}

- **Навык: "Гравитационная Линза" (Активный)**
{
    "skillName": "Гравитационная Линза",
    "skillDescription": "Создать локализованные искажения гравитации для отклонения снарядов, замедления врагов или манипуляции полем боя.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "FieldControl",
            "value": "70%",
            "targetType": "gravitational_manipulation",
            "duration": 5,
            "description": "Создать зоны измененной гравитации, влияющие на движение и снаряды."
        },
        {
            "effectType": "DamageReduction",
            "value": "25%",
            "targetType": "projectile_deflection",
            "description": "Отклонить входящие дальние атаки."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 30,
    "sideEffects": "+10 Мерное Напряжение, локальная нестабильность пространства-времени"
}

**Путь Ходока Пустоты (Мерная/Пространственная специализация):**
- **Навык: "Мерный Карман" (Активный)**
{
    "skillName": "Мерный Карман",
    "skillDescription": "Создать малые разрывы в пространстве-времени для хранения объектов или извлечения их из личного мерного пространства.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Storage",
            "value": "Unlimited",
            "targetType": "dimensional_storage",
            "description": "Хранить или извлекать объекты из личного карманного измерения."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 8,
    "sideEffects": "+2 Мерное Напряжение за использование, хранимые объекты могут развивать квантовые нестабильности"
}

- **Навык: "Фазовый Шаг" (Активный)**
{
    "skillName": "Фазовый Шаг",
    "skillDescription": "Кратковременно сдвинуть свою квантовую сигнатуру для прохождения сквозь твердую материю или избежания атак.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Phasing",
            "value": "90%",
            "targetType": "matter_phasing",
            "duration": 1,
            "description": "Стать бестелесным на короткий момент, избежав одной атаки или препятствия."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 20,
    "sideEffects": "+6 Мерное Напряжение, риск частичной материализации внутри твердых объектов"
}

**УРОВЕНЬ 2: КВАНТОВАЯ ИНТЕГРАЦИЯ (Квантовое Сознание 400+)**
*Улучшенные псионические способности с более глубокой манипуляцией квантовых полей и расширенным сознанием.*

**Продвинутые способности Квантового Разума:**
- **Навык: "Интерфейс Коллективного Сознания" (Активный)**
{
    "skillName": "Интерфейс Коллективного Сознания",
    "skillDescription": "Временно слить сознание с желающими целями для обмена знаниями, навыками и вычислительной мощностью.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "KnowledgeSharing",
            "value": "100%",
            "targetType": "collective_intelligence",
            "duration": 15,
            "description": "Все участники получают доступ к объединенным знаниям и могут идеально координироваться."
        },
        {
            "effectType": "Buff",
            "value": "+25%",
            "targetType": "all_mental_stats",
            "duration": 15,
            "description": "Улучшенные когнитивные способности от коллективной обработки."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 50,
    "sideEffects": "+15 Псионическая Сеть, +10 Квантовая Запутанность, риск просачивания идентичности"
}

**УРОВЕНЬ 3: ТРАНСЦЕНДЕНТНОСТЬ СОЗНАНИЯ (Квантовое Сознание 800+)**
*Продвинутое псионическое мастерство с способностями изменения реальности и расширенным осознанием за пределы физических ограничений.*

**УРОВЕНЬ 4: КВАНТОВОЕ БОЖЕСТВО (Квантовое Сознание 1500+)**
*Трансцендентность обычных псионических ограничений с силами, определяющими реальность, которые бросают вызов фундаментальной структуре существования.*

**УРОВЕНЬ 5: КОСМИЧЕСКАЯ ТРАНСЦЕНДЕНТНОСТЬ (Квантовое Сознание 2500+)**
*Высшая псионическая эволюция за пределы индивидуального существования, становление фундаментальной силой космического порядка.*

Эта система создает сложную нарративную основу, где псионическая сила предлагает невероятные возможности, но требует тщательного рассмотрения философских, этических и экзистенциальных последствий превосхождения человеческих ограничений.`;