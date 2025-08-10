export const radiationSystemDescEn = `### RADIATION & MUTATION SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics.**

1.  **Create State:** Create a Custom State named "Radiation Sickness" with \`currentValue: 0\` (Rads), \`minValue: 0\`, \`maxValue: 1000\`.
2.  **Progression:** Increase \`currentValue\` when in an irradiated zone (e.g., +5 to +20 Rads per turn depending on intensity) or consuming irradiated items. Decrease with anti-radiation chems (e.g., Rad-Away: -200 Rads).
3.  **Thresholds & Effects:** The effects are CUMULATIVE.
    *   **Minor Sickness (200+ Rads):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-5%", "targetType": "constitution", "duration": 999, "sourceSkill": "Radiation Sickness", "description": "Minor Sickness: Constitution reduced by 5%." }]
    *   **Advanced Sickness (400+ Rads):** Add \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-10%", "targetType": "strength", "duration": 999, "sourceSkill": "Radiation Sickness", "description": "Advanced Sickness: Strength reduced by 10%." }]
    *   **Critical Sickness (600+ Rads):** Add \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-15%", "targetType": "dexterity", "duration": 999, "sourceSkill": "Radiation Sickness", "description": "Critical Sickness: Dexterity reduced by 15%." }]
    *   **Lethal Dose (800+ Rads):** Add \`associatedEffects\`: [{ "effectType": "DamageOverTime", "value": "10%", "targetType": "radiation", "duration": 999, "sourceSkill": "Lethal Radiation", "description": "Lethal Dose: Taking 10% radiation damage per turn." }]
4.  **Mutations:**
    *   When the player's Rads first cross **300**, and again at **600**, there is a 50% chance they develop a random mutation.
    *   You MUST generate a new **Passive Skill** for the mutation via \`passiveSkillChanges\`. Each mutation should have a positive and a negative effect.
    *   **Example Mutation 1 (Chameleon Skin):**
        *   \`skillName\`: "Chameleon Skin"
        *   \`description\`: "Your skin can subtly shift color to match your surroundings, but it's now more sensitive to cold."
        *   \`playerStatBonus\`: "+10% bonus to stealth checks in natural environments"
        *   \`combatEffect\`: { effects: [{ effectType: "Debuff", value: "-15%", targetType: "resist (cold)", description: "Vulnerable to cold." }] }
    *   **Example Mutation 2 (Adrenal Gland):**
        *   \`skillName\`: "Adrenal Gland"
        *   \`description\`: "You have a hyperactive adrenal gland, giving you bursts of speed but making you prone to jitters."
        *   \`playerStatBonus\`: "+10% to initiative rolls"
        *   \`combatEffect\`: { effects: [{ effectType: "Debuff", value: "-10%", targetType: "dexterity_checks", description: "Jitters: -10% on fine motor skill checks." }] }`;

export const radiationSystemDescRu = `### ПРАВИЛА СИСТЕМЫ РАДИАЦИИ И МУТАЦИЙ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний.**

1.  **Создайте Состояние:** Создайте Пользовательское Состояние с названием "Лучевая болезнь" с \`currentValue: 0\` (Рад), \`minValue: 0\`, \`maxValue: 1000\`.
2.  **Прогрессия:** Увеличивайте \`currentValue\` при нахождении в облученной зоне (напр., +5 до +20 Рад за ход в зависимости от интенсивности) или употреблении облученных предметов. Снижайте с помощью антирадиационных препаратов (напр., Антирадин: -200 Рад).
3.  **Пороги и Эффекты:** Эффекты СУММИРУЮТСЯ.
    *   **Легкая болезнь (200+ Рад):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-5%", "targetType": "constitution", "duration": 999, "sourceSkill": "Лучевая болезнь", "description": "Легкая болезнь: Телосложение снижено на 5%." }]
    *   **Прогрессирующая болезнь (400+ Рад):** Добавьте \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-10%", "targetType": "strength", "duration": 999, "sourceSkill": "Лучевая болезнь", "description": "Прогрессирующая болезнь: Сила снижена на 10%." }]
    *   **Критическая болезнь (600+ Рад):** Добавьте \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-15%", "targetType": "dexterity", "duration": 999, "sourceSkill": "Лучевая болезнь", "description": "Критическая болезнь: Ловкость снижена на 15%." }]
    *   **Смертельная доза (800+ Рад):** Добавьте \`associatedEffects\`: [{ "effectType": "DamageOverTime", "value": "10%", "targetType": "radiation", "duration": 999, "sourceSkill": "Смертельная доза", "description": "Смертельная доза: Получение 10% радиационного урона за ход." }]
4.  **Мутации:**
    *   Когда Рады игрока впервые пересекают отметку в **300**, а затем снова в **600**, есть 50% шанс, что у него разовьется случайная мутация.
    *   Вы ДОЛЖНЫ сгенерировать новый **Пассивный Навык** для мутации через \`passiveSkillChanges\`. Каждая мутация должна иметь положительный и отрицательный эффект.
    *   **Пример мутации 1 (Кожа-хамелеон):**
        *   \`skillName\`: "Кожа-хамелеон"
        *   \`description\`: "Ваша кожа может незаметно менять цвет, сливаясь с окружением, но теперь она более чувствительна к холоду."
        *   \`playerStatBonus\`: "+10% бонус к проверкам скрытности в естественной среде"
        *   \`combatEffect\`: { effects: [{ effectType: "Debuff", value: "-15%", targetType: "resist (cold)", description: "Уязвимость к холоду." }] }
    *   **Пример мутации 2 (Надпочечник):**
        *   \`skillName\`: "Надпочечник"
        *   \`description\`: "У вас гиперактивный надпочечник, дающий всплески скорости, но вызывающий дрожь в руках."
        *   \`playerStatBonus\`: "+10% к броскам инициативы"
        *   \`combatEffect\`: { effects: [{ effectType: "Debuff", value: "-10%", targetType: "dexterity_checks", description: "Дрожь: -10% к проверкам мелкой моторики." }] }`;
