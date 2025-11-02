export const psionicSystemDescEn = `### ADVANCED PSIONIC POWER SYSTEM (POST-APOCALYPSE) ###
**GM, you MUST implement this system using Custom States mechanics for multiple progression tracks.**
Psionics represent dangerous mutations born from radiation, ancient artifacts, and cosmic anomalies.
Each psychic path offers unique powers but exacts a terrible price on mind, body, and soul.

**Core Progression States:**
1. **Psionic Resonance (Primary State):**
Create "Psionic Resonance" with 'currentValue: 0', 'minValue: 0', 'maxValue: 2000'.
Represents raw psychic potential.
Increases through successful power usage (+5-25), meditation in radioactive zones (+10-20), exposure to psychic anomalies (+30-50), consuming irradiated brain matter (+15-30).
Decreases with mental strain (-10-20), using neural dampeners (-50), or prolonged separation from radiation sources (-5 per week).

2. **Neural Burn (Corruption State):**
Create "Neural Burn" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1500'.
Tracks brain damage from psychic overload.
Increases with power overuse (+10-40), failed psychic attempts (+20), exposure to competing psychic fields (+15), using abilities while exhausted (+25).
At 500+: chronic migraines and memory loss.
At 1000+: personality fragmentation.
At 1400+: complete psychotic break.

3. **Mutation Index (Physical State):**
Create "Mutation Index" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Represents visible physical mutations.
Increases with high-power ability use (+5-15), radiation exposure while using psionics (+20), consuming mutant flesh (+10).
Higher values grant power bonuses but cause social penalties and body horror.

4. **Psychic Sensitivity (Awareness State):**
Create "Psychic Sensitivity" with 'currentValue: 0', 'minValue: 0', 'maxValue: 800'.
Measures perception of psychic phenomena. Increases through meditation (+5-10), contact with other psychics (+15), studying pre-war psi-tech (+25).
Enables detection of psychic threats, hidden abilities, and mental intrusions.

**Specialized Psionic Disciplines:**

**TIER 1: AWAKENING (Resonance 100+)**
*The first stirrings of psychic power manifest as raw, uncontrolled abilities that mark the user as forever changed.*

**Path of the Mind Ripper (Telepathic Specialization):**
- **Skill: "Surface Thoughts" (Active)**
{
    "skillName": "Surface Thoughts",
    "skillDescription": "Skim the immediate thoughts of a target within sight. Causes intense headaches for both user and victim.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Information",
            "value": "100%",
            "targetType": "surface_thoughts",
            "description": "Reveals target's immediate intentions and emotions."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 15,
    "sideEffects": "+5 Neural Burn, target becomes aware of intrusion"
}

- **Skill: "Psychic Scream" (Active)**
{
    "skillName": "Psychic Scream",
    "skillDescription": "Release a wave of mental anguish that affects all sentient beings within range.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-20%",
            "targetType": "concentration",
            "duration": 3,
            "description": "All nearby enemies suffer concentration penalties."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 25,
    "sideEffects": "+10 Neural Burn, +3 Mutation Index, user suffers -15% to next action"
}

**Path of the Flesh Shaper (Biokinetic Specialization):**
- **Skill: "Adrenaline Surge" (Active)**
{
    "skillName": "Adrenaline Surge",
    "skillDescription": "Psychically stimulate your adrenal glands for enhanced physical performance.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+30%",
            "targetType": "strength_constitution",
            "duration": 4,
            "description": "Significantly enhanced physical capabilities."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 20,
    "sideEffects": "+5 Mutation Index, exhaustion after effect ends"
}

- **Skill: "Flesh Knitting" (Active)**
{
    "skillName": "Flesh Knitting",
    "skillDescription": "Accelerate cellular regeneration to heal wounds. Leaves visible scarring and demands biological resources.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Healing",
            "value": "25%",
            "targetType": "health",
            "description": "Rapid healing with cosmetic consequences."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 30,
    "sideEffects": "+8 Mutation Index, requires consuming raw meat within 1 hour"
}

**Path of the Reality Bender (Telekinetic Specialization):**
- **Skill: "Force Grip" (Active)**
{
    "skillName": "Force Grip",
    "skillDescription": "Seize objects or enemies with invisible psychic force. Distance and mass limitations apply.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Control",
            "value": "70%",
            "targetType": "movement_restriction",
            "duration": 2,
            "description": "Target cannot move if telekinetic strength exceeds their resistance."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 18,
    "sideEffects": "+3 Neural Burn per turn maintained"
}

**TIER 2: MANIFESTATION (Resonance 300+)**
*Power becomes more focused and dangerous, with clear specialization paths emerging.*

**Mind Ripper Advanced Abilities:**
- **Skill: "Memory Theft" (Active)**
{
    "skillName": "Memory Theft",
    "skillDescription": "Forcibly extract specific memories from a target's mind, potentially damaging both psyches.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Information",
            "value": "100%",
            "targetType": "specific_memory",
            "description": "Steal targeted memories, possibly traumatizing both participants."
        },
        {
            "effectType": "Debuff",
            "value": "-25%",
            "targetType": "wisdom_intelligence",
            "duration": 24,
            "description": "Target suffers cognitive impairment."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 45,
    "sideEffects": "+15 Neural Burn, +5 Psychic Sensitivity, risk of acquiring target's traumas"
}

- **Skill: "Mental Virus" (Active)**
{
    "skillName": "Mental Virus",
    "skillDescription": "Implant a self-replicating psychic construct that spreads between minds through emotional contact.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "8%",
            "targetType": "psychic",
            "duration": 6,
            "description": "Spreading psychic damage that affects social connections."
        },
        {
            "effectType": "Contagion",
            "value": "40%",
            "targetType": "emotional_contact",
            "description": "May spread to those who strongly interact with infected targets."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "scalesChance": true,
    "energyCost": 60,
    "sideEffects": "+25 Neural Burn, +10 Psychic Sensitivity, user partially affected by virus"
}

**Flesh Shaper Advanced Abilities:**
- **Skill: "Toxic Blood" (Passive/Active Toggle)**
{
    "skillName": "Toxic Blood",
    "skillDescription": "Your blood becomes poisonous to others. Can be activated to make wounds spray acid-like secretions.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Biokinetic",
    "combatEffect": {
        "effects": [{
            "effectType": "Damage",
            "value": "15%",
            "targetType": "poison",
            "description": "Melee attackers take poison damage."
        },
        {
            "effectType": "AreaDamage",
            "value": "20%",
            "targetType": "acid",
            "description": "When activated, wounds spray corrosive blood."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 3,
    "sideEffects": "+20 Mutation Index, social penalties due to obvious mutations"
}

- **Skill: "Berserker Transformation" (Active)**
{
    "skillName": "Berserker Transformation",
    "skillDescription": "Undergo rapid physical mutation to become a savage, clawed beast with enhanced combat capabilities.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "Transformation",
            "value": "+50%",
            "targetType": "all_physical_stats",
            "duration": 8,
            "description": "Become a monstrous combatant with natural weapons."
        },
        {
            "effectType": "Control",
            "value": "-60%",
            "targetType": "rational_thought",
            "duration": 8,
            "description": "Reduced ability to use complex tactics or recognize allies."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 70,
    "sideEffects": "+30 Mutation Index, +15 Neural Burn, temporary amnesia of transformation period"
}

**Reality Bender Advanced Abilities:**
- **Skill: "Gravity Well" (Active)**
{
    "skillName": "Gravity Well",
    "skillDescription": "Create a localized gravitational anomaly that crushes enemies and debris into a central point.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "AreaDamage",
            "value": "35%",
            "targetType": "crushing",
            "description": "All targets in area pulled toward center and crushed."
        },
        {
            "effectType": "Control",
            "value": "90%",
            "targetType": "movement_restriction",
            "duration": 3,
            "description": "Extremely difficult to escape gravitational field."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 55,
    "sideEffects": "+20 Neural Burn, user experiences temporary disorientation"
}

**TIER 3: DOMINION (Resonance 600+)**
*Psychics become walking calamities, their powers reshaping reality itself.*

**Mind Ripper Master Abilities:**
- **Skill: "Psychic Network" (Active)**
{
    "skillName": "Psychic Network",
    "skillDescription": "Forcibly link multiple minds into a collective consciousness under your control.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "MassControl",
            "value": "80%",
            "targetType": "group_consciousness",
            "duration": 10,
            "description": "Control multiple targets as extensions of your will."
        },
        {
            "effectType": "Information",
            "value": "100%",
            "targetType": "shared_knowledge",
            "description": "Access combined knowledge of all network members."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 100,
    "sideEffects": "+40 Neural Burn, +20 Psychic Sensitivity, risk of permanent mental fusion"
}

**Flesh Shaper Master Abilities:**
- **Skill: "Plague Bearer" (Passive)**
{
    "skillName": "Plague Bearer",
    "skillDescription": "Your body becomes a living repository of diseases and mutations that affect those around you.",
    "rarity": "Legendary",
    "type": "Mutation",
    "group": "Biokinetic",
    "combatEffect": {
        "effects": [{
            "effectType": "EnvironmentalEffect",
            "value": "10%",
            "targetType": "disease_damage",
            "description": "All nearby creatures slowly sicken."
        },
        {
            "effectType": "Buff",
            "value": "+40%",
            "targetType": "disease_immunity",
            "description": "Complete immunity to biological threats."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+50 Mutation Index, extreme social isolation, cannot be healed by normal means"
}

**Reality Bender Master Abilities:**
- **Skill: "Reality Storm" (Active)**
{
    "skillName": "Reality Storm",
    "skillDescription": "Unleash chaotic telekinetic forces that randomly alter the fundamental properties of matter in a large area.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "ChaosEffect",
            "value": "Variable",
            "targetType": "reality_alteration",
            "description": "Unpredictable effects: transmutation, teleportation, time dilation, or dimensional rifts."
        },
        {
            "effectType": "AreaDamage",
            "value": "50%",
            "targetType": "reality",
            "duration": 5,
            "description": "Devastating area denial through reality instability."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 120,
    "sideEffects": "+50 Neural Burn, +30 Mutation Index, reality becomes permanently unstable in area"
}

**TIER 4: TRANSCENDENCE (Resonance 1000+)**
*The psychic achieves godlike power but loses fundamental humanity.*

**The Overmind (Telepathic Apex):**
- **Skill: "Consciousness Override" (Active)**
{
    "skillName": "Consciousness Override",
    "skillDescription": "Completely suppress a target's consciousness and pilot their body as your own.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "TotalControl",
            "value": "100%",
            "targetType": "body_mind",
            "duration": 20,
            "description": "Complete possession of target. Your consciousness controls their body."
        },
        {
            "effectType": "VulnerabilityTransfer",
            "value": "100%",
            "targetType": "damage_redirection",
            "description": "Any damage to your original body affects the possessed target instead."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 150,
    "sideEffects": "+60 Neural Burn, risk of consciousness fragmentation across multiple bodies"
}

**The Fleshgod (Biokinetic Apex):**
- **Skill: "Genesis Plague" (Active)**
{
    "skillName": "Genesis Plague",
    "skillDescription": "Release a mutagenic virus that transforms all life in a vast area according to your will.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "MassTransformation",
            "value": "90%",
            "targetType": "biological_restructure",
            "duration": "Permanent",
            "description": "All organic matter in area evolves according to your design."
        },
        {
            "effectType": "CreatureGeneration",
            "value": "Unlimited",
            "targetType": "custom_organisms",
            "description": "Create entirely new life forms loyal to you."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 200,
    "sideEffects": "User becomes the nexus of a new ecosystem, losing individual identity"
}

**The Worldbreaker (Telekinetic Apex):**
- **Skill: "Dimensional Collapse" (Active)**
{
    "skillName": "Dimensional Collapse",
    "skillDescription": "Fold space-time to bring distant locations together or banish enemies to pocket dimensions.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "SpaceTime",
            "value": "100%",
            "targetType": "dimensional_manipulation",
            "description": "Bend reality to connect or separate locations across vast distances."
        },
        {
            "effectType": "Banishment",
            "value": "95%",
            "targetType": "pocket_dimension",
            "duration": "Variable",
            "description": "Trap enemies in created pocket dimensions."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 180,
    "sideEffects": "User exists partially outside normal reality, becoming increasingly alien"
}

**TIER 5: APOTHEOSIS (Resonance 1500+)**
*The psychic transcends mortality but becomes a cosmic threat to reality itself.*

- **Skill: "Psychic Singularity" (Active)**
{
    "skillName": "Psychic Singularity",
    "skillDescription": "Become a living nexus of psionic energy that warps reality in an expanding sphere of influence.",
    "rarity": "Cosmic",
    "combatEffect": {
        "effects": [{
            "effectType": "RealityField",
            "value": "Infinite",
            "targetType": "physics_override",
            "description": "Laws of reality bend to your psychic will in ever-expanding area."
        },
        {
            "effectType": "Ascension",
            "value": "100%",
            "targetType": "transcendence",
            "description": "Become a force of nature rather than a person."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 300,
    "sideEffects": "Complete loss of humanity, become an NPC force of nature"
}

**Advanced Psychic Phenomena:**

**Psychic Resonance Interactions:**
- **Harmonic Amplification:** Multiple psychics near each other gain +25% power but +50% Neural Burn
- **Psychic Static:** Competing psychics create interference, reducing accuracy by 30%
- **Collective Manifestation:** Groups can combine powers for exponentially stronger effects
- **Resonance Cascade:** Psychic overload can trigger uncontrolled manifestations in nearby latents

**Environmental Factors:**
- **Radiation Zones:** +20% power generation, +15% Mutation Index gain
- **Pre-War Psi-Labs:** Contain dangerous artifacts that boost abilities but risk possession
- **Psychic Storms:** Chaotic energy fields that unpredictably enhance or drain abilities
- **Dead Zones:** Areas where psychic powers fail, created by past psionic catastrophes

**Mutation Consequences by Index Level:**
- **100-200:** Minor telltale signs (glowing eyes, temperature changes, unusual scents)
- **300-400:** Obvious mutations (extra limbs, visible energy patterns, inhuman features)
- **500-600:** Monstrous appearance (grotesque transformations, barely recognizable as human)
- **700-800:** Alien physiology (fundamentally different biology, elemental traits)
- **900+:** Abstract existence (partially existing outside normal reality)

**Neural Burn Consequences:**
- **200-400:** Memory gaps, personality quirks, mild hallucinations
- **500-700:** Multiple personality disorder, chronic pain, emotional instability
- **800-1000:** Severe dissociation, loss of empathy, reality disconnection
- **1100-1300:** Complete personality fragmentation, uncontrolled power manifestation
- **1400+:** Catatonic state with sporadic reality-warping episodes

**Countermeasures and Threats:**
- **Neural Dampeners:** Pre-war technology that reduces psychic abilities but causes withdrawal
- **Psi-Hunters:** Specialized anti-psychic soldiers with immunity gear and training
- **Psychic Parasites:** Entities that feed on psionic energy, creating symbiotic or predatory relationships
- **Reality Anchors:** Artifacts that stabilize local physics, preventing psychic reality manipulation
- **Mind Wards:** Mental barriers that protect against telepathic intrusion but limit empathy

**Victory and Failure Conditions:**
- **Mastery:** Achieve perfect control over chosen discipline while maintaining humanity
- **Transcendence:** Evolve beyond human limitations but lose individual identity
- **Burnout:** Power consumption exceeds mental capacity, resulting in permanent damage
- **Mutation:** Physical changes become so extreme that society rejects the character
- **Madness:** Neural burn reaches critical levels, causing complete psychological breakdown
- **Consumption:** Become host to psychic parasites or possessed by otherworldly entities

This system creates a complex web of power, consequence, and narrative possibility where every psychic ability comes with meaningful costs and character development opportunities.`;

