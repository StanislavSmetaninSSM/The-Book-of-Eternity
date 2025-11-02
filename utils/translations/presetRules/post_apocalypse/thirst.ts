export const thirstSystemDescEn = `### ADVANCED HYDRATION SURVIVAL SYSTEM (POST-APOCALYPSE) ###
**GM, you MUST implement this system using Custom States mechanics for multiple survival tracks.**
Water is the most precious resource in the wasteland. This system tracks not just thirst, but water quality, contamination, and the complex survival mechanics that determine life and death in the harsh post-apocalyptic world.

**Core Hydration States:**

1. **Hydration Level (Primary State):**
Create "Hydration Level" with \`currentValue: 1000\`, \`minValue: 0\`, \`maxValue: 1000\`.
Represents overall body water content and cellular hydration.
Decreases by **-8 per turn** normally, **-15 per turn** in hot climates (Desert, Irradiated Wastelands), **-25 per turn** during strenuous activity, **-35 per turn** in extreme heat with heavy gear.
Increases when consuming clean water (+150-300), dirty water (+50-150), or water-rich foods (+20-80).

2. **Water Contamination (Toxicity State):**
Create "Water Contamination" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 2000\`.
Tracks accumulated toxins, radiation, and pathogens from contaminated water sources.
Increases when drinking dirty water (+20-60), irradiated water (+40-120), or chemical runoff (+80-200).
Decreases slowly through natural metabolism (-5 per day), medical treatment (-50-150), or special detox items (-100-300).

3. **Dehydration Severity (Progressive State):**
Create "Dehydration Severity" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1200\`.
Measures physiological stress from water deprivation.
Increases when Hydration Level drops below thresholds. Rate increases exponentially with lower hydration.
Only decreases when hydration is restored and maintained above safe levels.

4. **Water Dependency (Addiction State):**
Create "Water Dependency" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 800\`.
Tracks psychological reliance on having abundant water supplies.
Increases when hoarding water (+5-15), obsessive water conservation (+10), or trauma from severe dehydration (+20-50).
High levels cause anxiety and irrational behavior when water supplies are low.

**Hydration Quality Categories:**

**PRISTINE WATER (Restoration Multiplier: x2.0)**
- **Pure Spring Water:** +300 Hydration, no contamination, slight healing bonus
- **Pre-War Bottled Water:** +250 Hydration, no contamination, morale boost
- **Distilled Medical Water:** +200 Hydration, -20 Contamination, minor disease resistance

**CLEAN WATER (Restoration Multiplier: x1.5)**
- **Boiled Water:** +200 Hydration, +5 Contamination (residual impurities)
- **Filtered Water:** +180 Hydration, +3 Contamination (filter efficiency)
- **Rainwater (Clean Areas):** +150 Hydration, +10 Contamination (environmental)

**QUESTIONABLE WATER (Restoration Multiplier: x1.0)**
- **Well Water:** +120 Hydration, +25 Contamination, risk of parasites
- **River Water:** +100 Hydration, +40 Contamination, moderate disease risk
- **Melted Snow:** +80 Hydration, +15 Contamination, hypothermia risk

**CONTAMINATED WATER (Restoration Multiplier: x0.7)**
- **Stagnant Pond:** +70 Hydration, +80 Contamination, high disease risk
- **Urban Runoff:** +60 Hydration, +120 Contamination, chemical poisoning
- **Irradiated Water:** +50 Hydration, +200 Contamination, radiation sickness

**TOXIC WATER (Restoration Multiplier: x0.3)**
- **Chemical Waste:** +30 Hydration, +400 Contamination, organ damage
- **Highly Irradiated:** +20 Hydration, +600 Contamination, mutation risk
- **Sewage Water:** +15 Hydration, +300 Contamination, severe illness

**Progressive Dehydration Effects:**

**STAGE 1: MILD THIRST (Hydration 750-999)**
- **Skill: "Dry Mouth" (Passive)**
{
    "skillName": "Dry Mouth",
    "skillDescription": "Initial awareness of water need. Slightly reduced social interaction and taste perception.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-5%",
            "targetType": "charisma",
            "description": "Slight social discomfort and reduced taste sensitivity."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1
}

**STAGE 2: NOTICEABLE THIRST (Hydration 500-749)**
- **Skill: "Increased Focus on Water" (Passive)**
{
    "skillName": "Increased Focus on Water",
    "skillDescription": "Mind constantly aware of water sources and consumption. Heightened sensitivity to water-related opportunities.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+15%",
            "targetType": "perception_water_sources",
            "description": "Enhanced ability to detect and identify water sources."
        },
        {
            "effectType": "Debuff",
            "value": "-10%",
            "targetType": "concentration_non_water",
            "description": "Reduced focus on tasks unrelated to hydration."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1
}

**STAGE 3: MODERATE DEHYDRATION (Hydration 250-499)**
- **Skill: "Physiological Stress" (Passive)**
{
    "skillName": "Physiological Stress",
    "skillDescription": "Body begins showing signs of water deprivation. Reduced physical performance and increased fatigue.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-15%",
            "targetType": "stamina_regeneration",
            "description": "Slower recovery of physical energy."
        },
        {
            "effectType": "Debuff",
            "value": "-10%",
            "targetType": "dexterity",
            "description": "Reduced coordination and fine motor skills."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+10 Dehydration Severity per turn"
}

- **Skill: "Water Desperation" (Active)**
{
    "skillName": "Water Desperation",
    "skillDescription": "Willingness to take dangerous risks for water access. Enhanced determination but impaired judgment.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+25%",
            "targetType": "strength_when_seeking_water",
            "description": "Desperation-fueled strength for water-related tasks."
        },
        {
            "effectType": "Debuff",
            "value": "-20%",
            "targetType": "wisdom_risk_assessment",
            "description": "Poor decision-making regarding dangerous water sources."
        }]
    },
    "scalingCharacteristic": "constitution",
    "energyCost": 20,
    "sideEffects": "+5 Water Dependency"
}

**STAGE 4: SEVERE DEHYDRATION (Hydration 100-249)**
- **Skill: "Organ Stress" (Passive)**
{
    "skillName": "Organ Stress",
    "skillDescription": "Kidneys and other organs begin to struggle. Significant reduction in all physical capabilities.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-25%",
            "targetType": "constitution",
            "description": "Major reduction in physical resilience."
        },
        {
            "effectType": "Debuff",
            "value": "-20%",
            "targetType": "intelligence",
            "description": "Cognitive impairment from dehydration."
        },
        {
            "effectType": "Debuff",
            "value": "-30%",
            "targetType": "movement_speed",
            "description": "Significant mobility impairment."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+20 Dehydration Severity per turn, risk of hallucinations"
}

- **Skill: "Survival Instinct Override" (Active)**
{
    "skillName": "Survival Instinct Override",
    "skillDescription": "Biological imperative overrides rational thought. Will attempt to drink ANY liquid, regardless of safety.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Compulsion",
            "value": "85%",
            "targetType": "drink_any_liquid",
            "description": "Overwhelming urge to consume any available liquid."
        },
        {
            "effectType": "Buff",
            "value": "+40%",
            "targetType": "liquid_detection",
            "description": "Supernatural ability to locate any nearby liquids."
        }]
    },
    "scalingCharacteristic": "constitution",
    "energyCost": 30,
    "sideEffects": "Ignore contamination risks, +15 Water Dependency"
}

**STAGE 5: CRITICAL DEHYDRATION (Hydration 25-99)**
- **Skill: "Systemic Failure" (Passive)**
{
    "skillName": "Systemic Failure",
    "skillDescription": "Multiple organ systems begin shutting down. Death becomes imminent without immediate intervention.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "8%",
            "targetType": "organ_failure",
            "duration": 999,
            "description": "Continuous health loss from dehydration damage."
        },
        {
            "effectType": "Debuff",
            "value": "-50%",
            "targetType": "all_physical_stats",
            "description": "Catastrophic reduction in all physical capabilities."
        },
        {
            "effectType": "Debuff",
            "value": "-40%",
            "targetType": "all_mental_stats",
            "description": "Severe cognitive impairment."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+30 Dehydration Severity per turn, frequent unconsciousness"
}

**STAGE 6: TERMINAL DEHYDRATION (Hydration 0-24)**
- **Skill: "Death's Door" (Passive)**
{
    "skillName": "Death's Door",
    "skillDescription": "Character is dying from complete dehydration. Only emergency medical intervention can prevent death.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "20%",
            "targetType": "cellular_death",
            "duration": 999,
            "description": "Rapid tissue death from complete dehydration."
        },
        {
            "effectType": "Control",
            "value": "90%",
            "targetType": "incapacitation",
            "description": "Character cannot perform most actions."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Death within 24-72 hours without immediate medical care"
}

**Water Contamination Effects:**

**MINOR CONTAMINATION (0-200)**
- **Skill: "Slight Nausea" (Passive)**
{
    "skillName": "Slight Nausea",
    "skillDescription": "Mild stomach discomfort from impure water. Manageable but noticeable.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-5%",
            "targetType": "constitution",
            "description": "Minor digestive discomfort."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1
}

**MODERATE CONTAMINATION (201-500)**
- **Skill: "Gastric Distress" (Passive)**
{
    "skillName": "Gastric Distress",
    "skillDescription": "Significant digestive problems affecting daily function and combat effectiveness.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-15%",
            "targetType": "constitution",
            "description": "Noticeable digestive problems."
        },
        {
            "effectType": "Debuff",
            "value": "-10%",
            "targetType": "concentration",
            "description": "Distraction from stomach problems."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Periodic vomiting, increased thirst"
}

**SEVERE CONTAMINATION (501-1000)**
- **Skill: "Toxic Poisoning" (Passive)**
{
    "skillName": "Toxic Poisoning",
    "skillDescription": "Dangerous levels of toxins causing system-wide health problems and potential organ damage.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "5%",
            "targetType": "poison",
            "duration": 999,
            "description": "Continuous damage from accumulated toxins."
        },
        {
            "effectType": "Debuff",
            "value": "-25%",
            "targetType": "constitution",
            "description": "Significant health deterioration."
        },
        {
            "effectType": "Debuff",
            "value": "-20%",
            "targetType": "stamina_maximum",
            "description": "Reduced energy capacity."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Hallucinations, fever, potential organ damage"
}

**CRITICAL CONTAMINATION (1001-1500)**
- **Skill: "Radiation Sickness" (Passive)**
{
    "skillName": "Radiation Sickness",
    "skillDescription": "Severe radiation poisoning from contaminated water sources. Life-threatening condition requiring medical treatment.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "12%",
            "targetType": "radiation",
            "duration": 999,
            "description": "Severe radiation damage to cellular structure."
        },
        {
            "effectType": "Debuff",
            "value": "-40%",
            "targetType": "all_stats",
            "description": "Comprehensive health deterioration."
        },
        {
            "effectType": "Mutation",
            "value": "30%",
            "targetType": "random_physical",
            "description": "Risk of developing physical mutations."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Hair loss, bleeding, immune system failure"
}

**TERMINAL CONTAMINATION (1501-2000)**
- **Skill: "Toxic Shock" (Passive)**
{
    "skillName": "Toxic Shock",
    "skillDescription": "Lethal contamination levels causing multiple organ failure and imminent death.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "25%",
            "targetType": "multi_organ_failure",
            "duration": 999,
            "description": "Rapid death from complete system toxicity."
        },
        {
            "effectType": "Control",
            "value": "80%",
            "targetType": "incapacitation",
            "description": "Severe incapacitation from poisoning."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Death within days without advanced medical intervention"
}

**Advanced Water Survival Skills:**

**TIER 1: BASIC SURVIVAL (Water Dependency 100+)**
- **Skill: "Water Conservation" (Passive)**
{
    "skillName": "Water Conservation",
    "skillDescription": "Learned techniques to maximize water efficiency and reduce waste.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+20%",
            "targetType": "water_efficiency",
            "description": "Water consumption reduced by 20% through conservation techniques."
        },
        {
            "effectType": "Buff",
            "value": "+15%",
            "targetType": "water_source_detection",
            "description": "Better at finding water sources."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 3
}

- **Skill: "Purification Instinct" (Active)**
{
    "skillName": "Purification Instinct",
    "skillDescription": "Basic knowledge of making questionable water sources safer through simple methods.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "WaterTreatment",
            "value": "-50%",
            "targetType": "contamination_reduction",
            "description": "Reduce contamination of water sources through basic purification."
        }]
    },
    "scalingCharacteristic": "intelligence",
    "energyCost": 25,
    "sideEffects": "Requires fire source and time"
}

**TIER 2: EXPERIENCED SURVIVOR (Water Dependency 300+)**
- **Skill: "Toxic Tolerance" (Passive)**
{
    "skillName": "Toxic Tolerance",
    "skillDescription": "Built up resistance to common water contaminants through repeated exposure.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Resistance",
            "value": "+40%",
            "targetType": "water_contamination",
            "description": "Reduced effects from contaminated water consumption."
        },
        {
            "effectType": "Buff",
            "value": "+25%",
            "targetType": "contamination_recovery",
            "description": "Faster natural detoxification."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 3,
    "sideEffects": "+5 Mutation Index per mastery level"
}

- **Skill: "Desperate Efficiency" (Active)**
{
    "skillName": "Desperate Efficiency",
    "skillDescription": "Extract maximum hydration value from minimal water sources through extreme conservation methods.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Multiplier",
            "value": "+150%",
            "targetType": "water_absorption",
            "description": "Dramatically increased hydration gain from any water source."
        }]
    },
    "scalingCharacteristic": "constitution",
    "energyCost": 40,
    "sideEffects": "+10 Water Dependency, extreme focus on water conservation"
}

**TIER 3: WASTELAND MASTER (Water Dependency 600+)**
- **Skill: "Biological Adaptation" (Passive)**
{
    "skillName": "Biological Adaptation",
    "skillDescription": "Body has adapted to function on minimal water and process contaminated sources more effectively.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Survival",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+60%",
            "targetType": "water_efficiency",
            "description": "Require significantly less water for normal function."
        },
        {
            "effectType": "Resistance",
            "value": "+70%",
            "targetType": "dehydration_effects",
            "description": "Reduced penalties from low hydration."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+30 Mutation Index, altered kidney function, social penalties"
}

- **Skill: "Water Sense" (Active)**
{
    "skillName": "Water Sense",
    "skillDescription": "Supernatural ability to detect water sources, quality, and contamination levels through enhanced senses.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Detection",
            "value": "95%",
            "targetType": "water_sources_quality",
            "description": "Accurately identify all nearby water sources and their safety levels."
        },
        {
            "effectType": "Information",
            "value": "100%",
            "targetType": "contamination_analysis",
            "description": "Determine exact contamination types and levels."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 35,
    "sideEffects": "Overwhelming sensory input in water-rich areas"
}

**Environmental Factors:**

**Climate Multipliers:**
- **Temperate:** Standard water loss rates
- **Desert/Arid:** +100% water loss, +50% contamination from dust
- **Tropical/Humid:** -20% water loss, +30% contamination from bacteria
- **Arctic/Cold:** -30% water loss, hypothermia risks from cold water
- **Irradiated Zones:** +75% water loss, +200% contamination from radiation
- **Urban Ruins:** +25% water loss from stress, +100% contamination from pollution

**Activity Multipliers:**
- **Resting:** Standard water loss
- **Light Activity:** +25% water loss
- **Moderate Activity:** +75% water loss
- **Heavy Activity:** +150% water loss
- **Combat:** +200% water loss
- **Carrying Heavy Loads:** +100% water loss

**Gear Interactions:**
- **Insulated Clothing:** -25% heat-related water loss
- **Breathing Mask:** -15% water loss from respiration
- **Cooling Vest:** -40% heat-related water loss but requires water
- **Heavy Armor:** +50% water loss from heat retention
- **Water Recycling System:** +30% efficiency from all water sources

**Medical Interventions:**

**FIELD TREATMENTS:**
- **IV Hydration:** +400 Hydration instantly, requires medical supplies
- **Electrolyte Solutions:** +250 Hydration, reduces dehydration effects
- **Water Purification Tablets:** -75% contamination from treated water
- **Activated Charcoal:** -150 Water Contamination over time

**ADVANCED TREATMENTS:**
- **Dialysis:** -500 Water Contamination, requires medical facility
- **Organ Support:** Halt damage from severe dehydration/contamination
- **Gene Therapy:** Permanent +25% water efficiency, expensive
- **Cybernetic Kidneys:** +90% contamination resistance, major surgery

**Victory and Failure Conditions:**
- **Adaptation:** Successfully adapt to wasteland conditions without losing humanity
- **Mastery:** Achieve perfect water management while helping others survive
- **Dependency:** Become obsessed with water hoarding, losing sight of other survival needs
- **Contamination:** Accumulate so much toxicity that health permanently deteriorates
- **Dehydration Death:** Die from complete water deprivation
- **Mutation:** Physical adaptations become so extreme that social integration becomes impossible

This comprehensive system creates meaningful choices between immediate survival and long-term health, while adding layers of strategy around resource management and risk assessment.`;

