export const radiationSystemDescEn = `### ADVANCED RADIATION & MUTATION SYSTEM (POST-APOCALYPSE) ###
**GM, you MUST implement this system using Custom States mechanics for complex radiation tracking.**
Radiation is not merely death - it is transformation, evolution, and the price of survival in a world broken by atomic fire.
Each exposure reshapes the body, mind, and soul in ways both terrible and magnificent.

**Core Radiation States:**

1. **Radiation Accumulation (Primary State):**
Create "Radiation Level" with 'currentValue: 0', 'minValue: 0', 'maxValue: 2000+'.
Represents total radiation absorbed by the body (measured in Rads).
Increases through zone exposure (+1-50 per hour depending on intensity), consuming irradiated food/water (+5-25), handling radioactive materials (+10-40), medical treatments (+20-100).
Decreases with Rad-Away medication (-50 to -200), specialized medical treatment (-100 to -300), natural slow healing (-1 per week if below 100 Rads).

2. **Cellular Adaptation (Evolution State):**
Create "Cellular Adaptation" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1500'.
Tracks the body's growing resistance to radiation.
Increases through repeated exposure cycles (+5-20), surviving high radiation doses (+25-50), consuming mutant flesh (+10-30).
Higher values provide radiation resistance but may trigger unpredictable mutations.

3. **Genetic Stability (Degradation State):**
Create "Genetic Stability" with 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'.
Represents DNA integrity and cellular cohesion.
Decreases with acute radiation exposure (-10 to -50), failed mutation attempts (-20 to -80), exposure to exotic radiation types (-30 to -100).
Low values increase mutation chances but also organ failure risks.

4. **Radiation Sensitivity (Awareness State):**
Create "Radiation Sensitivity" with 'currentValue: 0', 'minValue: 0', 'maxValue: 800'.
Measures ability to detect and understand radiation sources.
Increases through exposure study (+5-15), using Geiger counters (+10-20), surviving radiation poisoning (+20-40).
Enables detection of hotspots, contaminated items, and radiation-based threats.

**Radiation Exposure Classifications:**

**TIER 1: BACKGROUND EXPOSURE (0-199 Rads)**
*The character operates within tolerable limits, showing minimal symptoms.*

**Radiation Effects by Level:**
- **Minor Exposure (50-99 Rads):**
  Create associated effect: { "effectType": "Debuff", "value": "-5%", "targetType": "endurance_recovery", "duration": 168, "sourceSkill": "Minor Radiation", "description": "Slightly reduced stamina recovery from cellular stress." }

- **Light Sickness (100-199 Rads):**
  Add effect: { "effectType": "Debuff", "value": "-10%", "targetType": "constitution", "duration": 336, "sourceSkill": "Light Radiation Sickness", "description": "Mild nausea and fatigue from radiation exposure." }

**TIER 2: ACUTE RADIATION SYNDROME (200-599 Rads)**
*Serious health effects manifest as the body struggles to cope with radiation damage.*

- **Moderate Sickness (200-299 Rads):**
  Add effects: 
  [{ "effectType": "Debuff", "value": "-15%", "targetType": "constitution", "duration": 504, "sourceSkill": "Moderate Radiation Sickness", "description": "Persistent nausea, vomiting, and weakness." },
   { "effectType": "Debuff", "value": "-10%", "targetType": "healing_rate", "duration": 504, "sourceSkill": "Impaired Healing", "description": "Radiation damage slows natural healing processes." }]

- **Severe Sickness (300-399 Rads):**
  Add effects:
  [{ "effectType": "Debuff", "value": "-20%", "targetType": "strength", "duration": 672, "sourceSkill": "Severe Radiation Sickness", "description": "Muscle weakness and severe fatigue." },
   { "effectType": "Debuff", "value": "-15%", "targetType": "immune_system", "duration": 672, "sourceSkill": "Immunosuppression", "description": "Increased susceptibility to diseases and infections." }]

- **Critical Sickness (400-499 Rads):**
  Add effects:
  [{ "effectType": "Debuff", "value": "-25%", "targetType": "dexterity", "duration": 840, "sourceSkill": "Motor Impairment", "description": "Tremors and coordination problems from nervous system damage." },
   { "effectType": "DamageOverTime", "value": "3%", "targetType": "cellular", "duration": 840, "sourceSkill": "Cellular Breakdown", "description": "Ongoing tissue damage from radiation exposure." }]

- **Acute Syndrome (500-599 Rads):**
  Add effects:
  [{ "effectType": "Debuff", "value": "-30%", "targetType": "intelligence", "duration": 1008, "sourceSkill": "Cognitive Impairment", "description": "Brain fog and reduced mental acuity." },
   { "effectType": "DamageOverTime", "value": "5%", "targetType": "blood", "duration": 1008, "sourceSkill": "Bone Marrow Failure", "description": "Destruction of blood-forming cells." }]

**TIER 3: SEVERE RADIATION POISONING (600-999 Rads)**
*Life-threatening radiation levels that fundamentally alter the body's biology.*

- **Gastrointestinal Syndrome (600-799 Rads):**
  Add effects:
  [{ "effectType": "DamageOverTime", "value": "8%", "targetType": "digestive", "duration": 1176, "sourceSkill": "GI Syndrome", "description": "Severe damage to digestive system lining." },
   { "effectType": "Debuff", "value": "-40%", "targetType": "nutrition_absorption", "duration": 1176, "sourceSkill": "Malabsorption", "description": "Cannot properly process food or water." }]

- **Hematopoietic Syndrome (800-999 Rads):**
  Add effects:
  [{ "effectType": "DamageOverTime", "value": "12%", "targetType": "blood_production", "duration": 1344, "sourceSkill": "Blood Cell Failure", "description": "Catastrophic failure of blood cell production." },
   { "effectType": "Debuff", "value": "-50%", "targetType": "oxygen_transport", "duration": 1344, "sourceSkill": "Severe Anemia", "description": "Critical reduction in oxygen-carrying capacity." }]

**TIER 4: LETHAL RADIATION (1000-1499 Rads)**
*Radiation levels that should kill, but may instead trigger extraordinary adaptations.*

- **Neurovascular Syndrome (1000-1299 Rads):**
  Add effects:
  [{ "effectType": "DamageOverTime", "value": "15%", "targetType": "neurological", "duration": 1512, "sourceSkill": "Neural Damage", "description": "Progressive nervous system breakdown." },
   { "effectType": "Debuff", "value": "-60%", "targetType": "all_mental_stats", "duration": 1512, "sourceSkill": "Cognitive Collapse", "description": "Severe impairment of all mental functions." }]

- **Terminal Irradiation (1300-1499 Rads):**
  Add effects:
  [{ "effectType": "DamageOverTime", "value": "20%", "targetType": "cellular_integrity", "duration": 1680, "sourceSkill": "Cellular Catastrophe", "description": "Widespread cellular death and organ failure." },
   { "effectType": "Transformation", "value": "100%", "targetType": "threshold_mutation", "description": "Body forced into radical transformation or death." }]

**TIER 5: BEYOND HUMAN TOLERANCE (1500+ Rads)**
*Radiation levels that transcend mortality, creating something no longer entirely human.*

- **Transcendent Radiation (1500+ Rads):**
  Must trigger "Evolutionary Crisis" - character either dies permanently or undergoes radical transformation into a unique radiation-adapted entity.

**Advanced Mutation System:**

**Mutation Triggers:**
- **First Threshold (300 Rads):** 40% chance of beneficial mutation, 60% chance of neutral/negative
- **Second Threshold (600 Rads):** 50% chance of powerful mutation, increased risk of instability
- **Third Threshold (900 Rads):** 60% chance of exotic mutation, high risk of losing humanity
- **Critical Threshold (1200 Rads):** 80% chance of transcendent mutation, near-certain personality changes
- **Evolutionary Crisis (1500+ Rads):** 100% chance of fundamental transformation

**Mutation Categories:**

**Beneficial Adaptations (40% of mutations):**

- **Skill: "Radiation Glands" (Passive)**
{
    "skillName": "Radiation Glands",
    "skillDescription": "Your body produces and stores radiation, making you immune to most radioactive environments while becoming a walking hazard.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Adaptive",
    "combatEffect": {
        "effects": [{
            "effectType": "Immunity",
            "value": "100%",
            "targetType": "radiation_damage",
            "description": "Complete immunity to radiation exposure."
        },
        {
            "effectType": "EnvironmentalEffect",
            "value": "5%",
            "targetType": "radiation_aura",
            "description": "Constantly emit low-level radiation affecting nearby creatures."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 3,
    "sideEffects": "+30 Radiation Sensitivity, social isolation due to radioactive presence"
}

- **Skill: "Photosynthetic Skin" (Passive)**
{
    "skillName": "Photosynthetic Skin",
    "skillDescription": "Your skin develops chlorophyll-like compounds, allowing you to supplement nutrition through sunlight absorption.",
    "rarity": "Uncommon",
    "type": "Mutation",
    "group": "Metabolic",
    "combatEffect": {
        "effects": [{
            "effectType": "Regeneration",
            "value": "2%",
            "targetType": "health",
            "description": "Slowly heal when exposed to sunlight or radiation."
        },
        {
            "effectType": "Buff",
            "value": "+20%",
            "targetType": "endurance",
            "description": "Reduced need for food in bright environments."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 2,
    "sideEffects": "Greenish skin coloration, weakness in complete darkness"
}

- **Skill: "Redundant Organs" (Passive)**
{
    "skillName": "Redundant Organs",
    "skillDescription": "Your body has developed backup versions of critical organs, providing remarkable resilience to damage.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Physiological",
    "combatEffect": {
        "effects": [{
            "effectType": "Resistance",
            "value": "+40%",
            "targetType": "critical_damage",
            "description": "Reduced chance of suffering fatal injuries."
        },
        {
            "effectType": "Buff",
            "value": "+25%",
            "targetType": "constitution_recovery",
            "description": "Enhanced recovery from serious injuries."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Slightly enlarged torso, increased caloric requirements"
}

**Neutral Adaptations (35% of mutations):**

- **Skill: "Nictitating Membranes" (Passive)**
{
    "skillName": "Nictitating Membranes",
    "skillDescription": "Transparent protective eyelids that shield your eyes from environmental hazards while maintaining vision.",
    "rarity": "Common",
    "type": "Mutation",
    "group": "Sensory",
    "combatEffect": {
        "effects": [{
            "effectType": "Resistance",
            "value": "+60%",
            "targetType": "eye_damage",
            "description": "Protection against bright lights, particles, and chemical exposure."
        },
        {
            "effectType": "Buff",
            "value": "+15%",
            "targetType": "environmental_perception",
            "description": "Enhanced ability to see in harsh conditions."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Alien appearance when membranes are visible, unsettling to others"
}

- **Skill: "Bioluminescent Patches" (Passive/Active Toggle)**
{
    "skillName": "Bioluminescent Patches",
    "skillDescription": "Patches of skin that can emit various colors of light, useful for communication or distraction.",
    "rarity": "Uncommon",
    "type": "Mutation",
    "group": "Cosmetic",
    "combatEffect": {
        "effects": [{
            "effectType": "Utility",
            "value": "100%",
            "targetType": "light_source",
            "description": "Can provide illumination without external equipment."
        },
        {
            "effectType": "Buff",
            "value": "+10%",
            "targetType": "social_intrigue",
            "description": "Enhanced ability to distract or mesmerize in social situations."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 2,
    "sideEffects": "Impossible to hide in darkness when active, may attract unwanted attention"
}

**Detrimental Mutations (25% of mutations):**

- **Skill: "Toxic Secretions" (Passive)**
{
    "skillName": "Toxic Secretions",
    "skillDescription": "Your body constantly produces toxic chemicals that poison your environment and make normal social interaction impossible.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Toxic",
    "combatEffect": {
        "effects": [{
            "effectType": "EnvironmentalEffect",
            "value": "8%",
            "targetType": "poison_damage",
            "description": "All nearby creatures suffer slow poisoning."
        },
        {
            "effectType": "Debuff",
            "value": "-80%",
            "targetType": "social_interaction",
            "description": "Cannot have normal relationships due to toxic presence."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Complete social isolation, cannot consume normal food or water"
}

- **Skill: "Sensory Overload" (Passive)**
{
    "skillName": "Sensory Overload",
    "skillDescription": "Your senses have become hypersensitive to the point of causing constant pain and distraction.",
    "rarity": "Uncommon",
    "type": "Mutation",
    "group": "Neurological",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+50%",
            "targetType": "perception_detection",
            "description": "Extraordinary sensory awareness of environment."
        },
        {
            "effectType": "Debuff",
            "value": "-30%",
            "targetType": "concentration_pain_tolerance",
            "description": "Constant sensory overload causes focus problems and pain."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Requires special environment to function, extreme discomfort in normal conditions"
}

**Exotic Mutations (Rare, high radiation only):**

- **Skill: "Phase Shifting" (Active)**
{
    "skillName": "Phase Shifting",
    "skillDescription": "Your atomic structure has become unstable, allowing you to briefly exist between dimensions.",
    "rarity": "Legendary",
    "type": "Mutation",
    "group": "Quantum",
    "combatEffect": {
        "effects": [{
            "effectType": "Intangibility",
            "value": "90%",
            "targetType": "physical_immunity",
            "duration": 3,
            "description": "Become temporarily intangible, immune to physical attacks."
        },
        {
            "effectType": "Teleportation",
            "value": "100%",
            "targetType": "short_range",
            "description": "Can phase through solid matter to reappear nearby."
        }]
    },
    "scalingCharacteristic": "constitution",
    "energyCost": 40,
    "sideEffects": "Risk of becoming permanently phased out of reality, requires high Genetic Stability"
}

- **Skill: "Hive Mind Resonance" (Passive)**
{
    "skillName": "Hive Mind Resonance",
    "skillDescription": "Your consciousness has become connected to a collective intelligence of other heavily irradiated individuals.",
    "rarity": "Mythic",
    "type": "Mutation",
    "group": "Psychic",
    "combatEffect": {
        "effects": [{
            "effectType": "Information",
            "value": "100%",
            "targetType": "collective_knowledge",
            "description": "Access to shared memories and skills of other hive mind members."
        },
        {
            "effectType": "Buff",
            "value": "+40%",
            "targetType": "problem_solving",
            "description": "Enhanced intelligence through distributed processing."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Gradual loss of individual identity, compulsion to seek other hive mind members"
}

**Specialized Radiation Types:**

**Gamma Radiation (Standard):** Causes cellular damage and standard mutations
**Alpha Radiation (Heavy):** Intense local damage, high mutation chance, requires ingestion/inhalation
**Beta Radiation (Penetrating):** Moderate damage over time, affects electronics
**Neutron Radiation (Exotic):** Makes materials radioactive, causes bizarre mutations
**Cosmic Radiation (Transcendent):** From space or ancient artifacts, triggers exotic mutations

**Advanced Environmental Factors:**

**Radiation Zones:**
- **Light Contamination (1-5 Rads/hour):** Safe with protection, long-term exposure causes gradual buildup
- **Moderate Contamination (6-20 Rads/hour):** Requires protective equipment, causes radiation sickness quickly
- **Heavy Contamination (21-100 Rads/hour):** Extremely dangerous, protection degraded rapidly
- **Lethal Zones (101-500 Rads/hour):** Death within hours without specialized equipment
- **Hellscape Zones (500+ Rads/hour):** Only heavily mutated beings can survive

**Protective Equipment:**
- **Rad-Suit (Basic):** -50% radiation exposure, degrades over time
- **Power Armor (Advanced):** -80% radiation exposure, requires power source
- **Mutation Adaptation:** Some mutations provide natural protection
- **Chemical Prophylaxis:** Pre-exposure drugs reduce immediate damage

**Medical Treatments:**

- **Rad-Away (Standard):** Removes 50-200 Rads, causes weakness temporarily
- **RadShield (Preventive):** Reduces radiation absorption by 40% for 24 hours
- **Cellular Regeneration Therapy:** Expensive treatment that repairs radiation damage and removes 300-500 Rads
- **Gene Therapy:** Experimental treatment that can lock beneficial mutations and remove detrimental ones
- **Chelation Therapy:** Removes specific radioactive isotopes but requires knowing exact contamination type

**Social and Psychological Impact:**

**Radiation Stigma:** High radiation exposure creates social penalties due to fear and superstition
**Mutation Discrimination:** Visible mutations cause negative reactions from unmutated humans
**Survivor Guilt:** Characters may develop psychological trauma from surviving lethal radiation doses
**Adaptation Identity Crisis:** Characters struggle with losing humanity as they become more adapted

**Victory and Survival Conditions:**
- **Adaptation Mastery:** Successfully manage radiation exposure while maintaining functionality
- **Beneficial Evolution:** Develop advantageous mutations while avoiding detrimental ones
- **Transcendence:** Evolve beyond human limitations while retaining core identity
- **Environmental Harmony:** Learn to thrive in radioactive environments others cannot survive
- **Mutation Synergy:** Develop complementary mutations that work together effectively
- **Radiation Immunity:** Achieve complete resistance to radiation effects through adaptation or technology

This system creates a complex survival challenge where radiation is both threat and opportunity, forcing players to balance immediate survival against long-term evolution in a hostile world.`;

