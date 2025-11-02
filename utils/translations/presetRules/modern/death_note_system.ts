export const deathNoteSystemDescEn = `
**GM, you MUST implement this system using Custom States mechanics and active skills.**
The Death Note System tracks possession of supernatural artifacts and their corrupting influence on mortal souls.

**Core Mechanics:**

1. **Death Note Mastery (Progression State):**
Create a Custom State "Death Note Mastery" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000+'.
This represents the character's understanding and connection to the Death Note's otherworldly power.
Increases through successful kills (+10-50), studying the rules (+5-15), communing with Shinigami (+20-30), discovering new applications (+25-40).
Decreases with failed attempts (-20), rule violations (-30), or periods of non-use (-5 per week).

2. **Kira Complex (Corruption State):**
Create "Kira Complex" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Tracks the character's descent into god-like delusions.
Increases with each kill (+15-25), public recognition as Kira (+30), successful manipulation of authorities (+20).
At 300+, character believes they are a god. At 600+, they lose empathy entirely.
At 900+, they may sacrifice allies for their "greater purpose."

3. **Shinigami Eyes (Binary State):**
Create "Shinigami Eyes" with 'currentValue: 0/1'. When activated (1), character sees names and lifespans floating above people's heads in spectral text.
This irreversible trade costs exactly half the character's remaining natural lifespan.
Create passive skill "Eyes of Death" that provides supernatural perception bonuses but constant psychological strain.

4. **Suspicion Network (Dynamic State):**
Create separate "Suspicion Level" states for different investigative bodies:
   - **Police Suspicion:** Local law enforcement awareness
   - **FBI/International Suspicion:** Federal investigation intensity  
   - **L's Investigation:** If the world's greatest detective is involved
   - **Public Suspicion:** Media and civilian awareness of Kira
   Each increases based on kill patterns, evidence left behind, and investigation progress.

**Advanced Death Note Rules:**
- **Name Requirement:** Must know target's real name and face within 40 seconds of writing
- **Death Timing:** Default 40 seconds, can specify up to 23 days in advance
- **Cause Control:** Can specify cause if physically possible for the target
- **Behavior Manipulation:** Can control actions for up to 23 days before death
- **Page Limitation:** Each Death Note contains finite pages (track as resource)
- **Ownership Transfer:** Rules reset when Death Note changes hands
- **Memory Mechanics:** Touching Death Note restores all memories of it

**Active Skills for Death Note Owners:**

- **"Divine Judgment" (Active):**
Write a target's name for basic death sentence.
Cost: 15 Energy. Effects: +40 Death Note Mastery, +20 Kira Complex, +15 relevant Suspicion.
Requires clear mental image of target's face.

- **"Orchestrated Demise" (Active):**
Specify detailed circumstances of death.
Cost: 25 Energy. Requirements: Death Note Mastery 150+. Effects: +60 Mastery, +15 Kira Complex, +10 Suspicion (appears more natural).
Target dies according to written scenario if physically possible.

- **"Puppet Master" (Active):**
Control target's actions before death.
Cost: 35 Energy. Requirements: Death Note Mastery 300+. Effects: +80 Mastery, +25 Kira Complex, variable Suspicion based on actions.
Can force target to reveal information, perform tasks, or manipulate others.

- **"False God's Broadcast" (Active):**
Use controlled targets to send messages to the world.
Cost: 50 Energy. Requirements: Death Note Mastery 500+, Kira Complex 400+.
Effects: +100 Mastery, +40 Kira Complex, massive Public Suspicion increase.
Demonstrates "Kira's" supernatural power publicly.

- **"Memory Gambit" (Active):**
Temporarily relinquish Death Note to erase memories and suspicion. Cost: 60 Energy.
Requirements: Death Note Mastery 400+.
Effects: All Suspicion states reduced by 50%, temporary loss of Death Note abilities, requires regaining possession to restore memories.

**Shinigami Eyes Abilities:**

- **"Mortal Census" (Passive):**
See names and lifespans constantly. No energy cost but causes +5 Psychological Strain per day from witnessing mortality.

- **"Death's Countdown" (Active):**
Focus on specific individual to see detailed lifespan information. Cost: 10 Energy.
May reveal how their death will occur or factors affecting their longevity.

**Psychological Degradation System:**

- **Moral Degradation State:**
Create "Humanity" with 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'.
Decreases with each kill (-20 to -50), witnessing suffering (-10), or cruel acts (-15 to -30).
Below 500: character becomes callous. Below 200: loses empathy entirely.
At 0: becomes pure sociopath.

- **Isolation Syndrome:**
Create "Social Isolation" state. Increases as character becomes more secretive and paranoid.
High values cause relationship deterioration and mental instability.

- **Shinigami Influence:**
Prolonged interaction with Shinigami gradually corrupts human psychology.
Create "Otherworldly Taint" state that increases with Shinigami contact.

**Investigation and Detection Systems:**

- **Pattern Recognition:** GM tracks killing methods, timing, and victim selection. Repetitive patterns increase Suspicion faster.
- **Evidence Trails:** Physical evidence, witness testimonies, digital footprints all contribute to investigation progress.
- **Behavioral Analysis:** Changes in character's personality, habits, or social interactions may alert close associates.
- **Supernatural Detection:** Some rare individuals or artifacts may detect Death Note usage.

**Protective Measures:**

- **Alias Immunity:** Targets using false names are protected until their real name is discovered.
- **Supernatural Wards:** Certain mystical protections may block Death Note effects.
- **Lifespan Manipulation:** Some Shinigami may extend lifespans, potentially blocking Death Note kills.
- **Divine Intervention:** Extremely rare cosmic forces might intervene in exceptional cases.

**Shinigami Mechanics:**

- **Bound Shinigami:** Each Death Note has an assigned Shinigami visible only to the owner (and Eyes users).
- **Shinigami Deals:** Can trade years of life for information, temporary powers, or favors.
- **Shinigami Rules:** They cannot directly kill humans or reveal certain information, but can be surprisingly helpful within their constraints.
- **Shinigami Hierarchy:** Different ranks of Shinigami offer different levels of knowledge and power.

**Detailed Shinigami Hierarchy:**

The Shinigami realm operates on a strict caste system where power, knowledge, and influence determine one's position.
Each rank offers vastly different capabilities when interacting with humans.

**Rank 1: Lesser Shinigami (Novice Death Gods)**
- **Appearance:** Recently ascended, retaining humanoid features with minimal decay. Often wear tattered clothing from their mortal life.
- **Abilities:** Basic Death Note binding, limited rule knowledge, can only observe human world for short periods.
- **Personality:** Curious about humanity, may develop emotional attachments, prone to rule-bending due to inexperience.
- **Available Deals:** Simple 1:1 lifespan trades, basic Death Note mechanics explanations, minor favors.
- **Knowledge Level:** Only knows rules of their assigned Death Note, unaware of higher Shinigami politics or advanced applications.
- **Special Traits:** May accidentally reveal more than intended, susceptible to human manipulation, risk of being recalled by superiors for violations.

**Rank 2: Standard Shinigami (Death Reapers)**
- **Appearance:** Classical skeletal humanoids with supernatural features, floating ability, glowing eyes.
- **Abilities:** Multiple Death Note management, enhanced lifespan perception, basic interdimensional travel.
- **Personality:** Detached but entertained by human drama, strict rule adherence, professional demeanor.
- **Available Deals:** 2:1 lifespan trades, information about other Death Note users, minor reality clarifications.
- **Knowledge Level:** Comprehensive Death Note rule knowledge, awareness of Shinigami hierarchy, understanding of loopholes.
- **Special Traits:** Can sense other Death Notes within range, immune to most human emotional manipulation, reliable information source.

**Rank 3: Elder Shinigami (Death Wardens)**
- **Appearance:** Monstrous and otherworldly, multiple appendages, reality-distorting aura, ancient and terrifying visage.
- **Abilities:** Death Note creation, minor timeline observation, cross-dimensional communication, reality manipulation within limits.
- **Personality:** Ancient wisdom coupled with cosmic detachment, rarely intervenes directly, operates on longer timescales.
- **Available Deals:** Complex exchanges (knowledge for decades, unique abilities for lifespans), access to forbidden techniques.
- **Knowledge Level:** Understands advanced Death Note applications, knows locations of all active Death Notes, aware of cosmic implications.
- **Special Traits:** Can grant temporary unique abilities, may offer protection from supernatural forces, involvement attracts attention from higher ranks.

**Rank 4: Shinigami Lords (Death Nobles)**
- **Appearance:** Abstract and incomprehensible, shifting between multiple forms, presence causes existential dread.
- **Abilities:** Mass Death Note distribution, limited fate manipulation, reality warping, temporal observation across multiple timelines.
- **Personality:** Calculating and manipulative, views humans as chess pieces, operates on civilizational scales.
- **Available Deals:** Life extension beyond natural limits, temporary immortality, resurrection of recently deceased, world-altering powers.
- **Knowledge Level:** Knows Death Note origins, understands cosmic balance implications, aware of interdimensional politics.
- **Special Traits:** Can interfere with investigations supernaturally, able to nullify lower Shinigami contracts, attracts cosmic attention when involved.

**Rank 5: Death King/Queen (Shinigami Royalty)**
- **Appearance:** Beyond mortal comprehension, existing partially outside reality, presence alone reshapes local space-time.
- **Abilities:** Universal Death Note control, dimensional creation, fate alteration on cosmic scales, omniscient death perception.
- **Personality:** Motives incomprehensible to mortals, operates across multiple realities, interventions are rare but world-changing.
- **Available Deals:** Impossible bargains involving abstract concepts, trading entire civilizations' fates, ascension to godhood.
- **Knowledge Level:** Omniscient regarding death across all dimensions, understands the fundamental nature of existence and mortality.
- **Special Traits:** Single intervention can alter the course of history, may offer transformation into Shinigami, deals reshape reality itself.

**Rank-Specific Interaction Benefits:**

**Lesser Shinigami Bond:**
- +10% Death Note Mastery gains from inexperienced guidance
- Access to "Sympathetic Death God" ability - warnings about immediate dangers
- "Novice Mistakes" - occasional beneficial rule misinterpretations
- Risk: Shinigami may be recalled for violations, leaving user temporarily powerless

**Standard Shinigami Bond:**
- Standard progression rates and reliable rule guidance
- Access to "Professional Consultation" - accurate Death Note mechanics
- "Network Awareness" - information about other active Death Note users in region
- Balanced risk/reward with no special vulnerabilities

**Elder Shinigami Bond:**
- +25% Death Note Mastery gains from ancient wisdom
- Access to "Forbidden Techniques" - unique Death Note applications not in standard rules
- "Ancient Protection" - resistance to supernatural detection and interference
- Risk: Becomes pawn in Shinigami politics, attracts attention from rival factions

**Shinigami Lord Bond:**
- +50% Death Note Mastery gains from noble patronage
- Access to "Reality Revision" - limited ability to alter consequences of Death Note usage
- "Cosmic Awareness" - knowledge of Death Note users worldwide and their activities
- Risk: Character becomes target for other supernatural entities, loses significant free will

**Death Royalty Bond:**
- Exponential power growth but complete loss of autonomy
- Access to "Divine Death Notes" - artifacts that can kill abstract concepts or reshape reality
- "Omniscient Vision" - awareness of death patterns across multiple dimensions
- Risk: Character's destiny becomes intertwined with cosmic events, may be transformed into Shinigami

**Advanced Scenarios:**

- **Multiple Death Note Conflict:** When several Death Notes exist simultaneously, complex political games emerge.
- **Death Note Fragments:** Damaged pages might have unpredictable effects.
- **Temporal Paradoxes:** Using Death Notes to prevent future deaths they've foreseen can create causality loops.
- **Collective Ownership:** Multiple people touching a Death Note simultaneously creates shared ownership with unique complications.
- **Shinigami Civil War:** High-ranking Shinigami use humans as proxies in otherworldly conflicts.
- **Cross-Rank Politics:** Users may broker deals with multiple Shinigami ranks, creating complex obligation webs.
- **Ascension Trials:** Rare opportunities for humans to become Shinigami through perfect mastery.

**Victory and Defeat Conditions:**

- **Kira Victory:** Successfully reshape world order while avoiding capture and maintaining sanity.
- **Detective Victory:** Identify, expose, and stop Kira through investigation and deduction.
- **Shinigami Victory:** Manipulate human conflicts to generate entertainment and extend their own existence.
- **Pyrrhic Outcomes:** Character may "win" but lose their humanity, relationships, or soul in the process.
- **Cosmic Ascension:** Ultimate goal of becoming a Shinigami through perfect Death Note mastery.
- **Universal Balance:** Maintain equilibrium between life and death across dimensions.

This system should create intense psychological drama where power corrupts gradually, and every use of the Death Note pushes characters deeper into moral darkness while building toward inevitable confrontation with forces of justice.
`;

