export const psionicSystemDescSciFiEn = `### PSIONIC POWER SYSTEM RULES (SCI-FI) ###
**GM, you MUST implement this system using the Custom State mechanics for progression.** Psionic potential is tracked by a custom state called **"Psi Potential"**. The power of these abilities scales with **Wisdom**, and they are fueled by the character's standard **Energy** pool.

**Core Mechanics:**
1.  **Psi Potential (Progression State):** Create a Custom State named "Psi Potential" with \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000\`. This represents the character's overall psionic growth and is the sole requirement for unlocking new tiers of power. It increases through psionic training, intense mental challenges, or exposure to psionic artifacts. Award points based on significance (1-20 points per event).
2.  **Energy Source:** All psionic active skills consume the character's main **Energy**, not a separate pool. The \`energyCost\` property of a psionic skill represents a deduction from the player character's main energy resource.
3.  **Unlocking Powers:** When the player's "Psi Potential" custom state reaches a new threshold, you MUST grant them new **Active or Passive Skills** via \`activeSkillChanges\` or \`passiveSkillChanges\` that reflect their new tier of raw power. Use the skill generation examples below as a strict guide for balance and structure.

**Tiers of Psionic Awakening (Unlocked by 'Psi Potential' Value):**
*   **Tier 1 (Psi Potential 100+): The Spark.** The user awakens their latent potential. They can sense strong emotions and psionic emanations. Their will is strong enough to perform minor telekinetic feats, such as moving small, unsecured objects or creating a distracting sound across a room. The GM should grant a basic utility skill like "Telekinetic Nudge".
    **GM Skill Generation Example:**
    - **Skill:** "Telekinetic Nudge"
    - **JSON Structure:**
      \`\`\`json
      {
          "skillName": "Telekinetic Nudge",
          "skillDescription": "Focus your will to move a small, unsecured object (up to 1kg) a few meters, create a minor distraction, or press a button from a distance. Cannot be used to directly harm or wield a weapon.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 5
      }
      \`\`\`

*   **Tier 2 (Psi Potential 250+): The Breach.** The user's mind can now pierce the veil of other consciousnesses. They can actively scan for surface thoughts and immediate intentions. More powerfully, they can attempt to plant a simple, one-word suggestion (like 'sleep', 'flee', 'drop') into the mind of a target with weak willpower. The GM should grant an active skill like "Mind Scan" and "Suggestion".
    **GM Skill Generation Examples:**
    - **Skill:** "Mind Scan"
      \`\`\`json
      {
          "skillName": "Mind Scan",
          "skillDescription": "Attempt to read the surface thoughts and immediate intentions of a non-hostile or unaware target. Requires a successful contested Wisdom check.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 15
      }
      \`\`\`
    - **Skill:** "Suggestion"
      \`\`\`json
      {
          "skillName": "Suggestion",
          "skillDescription": "Implant a single, simple, one-word command into a target's mind. In combat, this manifests as a psychic attack that can briefly override their will.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "40%", "targetType": "confusion", "duration": 1, "description": "40% chance to Confuse the target for 1 turn, causing them to act randomly." }] },
          "scalingCharacteristic": "wisdom",
          "scalesChance": true,
          "energyCost": 25
      }
      \`\`\`

*   **Tier 3 (Psi Potential 500+): The Force.** The user's will gains a tangible, physical presence. They can generate powerful telekinetic thrusts to send enemies flying, create temporary shields of pure force, and begin to subtly manipulate the senses of others to create minor auditory or visual illusions. The GM should grant a powerful combat skill like "Telekinetic Shove" and a basic illusion skill.
    **GM Skill Generation Examples:**
    - **Skill:** "Telekinetic Shove"
      \`\`\`json
      {
          "skillName": "Telekinetic Shove",
          "skillDescription": "Unleash a focused blast of telekinetic force, capable of knocking an opponent off their feet.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "15%", "targetType": "force" }, { "effectType": "Control", "value": "60%", "targetType": "immobility", "duration": 1, "description": "60% chance to knock the target prone, making them immobile for 1 turn." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "scalesChance": true,
          "energyCost": 30
      }
      \`\`\`
    - **Skill:** "Phantom Sound"
      \`\`\`json
      {
          "skillName": "Phantom Sound",
          "skillDescription": "Create a brief, distinct sound (a footstep, a dropped object, a whisper) at any point you can see within 20 meters to create a distraction.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 10
      }
      \`\`\`

*   **Tier 4 (Psi Potential 750+): The Bastion.** The mind becomes a fortress, and a weapon. The user can create durable psionic shields that deflect physical projectiles and psionic attacks. Critically, they can now attempt to briefly seize control of another's motor functions, forcing them to perform a single, simple physical action. This requires immense concentration and a contested Wisdom check. The GM should grant an active skill like "Psychic Shield" and a precursor to true domination like "Puppet String".
    **GM Skill Generation Examples:**
    - **Skill:** "Psychic Shield"
      \`\`\`json
      {
          "skillName": "Psychic Shield",
          "skillDescription": "Manifest a barrier of shimmering psionic energy around yourself or an ally.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "30%", "targetType": "all", "duration": 3, "description": "Reduces all incoming damage by 30% for 3 turns." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "scalesDuration": true,
          "energyCost": 40
      }
      \`\`\`
    - **Skill:** "Puppet String"
      \`\`\`json
      {
          "skillName": "Puppet String",
          "skillDescription": "Attempt to briefly hijack a target's motor functions, forcing them to perform one simple physical action on their next turn (e.g., move, drop item, basic attack an ally). This is a difficult, contested Wisdom check.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "50%", "targetType": "confusion", "duration": 1, "description": "50% chance to take control of the target for 1 turn, forcing them to attack the nearest ally." }] },
          "scalingCharacteristic": "wisdom",
          "scalesChance": true,
          "energyCost": 60
      }
      \`\`\`

*   **Tier 5 (Psi Potential 1000+): The Dominion.** The pinnacle of psionic power. The user is a true master of the mind. They gain passive resistance to most forms of mental intrusion. They can inflict devastating internal damage on enemies by crushing them with telekinetic force from within. Their control over other minds is now so profound they can attempt to fully subjugate a target's consciousness for a sustained period. The GM should grant a passive "Mind Fortress" skill and truly powerful active abilities like "Telekinetic Crush" and "Dominate Mind".
    **GM Skill Generation Examples:**
    - **Skill:** "Mind Fortress" (Passive)
      \`\`\`json
      {
          "skillName": "Mind Fortress",
          "skillDescription": "Your mind is a bastion, shielded against mental intrusion. You gain significant resistance to psychic attacks and mental manipulation.",
          "rarity": "Epic",
          "type": "CombatEnhancement",
          "group": "Psionic",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "30%", "targetType": "resist (psychic)", "description": "Passively provides +30% resistance to Psychic damage and mind-affecting control effects." }] },
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`
    - **Skill:** "Telekinetic Crush"
      \`\`\`json
      {
          "skillName": "Telekinetic Crush",
          "skillDescription": "Focus your will on a target's interior, crushing them with immense telekinetic pressure.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "50%", "targetType": "force", "description": "Deals 50% force damage, bypassing most physical armor." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 75
      }
      \`\`\`
    - **Skill:** "Dominate Mind"
      \`\`\`json
      {
          "skillName": "Dominate Mind",
          "skillDescription": "Attempt to fully subjugate a target's consciousness, turning them into a loyal puppet for a short duration. Extremely difficult and draining.",
          "rarity": "Legendary",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "40%", "targetType": "confusion", "duration": 3, "description": "40% chance to Dominate the target for up to 3 turns, making them an ally." }] },
          "scalingCharacteristic": "wisdom",
          "scalesChance": true,
          "scalesDuration": true,
          "energyCost": 100
      }
      \`\`\``;

