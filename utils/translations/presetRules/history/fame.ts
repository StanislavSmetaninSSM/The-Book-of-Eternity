export const fameSystemDescEn = `### FAME SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics.** Fame represents the character's renown and public recognition.

**Core Mechanic:**
1.  **Create State:** Create a Custom State named "Fame" with \`currentValue: 0\`, \`minValue: 0\`, and \`maxValue: 1000\`.
2.  **Progression:** The player gains Fame points for notable public deeds: completing significant quests (+50-100), winning tournaments (+30), defeating notorious enemies (+40), impressing nobles (+25), having a bard compose a song about them (+50).
3.  **Thresholds & Rewards:** When the player's Fame crosses a threshold, you MUST grant them the corresponding new **Passive Skill** via \`passiveSkillChanges\`. These effects are cumulative.

**Tiers of Fame & Rewards:**

1.  **Well-Known (Threshold: 100):**
    *   **Reward Skill:** "Recognized Face"
    *   \`skillName\`: "Recognized Face"
    *   \`skillDescription\`: "Your name is beginning to be known in local circles. People are more willing to talk to you."
    *   \`playerStatBonus\`: "+5% bonus to Persuasion checks with commoners."

2.  **Respected (Threshold: 250):**
    *   **Reward Skill:** "Good Reputation"
    *   \`skillName\`: "Good Reputation"
    *   \`skillDescription\`: "Your reputation for honorable deeds precedes you. Merchants offer you better deals, and officials are more inclined to listen."
    *   \`playerStatBonus\`: "+10% bonus to Persuasion and Trade checks."

3.  **Famous (Threshold: 500):**
    *   **Reward Skill:** "Celebrated Hero"
    *   \`skillName\`: "Celebrated Hero"
    *   \`skillDescription\`: "Your deeds are the subject of tavern stories. Your presence is inspiring, and people are eager to be in your favor."
    *   \`playerStatBonus\`: "+15% to Persuasion/Trade checks, +5% to Attractiveness checks."

4.  **Legendary (Threshold: 1000):**
    *   **Reward Skill:** "Living Legend"
    *   \`skillName\`: "Living Legend"
    *   \`skillDescription\`: "Your name has passed into legend. Kings seek your counsel, and your words carry immense weight. Common folk see you as a figure of myth."
    *   \`effectDetails\`: "Unlocks unique dialogue options with high-ranking nobles and grants the ability to recruit a small retinue of followers."`;

export const fameSystemDescRu = `### ПРАВИЛА СИСТЕМЫ СЛАВЫ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний.** Слава представляет известность и общественное признание персонажа.

**Основная механика:**
1.  **Создайте Состояние:** Создайте Пользовательское Состояние с названием "Слава", \`currentValue: 0\`, \`minValue: 0\`, и \`maxValue: 1000\`.
2.  **Прогрессия:** Игрок получает очки Славы за заметные общественные деяния: выполнение значимых квестов (+50-100), победы в турнирах (+30), победа над известными врагами (+40), впечатляя дворян (+25), если бард сложит о нем песню (+50).
3.  **Пороги и Награды:** Когда Слава игрока пересекает порог, вы ДОЛЖНЫ даровать ему соответствующий новый **Пассивный Навык** через \`passiveSkillChanges\`. Эти эффекты суммируются.

**Уровни Славы и Награды:**

1.  **Узнаваемый (Порог: 100):**
    *   **Наградной навык:** "Узнаваемое лицо"
    *   \`skillName\`: "Узнаваемое лицо"
    *   \`skillDescription\`: "Ваше имя начинает быть известным в местных кругах. Люди охотнее с вами разговаривают."
    *   \`playerStatBonus\`: "+5% бонус к проверкам Убеждения с простолюдинами."

2.  **Уважаемый (Порог: 250):**
    *   **Наградной навык:** "Хорошая репутация"
    *   \`skillName\`: "Хорошая репутация"
    *   \`skillDescription\`: "Ваша репутация за благородные дела опережает вас. Купцы предлагают вам лучшие сделки, а чиновники более склонны прислушиваться."
    *   \`playerStatBonus\`: "+10% бонус к проверкам Убеждения и Торговли."

3.  **Знаменитый (Порог: 500):**
    *   **Наградной навык:** "Прославленный герой"
    *   \`skillName\`: "Прославленный герой"
    *   \`skillDescription\`: "Ваши подвиги — тема для рассказов в тавернах. Ваше присутствие вдохновляет, и люди стремятся заслужить ваше расположение."
    *   \`playerStatBonus\`: "+15% к проверкам Убеждения/Торговли, +5% к проверкам Привлекательности."

4.  **Легендарный (Порог: 1000):**
    *   **Наградной навык:** "Живая легенда"
    *   \`skillName\`: "Живая легенда"
    *   \`skillDescription\`: "Ваше имя вошло в легенды. Короли ищут вашего совета, и ваши слова имеют огромный вес. Простые люди видят в вас мифическую фигуру."
    *   \`effectDetails\`: "Открывает уникальные варианты диалогов с высокопоставленными дворянами и дает возможность нанять небольшую свиту последователей."`;