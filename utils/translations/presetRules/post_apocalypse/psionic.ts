export const psionicSystemDescEn = `### PSIONIC POWER SYSTEM RULES (POST-APOCALYPSE) ###
**GM, you MUST implement this system using the Custom State mechanics for progression.** Psionics are a dangerous mutation tied to a psionic potential state called **"Brain Burn"**. The power of these abilities scales with **Wisdom**, and they are fueled by the character's standard **Energy** pool.

**Core Mechanics:**
1.  **Brain Burn (Progression State):** Create a Custom State named "Brain Burn" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000\`. This represents the character's growing, but stressful, psionic potential. It is the sole requirement for unlocking new tiers of power. It increases through using psionic powers, intense mental challenges, or exposure to psychic anomalies. Award points based on significance (1-20 points per event).
2.  **Energy Source:** All psionic active skills consume the character's main **Energy**, not a separate pool. The \`energyCost\` property of a psionic skill represents a deduction from the player character's main energy resource.
3.  **Unlocking Powers:** When the player's "Brain Burn" custom state reaches a new threshold, you MUST grant them new **Active or Passive Skills** via \`activeSkillChanges\` or \`passiveSkillChanges\` that reflect their new tier of raw power. Use the skill generation examples below as a strict guide for balance and structure.

**Tiers of Psionic Mutation (Unlocked by "Brain Burn" Value):**
*   **Tier 1 (Brain Burn 100+): The Sensitive.** The user is a "sensitive" who gets migraines and flashes of insight. They can sense imminent danger, get a 'feel' for radiation levels, and make small objects vibrate or fall over.
    **GM Skill Generation Examples:**
    - **Skill:** "Danger Sense" (Passive)
      \`\`\`json
      {
          "skillName": "Danger Sense",
          "skillDescription": "A constant headache gives you a sixth sense for immediate danger, granting a small bonus to avoid traps and ambushes.",
          "rarity": "Common",
          "type": "Utility",
          "group": "Psionic",
          "playerStatBonus": "+10% chance on perception checks to detect ambushes or traps.",
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`
    - **Skill:** "Kinetic Jolt" (Active)
      \`\`\`json
      {
          "skillName": "Kinetic Jolt",
          "skillDescription": "Focus your mind to unleash a weak telekinetic push. Enough to knock over a bottle, rattle a door, or distract a guard.",
          "rarity": "Common",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "5%", "targetType": "force", "description": "Deals a minor telekinetic jolt." }] },
          "scalingCharacteristic": "wisdom",
          "energyCost": 5
      }
      \`\`\`

*   **Tier 2 (Brain Burn 250+): The Empath.** The user can hear the "static" of other minds and the pain of the irradiated wastes. They can project feelings of dread to unnerve foes or attempt to soothe the primitive minds of mutated beasts.
    **GM Skill Generation Examples:**
    - **Skill:** "Mind Static" (Active)
      \`\`\`json
      {
          "skillName": "Mind Static",
          "skillDescription": "Project a wave of psychic noise, making it difficult for a target to concentrate.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Debuff", "value": "-15%", "targetType": "perception_checks", "duration": 2, "description": "Target's Perception is reduced by 15% for 2 turns." }] },
          "scalingCharacteristic": "wisdom",
          "energyCost": 15
      }
      \`\`\`
    - **Skill:** "Beast Soothe" (Active)
      \`\`\`json
      {
          "skillName": "Beast Soothe",
          "skillDescription": "Attempt to calm a single, non-hostile mutated beast. Requires a contested Wisdom check.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 20
      }
      \`\`\`

*   **Tier 3 (Brain Burn 500+): The Telekinetic.** The user's mind can now lash out with tangible force. They can hurl junk as projectiles, create a shimmering shield of kinetic energy, and feel the very structure of objects for weaknesses.
    **GM Skill Generation Examples:**
    - **Skill:** "Junk Hail" (Active)
      \`\`\`json
      {
          "skillName": "Junk Hail",
          "skillDescription": "Telekinetically grab loose debris (scrap metal, rocks, bones) and hurl it at an enemy.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "20%", "targetType": "bludgeoning", "description": "Deals 20% bludgeoning damage." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 25
      }
      \`\`\`
    - **Skill:** "Kinetic Barrier" (Active)
      \`\`\`json
      {
          "skillName": "Kinetic Barrier",
          "skillDescription": "Project a shimmering shield of telekinetic force in front of you.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "25%", "targetType": "all", "duration": 2, "description": "Reduces all incoming damage by 25% for 2 turns." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 30
      }
      \`\`\`

*   **Tier 4 (Brain Burn 750+): The Telepath.** The user can now form coherent thoughts in another's mind, a violation that can shatter concentration or implant simple, false sensations. Their own mind becomes a confusing labyrinth to others.
    **GM Skill Generation Examples:**
    - **Skill:** "Mind Worm" (Active)
      \`\`\`json
      {
          "skillName": "Mind Worm",
          "skillDescription": "Implant a debilitating psychic worm into a target's mind, causing immense pain and confusion.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "DamageOverTime", "value": "10%", "targetType": "psychic", "duration": 3, "description": "Deals 10% psychic damage per turn for 3 turns." }, { "effectType": "Control", "value": "25%", "targetType": "confusion", "duration": 1, "description": "25% chance to Confuse the target for 1 turn." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "scalesChance": true,
          "energyCost": 45
      }
      \`\`\`
    - **Skill:** "Psychic Labyrinth" (Passive)
      \`\`\`json
      {
          "skillName": "Psychic Labyrinth",
          "skillDescription": "Your mind is a confusing maze to other psychics. You gain resistance to mental attacks.",
          "rarity": "Rare",
          "type": "CombatEnhancement",
          "group": "Psionic",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "25%", "targetType": "resist (psychic)" }] },
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`