export const radiationSystemDescRu = `### ПРОДВИНУТАЯ СИСТЕМА РАДИАЦИИ И МУТАЦИЙ (ПОСТАПОКАЛИПСИС) ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для сложного отслеживания радиации.**
Радиация - это не просто смерть, это трансформация, эволюция и цена выживания в мире, разрушенном атомным огнем.
Каждое воздействие изменяет тело, разум и душу ужасными и великолепными способами.

**Основные Состояния Радиации:**

1. **Накопление Радиации (Основное состояние):**
Создайте "Уровень Радиации" с 'currentValue: 0', 'minValue: 0', 'maxValue: 2000+'.
Представляет общую радиацию, поглощенную телом (измеряется в Радах).
Увеличивается через воздействие зон (+1-50 в час в зависимости от интенсивности), потребление облученной еды/воды (+5-25), обращение с радиоактивными материалами (+10-40), медицинские процедуры (+20-100).
Уменьшается лекарствами Антирадин (-50 до -200), специализированным медицинским лечением (-100 до -300), естественным медленным заживлением (-1 в неделю если ниже 100 Рад).

2. **Клеточная Адаптация (Состояние эволюции):**
Создайте "Клеточную Адаптацию" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1500'.
Отслеживает растущую устойчивость тела к радиации.
Увеличивается через повторные циклы воздействия (+5-20), выживание при высоких дозах радиации (+25-50), потребление мутантской плоти (+10-30).
Высокие значения обеспечивают устойчивость к радиации, но могут вызвать непредсказуемые мутации.

3. **Генетическая Стабильность (Состояние деградации):**
Создайте "Генетическую Стабильность" с 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'.
Представляет целостность ДНК и клеточную связность.
Уменьшается при остром радиационном воздействии (-10 до -50), неудачных попытках мутации (-20 до -80), воздействии экзотических типов радиации (-30 до -100).
Низкие значения увеличивают шансы мутации, но также риски отказа органов.

4. **Радиационная Чувствительность (Состояние осознания):**
Создайте "Радиационную Чувствительность" с 'currentValue: 0', 'minValue: 0', 'maxValue: 800'.
Измеряет способность обнаруживать и понимать источники радиации.
Увеличивается через изучение воздействия (+5-15), использование счетчиков Гейгера (+10-20), выживание после лучевой болезни (+20-40).
Позволяет обнаружение горячих точек, загрязненных предметов и угроз, основанных на радиации.

**Классификации Радиационного Воздействия:**

**УРОВЕНЬ 1: ФОНОВОЕ ВОЗДЕЙСТВИЕ (0-199 Рад)**
*Персонаж функционирует в пределах допустимых лимитов, показывая минимальные симптомы.*

**Эффекты Радиации по Уровням:**
- **Незначительное Воздействие (50-99 Рад):**
  Создайте связанный эффект: { "effectType": "Debuff", "value": "-5%", "targetType": "endurance_recovery", "duration": 168, "sourceSkill": "Незначительная Радиация", "description": "Слегка снижено восстановление выносливости от клеточного стресса." }

- **Легкая Болезнь (100-199 Рад):**
  Добавьте эффект: { "effectType": "Debuff", "value": "-10%", "targetType": "constitution", "duration": 336, "sourceSkill": "Легкая Лучевая Болезнь", "description": "Легкая тошнота и усталость от радиационного воздействия." }

**УРОВЕНЬ 2: ОСТРЫЙ РАДИАЦИОННЫЙ СИНДРОМ (200-599 Рад)**
*Серьезные последствия для здоровья проявляются, поскольку тело борется с радиационными повреждениями.*

- **Умеренная Болезнь (200-299 Рад):**
  Добавьте эффекты:
  [{ "effectType": "Debuff", "value": "-15%", "targetType": "constitution", "duration": 504, "sourceSkill": "Умеренная Лучевая Болезнь", "description": "Постоянная тошнота, рвота и слабость." },
   { "effectType": "Debuff", "value": "-10%", "targetType": "healing_rate", "duration": 504, "sourceSkill": "Нарушенное Заживление", "description": "Радиационные повреждения замедляют естественные процессы заживления." }]

- **Тяжелая Болезнь (300-399 Рад):**
  Добавьте эффекты:
  [{ "effectType": "Debuff", "value": "-20%", "targetType": "strength", "duration": 672, "sourceSkill": "Тяжелая Лучевая Болезнь", "description": "Мышечная слабость и сильная усталость." },
   { "effectType": "Debuff", "value": "-15%", "targetType": "immune_system", "duration": 672, "sourceSkill": "Иммуносупрессия", "description": "Повышенная восприимчивость к болезням и инфекциям." }]

- **Критическая Болезнь (400-499 Рад):**
  Добавьте эффекты:
  [{ "effectType": "Debuff", "value": "-25%", "targetType": "dexterity", "duration": 840, "sourceSkill": "Двигательные Нарушения", "description": "Тремор и проблемы координации от повреждения нервной системы." },
   { "effectType": "DamageOverTime", "value": "3%", "targetType": "cellular", "duration": 840, "sourceSkill": "Клеточный Распад", "description": "Продолжающееся повреждение тканей от радиационного воздействия." }]

- **Острый Синдром (500-599 Рад):**
  Добавьте эффекты:
  [{ "effectType": "Debuff", "value": "-30%", "targetType": "intelligence", "duration": 1008, "sourceSkill": "Когнитивные Нарушения", "description": "Туман в мозгу и снижение умственной остроты." },
   { "effectType": "DamageOverTime", "value": "5%", "targetType": "blood", "duration": 1008, "sourceSkill": "Отказ Костного Мозга", "description": "Разрушение кроветворных клеток." }]

**УРОВЕНЬ 3: ТЯЖЕЛОЕ РАДИАЦИОННОЕ ОТРАВЛЕНИЕ (600-999 Рад)**
*Угрожающие жизни уровни радиации, которые фундаментально изменяют биологию тела.*

- **Гастроинтестинальный Синдром (600-799 Рад):**
  Добавьте эффекты:
  [{ "effectType": "DamageOverTime", "value": "8%", "targetType": "digestive", "duration": 1176, "sourceSkill": "ЖК Синдром", "description": "Серьезное повреждение слизистой пищеварительной системы." },
   { "effectType": "Debuff", "value": "-40%", "targetType": "nutrition_absorption", "duration": 1176, "sourceSkill": "Мальабсорбция", "description": "Не может правильно переваривать пищу или воду." }]

- **Кроветворный Синдром (800-999 Рад):**
  Добавьте эффекты:
  [{ "effectType": "DamageOverTime", "value": "12%", "targetType": "blood_production", "duration": 1344, "sourceSkill": "Отказ Кровяных Клеток", "description": "Катастрофический отказ производства кровяных клеток." },
   { "effectType": "Debuff", "value": "-50%", "targetType": "oxygen_transport", "duration": 1344, "sourceSkill": "Тяжелая Анемия", "description": "Критическое снижение способности переноса кислорода." }]

**УРОВЕНЬ 4: СМЕРТЕЛЬНАЯ РАДИАЦИЯ (1000-1499 Рад)**
*Уровни радиации, которые должны убивать, но могут вместо этого вызвать экстраординарные адаптации.*

- **Нейроваскулярный Синдром (1000-1299 Рад):**
  Добавьте эффекты:
  [{ "effectType": "DamageOverTime", "value": "15%", "targetType": "neurological", "duration": 1512, "sourceSkill": "Нейронные Повреждения", "description": "Прогрессирующий распад нервной системы." },
   { "effectType": "Debuff", "value": "-60%", "targetType": "all_mental_stats", "duration": 1512, "sourceSkill": "Когнитивный Коллапс", "description": "Серьезное нарушение всех умственных функций." }]

- **Терминальное Облучение (1300-1499 Рад):**
  Добавьте эффекты:
  [{ "effectType": "DamageOverTime", "value": "20%", "targetType": "cellular_integrity", "duration": 1680, "sourceSkill": "Клеточная Катастрофа", "description": "Широкомасштабная клеточная смерть и отказ органов." },
   { "effectType": "Transformation", "value": "100%", "targetType": "threshold_mutation", "description": "Тело принуждено к радикальной трансформации или смерти." }]

**УРОВЕНЬ 5: ЗА ПРЕДЕЛАМИ ЧЕЛОВЕЧЕСКОЙ ВЫНОСЛИВОСТИ (1500+ Рад)**
*Уровни радиации, превосходящие смертность, создающие нечто более не полностью человеческое.*

- **Трансцендентная Радиация (1500+ Рад):**
  Должен вызвать "Эволюционный Кризис" - персонаж либо умирает навсегда, либо подвергается радикальной трансформации в уникальную сущность, адаптированную к радиации.

**Продвинутая Система Мутаций:**

**Триггеры Мутаций:**
- **Первый Порог (300 Рад):** 40% шанс полезной мутации, 60% шанс нейтральной/негативной
- **Второй Порог (600 Рад):** 50% шанс мощной мутации, повышенный риск нестабильности
- **Третий Порог (900 Рад):** 60% шанс экзотической мутации, высокий риск потери человечности
- **Критический Порог (1200 Рад):** 80% шанс трансцендентной мутации, почти неизбежные изменения личности
- **Эволюционный Кризис (1500+ Рад):** 100% шанс фундаментальной трансформации

**Категории Мутаций:**

**Полезные Адаптации (40% мутаций):**

- **Навык: "Радиационные Железы" (Пассивный)**
{
    "skillName": "Радиационные Железы",
    "skillDescription": "Ваше тело производит и накапливает радиацию, делая вас невосприимчивым к большинству радиоактивных сред, но превращая в ходячую опасность.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Adaptive",
    "combatEffect": {
        "effects": [{
            "effectType": "Immunity",
            "value": "100%",
            "targetType": "radiation_damage",
            "description": "Полная невосприимчивость к радиационному воздействию."
        },
        {
            "effectType": "EnvironmentalEffect",
            "value": "5%",
            "targetType": "radiation_aura",
            "description": "Постоянно излучает слабую радиацию, поражающую ближайших существ."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 3,
    "sideEffects": "+30 Радиационная Чувствительность, социальная изоляция из-за радиоактивного присутствия"
}

- **Навык: "Фотосинтетическая Кожа" (Пассивный)**
{
    "skillName": "Фотосинтетическая Кожа",
    "skillDescription": "Ваша кожа развивает хлорофиллоподобные соединения, позволяющие дополнить питание через поглощение солнечного света.",
    "rarity": "Uncommon",
    "type": "Mutation",
    "group": "Metabolic",
    "combatEffect": {
        "effects": [{
            "effectType": "Regeneration",
            "value": "2%",
            "targetType": "health",
            "description": "Медленно лечится при воздействии солнечного света или радиации."
        },
        {
            "effectType": "Buff",
            "value": "+20%",
            "targetType": "endurance",
            "description": "Сниженная потребность в пище в ярких средах."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 2,
    "sideEffects": "Зеленоватый цвет кожи, слабость в полной темноте"
}

- **Навык: "Резервные Органы" (Пассивный)**
{
    "skillName": "Резервные Органы",
    "skillDescription": "Ваше тело развило резервные версии критически важных органов, обеспечивая замечательную устойчивость к повреждениям.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Physiological",
    "combatEffect": {
        "effects": [{
            "effectType": "Resistance",
            "value": "+40%",
            "targetType": "critical_damage",
            "description": "Сниженный шанс получения смертельных ранений."
        },
        {
            "effectType": "Buff",
            "value": "+25%",
            "targetType": "constitution_recovery",
            "description": "Улучшенное восстановление от серьезных ранений."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Слегка увеличенный торс, повышенные калорические потребности"
}

**Нейтральные Адаптации (35% мутаций):**

- **Навык: "Мигательные Мембраны" (Пассивный)**
{
    "skillName": "Мигательные Мембраны",
    "skillDescription": "Прозрачные защитные веки, которые экранируют ваши глаза от экологических опасностей, сохраняя зрение.",
    "rarity": "Common",
    "type": "Mutation",
    "group": "Sensory",
    "combatEffect": {
        "effects": [{
            "effectType": "Resistance",
            "value": "+60%",
            "targetType": "eye_damage",
            "description": "Защита от яркого света, частиц и химического воздействия."
        },
        {
            "effectType": "Buff",
            "value": "+15%",
            "targetType": "environmental_perception",
            "description": "Улучшенная способность видеть в суровых условиях."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Чуждая внешность когда мембраны видны, тревожит других"
}

- **Навык: "Биолюминесцентные Пятна" (Пассивный/Активный переключатель)**
{
    "skillName": "Биолюминесцентные Пятна",
    "skillDescription": "Пятна кожи, которые могут излучать различные цвета света, полезные для общения или отвлечения внимания.",
    "rarity": "Uncommon",
    "type": "Mutation",
    "group": "Cosmetic",
    "combatEffect": {
        "effects": [{
            "effectType": "Utility",
            "value": "100%",
            "targetType": "light_source",
            "description": "Может обеспечить освещение без внешнего оборудования."
        },
        {
            "effectType": "Buff",
            "value": "+10%",
            "targetType": "social_intrigue",
            "description": "Улучшенная способность отвлекать или завораживать в социальных ситуациях."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 2,
    "sideEffects": "Невозможно скрыться в темноте когда активно, может привлечь нежелательное внимание"
}

**Вредоносные Мутации (25% мутаций):**

- **Навык: "Токсичные Выделения" (Пассивный)**
{
    "skillName": "Токсичные Выделения",
    "skillDescription": "Ваше тело постоянно производит токсичные химикаты, которые отравляют окружение и делают нормальное социальное взаимодействие невозможным.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Toxic",
    "combatEffect": {
        "effects": [{
            "effectType": "EnvironmentalEffect",
            "value": "8%",
            "targetType": "poison_damage",
            "description": "Все ближайшие существа страдают от медленного отравления."
        },
        {
            "effectType": "Debuff",
            "value": "-80%",
            "targetType": "social_interaction",
            "description": "Не может иметь нормальные отношения из-за токсичного присутствия."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Полная социальная изоляция, не может потреблять нормальную пищу или воду"
}

- **Навык: "Сенсорная Перегрузка" (Пассивный)**
{
    "skillName": "Сенсорная Перегрузка",
    "skillDescription": "Ваши чувства стали гиперчувствительными до точки постоянной боли и отвлечения внимания.",
    "rarity": "Uncommon",
    "type": "Mutation",
    "group": "Neurological",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+50%",
            "targetType": "perception_detection",
            "description": "Экстраординарная сенсорная осведомленность окружения."
        },
        {
            "effectType": "Debuff",
            "value": "-30%",
            "targetType": "concentration_pain_tolerance",
            "description": "Постоянная сенсорная перегрузка вызывает проблемы с фокусировкой и боль."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Требует специальную среду для функционирования, крайний дискомфорт в нормальных условиях"
}

**Экзотические Мутации (Редкие, только высокая радиация):**

- **Навык: "Фазовый Сдвиг" (Активный)**
{
    "skillName": "Фазовый Сдвиг",
    "skillDescription": "Ваша атомная структура стала нестабильной, позволяя кратковременно существовать между измерениями.",
    "rarity": "Legendary",
    "type": "Mutation",
    "group": "Quantum",
    "combatEffect": {
        "effects": [{
            "effectType": "Intangibility",
            "value": "90%",
            "targetType": "physical_immunity",
            "duration": 3,
            "description": "Стать временно нематериальным, невосприимчивым к физическим атакам."
        },
        {
            "effectType": "Teleportation",
            "value": "100%",
            "targetType": "short_range",
            "description": "Может проходить через твердую материю, чтобы появиться поблизости."
        }]
    },
    "scalingCharacteristic": "constitution",
    "energyCost": 40,
    "sideEffects": "Риск постоянного выхода из фазы реальности, требует высокой Генетической Стабильности"
}

- **Навык: "Резонанс Коллективного Разума" (Пассивный)**
{
    "skillName": "Резонанс Коллективного Разума",
    "skillDescription": "Ваше сознание стало связано с коллективным интеллектом других сильно облученных индивидуумов.",
    "rarity": "Mythic",
    "type": "Mutation",
    "group": "Psychic",
    "combatEffect": {
        "effects": [{
            "effectType": "Information",
            "value": "100%",
            "targetType": "collective_knowledge",
            "description": "Доступ к общим воспоминаниям и навыкам других членов коллективного разума."
        },
        {
            "effectType": "Buff",
            "value": "+40%",
            "targetType": "problem_solving",
            "description": "Улучшенный интеллект через распределенную обработку."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Постепенная потеря индивидуальной идентичности, принуждение искать других членов коллективного разума"
}

**Специализированные Типы Радиации:**

**Гамма-радиация (Стандартная):** Вызывает клеточные повреждения и стандартные мутации
**Альфа-радиация (Тяжелая):** Интенсивное локальное повреждение, высокий шанс мутации, требует поглощения/вдыхания
**Бета-радиация (Проникающая):** Умеренное повреждение со временем, поражает электронику
**Нейтронная радиация (Экзотическая):** Делает материалы радиоактивными, вызывает странные мутации
**Космическая радиация (Трансцендентная):** Из космоса или древних артефактов, вызывает экзотические мутации

**Продвинутые Экологические Факторы:**

**Радиационные Зоны:**
- **Легкое Загрязнение (1-5 Рад/час):** Безопасно с защитой, долгосрочное воздействие вызывает постепенное накопление
- **Умеренное Загрязнение (6-20 Рад/час):** Требует защитное оборудование, быстро вызывает лучевую болезнь
- **Тяжелое Загрязнение (21-100 Рад/час):** Крайне опасно, защита быстро деградирует
- **Смертельные Зоны (101-500 Рад/час):** Смерть в течение часов без специализированного оборудования
- **Зоны Адского Пейзажа (500+ Рад/час):** Только сильно мутировавшие существа могут выжить

**Защитное Оборудование:**
- **Защитный Костюм (Базовый):** -50% радиационного воздействия, деградирует со временем
- **Силовая Броня (Продвинутая):** -80% радиационного воздействия, требует источник энергии
- **Мутационная Адаптация:** Некоторые мутации обеспечивают естественную защиту
- **Химическая Профилактика:** Препараты до воздействия снижают немедленное повреждение

**Медицинские Лечения:**

- **Антирадин (Стандартный):** Удаляет 50-200 Рад, временно вызывает слабость
- **РадЩит (Превентивный):** Снижает поглощение радиации на 40% в течение 24 часов
- **Терапия Клеточной Регенерации:** Дорогое лечение, которое восстанавливает радиационные повреждения и удаляет 300-500 Рад
- **Генная Терапия:** Экспериментальное лечение, которое может закрепить полезные мутации и удалить вредоносные
- **Хелатная Терапия:** Удаляет специфические радиоактивные изотопы, но требует знания точного типа загрязнения

**Социальное и Психологическое Воздействие:**

**Радиационная Стигма:** Высокое радиационное воздействие создает социальные штрафы из-за страха и суеверий
**Дискриминация Мутантов:** Видимые мутации вызывают негативные реакции от немутировавших людей
**Вина Выжившего:** Персонажи могут развить психологическую травму от выживания при смертельных дозах радиации
**Кризис Идентичности Адаптации:** Персонажи борются с потерей человечности, поскольку становятся более адаптированными

**Условия Победы и Выживания:**
- **Мастерство Адаптации:** Успешно управлять радиационным воздействием, сохраняя функциональность
- **Полезная Эволюция:** Развить преимущественные мутации, избегая вредоносных
- **Трансцендентность:** Эволюционировать за пределы человеческих ограничений, сохраняя основную идентичность
- **Экологическая Гармония:** Научиться процветать в радиоактивных средах, где другие не могут выжить
- **Синергия Мутаций:** Развить дополняющие мутации, которые работают вместе эффективно
- **Радиационный Иммунитет:** Достичь полной устойчивости к радиационным эффектам через адаптацию или технологию

Эта система создает сложный вызов выживания, где радиация является как угрозой, так и возможностью, заставляя игроков балансировать немедленное выживание против долгосрочной эволюции во враждебном мире.`;