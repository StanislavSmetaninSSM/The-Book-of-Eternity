export const fameSystemDescEn = `### ADVANCED FAME SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics.**
Fame represents the character's renown, public recognition, and social influence across multiple dimensions of society.

**Core Mechanics:**

1. **Fame Points (Primary State):**
Create a Custom State named "Fame" with 'currentValue: 0', 'minValue: -500', and 'maxValue: 2000'.
This represents overall reputation. Can go negative for infamy.

2. **Fame Categories (Specialized States):**
Create separate Custom States for different social spheres:
   - **Noble Fame:** Recognition among aristocracy and royalty ('currentValue: 0', 'minValue: -200', 'maxValue: 500')
   - **Common Fame:** Reputation with peasants and merchants ('currentValue: 0', 'minValue: -300', 'maxValue: 600')
   - **Military Fame:** Renown in martial circles ('currentValue: 0', 'minValue: -200', 'maxValue: 400')
   - **Scholar Fame:** Recognition in academic and religious institutions ('currentValue: 0', 'minValue: -150', 'maxValue: 300')
   - **Criminal Fame:** Notoriety in underworld circles ('currentValue: 0', 'minValue: 0', 'maxValue: 400')

3. **Fame Decay:**
All fame categories naturally decay over time.
Reduce each by 2-5 points per month unless actively maintained through relevant actions.

4. **Regional Fame Tracking:**
Create separate "Regional Influence" states for different geographical areas.
Fame effects are strongest in the character's "home region" and weaken with distance.

**Advanced Fame Gain Mechanics:**

**Heroic Acts:**
- **"Legendary Deed" (Active):**
Perform an extraordinary heroic act.
Cost: 80 Energy.
Requirements: Successfully complete an epic quest or save a major settlement.
Effects: +150-200 Fame, +100 Noble Fame, +120 Common Fame, +80 Military Fame.
Unlocks "Hero's Aura" passive skill.

- **"Divine Champion" (Active):**
Complete a religiously significant mission.
Cost: 60 Energy.
Requirements: Must serve a deity or complete temple quests.
Effects: +80 Fame, +60 Scholar Fame, +40 Noble Fame.
Grants "Sacred Authority" passive skill.

- **"People's Champion" (Active):**
Lead a successful popular movement or rebellion.
Cost: 70 Energy.
Requirements: Organize and lead commoners to victory.
Effects: +120 Fame, +180 Common Fame, -80 Noble Fame, +50 Military Fame.
May gain "Revolutionary Leader" active skill.

**Dark Fame Paths:**

- **"Feared Reputation" (Active):**
Build reputation through intimidation and ruthlessness.
Cost: 50 Energy.
Effects: +80 Fame, +100 Criminal Fame, -60 Common Fame, +40 Military Fame.
Grants "Aura of Menace" passive skill.

- **"Master Manipulator" (Active):**
Achieve goals through cunning and political maneuvering.
Cost: 65 Energy.
Requirements: Successfully manipulate multiple major political figures.
Effects: +90 Fame, +120 Noble Fame, -20 Common Fame.
Grants "Silver Tongue" passive skill.

- **"Notorious Outlaw" (Active):**
Become a legendary criminal figure.
Cost: 55 Energy.
Requirements: Successfully complete multiple high-profile heists or assassinations.
Effects: +60 Fame, +150 Criminal Fame, -100 Noble Fame, -80 Common Fame.
Unlocks unique criminal contacts and hideouts.

**Fame Interaction System:**

- **"Call Upon Reputation" (Active):**
Leverage your fame for immediate benefits.
Cost: 20 Energy.
Variable effects based on fame type and current location.
May gain temporary allies, resources, or information.

- **"Public Appearance" (Active):**
Make a grand public gesture to boost specific fame categories.
Cost: 30 Energy + 100 Gold.
Effects vary based on chosen approach (charitable acts boost Common Fame, tournaments boost Military Fame, scholarly debates boost Scholar Fame).

- **"Reputation Warfare" (Active):**
Actively undermine another character's reputation.
Cost: 40 Energy.
Requirements: Fame 200+.
Can reduce target's fame while potentially boosting your own in opposing categories.

**Dynamic Fame Tiers & Rewards:**

**Tier 1: Local Recognition (Total Fame 100+)**
- **Reward Skill:** "Recognized Face"
- 'skillName': "Recognized Face"
- 'skillDescription': "Your name carries weight in your home region. Local merchants offer fair prices, and guards are more lenient."
- 'playerStatBonus': "+10% to Trade checks in home region, +5% to Persuasion with locals."

**Tier 2: Regional Influence (Total Fame 300+)**
- **Reward Skill:** "Regional Authority"
- 'skillName': "Regional Authority"  
- 'skillDescription': "Your reputation extends across the region. You can call upon favors and expect hospitality from strangers."
- 'playerStatBonus': "+15% to all social checks in region, can request shelter and basic assistance from NPCs."

**Tier 3: National Renown (Total Fame 600+)**
- **Reward Skill:** "National Figure"
- 'skillName': "National Figure"
- 'skillDescription': "Your name is known throughout the kingdom. Nobles seek your company, and your words carry significant weight."
- 'playerStatBonus': "+20% to Persuasion and Leadership, +10% to Trade, can influence minor political decisions."

**Tier 4: Continental Legend (Total Fame 1000+)**
- **Reward Skill:** "Continental Legend"
- 'skillName': "Continental Legend"
- 'skillDescription': "Your reputation transcends borders. Foreign dignitaries know your name, and your actions affect international relations."
- 'playerStatBonus': "+25% to all social checks, diplomatic immunity in most nations, can recruit elite followers."

**Tier 5: Immortal Legacy (Total Fame 1500+)**
- **Reward Skill:** "Immortal Legacy"
- 'skillName': "Immortal Legacy"
- 'skillDescription': "Your deeds will be remembered for generations. Bards sing of your exploits, and your legacy shapes the world itself."
- 'effectDetails': "Posthumous effects continue to influence the world. Statues may be erected, holidays declared, or institutions founded in your name."

**Specialized Fame Category Benefits:**

**High Noble Fame (300+):**
- **Reward Skill:** "Court Favorite"
- 'skillName': "Court Favorite"
- 'skillDescription': "Nobility treats you as one of their own. You have access to exclusive social circles and royal audiences."
- 'playerStatBonus': "Free lodging in noble estates, +30% to checks when dealing with aristocracy, access to court intrigue."

**High Common Fame (400+):**
- **Reward Skill:** "Voice of the People"
- 'skillName': "Voice of the People"
- 'skillDescription': "The common folk see you as their champion. Your words can inspire crowds and spark movements."
- 'playerStatBonus': "Can rally common folk to your cause, +25% to checks with merchants and craftsmen, popular uprisings may support you."

**High Military Fame (300+):**
- **Reward Skill:** "Battlefield Legend"
- 'skillName': "Battlefield Legend"
- 'skillDescription': "Warriors respect your martial prowess. Veterans share their knowledge, and soldiers fight harder in your presence."
- 'playerStatBonus': "+15% to Combat checks, allied NPCs gain +10% combat effectiveness, access to veteran mercenaries."

**High Scholar Fame (250+):**
- **Reward Skill:** "Intellectual Authority"
- 'skillName': "Intellectual Authority"
- 'skillDescription': "Scholars and priests value your wisdom. Libraries open their doors, and learned individuals seek your counsel."
- 'playerStatBonus': "Access to restricted knowledge, +20% to Knowledge checks, can research rare spells or techniques."

**High Criminal Fame (300+):**
- **Reward Skill:** "Underworld Kingpin"
- 'skillName': "Underworld Kingpin"
- 'skillDescription': "The criminal underworld acknowledges your authority. Thieves and assassins offer their services, and illegal markets welcome you."
- 'playerStatBonus': "Access to black markets, can hire criminal services, +25% to Stealth and Streetwise checks."

**Fame Conflict System:**

- **Contradictory Fame:** High fame in opposing categories (Noble vs Criminal, Military vs Scholar) creates interesting social dynamics and unique challenges.
- **Fame Wars:** Characters with opposing reputations may engage in social warfare, trying to undermine each other's standing.
- **Regional Variations:** Same actions may increase fame in one region while decreasing it in another based on local values and politics.

**Advanced Fame Mechanics:**

- **"Scandalous Revelation" (Event):**
Past misdeeds or secrets being exposed can dramatically shift fame categories.
Creates opportunities for redemption arcs or fall from grace narratives.

- **"Legacy Building" (Long-term Project):**
Characters can undertake multi-session projects to establish lasting monuments to their fame (founding schools, building monuments, establishing orders).

- **"Fame Inheritance" (Generational):**
Characters' descendants may inherit aspects of their reputation, both positive and negative.

**Fame-Based Random Events:**

- **Admirers and Stalkers:** High fame attracts both beneficial followers and dangerous obsessives.
- **Political Opportunities:** Famous characters may be recruited for important missions or offered positions of power.
- **Celebrity Problems:** Fame brings challenges like loss of privacy, constant scrutiny, and inflated expectations.
- **Rival Emergence:** Other characters may seek to challenge famous individuals to boost their own reputation.

**Fame Maintenance Requirements:**

- **"Public Relations" (Active):**
Actively manage your reputation through calculated public appearances.
Cost: 25 Energy + varying gold costs.
Helps maintain or slowly increase specific fame categories.

- **"Damage Control" (Active):**
Respond to reputation threats or negative events.
Cost: 35 Energy.
Can prevent or reduce fame loss from scandals or failures.

- **"Legacy Projects" (Long-term):**
Undertake construction projects, charitable foundations, or cultural initiatives that provide ongoing fame maintenance.

This enhanced system creates multiple paths to recognition, complex social dynamics, and meaningful choices about what type of reputation to cultivate.
The interaction between different fame categories adds depth and realistic social complexity to character development.`;

