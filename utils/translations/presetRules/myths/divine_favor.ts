export const divineFavorDescEn = `### FAVOR OF THE OLD GODS & THE NEW SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.** The character's devotion is tracked by two states: **"Old God Favor"** and **"New God Favor"**. The power of the unlocked abilities scales with **Faith**, and they are fueled by the character's standard **Energy** pool.

**Core Mechanics:**
1.  **Favor States (Progression):** Create two Custom States: "Old God Favor" and "New God Favor". Both start at \`currentValue: 0\`, with \`minValue: 0\`, \`maxValue: 100\`.
2.  **Gaining Favor:**
    *   Gain **Old God Favor** (+5-15) for actions honoring nature, pagan rites, respecting ancient sites, or opposing the Christian church.
    *   Gain **New God Favor** (+5-15) for acts of Christian piety, prayer in churches, aiding priests, or fighting pagan beasts/magic.
3.  **Conflict:** A strong act for one side may decrease favor with the other (-5-10).
4.  **Unlocking Powers:** When Favor crosses a threshold, you MUST grant a new, thematically appropriate **Active Skill** via \`activeSkillChanges\`. The skills listed below are balanced **examples** for each path. You should use them as a baseline to create unique abilities that reflect the player's specific deeds in service to their gods. If favor drops below the threshold, the skill is lost via \`removeActiveSkills\`.

**Old God Favor Tiers (Active Skills Unlocked):**
1.  **Favor 25+: Example Skill - "Grasping Roots".**
    \`\`\`json
    {
        "skillName": "Grasping Roots",
        "skillDescription": "Channel the will of the earth to entangle a foe's feet.",
        "rarity": "Common",
        "combatEffect": { "effects": [{ "effectType": "Control", "value": "40%", "targetType": "immobility", "duration": 1, "description": "40% chance to immobilize for 1 turn." }] },
        "scalingCharacteristic": "faith", "scalesChance": true, "energyCost": 15
    }
    \`\`\`
2.  **Favor 50+: Example Skill - "Might of the Stag".**
    \`\`\`json
    {
        "skillName": "Might of the Stag",
        "skillDescription": "Invoke the spirit of the great stag to grant you or an ally primal strength.",
        "rarity": "Uncommon",
        "combatEffect": { "effects": [{ "effectType": "Buff", "value": "15%", "targetType": "strength", "duration": 3, "description": "Increases Strength by 15% for 3 turns." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 25
    }
    \`\`\`
3.  **Favor 75+: Example Skill - "Primal Fury".**
    \`\`\`json
    {
        "skillName": "Primal Fury",
        "skillDescription": "Unleash the raw fury of the wild, striking a foe with the force of a cornered beast.",
        "rarity": "Rare",
        "combatEffect": { "effects": [{ "effectType": "Damage", "value": "35%", "targetType": "force", "description": "Deals 35% raw force damage." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 40
    }
    \`\`\`

**New God Favor Tiers (Active Skills Unlocked):**
1.  **Favor 25+: Example Skill - "Shield of Faith".**
    \`\`\`json
    {
        "skillName": "Shield of Faith",
        "skillDescription": "Invoke a barrier of divine protection around yourself or an ally.",
        "rarity": "Common",
        "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "20%", "targetType": "all", "duration": 1, "description": "Reduces incoming damage by 20% for 1 turn." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 15
    }
    \`\`\`
2.  **Favor 50+: Example Skill - "Lay on Hands".**
    \`\`\`json
    {
        "skillName": "Lay on Hands",
        "skillDescription": "Channel divine energy to mend grievous wounds.",
        "rarity": "Uncommon",
        "combatEffect": { "effects": [{ "effectType": "Heal", "value": "25%", "targetType": "health", "description": "Restores 25% health." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 25
    }
    \`\`\`
3.  **Favor 75+: Example Skill - "Smite the Unworthy".**
    \`\`\`json
    {
        "skillName": "Smite the Unworthy",
        "skillDescription": "Call down divine judgment upon a foe, striking them with holy power.",
        "rarity": "Rare",
        "combatEffect": { "effects": [{ "effectType": "Damage", "value": "35%", "targetType": "holy", "description": "Deals 35% holy damage." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 40
    }
    \`\`\``;