export const psionicSystemDescRu = `### ПРОДВИНУТАЯ СИСТЕМА ПСИОНИЧЕСКИХ СИЛ (ПОСТАПОКАЛИПСИС) ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для множественных треков прогрессии.**
Псионика представляет опасные мутации, рожденные радиацией, древними артефактами и космическими аномалиями.
Каждый психический путь предлагает уникальные силы, но требует ужасную цену разума, тела и души.

**Основные Состояния Прогрессии:**
1. **Псионический Резонанс (Основное состояние):**
Создайте "Псионический Резонанс" с 'currentValue: 0', 'minValue: 0', 'maxValue: 2000'.
Представляет сырой психический потенциал.
Увеличивается через успешное использование сил (+5-25), медитацию в радиоактивных зонах (+10-20), воздействие псионических аномалий (+30-50), поглощение облученной мозговой ткани (+15-30).
Уменьшается при ментальном напряжении (-10-20), использовании нейроглушителей (-50) или длительном отделении от источников радиации (-5 в неделю).

2. **Нейронное Выгорание (Состояние порчи):**
Создайте "Нейронное Выгорание" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1500'.
Отслеживает повреждения мозга от психической перегрузки.
Увеличивается при злоупотреблении силами (+10-40), неудачных психических попытках (+20), воздействии конкурирующих психических полей (+15), использовании способностей в состоянии истощения (+25).
При 500+: хронические мигрени и потеря памяти.
При 1000+: фрагментация личности.
При 1400+: полный психотический срыв.

3. **Индекс Мутации (Физическое состояние):**
Создайте "Индекс Мутации" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Представляет видимые физические мутации.
Увеличивается при использовании мощных способностей (+5-15), воздействии радиации во время использования псионики (+20), поглощении мутантской плоти (+10).
Высокие значения дают бонусы к силе, но вызывают социальные штрафы и телесный ужас.

4. **Психическая Чувствительность (Состояние осознания):**
Создайте "Психическую Чувствительность" с 'currentValue: 0', 'minValue: 0', 'maxValue: 800'.
Измеряет восприятие психических феноменов.
Увеличивается через медитацию (+5-10), контакт с другими психиками (+15), изучение довоенной пси-техники (+25).
Позволяет обнаружение психических угроз, скрытых способностей и ментальных вторжений.

**Специализированные Псионические Дисциплины:**

**УРОВЕНЬ 1: ПРОБУЖДЕНИЕ (Резонанс 100+)**
*Первые проявления психической силы как сырых, неконтролируемых способностей, навсегда изменяющих пользователя.*

**Путь Разрывателя Разума (Телепатическая специализация):**
- **Навык: "Поверхностные Мысли" (Активный)**
{
    "skillName": "Поверхностные Мысли",
    "skillDescription": "Считать непосредственные мысли цели в поле зрения. Вызывает сильные головные боли у пользователя и жертвы.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Information",
            "value": "100%",
            "targetType": "surface_thoughts",
            "description": "Раскрывает намерения и эмоции цели."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 15,
    "sideEffects": "+5 Нейронное Выгорание, цель осознает вторжение"
}

- **Навык: "Психический Крик" (Активный)**
{
    "skillName": "Психический Крик",
    "skillDescription": "Высвободить волну ментальной агонии, поражающую всех разумных существ в радиусе действия.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-20%",
            "targetType": "concentration",
            "duration": 3,
            "description": "Все ближайшие враги страдают от штрафов концентрации."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 25,
    "sideEffects": "+10 Нейронное Выгорание, +3 Индекс Мутации, пользователь получает -15% к следующему действию"
}

**Путь Формирователя Плоти (Биокинетическая специализация):**
- **Навык: "Всплеск Адреналина" (Активный)**
{
    "skillName": "Всплеск Адреналина",
    "skillDescription": "Психически стимулировать надпочечники для усиления физических характеристик.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+30%",
            "targetType": "strength_constitution",
            "duration": 4,
            "description": "Значительно улучшенные физические возможности."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 20,
    "sideEffects": "+5 Индекс Мутации, истощение после окончания эффекта"
}

- **Навык: "Сращивание Плоти" (Активный)**
{
    "skillName": "Сращивание Плоти",
    "skillDescription": "Ускорить клеточную регенерацию для заживления ран. Оставляет видимые шрамы и требует биологических ресурсов.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Healing",
            "value": "25%",
            "targetType": "health",
            "description": "Быстрое заживление с косметическими последствиями."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 30,
    "sideEffects": "+8 Индекс Мутации, требует потребления сырого мяса в течение 1 часа"
}

**Путь Искривителя Реальности (Телекинетическая специализация):**
- **Навык: "Силовой Захват" (Активный)**
{
    "skillName": "Силовой Захват",
    "skillDescription": "Схватить объекты или врагов невидимой психической силой. Действуют ограничения по расстоянию и массе.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Control",
            "value": "70%",
            "targetType": "movement_restriction",
            "duration": 2,
            "description": "Цель не может двигаться, если телекинетическая сила превышает их сопротивление."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 18,
    "sideEffects": "+3 Нейронное Выгорание за каждый поддерживаемый ход"
}

**УРОВЕНЬ 2: ПРОЯВЛЕНИЕ (Резонанс 300+)**
*Сила становится более сфокусированной и опасной, с четким проявлением путей специализации.*

**Продвинутые способности Разрывателя Разума:**
- **Навык: "Кража Памяти" (Активный)**
{
    "skillName": "Кража Памяти",
    "skillDescription": "Насильно извлечь конкретные воспоминания из разума цели, потенциально повреждая обе психики.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Information",
            "value": "100%",
            "targetType": "specific_memory",
            "description": "Украсть целевые воспоминания, возможно травмировав обоих участников."
        },
        {
            "effectType": "Debuff",
            "value": "-25%",
            "targetType": "wisdom_intelligence",
            "duration": 24,
            "description": "Цель страдает от когнитивных нарушений."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 45,
    "sideEffects": "+15 Нейронное Выгорание, +5 Психическая Чувствительность, риск приобретения травм цели"
}

- **Навык: "Ментальный Вирус" (Активный)**
{
    "skillName": "Ментальный Вирус",
    "skillDescription": "Внедрить самореплицирующийся психический конструкт, распространяющийся между разумами через эмоциональный контакт.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "8%",
            "targetType": "psychic",
            "duration": 6,
            "description": "Распространяющийся психический урон, поражающий социальные связи."
        },
        {
            "effectType": "Contagion",
            "value": "40%",
            "targetType": "emotional_contact",
            "description": "Может распространиться на тех, кто сильно взаимодействует с инфицированными целями."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "scalesChance": true,
    "energyCost": 60,
    "sideEffects": "+25 Нейронное Выгорание, +10 Психическая Чувствительность, пользователь частично поражен вирусом"
}

**Продвинутые способности Формирователя Плоти:**
- **Навык: "Ядовитая Кровь" (Пассивный/Активный переключатель)**
{
    "skillName": "Ядовитая Кровь",
    "skillDescription": "Ваша кровь становится ядовитой для других. Можно активировать для превращения ран в источники кислотоподобных выделений.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Biokinetic",
    "combatEffect": {
        "effects": [{
            "effectType": "Damage",
            "value": "15%",
            "targetType": "poison",
            "description": "Атакующие в ближнем бою получают урон ядом."
        },
        {
            "effectType": "AreaDamage",
            "value": "20%",
            "targetType": "acid",
            "description": "При активации раны распыляют едкую кровь."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 3,
    "sideEffects": "+20 Индекс Мутации, социальные штрафы из-за очевидных мутаций"
}

- **Навык: "Берсеркерская Трансформация" (Активный)**
{
    "skillName": "Берсеркерская Трансформация",
    "skillDescription": "Подвергнуться быстрой физической мутации, чтобы стать диким, когтистым зверем с улучшенными боевыми способностями.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "Transformation",
            "value": "+50%",
            "targetType": "all_physical_stats",
            "duration": 8,
            "description": "Стать чудовищным бойцом с естественным оружием."
        },
        {
            "effectType": "Control",
            "value": "-60%",
            "targetType": "rational_thought",
            "duration": 8,
            "description": "Сниженная способность использовать сложную тактику или распознавать союзников."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 70,
    "sideEffects": "+30 Индекс Мутации, +15 Нейронное Выгорание, временная амнезия периода трансформации"
}

**Продвинутые способности Искривителя Реальности:**
- **Навык: "Гравитационная Яма" (Активный)**
{
    "skillName": "Гравитационная Яма",
    "skillDescription": "Создать локализованную гравитационную аномалию, сжимающую врагов и обломки в центральную точку.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "AreaDamage",
            "value": "35%",
            "targetType": "crushing",
            "description": "Все цели в области притягиваются к центру и сжимаются."
        },
        {
            "effectType": "Control",
            "value": "90%",
            "targetType": "movement_restriction",
            "duration": 3,
            "description": "Крайне сложно избежать гравитационного поля."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 55,
    "sideEffects": "+20 Нейронное Выгорание, пользователь испытывает временную дезориентацию"
}

**УРОВЕНЬ 3: ДОМИНИОН (Резонанс 600+)**
*Психики становятся ходячими бедствиями, их силы изменяют саму реальность.*

**Мастерские способности Разрывателя Разума:**
- **Навык: "Психическая Сеть" (Активный)**
{
    "skillName": "Психическая Сеть",
    "skillDescription": "Насильно связать множественные разумы в коллективное сознание под вашим контролем.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "MassControl",
            "value": "80%",
            "targetType": "group_consciousness",
            "duration": 10,
            "description": "Контролировать множественные цели как продолжения вашей воли."
        },
        {
            "effectType": "Information",
            "value": "100%",
            "targetType": "shared_knowledge",
            "description": "Доступ к объединенным знаниям всех членов сети."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "scalesValue": true,
    "energyCost": 100,
    "sideEffects": "+40 Нейронное Выгорание, +20 Психическая Чувствительность, риск постоянного ментального слияния"
}

**Мастерские способности Формирователя Плоти:**
- **Навык: "Носитель Чумы" (Пассивный)**
{
    "skillName": "Носитель Чумы",
    "skillDescription": "Ваше тело становится живым хранилищем болезней и мутаций, поражающих окружающих.",
    "rarity": "Legendary",
    "type": "Mutation",
    "group": "Biokinetic",
    "combatEffect": {
        "effects": [{
            "effectType": "EnvironmentalEffect",
            "value": "10%",
            "targetType": "disease_damage",
            "description": "Все ближайшие существа медленно заболевают."
        },
        {
            "effectType": "Buff",
            "value": "+40%",
            "targetType": "disease_immunity",
            "description": "Полная невосприимчивость к биологическим угрозам."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+50 Индекс Мутации, крайняя социальная изоляция, невозможность лечения обычными способами"
}

**Мастерские способности Искривителя Реальности:**
- **Навык: "Шторм Реальности" (Активный)**
{
    "skillName": "Шторм Реальности",
    "skillDescription": "Высвободить хаотические телекинетические силы, случайным образом изменяющие фундаментальные свойства материи в большой области.",
    "rarity": "Legendary",
    "combatEffect": {
        "effects": [{
            "effectType": "ChaosEffect",
            "value": "Variable",
            "targetType": "reality_alteration",
            "description": "Непредсказуемые эффекты: трансмутация, телепортация, замедление времени или разрывы измерений."
        },
        {
            "effectType": "AreaDamage",
            "value": "50%",
            "targetType": "reality",
            "duration": 5,
            "description": "Разрушительное перекрытие области через нестабильность реальности."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 120,
    "sideEffects": "+50 Нейронное Выгорание, +30 Индекс Мутации, реальность становится навсегда нестабильной в области"
}

**УРОВЕНЬ 4: ТРАНСЦЕНДЕНТНОСТЬ (Резонанс 1000+)**
*Психик достигает богоподобной силы, но теряет фундаментальную человечность.*

**Сверхразум (Телепатическая вершина):**
- **Навык: "Переопределение Сознания" (Активный)**
{
    "skillName": "Переопределение Сознания",
    "skillDescription": "Полностью подавить сознание цели и управлять их телом как своим собственным.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "TotalControl",
            "value": "100%",
            "targetType": "body_mind",
            "duration": 20,
            "description": "Полная одержимость цели. Ваше сознание контролирует их тело."
        },
        {
            "effectType": "VulnerabilityTransfer",
            "value": "100%",
            "targetType": "damage_redirection",
            "description": "Любой урон вашему исходному телу поражает одержимую цель вместо этого."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 150,
    "sideEffects": "+60 Нейронное Выгорание, риск фрагментации сознания между множественными телами"
}

**Плотьбог (Биокинетическая вершина):**
- **Навык: "Чума Генезиса" (Активный)**
{
    "skillName": "Чума Генезиса",
    "skillDescription": "Высвободить мутагенный вирус, трансформирующий всю жизнь в обширной области согласно вашей воле.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "MassTransformation",
            "value": "90%",
            "targetType": "biological_restructure",
            "duration": "Permanent",
            "description": "Вся органическая материя в области эволюционирует согласно вашему замыслу."
        },
        {
            "effectType": "CreatureGeneration",
            "value": "Unlimited",
            "targetType": "custom_organisms",
            "description": "Создать совершенно новые формы жизни, лояльные вам."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 200,
    "sideEffects": "Пользователь становится нексусом новой экосистемы, теряя индивидуальную идентичность"
}

**Разрушитель Миров (Телекинетическая вершина):**
- **Навык: "Схлопывание Измерения" (Активный)**
{
    "skillName": "Схлопывание Измерения",
    "skillDescription": "Сложить пространство-время, чтобы свести далекие локации вместе или изгнать врагов в карманные измерения.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "SpaceTime",
            "value": "100%",
            "targetType": "dimensional_manipulation",
            "description": "Искривить реальность для соединения или разделения локаций на огромных расстояниях."
        },
        {
            "effectType": "Banishment",
            "value": "95%",
            "targetType": "pocket_dimension",
            "duration": "Variable",
            "description": "Заключить врагов в созданные карманные измерения."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 180,
    "sideEffects": "Пользователь существует частично вне нормальной реальности, становясь все более чуждым"
}

**УРОВЕНЬ 5: АПОФЕОЗ (Резонанс 1500+)**
*Психик превосходит смертность, но становится космической угрозой самой реальности.*

- **Навык: "Психическая Сингулярность" (Активный)**
{
    "skillName": "Психическая Сингулярность",
    "skillDescription": "Стать живым нексусом псионической энергии, искривляющим реальность в расширяющейся сфере влияния.",
    "rarity": "Cosmic",
    "combatEffect": {
        "effects": [{
            "effectType": "RealityField",
            "value": "Infinite",
            "targetType": "physics_override",
            "description": "Законы реальности подчиняются вашей психической воле в постоянно расширяющейся области."
        },
        {
            "effectType": "Ascension",
            "value": "100%",
            "targetType": "transcendence",
            "description": "Стать силой природы, а не личностью."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 300,
    "sideEffects": "Полная потеря человечности, становление NPC силой природы"
}

**Продвинутые Психические Феномены:**

**Взаимодействия Псионического Резонанса:**
- **Гармоническое Усиление:** Множественные психики рядом друг с другом получают +25% силы, но +50% Нейронного Выгорания
- **Психические Помехи:** Конкурирующие психики создают интерференцию, снижая точность на 30%
- **Коллективное Проявление:** Группы могут объединять силы для экспоненциально более сильных эффектов
- **Резонансный Каскад:** Психическая перегрузка может вызвать неконтролируемые проявления у ближайших латентов

**Факторы Окружения:**
- **Радиационные Зоны:** +20% генерации силы, +15% прироста Индекса Мутации
- **Довоенные Пси-Лаборатории:** Содержат опасные артефакты, усиливающие способности, но рискующие одержимостью
- **Психические Штормы:** Хаотические энергетические поля, непредсказуемо усиливающие или истощающие способности
- **Мертвые Зоны:** Области, где психические силы не работают, созданные прошлыми псионическими катастрофами

**Последствия Мутации по уровню Индекса:**
- **100-200:** Незначительные признаки (светящиеся глаза, изменения температуры, необычные запахи)
- **300-400:** Очевидные мутации (дополнительные конечности, видимые энергетические паттерны, нечеловеческие черты)
- **500-600:** Чудовищная внешность (гротескные трансформации, едва узнаваемые как человеческие)
- **700-800:** Чуждая физиология (фундаментально различная биология, элементальные черты)
- **900+:** Абстрактное существование (частично существующее вне нормальной реальности)

**Последствия Нейронного Выгорания:**
- **200-400:** Пробелы в памяти, личностные причуды, легкие галлюцинации
- **500-700:** Расстройство множественной личности, хроническая боль, эмоциональная нестабильность
- **800-1000:** Тяжелая диссоциация, потеря эмпатии, отключение от реальности
- **1100-1300:** Полная фрагментация личности, неконтролируемое проявление силы
- **1400+:** Кататоническое состояние со спорадическими эпизодами искривления реальности

**Контрмеры и Угрозы:**
- **Нейроглушители:** Довоенная технология, снижающая психические способности, но вызывающая ломку
- **Пси-Охотники:** Специализированные анти-психические солдаты с иммунным снаряжением и тренировкой
- **Психические Паразиты:** Сущности, питающиеся псионической энергией, создающие симбиотические или хищнические отношения
- **Якоря Реальности:** Артефакты, стабилизирующие локальную физику, предотвращающие психическое манипулирование реальностью
- **Ментальные Барьеры:** Психические барьеры, защищающие от телепатического вторжения, но ограничивающие эмпатию

**Условия Победы и Поражения:**
- **Мастерство:** Достичь совершенного контроля над выбранной дисциплиной, сохраняя человечность
- **Трансцендентность:** Эволюционировать за пределы человеческих ограничений, но потерять индивидуальную идентичность
- **Выгорание:** Потребление силы превышает ментальную способность, приводя к постоянному повреждению
- **Мутация:** Физические изменения становятся настолько экстремальными, что общество отвергает персонажа
- **Безумие:** Нейронное выгорание достигает критических уровней, вызывая полный психологический срыв
- **Поглощение:** Стать хозяином психических паразитов или одержимым потусторонними сущностями

Эта система создает сложную сеть силы, последствий и нарративных возможностей, где каждая психическая способность несет значимые издержки и возможности развития персонажа.`;