*   **Tier 5 (Brain Burn 1000+): The Maelstrom.** The user becomes a nexus of raw psionic energy, a walking storm of mental force. They can shred the consciousness of others or ignite the very air with psychokinetic friction.
    **GM Skill Generation Examples:**
    - **Skill:** "Mind Shred" (Active)
      \`\`\`json
      {
          "skillName": "Mind Shred",
          "skillDescription": "Unleash a focused beam of pure psychic energy that tears at the target's consciousness.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "60%", "targetType": "psychic", "description": "Deals a devastating 60% psychic damage." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 70
      }
      \`\`\`
    - **Skill:** "Pyrokinesis" (Active)
      \`\`\`json
      {
          "skillName": "Pyrokinesis",
          "skillDescription": "Agitate the molecules of the air around a target to the point of combustion.",
          "rarity": "Legendary",
          "combatEffect": { "effects": [{ "effectType": "DamageOverTime", "value": "20%", "targetType": "fire", "duration": 3, "description": "Sets the target ablaze, dealing 20% fire damage per turn for 3 turns." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 80
      }
      \`\`\``;

export const psionicSystemDescRu = `### ПРАВИЛА СИСТЕМЫ ПСИОНИЧЕСКОЙ СИЛЫ (ПОСТАПОКАЛИПСИС) ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.** Псионика — это опасная мутация, связанная с состоянием псионического потенциала **"Выгорание мозга"**. Сила этих способностей масштабируется от **Мудрости** и питается стандартным пулом **Энергии** персонажа.

**Основные механики:**
1.  **Выгорание мозга (Состояние прогрессии):** Создайте Пользовательское Состояние "Выгорание мозга" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000\`. Оно представляет растущий, но стрессовый псионический потенциал персонажа и является единственным требованием для открытия новых уровней силы. Увеличивается при использовании пси-способностей, интенсивных ментальных испытаниях или контакте с пси-аномалиями. Начисляйте очки в зависимости от значимости (1-20 очков за событие).
2.  **Источник Энергии:** Все псионические активные навыки потребляют основную **Энергию** персонажа, а не отдельный пул. Свойство \`energyCost\` псионического навыка представляет собой вычет из основного энергетического ресурса игрового персонажа.
3.  **Открытие способностей:** Когда значение состояния "Выгорание мозга" игрока достигает нового порога, вы ДОЛЖНЫ даровать ему новые **Активные или Пассивные Навыки** через \`activeSkillChanges\` или \`passiveSkillChanges\`, отражающие новый уровень его сырой силы. Используйте примеры генерации навыков ниже как строгое руководство по балансу и структуре.

**Уровни Псионической Мутации (Открываются по значению "Выгорания мозга"):**
*   **Уровень 1 (Выгорание мозга 100+): Сенситив.** Пользователь — «чувствительный», страдающий от мигреней и вспышек озарения. Он может предчувствовать непосредственную опасность, ощущать уровень радиации и заставлять мелкие предметы вибрировать или падать.
    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Чувство опасности" (Пассивный)
      \`\`\`json
      {
          "skillName": "Чувство опасности",
          "skillDescription": "Постоянная головная боль дает вам шестое чувство на непосредственную опасность, предоставляя небольшой бонус для избежания ловушек и засад.",
          "rarity": "Common",
          "type": "Utility",
          "group": "Psionic",
          "playerStatBonus": "+10% шанс при проверках Восприятия на обнаружение засад или ловушек.",
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`
    - **Навык:** "Кинетический импульс" (Активный)
      \`\`\`json
      {
          "skillName": "Кинетический импульс",
          "skillDescription": "Сконцентрируйте свой разум, чтобы высвободить слабый телекинетический толчок. Достаточно, чтобы опрокинуть бутылку, заставить дребезжать дверь или отвлечь охранника.",
          "rarity": "Common",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "5%", "targetType": "force", "description": "Наносит незначительный телекинетический толчок." }] },
          "scalingCharacteristic": "wisdom",
          "energyCost": 5
      }
      \`\`\`

*   **Уровень 2 (Выгорание мозга 250+): Эмпат.** Пользователь слышит «статику» чужих разумов и боль облученных пустошей. Он может проецировать чувства ужаса, чтобы обескуражить врагов, или пытаться успокоить примитивные умы мутировавших зверей.
    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Ментальный шум" (Активный)
      \`\`\`json
      {
          "skillName": "Ментальный шум",
          "skillDescription": "Спроецируйте волну психического шума, мешая цели сконцентрироваться.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Debuff", "value": "-15%", "targetType": "perception_checks", "duration": 2, "description": "Восприятие цели снижено на 15% на 2 хода." }] },
          "scalingCharacteristic": "wisdom",
          "energyCost": 15
      }
      \`\`\`
    - **Навык:** "Усмирение зверя" (Активный)
      \`\`\`json
      {
          "skillName": "Усмирение зверя",
          "skillDescription": "Попытка успокоить одного невраждебного мутировавшего зверя. Требует оспариваемой проверки Мудрости.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 20
      }
      \`\`\`

*   **Уровень 3 (Выгорание мозга 500+): Телекинетик.** Разум пользователя теперь может атаковать с ощутимой силой. Он может метать мусор как снаряды, создавать мерцающий щит кинетической энергии и чувствовать структуру объектов, находя в них слабые места.
    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Град мусора" (Активный)
      \`\`\`json
      {
          "skillName": "Град мусора",
          "skillDescription": "Телекинетически захватите валяющийся мусор (металлолом, камни, кости) и швырните его во врага.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "20%", "targetType": "bludgeoning", "description": "Наносит 20% дробящего урона." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 25
      }
      \`\`\`
    - **Навык:** "Кинетический барьер" (Активный)
      \`\`\`json
      {
          "skillName": "Кинетический барьер",
          "skillDescription": "Спроецируйте перед собой мерцающий щит телекинетической силы.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "25%", "targetType": "all", "duration": 2, "description": "Снижает весь входящий урон на 25% на 2 хода." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 30
      }
      \`\`\`

*   **Уровень 4 (Выгорание мозга 750+): Телепат.** Пользователь теперь может формировать связные мысли в чужом разуме — вторжение, способное разрушить концентрацию или внедрить простые, ложные ощущения. Его собственный разум становится для других запутанным лабиринтом.
    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Ментальный червь" (Активный)
      \`\`\`json
      {
          "skillName": "Ментальный червь",
          "skillDescription": "Внедрите изнуряющего психического червя в разум цели, вызывая невыносимую боль и замешательство.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "DamageOverTime", "value": "10%", "targetType": "psychic", "duration": 3, "description": "Наносит 10% психического урона за ход в течение 3 ходов." }, { "effectType": "Control", "value": "25%", "targetType": "confusion", "duration": 1, "description": "25% шанс привести цель в Замешательство на 1 ход." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "scalesChance": true,
          "energyCost": 45
      }
      \`\`\`
    - **Навык:** "Психический лабиринт" (Пассивный)
      \`\`\`json
      {
          "skillName": "Психический лабиринт",
          "skillDescription": "Ваш разум — это запутанный лабиринт для других псиоников. Вы получаете сопротивление ментальным атакам.",
          "rarity": "Rare",
          "type": "CombatEnhancement",
          "group": "Psionic",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "25%", "targetType": "resist (psychic)" }] },
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`

*   **Уровень 5 (Выгорание мозга 1000+): Вихрь.** Пользователь становится средоточием сырой псионической энергии, ходячим штормом ментальной силы. Он может разрывать сознание других или воспламенять сам воздух психокинетическим трением.
    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Разрыв разума" (Активный)
      \`\`\`json
      {
          "skillName": "Разрыв разума",
          "skillDescription": "Высвободите сфокусированный луч чистой психической энергии, который разрывает сознание цели.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "60%", "targetType": "psychic", "description": "Наносит разрушительный 60% психический урон." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 70
      }
      \`\`\`
    - **Навык:** "Пирокинез" (Активный)
      \`\`\`json
      {
          "skillName": "Пирокинез",
          "skillDescription": "Возбудите молекулы воздуха вокруг цели до точки возгорания.",
          "rarity": "Legendary",
          "combatEffect": { "effects": [{ "effectType": "DamageOverTime", "value": "20%", "targetType": "fire", "duration": 3, "description": "Поджигает цель, нанося 20% урона огнем за ход в течение 3 ходов." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 80
      }
      \`\`\``;