export const divineFavorDescRu = `### ПРАВИЛА СИСТЕМЫ БЛАГОВОЛЕНИЯ СТАРЫХ И НОВОГО БОГОВ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.** Преданность персонажа отслеживается двумя состояниями: **"Благоволение Старых Богов"** и **"Благоволение Нового Бога"**. Сила открытых способностей масштабируется от **Веры**, и они питаются стандартным пулом **Энергии** персонажа.

**Основные механики:**
1.  **Состояния Благоволения (Прогрессия):** Создайте два Пользовательских Состояния: "Благоволение Старых Богов" и "Благоволение Нового Бога". Оба начинаются с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 100\`.
2.  **Получение благоволения:**
    *   Получайте **Благоволение Старых Богов** (+5-15) за действия, чтящие природу, языческие обряды, уважение к древним местам или противостояние христианской церкви.
    *   Получайте **Благоволение Нового Бога** (+5-15) за акты христианского благочестия, молитвы в церквях, помощь священникам или борьбу с языческими тварями/магией.
3.  **Конфликт:** Сильный поступок в пользу одной стороны может уменьшить благоволение другой (-5-10).
4.  **Открытие способностей:** Когда Благоволение пересекает порог, вы ДОЛЖНЫ даровать новый, тематически подходящий **Активный Навык** через \`activeSkillChanges\`. Навыки, перечисленные ниже, являются сбалансированными **примерами** для каждого пути. Вы должны использовать их как основу для создания уникальных способностей, отражающих конкретные деяния игрока на службе своим богам. Если благоволение падает ниже порога, навык теряется через \`removeActiveSkills\`.

**Уровни Благоволения Старых Богов (Открываемые Активные Навыки):**
1.  **Благоволение 25+: Пример навыка - "Хватающие Корни".**
    \`\`\`json
    {
        "skillName": "Хватающие Корни",
        "skillDescription": "Направьте волю земли, чтобы опутать ноги врага.",
        "rarity": "Common",
        "combatEffect": { "effects": [{ "effectType": "Control", "value": "40%", "targetType": "immobility", "duration": 1, "description": "40% шанс обездвижить на 1 ход." }] },
        "scalingCharacteristic": "faith", "scalesChance": true, "energyCost": 15
    }
    \`\`\`
2.  **Благоволение 50+: Пример навыка - "Мощь Оленя".**
    \`\`\`json
    {
        "skillName": "Мощь Оленя",
        "skillDescription": "Призовите дух великого оленя, чтобы даровать себе или союзнику первобытную силу.",
        "rarity": "Uncommon",
        "combatEffect": { "effects": [{ "effectType": "Buff", "value": "15%", "targetType": "strength", "duration": 3, "description": "Увеличивает Силу на 15% на 3 хода." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 25
    }
    \`\`\`
3.  **Благоволение 75+: Пример навыка - "Первобытная Ярость".**
    \`\`\`json
    {
        "skillName": "Первобытная Ярость",
        "skillDescription": "Высвободите сырую ярость дикой природы, ударив врага с силой загнанного зверя.",
        "rarity": "Rare",
        "combatEffect": { "effects": [{ "effectType": "Damage", "value": "35%", "targetType": "force", "description": "Наносит 35% чистого урона силой." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 40
    }
    \`\`\`

**Уровни Благоволения Нового Бога (Открываемые Активные Навыки):**
1.  **Благоволение 25+: Пример навыка - "Щит Веры".**
    \`\`\`json
    {
        "skillName": "Щит Веры",
        "skillDescription": "Призовите барьер божественной защиты вокруг себя или союзника.",
        "rarity": "Common",
        "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "20%", "targetType": "all", "duration": 1, "description": "Снижает входящий урон на 20% на 1 ход." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 15
    }
    \`\`\`
2.  **Благоволение 50+: Пример навыка - "Возложение Рук".**
    \`\`\`json
    {
        "skillName": "Возложение Рук",
        "skillDescription": "Направьте божественную энергию, чтобы залечить тяжелые раны.",
        "rarity": "Uncommon",
        "combatEffect": { "effects": [{ "effectType": "Heal", "value": "25%", "targetType": "health", "description": "Восстанавливает 25% здоровья." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 25
    }
    \`\`\`
3.  **Благоволение 75+: Пример навыка - "Поразить Недостойного".**
    \`\`\`json
    {
        "skillName": "Поразить Недостойного",
        "skillDescription": "Призовите божественный суд на врага, ударив его святой силой.",
        "rarity": "Rare",
        "combatEffect": { "effects": [{ "effectType": "Damage", "value": "35%", "targetType": "holy", "description": "Наносит 35% святого урона." }] },
        "scalingCharacteristic": "faith", "scalesValue": true, "energyCost": 40
    }
    \`\`\``;