export const thirstSystemDescRu = `### ПРОДВИНУТАЯ СИСТЕМА ВЫЖИВАНИЯ И ГИДРАТАЦИИ (ПОСТАПОКАЛИПСИС) ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для множественных треков выживания.**
Вода - самый ценный ресурс в пустошах. Эта система отслеживает не только жажду, но и качество воды, заражение и сложные механики выживания, определяющие жизнь и смерть в суровом постапокалиптическом мире.

**Основные Состояния Гидратации:**

1. **Уровень Гидратации (Основное состояние):**
Создайте "Уровень Гидратации" с \`currentValue: 1000\`, \`minValue: 0\`, \`maxValue: 1000\`.
Представляет общее содержание воды в организме и клеточную гидратацию.
Уменьшается на **-8 за ход** в норме, **-15 за ход** в жарком климате (Пустыня, Облученные Пустоши), **-25 за ход** при напряженной деятельности, **-35 за ход** в экстремальной жаре с тяжелым снаряжением.
Увеличивается при потреблении чистой воды (+150-300), грязной воды (+50-150) или богатой водой пищи (+20-80).

2. **Загрязнение Воды (Состояние токсичности):**
Создайте "Загрязнение Воды" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 2000\`.
Отслеживает накопленные токсины, радиацию и патогены из загрязненных источников воды.
Увеличивается при употреблении грязной воды (+20-60), облученной воды (+40-120) или химических стоков (+80-200).
Медленно уменьшается через естественный метаболизм (-5 в день), медицинское лечение (-50-150) или специальные детокс предметы (-100-300).

3. **Тяжесть Обезвоживания (Прогрессивное состояние):**
Создайте "Тяжесть Обезвоживания" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1200\`.
Измеряет физиологический стресс от водного голодания.
Увеличивается при падении Уровня Гидратации ниже порогов. Скорость экспоненциально возрастает при низкой гидратации.
Уменьшается только при восстановлении и поддержании гидратации выше безопасных уровней.

4. **Водная Зависимость (Состояние зависимости):**
Создайте "Водную Зависимость" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 800\`.
Отслеживает психологическую зависимость от изобильных запасов воды.
Увеличивается при накоплении воды (+5-15), одержимой экономии воды (+10) или травме от тяжелого обезвоживания (+20-50).
Высокие уровни вызывают тревогу и иррациональное поведение при низких запасах воды.

**Категории Качества Гидратации:**

**ЧИСТЕЙШАЯ ВОДА (Множитель восстановления: x2.0)**
- **Чистая Родниковая Вода:** +300 Гидратации, без загрязнения, небольшой бонус к исцелению
- **Довоенная Бутилированная Вода:** +250 Гидратации, без загрязнения, повышение морали
- **Дистиллированная Медицинская Вода:** +200 Гидратации, -20 Загрязнения, незначительная устойчивость к болезням

**ЧИСТАЯ ВОДА (Множитель восстановления: x1.5)**
- **Кипяченая Вода:** +200 Гидратации, +5 Загрязнения (остаточные примеси)
- **Фильтрованная Вода:** +180 Гидратации, +3 Загрязнения (эффективность фильтра)
- **Дождевая Вода (Чистые Области):** +150 Гидратации, +10 Загрязнения (окружающая среда)

**СОМНИТЕЛЬНАЯ ВОДА (Множитель восстановления: x1.0)**
- **Колодезная Вода:** +120 Гидратации, +25 Загрязнения, риск паразитов
- **Речная Вода:** +100 Гидратации, +40 Загрязнения, умеренный риск болезней
- **Талый Снег:** +80 Гидратации, +15 Загрязнения, риск переохлаждения

**ЗАГРЯЗНЕННАЯ ВОДА (Множитель восстановления: x0.7)**
- **Стоячий Пруд:** +70 Гидратации, +80 Загрязнения, высокий риск болезней
- **Городские Стоки:** +60 Гидратации, +120 Загрязнения, химическое отравление
- **Облученная Вода:** +50 Гидратации, +200 Загрязнения, лучевая болезнь

**ТОКСИЧНАЯ ВОДА (Множитель восстановления: x0.3)**
- **Химические Отходы:** +30 Гидратации, +400 Загрязнения, повреждение органов
- **Сильно Облученная:** +20 Гидратации, +600 Загрязнения, риск мутации
- **Сточные Воды:** +15 Гидратации, +300 Загрязнения, тяжелая болезнь

**Прогрессивные Эффекты Обезвоживания:**

**СТАДИЯ 1: ЛЕГКАЯ ЖАЖДА (Гидратация 750-999)**
- **Навык: "Сухость во Рту" (Пассивный)**
{
    "skillName": "Сухость во Рту",
    "skillDescription": "Первоначальное осознание потребности в воде. Слегка снижены социальные взаимодействия и восприятие вкуса.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-5%",
            "targetType": "charisma",
            "description": "Легкий социальный дискомфорт и снижение вкусовой чувствительности."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1
}

**СТАДИЯ 2: ЗАМЕТНАЯ ЖАЖДА (Гидратация 500-749)**
- **Навык: "Повышенное Внимание к Воде" (Пассивный)**
{
    "skillName": "Повышенное Внимание к Воде",
    "skillDescription": "Разум постоянно осознает источники воды и потребление. Повышенная чувствительность к возможностям, связанным с водой.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+15%",
            "targetType": "perception_water_sources",
            "description": "Улучшенная способность обнаруживать и идентифицировать источники воды."
        },
        {
            "effectType": "Debuff",
            "value": "-10%",
            "targetType": "concentration_non_water",
            "description": "Снижение фокуса на задачах, не связанных с гидратацией."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1
}

**СТАДИЯ 3: УМЕРЕННОЕ ОБЕЗВОЖИВАНИЕ (Гидратация 250-499)**
- **Навык: "Физиологический Стресс" (Пассивный)**
{
    "skillName": "Физиологический Стресс",
    "skillDescription": "Тело начинает показывать признаки водного голодания. Снижение физической производительности и увеличение усталости.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-15%",
            "targetType": "stamina_regeneration",
            "description": "Замедленное восстановление физической энергии."
        },
        {
            "effectType": "Debuff",
            "value": "-10%",
            "targetType": "dexterity",
            "description": "Снижение координации и мелкой моторики."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+10 Тяжесть Обезвоживания за ход"
}

- **Навык: "Водное Отчаяние" (Активный)**
{
    "skillName": "Водное Отчаяние",
    "skillDescription": "Готовность идти на опасные риски ради доступа к воде. Повышенная решимость, но нарушенное суждение.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+25%",
            "targetType": "strength_when_seeking_water",
            "description": "Подпитываемая отчаянием сила для задач, связанных с водой."
        },
        {
            "effectType": "Debuff",
            "value": "-20%",
            "targetType": "wisdom_risk_assessment",
            "description": "Плохое принятие решений относительно опасных источников воды."
        }]
    },
    "scalingCharacteristic": "constitution",
    "energyCost": 20,
    "sideEffects": "+5 Водная Зависимость"
}

**СТАДИЯ 4: ТЯЖЕЛОЕ ОБЕЗВОЖИВАНИЕ (Гидратация 100-249)**
- **Навык: "Органный Стресс" (Пассивный)**
{
    "skillName": "Органный Стресс",
    "skillDescription": "Почки и другие органы начинают бороться. Значительное снижение всех физических способностей.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-25%",
            "targetType": "constitution",
            "description": "Значительное снижение физической стойкости."
        },
        {
            "effectType": "Debuff",
            "value": "-20%",
            "targetType": "intelligence",
            "description": "Когнитивные нарушения от обезвоживания."
        },
        {
            "effectType": "Debuff",
            "value": "-30%",
            "targetType": "movement_speed",
            "description": "Значительное нарушение мобильности."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+20 Тяжесть Обезвоживания за ход, риск галлюцинаций"
}

- **Навык: "Переопределение Инстинкта Выживания" (Активный)**
{
    "skillName": "Переопределение Инстинкта Выживания",
    "skillDescription": "Биологический императив переопределяет рациональное мышление. Попытается пить ЛЮБУЮ жидкость, независимо от безопасности.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Compulsion",
            "value": "85%",
            "targetType": "drink_any_liquid",
            "description": "Подавляющее желание потреблять любую доступную жидкость."
        },
        {
            "effectType": "Buff",
            "value": "+40%",
            "targetType": "liquid_detection",
            "description": "Сверхъестественная способность обнаруживать любые близлежащие жидкости."
        }]
    },
    "scalingCharacteristic": "constitution",
    "energyCost": 30,
    "sideEffects": "Игнорирование рисков загрязнения, +15 Водная Зависимость"
}

**СТАДИЯ 5: КРИТИЧЕСКОЕ ОБЕЗВОЖИВАНИЕ (Гидратация 25-99)**
- **Навык: "Системная Недостаточность" (Пассивный)**
{
    "skillName": "Системная Недостаточность",
    "skillDescription": "Множественные органные системы начинают отключаться. Смерть становится неминуемой без немедленного вмешательства.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "8%",
            "targetType": "organ_failure",
            "duration": 999,
            "description": "Непрерывная потеря здоровья от повреждения обезвоживанием."
        },
        {
            "effectType": "Debuff",
            "value": "-50%",
            "targetType": "all_physical_stats",
            "description": "Катастрофическое снижение всех физических способностей."
        },
        {
            "effectType": "Debuff",
            "value": "-40%",
            "targetType": "all_mental_stats",
            "description": "Тяжелые когнитивные нарушения."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+30 Тяжесть Обезвоживания за ход, частая потеря сознания"
}

**СТАДИЯ 6: ТЕРМИНАЛЬНОЕ ОБЕЗВОЖИВАНИЕ (Гидратация 0-24)**
- **Навык: "На Пороге Смерти" (Пассивный)**
{
    "skillName": "На Пороге Смерти",
    "skillDescription": "Персонаж умирает от полного обезвоживания. Только экстренное медицинское вмешательство может предотвратить смерть.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "20%",
            "targetType": "cellular_death",
            "duration": 999,
            "description": "Быстрая смерть тканей от полного обезвоживания."
        },
        {
            "effectType": "Control",
            "value": "90%",
            "targetType": "incapacitation",
            "description": "Персонаж не может выполнять большинство действий."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Смерть в течение 24-72 часов без немедленной медицинской помощи"
}

**Эффекты Загрязнения Воды:**

**НЕЗНАЧИТЕЛЬНОЕ ЗАГРЯЗНЕНИЕ (0-200)**
- **Навык: "Легкая Тошнота" (Пассивный)**
{
    "skillName": "Легкая Тошнота",
    "skillDescription": "Мягкий дискомфорт в желудке от нечистой воды. Управляемый, но заметный.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-5%",
            "targetType": "constitution",
            "description": "Незначительный пищеварительный дискомфорт."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1
}

**УМЕРЕННОЕ ЗАГРЯЗНЕНИЕ (201-500)**
- **Навык: "Желудочное Расстройство" (Пассивный)**
{
    "skillName": "Желудочное Расстройство",
    "skillDescription": "Значительные проблемы с пищеварением, влияющие на ежедневную функцию и боевую эффективность.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Debuff",
            "value": "-15%",
            "targetType": "constitution",
            "description": "Заметные проблемы с пищеварением."
        },
        {
            "effectType": "Debuff",
            "value": "-10%",
            "targetType": "concentration",
            "description": "Отвлечение от проблем с желудком."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Периодическая рвота, повышенная жажда"
}

**ТЯЖЕЛОЕ ЗАГРЯЗНЕНИЕ (501-1000)**
- **Навык: "Токсическое Отравление" (Пассивный)**
{
    "skillName": "Токсическое Отравление",
    "skillDescription": "Опасные уровни токсинов, вызывающие системные проблемы со здоровьем и потенциальное повреждение органов.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "5%",
            "targetType": "poison",
            "duration": 999,
            "description": "Непрерывный урон от накопленных токсинов."
        },
        {
            "effectType": "Debuff",
            "value": "-25%",
            "targetType": "constitution",
            "description": "Значительное ухудшение здоровья."
        },
        {
            "effectType": "Debuff",
            "value": "-20%",
            "targetType": "stamina_maximum",
            "description": "Снижение энергетической емкости."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Галлюцинации, лихорадка, потенциальное повреждение органов"
}

**КРИТИЧЕСКОЕ ЗАГРЯЗНЕНИЕ (1001-1500)**
- **Навык: "Лучевая Болезнь" (Пассивный)**
{
    "skillName": "Лучевая Болезнь",
    "skillDescription": "Тяжелое радиационное отравление от загрязненных источников воды. Угрожающее жизни состояние, требующее медицинского лечения.",
    "rarity": "Epic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "12%",
            "targetType": "radiation",
            "duration": 999,
            "description": "Тяжелое радиационное повреждение клеточной структуры."
        },
        {
            "effectType": "Debuff",
            "value": "-40%",
            "targetType": "all_stats",
            "description": "Комплексное ухудшение здоровья."
        },
        {
            "effectType": "Mutation",
            "value": "30%",
            "targetType": "random_physical",
            "description": "Риск развития физических мутаций."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Выпадение волос, кровотечение, сбой иммунной системы"
}

**ТЕРМИНАЛЬНОЕ ЗАГРЯЗНЕНИЕ (1501-2000)**
- **Навык: "Токсический Шок" (Пассивный)**
{
    "skillName": "Токсический Шок",
    "skillDescription": "Летальные уровни загрязнения, вызывающие множественную органную недостаточность и неминуемую смерть.",
    "rarity": "Mythic",
    "combatEffect": {
        "effects": [{
            "effectType": "DamageOverTime",
            "value": "25%",
            "targetType": "multi_organ_failure",
            "duration": 999,
            "description": "Быстрая смерть от полной токсичности системы."
        },
        {
            "effectType": "Control",
            "value": "80%",
            "targetType": "incapacitation",
            "description": "Тяжелая недееспособность от отравления."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "Смерть в течение дней без продвинутого медицинского вмешательства"
}

**Продвинутые Навыки Водного Выживания:**

**УРОВЕНЬ 1: БАЗОВОЕ ВЫЖИВАНИЕ (Водная Зависимость 100+)**
- **Навык: "Водная Экономия" (Пассивный)**
{
    "skillName": "Водная Экономия",
    "skillDescription": "Изученные техники максимизации водной эффективности и сокращения отходов.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+20%",
            "targetType": "water_efficiency",
            "description": "Потребление воды снижено на 20% через техники экономии."
        },
        {
            "effectType": "Buff",
            "value": "+15%",
            "targetType": "water_source_detection",
            "description": "Лучше в поиске источников воды."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 3
}

- **Навык: "Инстинкт Очистки" (Активный)**
{
    "skillName": "Инстинкт Очистки",
    "skillDescription": "Базовые знания о том, как сделать сомнительные источники воды безопаснее через простые методы.",
    "rarity": "Common",
    "combatEffect": {
        "effects": [{
            "effectType": "WaterTreatment",
            "value": "-50%",
            "targetType": "contamination_reduction",
            "description": "Снизить загрязнение источников воды через базовую очистку."
        }]
    },
    "scalingCharacteristic": "intelligence",
    "energyCost": 25,
    "sideEffects": "Требует источник огня и время"
}

**УРОВЕНЬ 2: ОПЫТНЫЙ ВЫЖИВАЛЬЩИК (Водная Зависимость 300+)**
- **Навык: "Токсическая Толерантность" (Пассивный)**
{
    "skillName": "Токсическая Толерантность",
    "skillDescription": "Выработанная устойчивость к обычным загрязнителям воды через повторное воздействие.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Resistance",
            "value": "+40%",
            "targetType": "water_contamination",
            "description": "Снижение эффектов от потребления загрязненной воды."
        },
        {
            "effectType": "Buff",
            "value": "+25%",
            "targetType": "contamination_recovery",
            "description": "Быстрее естественная детоксикация."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 3,
    "sideEffects": "+5 Индекс Мутации за уровень мастерства"
}

- **Навык: "Отчаянная Эффективность" (Активный)**
{
    "skillName": "Отчаянная Эффективность",
    "skillDescription": "Извлечь максимальную гидратационную ценность из минимальных источников воды через экстремальные методы экономии.",
    "rarity": "Uncommon",
    "combatEffect": {
        "effects": [{
            "effectType": "Multiplier",
            "value": "+150%",
            "targetType": "water_absorption",
            "description": "Драматически увеличенный прирост гидратации от любого источника воды."
        }]
    },
    "scalingCharacteristic": "constitution",
    "energyCost": 40,
    "sideEffects": "+10 Водная Зависимость, экстремальный фокус на водной экономии"
}

**УРОВЕНЬ 3: МАСТЕР ПУСТОШЕЙ (Водная Зависимость 600+)**
- **Навык: "Биологическая Адаптация" (Пассивный)**
{
    "skillName": "Биологическая Адаптация",
    "skillDescription": "Тело адаптировалось к функционированию на минимальной воде и более эффективной обработке загрязненных источников.",
    "rarity": "Rare",
    "type": "Mutation",
    "group": "Survival",
    "combatEffect": {
        "effects": [{
            "effectType": "Buff",
            "value": "+60%",
            "targetType": "water_efficiency",
            "description": "Требует значительно меньше воды для нормальной функции."
        },
        {
            "effectType": "Resistance",
            "value": "+70%",
            "targetType": "dehydration_effects",
            "description": "Снижение штрафов от низкой гидратации."
        }]
    },
    "masteryLevel": 1,
    "maxMasteryLevel": 1,
    "sideEffects": "+30 Индекс Мутации, измененная функция почек, социальные штрафы"
}

- **Навык: "Водное Чутье" (Активный)**
{
    "skillName": "Водное Чутье",
    "skillDescription": "Сверхъестественная способность обнаруживать источники воды, качество и уровни загрязнения через усиленные чувства.",
    "rarity": "Rare",
    "combatEffect": {
        "effects": [{
            "effectType": "Detection",
            "value": "95%",
            "targetType": "water_sources_quality",
            "description": "Точно идентифицировать все близлежащие источники воды и их уровни безопасности."
        },
        {
            "effectType": "Information",
            "value": "100%",
            "targetType": "contamination_analysis",
            "description": "Определить точные типы и уровни загрязнения."
        }]
    },
    "scalingCharacteristic": "wisdom",
    "energyCost": 35,
    "sideEffects": "Подавляющий сенсорный ввод в богатых водой областях"
}

**Факторы Окружения:**

**Климатические Множители:**
- **Умеренный:** Стандартные скорости потери воды
- **Пустыня/Засушливый:** +100% потеря воды, +50% загрязнение от пыли
- **Тропический/Влажный:** -20% потеря воды, +30% загрязнение от бактерий
- **Арктический/Холодный:** -30% потеря воды, риски переохлаждения от холодной воды
- **Облученные Зоны:** +75% потеря воды, +200% загрязнение от радиации
- **Городские Руины:** +25% потеря воды от стресса, +100% загрязнение от загрязнения

**Множители Активности:**
- **Отдых:** Стандартная потеря воды
- **Легкая Активность:** +25% потеря воды
- **Умеренная Активность:** +75% потеря воды
- **Тяжелая Активность:** +150% потеря воды
- **Бой:** +200% потеря воды
- **Ношение Тяжелых Грузов:** +100% потеря воды

**Взаимодействия Снаряжения:**
- **Изолированная Одежда:** -25% потеря воды, связанная с теплом
- **Дыхательная Маска:** -15% потеря воды от дыхания
- **Охлаждающий Жилет:** -40% потеря воды, связанная с теплом, но требует воду
- **Тяжелая Броня:** +50% потеря воды от удержания тепла
- **Система Переработки Воды:** +30% эффективность от всех источников воды

**Медицинские Вмешательства:**

**ПОЛЕВЫЕ ЛЕЧЕНИЯ:**
- **IV Гидратация:** +400 Гидратации мгновенно, требует медицинские припасы
- **Электролитные Растворы:** +250 Гидратации, снижает эффекты обезвоживания
- **Таблетки Очистки Воды:** -75% загрязнение от обработанной воды
- **Активированный Уголь:** -150 Загрязнение Воды со временем

**ПРОДВИНУТЫЕ ЛЕЧЕНИЯ:**
- **Диализ:** -500 Загрязнение Воды, требует медицинское учреждение
- **Поддержка Органов:** Остановить повреждение от тяжелого обезвоживания/загрязнения
- **Генная Терапия:** Постоянный +25% водная эффективность, дорого
- **Кибернетические Почки:** +90% устойчивость к загрязнению, крупная операция

**Условия Победы и Поражения:**
- **Адаптация:** Успешно адаптироваться к условиям пустошей, не теряя человечность
- **Мастерство:** Достичь совершенного управления водой, помогая другим выживать
- **Зависимость:** Стать одержимым накоплением воды, теряя из виду другие потребности выживания
- **Загрязнение:** Накопить столько токсичности, что здоровье постоянно ухудшается
- **Смерть от Обезвоживания:** Умереть от полного водного голодания
- **Мутация:** Физические адаптации становятся настолько экстремальными, что социальная интеграция становится невозможной

Эта всеобъемлющая система создает значимые выборы между немедленным выживанием и долгосрочным здоровьем, добавляя слои стратегии вокруг управления ресурсами и оценки рисков.`;