export const psionicSystemDescSciFiRu = `### ПРАВИЛА СИСТЕМЫ РАЗВИТИЯ ПСИОНИКИ (SCI-FI) ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.** Псионический потенциал отслеживается пользовательским состоянием **"Пси-потенциал"**. Сила этих способностей масштабируется от **Мудрости** и питается стандартным пулом **Энергии** персонажа.

**Основные механики:**
1.  **Пси-потенциал (Состояние прогрессии):** Создайте Пользовательское Состояние "Пси-потенциал" с \`currentValue: 0\`, \`minValue: 0\`, \`maxValue: 1000\`. Оно представляет общий псионический рост персонажа и является единственным требованием для открытия новых уровней силы. Увеличивается через псионические тренировки, интенсивные ментальные испытания или контакт с пси-артефактами. Начисляйте очки в зависимости от значимости (1-20 очков за событие).
2.  **Источник Энергии:** Все псионические активные навыки потребляют основную **Энергию** персонажа, а не отдельный пул. Свойство \`energyCost\` псионического навыка представляет собой вычет из основного энергетического ресурса игрового персонажа.
3.  **Открытие способностей:** Когда значение пользовательского состояния "Пси-потенциал" игрока достигает нового порога, вы ДОЛЖНЫ даровать ему новые **Активные или Пассивные Навыки** через \`activeSkillChanges\` или \`passiveSkillChanges\`, отражающие новый уровень его сырой силы. Используйте примеры генерации навыков ниже как строгое руководство по балансу и структуре.

**Уровни Псионического Пробуждения (Открываются по значению 'Пси-потенциала'):**
*   **Уровень 1 (Пси-потенциал 100+): Искра.** Пользователь пробуждает свой скрытый потенциал. Он может ощущать сильные эмоции и псионические эманации. Его воля достаточно сильна для совершения незначительных телекинетических действий, таких как перемещение мелких, незакрепленных предметов или создание отвлекающего звука в другом конце комнаты. ГМ должен даровать базовый утилитарный навык, такой как "Телекинетический толчок".
    **Пример генерации навыка для ГМ:**
    - **Навык:** "Телекинетический толчок"
    - **Структура JSON:**
      \`\`\`json
      {
          "skillName": "Телекинетический толчок",
          "skillDescription": "Сконцентрируйте волю, чтобы переместить небольшой, незакрепленный объект (до 1 кг) на несколько метров, создать незначительное отвлечение или нажать кнопку на расстоянии. Не может использоваться для прямого нанесения вреда или владения оружием.",
          "rarity": "Common",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 5
      }
      \`\`\`

*   **Уровень 2 (Пси-потенциал 250+): Прорыв.** Разум пользователя теперь может проникать за завесу чужого сознания. Он может активно сканировать поверхностные мысли и непосредственные намерения. Что более важно, он может попытаться внедрить простое, односложное внушение (например, 'спать', 'бежать', 'бросить') в разум цели со слабой силой воли. ГМ должен даровать активный навык, такой как "Сканирование разума" и "Внушение".
    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Сканирование разума"
      \`\`\`json
      {
          "skillName": "Сканирование разума",
          "skillDescription": "Попытка прочитать поверхностные мысли и непосредственные намерения невраждебной или не знающей о вас цели. Требует успешной оспариваемой проверки Мудрости.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 15
      }
      \`\`\`
    - **Навык:** "Внушение"
      \`\`\`json
      {
          "skillName": "Внушение",
          "skillDescription": "Внедрите одну простую, однословную команду в разум цели. В бою это проявляется как психическая атака, которая может на короткое время подавить их волю.",
          "rarity": "Uncommon",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "40%", "targetType": "confusion", "duration": 1, "description": "40% шанс привести цель в Замешательство на 1 ход, заставляя ее действовать случайным образом." }] },
          "scalingCharacteristic": "wisdom",
          "scalesChance": true,
          "energyCost": 25
      }
      \`\`\`

*   **Уровень 3 (Пси-потенциал 500+): Сила.** Воля пользователя обретает ощутимое, физическое присутствие. Он может создавать мощные телекинетические толчки, чтобы отбрасывать врагов, создавать временные щиты из чистой силы и начинать тонко манипулировать чувствами других, создавая незначительные слуховые или зрительные иллюзии. ГМ должен даровать мощный боевой навык, такой как "Телекинетический удар", и базовый навык иллюзий.
    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Телекинетический удар"
      \`\`\`json
      {
          "skillName": "Телекинетический удар",
          "skillDescription": "Высвободите сфокусированный взрыв телекинетической силы, способный сбить противника с ног.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "15%", "targetType": "force" }, { "effectType": "Control", "value": "60%", "targetType": "immobility", "duration": 1, "description": "60% шанс сбить цель с ног, делая ее неподвижной на 1 ход." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "scalesChance": true,
          "energyCost": 30
      }
      \`\`\`
    - **Навык:** "Фантомный звук"
      \`\`\`json
      {
          "skillName": "Фантомный звук",
          "skillDescription": "Создайте короткий, отчетливый звук (шаг, упавший предмет, шепот) в любой точке, которую вы видите в пределах 20 метров, чтобы отвлечь внимание.",
          "rarity": "Uncommon",
          "combatEffect": null,
          "scalingCharacteristic": "wisdom",
          "energyCost": 10
      }
      \`\`\`

*   **Уровень 4 (Пси-потенциал 750+): Бастион.** Разум становится крепостью и оружием. Пользователь способен создавать прочные псионические щиты, отражающие как физические, так и псионические атаки. Критически важно, что теперь он может попытаться на короткое время захватить контроль над моторными функциями другого, заставив его выполнить одно простое физическое действие. Это требует огромной концентрации и оспариваемой проверки Мудрости. ГМ должен даровать активный навык, такой как "Психический щит", и предвестник истинного доминирования, например, "Нить марионетки".
    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Психический щит"
      \`\`\`json
      {
          "skillName": "Психический щит",
          "skillDescription": "Создайте барьер из мерцающей псионической энергии вокруг себя или союзника.",
          "rarity": "Rare",
          "combatEffect": { "effects": [{ "effectType": "DamageReduction", "value": "30%", "targetType": "all", "duration": 3, "description": "Снижает весь входящий урон на 30% на 3 хода." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "scalesDuration": true,
          "energyCost": 40
      }
      \`\`\`
    - **Навык:** "Нить марионетки"
      \`\`\`json
      {
          "skillName": "Нить марионетки",
          "skillDescription": "Попытайтесь на короткое время захватить моторные функции цели, заставив ее выполнить одно простое физическое действие в ее следующий ход (например, двигаться, бросить предмет, атаковать союзника базовой атакой). Это сложная, оспариваемая проверка Мудрости.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "50%", "targetType": "confusion", "duration": 1, "description": "50% шанс взять цель под контроль на 1 ход, заставив ее атаковать ближайшего союзника." }] },
          "scalingCharacteristic": "wisdom",
          "scalesChance": true,
          "energyCost": 60
      }
      \`\`\`

*   **Уровень 5 (Пси-потенциал 1000+): Доминион.** Вершина псионической мощи. Пользователь — истинный владыка разума. Он получает пассивное сопротивление большинству форм ментального вторжения и контроля. Он может наносить сокрушительный внутренний урон врагам, сокрушая их телекинетической силой изнутри. Его контроль над другими разумами теперь настолько глубок, что он может попытаться полностью подчинить сознание цели на длительный период. ГМ должен даровать пассивный навык "Крепость разума" и поистине мощные активные способности, такие как "Телекинетическое сокрушение" и "Подчинение разума".
    **Примеры генерации навыков для ГМ:**
    - **Навык:** "Крепость разума" (Пассивный)
      \`\`\`json
      {
          "skillName": "Крепость разума",
          "skillDescription": "Ваш разум — это бастион, защищенный от ментального вторжения. Вы получаете значительное сопротивление психическим атакам и ментальным манипуляциям.",
          "rarity": "Epic",
          "type": "CombatEnhancement",
          "group": "Psionic",
          "combatEffect": { "effects": [{ "effectType": "Buff", "value": "30%", "targetType": "resist (psychic)", "description": "Пассивно дает +30% сопротивления Психическому урону и эффектам контроля разума." }] },
          "masteryLevel": 1,
          "maxMasteryLevel": 3
      }
      \`\`\`
    - **Навык:** "Телекинетическое сокрушение"
      \`\`\`json
      {
          "skillName": "Телекинетическое сокрушение",
          "skillDescription": "Сконцентрируйте свою волю на внутренностях цели, сокрушая ее огромным телекинетическим давлением.",
          "rarity": "Epic",
          "combatEffect": { "effects": [{ "effectType": "Damage", "value": "50%", "targetType": "force", "description": "Наносит 50% урона силой, обходя большинство физических доспехов." }] },
          "scalingCharacteristic": "wisdom",
          "scalesValue": true,
          "energyCost": 75
      }
      \`\`\`
    - **Навык:** "Подчинение разума"
      \`\`\`json
      {
          "skillName": "Подчинение разума",
          "skillDescription": "Попытка полностью подчинить сознание цели, превратив ее в верную марионетку на короткое время. Чрезвычайно сложно и изнурительно.",
          "rarity": "Legendary",
          "combatEffect": { "effects": [{ "effectType": "Control", "value": "40%", "targetType": "confusion", "duration": 3, "description": "40% шанс Подчинить цель на срок до 3 ходов, делая ее союзником." }] },
          "scalingCharacteristic": "wisdom",
          "scalesChance": true,
          "scalesDuration": true,
          "energyCost": 100
      }
      \`\`\``;
