export const hungerSystemDescEn = `### HUNGER SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics.**

1.  **Create State:** Create a Custom State named "Hunger" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 100\`.
2.  **Progression:** Increase \`currentValue\` by **+5** per turn. Increase by an additional **+5** for strenuous activity (running, heavy combat). Decrease \`currentValue\` when the player eats. The amount of reduction depends on the food item (e.g., Snack: -15, Full Meal: -50).
3.  **Thresholds & Effects:**
    *   **Peckish (25+):** Minor debuff. \`description: "You feel the first pangs of hunger."\`
    *   **Hungry (50+):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-10%", "targetType": "constitution", "duration": 999, "sourceSkill": "Hunger", "description": "Hungry: Constitution reduced by 10%." }]
    *   **Starving (75+):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-15%", "targetType": "strength", "duration": 999, "sourceSkill": "Starvation", "description": "Starving: Strength reduced by 15%." }]
    *   **Famished (100):** \`associatedEffects\`: [{ "effectType": "DamageOverTime", "value": "2%", "targetType": "dark", "duration": 999, "sourceSkill": "Famished", "description": "Famished: Taking 2% damage per turn from severe malnutrition." }]`;

export const hungerSystemDescRu = `### ПРАВИЛА СИСТЕМЫ ГОЛОДА ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний.**

1.  **Создайте Состояние:** Создайте Пользовательское Состояние с названием "Голод", \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 100\`.
2.  **Прогрессия:** Увеличивайте \`currentValue\` на **+5** за ход. Увеличивайте дополнительно на **+5** за напряженную деятельность (бег, тяжелый бой). Уменьшайте \`currentValue\`, когда игрок ест. Размер снижения зависит от еды (напр., Закуска: -15, Полноценный обед: -50).
3.  **Пороги и Эффекты:**
    *   **Легкий голод (25+):** Незначительный дебафф. \`description: "Вы чувствуете первые признаки голода."\`
    *   **Голод (50+):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-10%", "targetType": "constitution", "duration": 999, "sourceSkill": "Голод", "description": "Голод: Телосложение снижено на 10%." }]
    *   **Истощение (75+):** \`associatedEffects\`: [{ "effectType": "Debuff", "value": "-15%", "targetType": "strength", "duration": 999, "sourceSkill": "Истощение", "description": "Истощение: Сила снижена на 15%." }]
    *   **Изнурение (100):** \`associatedEffects\`: [{ "effectType": "DamageOverTime", "value": "2%", "targetType": "dark", "duration": 999, "sourceSkill": "Изнурение", "description": "Изнурение: Получение 2% урона за ход от сильного недоедания." }]`;