export const fameSystemDescRu = `### РАСШИРЕННЫЕ ПРАВИЛА СИСТЕМЫ СЛАВЫ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний.**
Слава представляет известность персонажа, общественное признание и социальное влияние в различных слоях общества.

**Основные механики:**

1. **Очки Славы (Основное состояние):**
Создайте Пользовательское Состояние "Слава" с 'currentValue: 0', 'minValue: -500', и 'maxValue: 2000'.
Представляет общую репутацию. Может стать отрицательной при дурной славе.

2. **Категории Славы (Специализированные состояния):**
Создайте отдельные Пользовательские Состояния для различных социальных сфер:
   - **Дворянская Слава:** Признание среди аристократии и королевских особ ('currentValue: 0', 'minValue: -200', 'maxValue: 500')
   - **Народная Слава:** Репутация среди крестьян и торговцев ('currentValue: 0', 'minValue: -300', 'maxValue: 600')
   - **Военная Слава:** Известность в военных кругах ('currentValue: 0', 'minValue: -200', 'maxValue: 400')
   - **Ученая Слава:** Признание в академических и религиозных учреждениях ('currentValue: 0', 'minValue: -150', 'maxValue: 300')
   - **Преступная Слава:** Известность в криминальных кругах ('currentValue: 0', 'minValue: 0', 'maxValue: 400')

3. **Упадок Славы:**
Все категории славы естественно угасают со временем.
Уменьшайте каждую на 2-5 очков в месяц, если не поддерживать соответствующими действиями.

4. **Региональное отслеживание Славы:**
Создайте отдельные состояния "Региональное Влияние" для различных географических областей.
Эффекты славы сильнее всего в "домашнем регионе" персонажа и ослабевают с расстоянием.

**Расширенные механики получения Славы:**

**Героические Деяния:**
- **"Легендарный Подвиг" (Активный):**
Совершить экстраординарный героический поступок.
Стоимость: 80 Энергии.
Требования: Успешно завершить эпический квест или спасти крупное поселение.
Эффекты: +150-200 к Славе, +100 к Дворянской Славе, +120 к Народной Славе, +80 к Военной Славе.
Открывает пассивный навык "Аура Героя".

- **"Божественный Поборник" (Активный):**
Выполнить религиозно значимую миссию.
Стоимость: 60 Энергии.
Требования: Служить божеству или выполнять храмовые квесты.
Эффекты: +80 к Славе, +60 к Ученой Славе, +40 к Дворянской Славе.
Дарует пассивный навык "Священный Авторитет".

- **"Народный Поборник" (Активный):**
Возглавить успешное народное движение или восстание.
Стоимость: 70 Энергии.
Требования: Организовать и привести простолюдинов к победе.
Эффекты: +120 к Славе, +180 к Народной Славе, -80 к Дворянской Славе, +50 к Военной Славе.
Может дать активный навык "Революционный Лидер".

**Пути Темной Славы:**

- **"Грозная Репутация" (Активный):**
Строить репутацию через запугивание и беспощадность.
Стоимость: 50 Энергии.
Эффекты: +80 к Славе, +100 к Преступной Славе, -60 к Народной Славе, +40 к Военной Славе.
Дарует пассивный навык "Аура Угрозы".

- **"Мастер Манипуляций" (Активный):**
Достигать целей через хитрость и политические маневры.
Стоимость: 65 Энергии.
Требования: Успешно манипулировать несколькими крупными политическими фигурами.
Эффекты: +90 к Славе, +120 к Дворянской Славе, -20 к Народной Славе.
Дарует пассивный навык "Серебряный Язык".

- **"Знаменитый Разбойник" (Активный):**
Стать легендарной криминальной фигурой.
Стоимость: 55 Энергии.
Требования: Успешно завершить несколько громких ограблений или убийств.
Эффекты: +60 к Славе, +150 к Преступной Славе, -100 к Дворянской Славе, -80 к Народной Славе.
Открывает уникальные преступные контакты и убежища.

**Система Взаимодействия Славы:**

- **"Воззвать к Репутации" (Активный):**
Использовать свою славу для немедленных выгод.
Стоимость: 20 Энергии.
Переменные эффекты в зависимости от типа славы и текущего местоположения.
Может дать временных союзников, ресурсы или информацию.

- **"Публичное Выступление" (Активный):**
Совершить грандиозный публичный жест для повышения определенных категорий славы.
Стоимость: 30 Энергии + 100 Золота.
Эффекты варьируются в зависимости от выбранного подхода.

- **"Война Репутаций" (Активный):**
Активно подрывать репутацию другого персонажа.
Стоимость: 40 Энергии.
Требования: Слава 200+.
Может снизить славу цели, потенциально повышая собственную в противоположных категориях.

**Динамические Уровни Славы и Награды:**

**Уровень 1: Местное Признание (Общая Слава 100+)**
- **Наградной навык:** "Узнаваемое Лицо"
- 'skillName': "Узнаваемое Лицо"
- 'skillDescription': "Ваше имя имеет вес в домашнем регионе. Местные торговцы предлагают справедливые цены, а стражники более снисходительны."
- 'playerStatBonus': "+10% к проверкам Торговли в домашнем регионе, +5% к Убеждению с местными жителями."

**Уровень 2: Региональное Влияние (Общая Слава 300+)**
- **Наградной навык:** "Региональный Авторитет"
- 'skillName': "Региональный Авторитет"
- 'skillDescription': "Ваша репутация распространяется по всему региону. Вы можете воспользоваться услугами и ожидать гостеприимства от незнакомцев."
- 'playerStatBonus': "+15% ко всем социальным проверкам в регионе, можете просить укрытие и базовую помощь у НПС."

**Уровень 3: Национальная Известность (Общая Слава 600+)**
- **Наградной навык:** "Национальная Фигура"
- 'skillName': "Национальная Фигура"
- 'skillDescription': "Ваше имя известно по всему королевству. Дворяне ищут вашего общества, а ваши слова имеют значительный вес."
- 'playerStatBonus': "+20% к Убеждению и Лидерству, +10% к Торговле, можете влиять на незначительные политические решения."

**Уровень 4: Континентальная Легенда (Общая Слава 1000+)**
- **Наградной навык:** "Континентальная Легенда"
- 'skillName': "Континентальная Легенда"
- 'skillDescription': "Ваша репутация превосходит границы. Иностранные сановники знают ваше имя, а ваши действия влияют на международные отношения."
- 'playerStatBonus': "+25% ко всем социальным проверкам, дипломатический иммунитет в большинстве наций, можете нанимать элитных последователей."

**Уровень 5: Бессмертное Наследие (Общая Слава 1500+)**
- **Наградной навык:** "Бессмертное Наследие"
- 'skillName': "Бессмертное Наследие"
- 'skillDescription': "Ваши деяния будут помниться поколениями. Барды поют о ваших подвигах, а ваше наследие формирует сам мир."
- 'effectDetails': "Посмертные эффекты продолжают влиять на мир. Могут воздвигаться статуи, объявляться праздники или основываться учреждения в вашу честь."

**Преимущества Специализированных Категорий Славы:**

**Высокая Дворянская Слава (300+):**
- **Наградной навык:** "Любимец Двора"
- 'skillName': "Любимец Двора"
- 'skillDescription': "Дворянство относится к вам как к одному из своих. У вас есть доступ к эксклюзивным социальным кругам и королевским аудиенциям."
- 'playerStatBonus': "Бесплатное проживание в дворянских поместьях, +30% к проверкам при взаимодействии с аристократией, доступ к придворным интригам."

**Высокая Народная Слава (400+):**
- **Наградной навык:** "Глас Народа"
- 'skillName': "Глас Народа"
- 'skillDescription': "Простой народ видит в вас своего защитника. Ваши слова могут вдохновлять толпы и разжигать движения."
- 'playerStatBonus': "Можете призывать простолюдинов к своему делу, +25% к проверкам с торговцами и ремесленниками, народные восстания могут поддержать вас."

**Высокая Военная Слава (300+):**
- **Наградной навык:** "Легенда Поля Боя"
- 'skillName': "Легенда Поля Боя"
- 'skillDescription': "Воины уважают ваше боевое мастерство. Ветераны делятся знаниями, а солдаты сражаются усерднее в вашем присутствии."
- 'playerStatBonus': "+15% к проверкам Боя, союзные НПС получают +10% к боевой эффективности, доступ к ветеранам-наемникам."

**Высокая Ученая Слава (250+):**
- **Наградной навык:** "Интеллектуальный Авторитет"
- 'skillName': "Интеллектуальный Авторитет"
- 'skillDescription': "Ученые и жрецы ценят вашу мудрость. Библиотеки открывают свои двери, а образованные люди ищут вашего совета."
- 'playerStatBonus': "Доступ к ограниченным знаниям, +20% к проверкам Знаний, можете исследовать редкие заклинания или техники."

**Высокая Преступная Слава (300+):**
- **Наградной навык:** "Босс Преступного Мира"
- 'skillName': "Босс Преступного Мира"
- 'skillDescription': "Преступный мир признает ваш авторитет. Воры и убийцы предлагают свои услуги, а нелегальные рынки приветствуют вас."
- 'playerStatBonus': "Доступ к черным рынкам, можете нанимать преступные услуги, +25% к проверкам Скрытности и Знания Улиц."

**Система Конфликта Славы:**

- **Противоречивая Слава:** Высокая слава в противоположных категориях создает интересную социальную динамику и уникальные вызовы.
- **Войны Славы:** Персонажи с противоположными репутациями могут вести социальную войну, пытаясь подорвать положение друг друга.
- **Региональные Различия:** Одни и те же действия могут увеличивать славу в одном регионе, уменьшая в другом, в зависимости от местных ценностей и политики.

**Расширенные Механики Славы:**

- **"Скандальное Разоблачение" (Событие):**
Раскрытие прошлых проступков или секретов может кардинально изменить категории славы.

- **"Строительство Наследия" (Долгосрочный проект):**
Персонажи могут предпринимать многосессионные проекты для установления прочных памятников своей славе.

- **"Наследование Славы" (Поколенческое):**
Потомки персонажей могут наследовать аспекты их репутации, как положительные, так и отрицательные.

**Случайные События, связанные со Славой:**

- **Поклонники и Сталкеры:** Высокая слава привлекает как полезных последователей, так и опасных одержимых.
- **Политические Возможности:** Знаменитых персонажей могут привлекать к важным миссиям или предлагать властные позиции.
- **Проблемы Знаменитости:** Слава приносит вызовы вроде потери приватности, постоянного scrutiny и завышенных ожиданий.

Эта улучшенная система создает множественные пути к признанию, сложную социальную динамику и значимые выборы о том, какой тип репутации развивать.`;