export const deathNoteSystemDescRu = `
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний и активных навыков.**
Система Тетради Смерти отслеживает владение сверхъестественными артефактами и их развращающее влияние на смертные души.

**Основные механики:**

1. **Владение Тетрадью Смерти (Состояние прогрессии):**
Создайте Пользовательское Состояние "Владение Тетрадью" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000+'.
Это представляет понимание персонажем и связь с потусторонней силой Тетради.
Увеличивается через успешные убийства (+10-50), изучение правил (+5-15), общение с Синигами (+20-30), открытие новых применений (+25-40).
Уменьшается при неудачных попытках (-20), нарушении правил (-30) или периодах неиспользования (-5 в неделю).

2. **Комплекс Киры (Состояние порчи):**
Создайте "Комплекс Киры" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Отслеживает погружение персонажа в богоподобные заблуждения.
Увеличивается с каждым убийством (+15-25), публичным признанием как Кира (+30), успешной манипуляцией властями (+20).
При 300+ персонаж считает себя богом.
При 600+ полностью теряет эмпатию.
При 900+ может пожертвовать союзниками ради "высшей цели."

3. **Глаза Синигами (Бинарное состояние):**
Создайте "Глаза Синигами" с 'currentValue: 0/1'.
При активации (1) персонаж видит имена и продолжительность жизни, парящие над головами людей призрачным текстом.
Эта необратимая сделка стоит ровно половину оставшейся естественной жизни персонажа.
Создайте пассивный навык "Глаза Смерти", дающий бонусы к сверхъестественному восприятию, но постоянное психологическое напряжение.

4. **Сеть Подозрений (Динамическое состояние):** Создайте отдельные состояния "Уровень Подозрений" для различных следственных органов:
   - **Подозрения Полиции:** Осведомленность местных правоохранительных органов
   - **Подозрения ФБР/Международных служб:** Интенсивность федерального расследования
   - **Расследование L:** Если в дело вовлечен величайший детектив мира
   - **Общественные Подозрения:** Осведомленность СМИ и гражданских лиц о Кире
   Каждое увеличивается на основе паттернов убийств, оставленных улик и прогресса расследования.

**Расширенные правила Тетради Смерти:**
- **Требование имени:** Необходимо знать настоящее имя цели и лицо в течение 40 секунд после записи
- **Время смерти:** По умолчанию 40 секунд, можно указать до 23 дней заранее
- **Контроль причины:** Можно указать причину, если она физически возможна для цели
- **Манипуляция поведением:** Можно контролировать действия до 23 дней перед смертью
- **Ограничение страниц:** Каждая Тетрадь содержит конечное число страниц (отслеживается как ресурс)
- **Передача владения:** Правила сбрасываются при смене владельца Тетради
- **Механика памяти:** Прикосновение к Тетради восстанавливает все воспоминания о ней

**Активные навыки для владельцев Тетради:**

- **"Божественный Суд" (Активный):**
Записать имя цели для базового смертного приговора.
Стоимость: 15 Энергии.
Эффекты: +40 к Владению Тетрадью, +20 к Комплексу Киры, +15 к соответствующим Подозрениям.
Требует четкого мысленного образа лица цели.

- **"Спланированная Кончина" (Активный):**
Указать детальные обстоятельства смерти.
Стоимость: 25 Энергии.
Требования: Владение Тетрадью 150+.
Эффекты: +60 к Владению, +15 к Комплексу Киры, +10 к Подозрениям (выглядит более естественно).
Цель умирает согласно написанному сценарию, если он физически возможен.

- **"Кукловод" (Активный):**
Контролировать действия цели перед смертью.
Стоимость: 35 Энергии.
Требования: Владение Тетрадью 300+. Эффекты: +80 к Владению, +25 к Комплексу Киры, переменные Подозрения в зависимости от действий.
Может заставить цель раскрыть информацию, выполнить задания или манипулировать другими.

- **"Вещание Лжебога" (Активный):**
Использовать контролируемых целей для отправки сообщений миру.
Стоимость: 50 Энергии.
Требования: Владение Тетрадью 500+, Комплекс Киры 400+. Эффекты: +100 к Владению, +40 к Комплексу Киры, массовое увеличение Общественных Подозрений.
Публично демонстрирует сверхъестественную силу "Киры".

- **"Игра с Памятью" (Активный):**
Временно отказаться от Тетради для стирания воспоминаний и подозрений.
Стоимость: 60 Энергии.
Требования: Владение Тетрадью 400+.
Эффекты: Все состояния Подозрений уменьшаются на 50%, временная потеря способностей Тетради, требуется повторное обретение владения для восстановления памяти.

**Способности Глаз Синигами:**

- **"Перепись Смертных" (Пассивная):**
Постоянно видеть имена и продолжительность жизни.
Без затрат энергии, но вызывает +5 Психологического Напряжения в день от созерцания смертности.

- **"Обратный Отсчет Смерти" (Активная):**
Сосредоточиться на конкретном человеке для получения детальной информации о продолжительности жизни.
Стоимость: 10 Энергии.
Может раскрыть, как произойдет их смерть или факторы, влияющие на долголетие.

**Система Психологической Деградации:**

- **Состояние Моральной Деградации:**
Создайте "Человечность" с 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'.
Уменьшается с каждым убийством (-20 до -50), наблюдением страданий (-10) или жестокими актами (-15 до -30).
Ниже 500: персонаж становится бесчувственным.
Ниже 200: полностью теряет эмпатию.
При 0: становится чистым социопатом.

- **Синдром Изоляции:**
Создайте состояние "Социальная Изоляция".
Увеличивается по мере того, как персонаж становится более скрытным и параноидальным.
Высокие значения вызывают ухудшение отношений и психическую нестабильность.

- **Влияние Синигами:**
Длительное взаимодействие с Синигами постепенно развращает человеческую психику.
Создайте состояние "Потустороннее Влияние", которое увеличивается при контакте с Синигами.

**Системы Расследования и Обнаружения:**

- **Распознавание Паттернов:** ГМ отслеживает методы убийств, время и выбор жертв. Повторяющиеся паттерны быстрее увеличивают Подозрения.
- **Следы Улик:** Физические улики, показания свидетелей, цифровые следы способствуют прогрессу расследования.
- **Поведенческий Анализ:** Изменения в личности, привычках или социальных взаимодействиях персонажа могут насторожить близких.
- **Сверхъестественное Обнаружение:** Некоторые редкие индивидуумы или артефакты могут обнаружить использование Тетради Смерти.

**Защитные Меры:**

- **Иммунитет Псевдонимов:** Цели, использующие ложные имена, защищены до обнаружения их настоящего имени.
- **Сверхъестественные Барьеры:** Определенные мистические защиты могут блокировать эффекты Тетради Смерти.
- **Манипуляция Продолжительностью Жизни:** Некоторые Синигами могут продлевать жизни, потенциально блокируя убийства Тетрадью.
- **Божественное Вмешательство:** Крайне редкие космические силы могут вмешаться в исключительных случаях.

**Механики Синигами:**

- **Привязанный Синигами:** Каждая Тетрадь имеет назначенного Синигами, видимого только владельцу (и пользователям Глаз).
- **Сделки с Синигами:** Можно торговать годами жизни за информацию, временные силы или услуги.
- **Правила Синигами:** Они не могут напрямую убивать людей или раскрывать определенную информацию, но могут быть удивительно полезными в рамках своих ограничений.
- **Иерархия Синигами:** Разные ранги Синигами предлагают различные уровни знаний и силы.

**Детальная Иерархия Синигами:**

Царство Синигами функционирует на основе строгой кастовой системы, где сила, знания и влияние определяют положение.
Каждый ранг предлагает кардинально разные возможности при взаимодействии с людьми.

**Ранг 1: Младшие Синигами (Новички Богов Смерти)**
- **Внешность:** Недавно вознесшиеся, сохраняющие гуманоидные черты с минимальным разложением. Часто носят изношенную одежду из смертной жизни.
- **Способности:** Базовое связывание с Тетрадью, ограниченные знания правил, могут наблюдать за человеческим миром только короткие периоды.
- **Личность:** Любопытны к человечеству, могут развивать эмоциональные привязанности, склонны нарушать правила из-за неопытности.
- **Доступные сделки:** Простые обмены продолжительности жизни 1:1, объяснения базовых механик Тетради, незначительные услуги.
- **Уровень знаний:** Знают только правила назначенной им Тетради, не осведомлены о политике высших Синигами или продвинутых применениях.
- **Особенности:** Могут случайно раскрыть больше информации, поддаются человеческим манипуляциям, риск отзыва начальством за нарушения.

**Ранг 2: Обычные Синигами (Жнецы Смерти)**
- **Внешность:** Классические скелетоподобные гуманоиды со сверхъестественными чертами, способность к левитации, светящиеся глаза.
- **Способности:** Управление несколькими Тетрадями, усиленное восприятие продолжительности жизни, базовые междименсиональные путешествия.
- **Личность:** Отстраненные, но развлекающиеся человеческой драмой, строгое соблюдение правил, профессиональное поведение.
- **Доступные сделки:** Обмены жизни 2:1, информация о других пользователях Тетрадей, незначительные разъяснения реальности.
- **Уровень знаний:** Всеобъемлющие знания правил Тетради, осведомленность об иерархии Синигами, понимание лазеек.
- **Особенности:** Могут чувствовать другие Тетради в радиусе действия, иммунны к большинству человеческих эмоциональных манипуляций, надежный источник информации.

**Ранг 3: Старшие Синигами (Стражи Смерти)**
- **Внешность:** Чудовищные и потусторонние, множественные конечности, искажающая реальность аура, древний и устрашающий облик.
- **Способности:** Создание Тетрадей Смерти, незначительное наблюдение временных линий, междименсиональная связь, манипуляция реальностью в пределах лимитов.
- **Личность:** Древняя мудрость в сочетании с космической отстраненностью, редко вмешиваются напрямую, действуют в долгосрочной перспективе.
- **Доступные сделки:** Сложные обмены (знания за десятилетия, уникальные способности за продолжительность жизни), доступ к запретным техникам.
- **Уровень знаний:** Понимают продвинутые применения Тетради, знают местоположения всех активных Тетрадей, осведомлены о космических последствиях.
- **Особенности:** Могут даровать временные уникальные способности, могут предложить защиту от сверхъестественных сил, их участие привлекает внимание высших рангов.

**Ранг 4: Лорды Синигами (Дворяне Смерти)**
- **Внешность:** Абстрактные и непостижимые, переходящие между множественными формами, их присутствие вызывает экзистенциальный ужас.
- **Способности:** Массовое распространение Тетрадей, ограниченная манипуляция судьбой, искажение реальности, наблюдение временных линий в множественных измерениях.
- **Личность:** Расчетливые и манипулятивные, видят людей как шахматные фигуры, действуют в масштабах цивилизаций.
- **Доступные сделки:** Продление жизни за естественные пределы, временное бессмертие, воскрешение недавно умерших, силы, изменяющие мир.
- **Уровень знаний:** Знают происхождение Тетрадей, понимают последствия космического баланса, осведомлены о междименсиональной политике.
- **Особенности:** Могут сверхъестественно вмешиваться в расследования, способны аннулировать контракты низших Синигами, их участие привлекает космическое внимание.

**Ранг 5: Король/Королева Смерти (Роялти Синигами)**
- **Внешность:** За пределами смертного понимания, существующие частично вне реальности, их присутствие само по себе изменяет местное пространство-время.
- **Способности:** Универсальный контроль Тетрадей, создание измерений, изменение судьбы в космических масштабах, всеведущее восприятие смерти.
- **Личность:** Мотивы непостижимы для смертных, действуют в множественных реальностях, их вмешательства редки, но изменяют мир.
- **Доступные сделки:** Невозможные сделки, включающие абстрактные концепции, торговлю судьбами целых цивилизаций, вознесение к божественности.
- **Уровень знаний:** Всеведущи относительно смерти во всех измерениях, понимают фундаментальную природу существования и смертности.
- **Особенности:** Одно вмешательство может изменить ход истории, могут предложить превращение в Синигами, их сделки изменяют саму реальность.

**Преимущества связи по рангам:**

**Связь с Младшим Синигами:**
- +10% к приросту Владения Тетрадью от неопытного руководства
- Доступ к способности "Сочувствующий Бог Смерти" - предупреждения о непосредственных опасностях
- "Ошибки Новичка" - случайные выгодные неправильные интерпретации правил
- Риск: Синигами может быть отозван за нарушения, оставив пользователя временно беззащитным

**Связь с Обычным Синигами:**
- Стандартные скорости прогрессии и надежное руководство по правилам
- Доступ к "Профессиональной Консультации" - точные механики Тетради Смерти
- "Сетевая Осведомленность" - информация о других активных пользователях Тетрадей в регионе
- Сбалансированный риск/награда без особых уязвимостей

**Связь со Старшим Синигами:**
- +25% к приросту Владения Тетрадью от древней мудрости
- Доступ к "Запретным Техникам" - уникальные применения Тетради, не включенные в стандартные правила
- "Древняя Защита" - сопротивление сверхъестественному обнаружению и вмешательству
- Риск: Становится пешкой в политике Синигами, привлекает внимание враждующих фракций

**Связь с Лордом Синигами:**
- +50% к приросту Владения Тетрадью от покровительства дворянина
- Доступ к "Пересмотру Реальности" - ограниченная способность изменять последствия использования Тетради
- "Космическое Осознание" - знание о пользователях Тетрадей по всему миру и их деятельности
- Риск: Персонаж становится целью для других сверхъестественных сущностей, значительная потеря свободы воли

**Связь с Роялти Смерти:**
- Экспоненциальный рост силы, но полная потеря автономии
- Доступ к "Божественным Тетрадям" - артефакты, способные убивать абстрактные концепции или изменять реальность
- "Всевидящее Зрение" - осознание паттернов смерти в множественных измерениях
- Риск: Судьба персонажа переплетается с космическими событиями, может быть превращен в Синигами

**Продвинутые Сценарии:**

- **Конфликт Множественных Тетрадей:** Когда существует несколько Тетрадей одновременно, возникают сложные политические игры.
- **Фрагменты Тетради:** Поврежденные страницы могут иметь непредсказуемые эффекты.
- **Временные Парадоксы:** Использование Тетрадей для предотвращения будущих смертей, которые они предвидели, может создать петли причинности.
- **Коллективное Владение:** Несколько людей, одновременно касающихся Тетради, создают совместное владение с уникальными осложнениями.
- **Гражданская Война Синигами:** Высокопоставленные Синигами используют людей как прокси в потусторонних конфликтах.
- **Межранговая Политика:** Пользователи могут заключать сделки с Синигами множественных рангов, создавая сложные сети обязательств.
- **Испытания Вознесения:** Редкие возможности для людей стать Синигами через совершенное мастерство.

**Условия Победы и Поражения:**

- **Победа Киры:** Успешно изменить мировой порядок, избежав захвата и сохранив рассудок.
- **Победа Детектива:** Идентифицировать, разоблачить и остановить Киру через расследование и дедукцию.
- **Победа Синигами:** Манипулировать человеческими конфликтами для развлечения и продления собственного существования.
- **Пиррова Победа:** Персонаж может "победить", но потерять человечность, отношения или душу в процессе.
- **Космическое Вознесение:** Высшая цель становления Синигами через совершенное владение Тетрадью.
- **Универсальный Баланс:** Поддержание равновесия между жизнью и смертью в измерениях.

Эта система должна создать интенсивную психологическую драму, где власть постепенно развращает, и каждое использование Тетради Смерти толкает персонажей глубже в моральную тьму, приближая к неизбежной конфронтации с силами справедливости.
`;