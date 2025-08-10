export const thirstSystemDescEn = `### THIRST SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics.**

1.  **Create State:** Create a Custom State named "Thirst" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 100\`.
2.  **Progression:** Increase \`currentValue\` by **+10** per turn. Increase by an additional **+5** for strenuous activity or in hot biomes (Desert). Decrease \`currentValue\` when the player drinks. (e.g., Sip of Water: -20, Full Canteen: -60).
3.  **Thresholds & Effects:**
    *   **Thirsty (25+):** Minor debuff. \`description: "Your mouth feels dry."\`
    *   **Dehydrated (50+):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-10%", "targetType": "perception", "duration": 999, "sourceSkill": "Dehydration", "description": "Dehydrated: Perception reduced by 10%." }]
    *   **Severely Dehydrated (75+):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-15%", "targetType": "dexterity", "duration": 999, "sourceSkill": "Severe Dehydration", "description": "Severely Dehydrated: Dexterity reduced by 15%." }]
    *   **Parched (100):** \`associatedEffects\`: [{ "effectType": "DamageOverTime", "value": "5%", "targetType": "dark", "duration": 999, "sourceSkill": "Parched", "description": "Parched: Taking 5% damage per turn from severe dehydration." }]`;

export const thirstSystemDescRu = `### ПРАВИЛА СИСТЕМЫ ЖАЖДЫ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний.**

1.  **Создайте Состояние:** Создайте Пользовательское Состояние с названием "Жажда", \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 100\`.
2.  **Прогрессия:** Увеличивайте \`currentValue\` на **+10** за ход. Увеличивайте дополнительно на **+5** за напряженную деятельность или в жарких биомах (Пустыня). Уменьшайте \`currentValue\`, когда игрок пьет. (напр., Глоток воды: -20, Полная фляга: -60).
3.  **Пороги и Эффекты:**
    *   **Жажда (25+):** Незначительный дебафф. \`description: "У вас пересохло во рту."\`
    *   **Обезвоживание (50+):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-10%", "targetType": "perception", "duration": 999, "sourceSkill": "Обезвоживание", "description": "Обезвоживание: Восприятие снижено на 10%." }]
    *   **Сильное обезвоживание (75+):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-15%", "targetType": "dexterity", "duration": 999, "sourceSkill": "Сильное обезвоживание", "description": "Сильное обезвоживание: Ловкость снижена на 15%." }]
    *   **Иссушение (100):** \`associatedEffects\`: [{ "effectType": "DamageOverTime", "value": "5%", "targetType": "dark", "duration": 999, "sourceSkill": "Иссушение", "description": "Иссушение: Получение 5% урона за ход от сильного обезвоживания." }]`;
