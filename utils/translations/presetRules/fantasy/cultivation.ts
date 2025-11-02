export const cultivationSystemDescEn = `### ENHANCED CULTIVATION SYSTEM RULES ###
**GM, you MUST implement this system using the Custom State mechanics for progression.**
A cultivator's journey is tracked through multiple interconnected states that create a complex web of growth, corruption, and enlightenment.

**Core Mechanics:**

1. **Cultivation (Primary Progression):**
Create Custom State "Cultivation" with 'currentValue: 0', 'minValue: 0', 'maxValue: 2000+'.
Increases through meditation (+5-15), absorbing Qi (+10-25), consuming pills (+20-50), comprehending Daos (+30-80), surviving tribulations (+100-200).

2. **Dao Comprehension (Enlightenment Path):**
Create "Dao Understanding" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Represents philosophical and spiritual insights. Choose a primary Dao (Sword, Fire, Death, Life, Time, Space, etc.).
Different Daos unlock unique abilities and affect personality.

3. **Qi Purity (Quality Metric):**
Create "Qi Refinement" with 'currentValue: 50', 'minValue: 0', 'maxValue: 100'.
Higher purity multiplies power but makes advancement slower.
Decreases with rushed cultivation (-10), impure resources (-5), demonic methods (-20).
Increases with patient refinement (+2-5), pure resources (+5-10), righteous techniques (+3-8).

4. **Heart Demon Corruption (Psychological State):**
Create "Inner Demons" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Accumulates from negative emotions, cruel acts, forbidden techniques, or traumatic experiences.
At 200+: occasional loss of control. At 500+: personality changes.
At 800+: risk of qi deviation and soul destruction.

5. **Karma Balance (Cosmic Standing):**
Create "Heavenly Karma" with 'currentValue: 0', 'minValue: -1000', 'maxValue: 1000'.
Positive karma from good deeds eases tribulations.
Negative karma attracts divine punishment, makes enemies stronger, and blocks certain opportunities.

6. **Tribulation Countdown (Divine Opposition):**
Create "Tribulation Timer" that decreases as cultivation increases.
When it reaches 0, character must face Heavenly Tribulation - a potentially deadly test that can destroy or greatly empower them.

**Dao Path Specializations:**

**Sword Dao Path:**
- **Core Philosophy:** "Cut through all obstacles with unwavering will"
- **Personality Changes:** Becomes more decisive, direct, sometimes ruthlessly pragmatic
- **Unique Mechanics:** Sword Dao cultivators gain "Sword Heart" state - emotional clarity that increases attack precision but reduces empathy
- **Special Resources:** Sword Intent, Killing Intent, Weapon Spirits
- **Tribulation Type:** Blade Tribulation - weapons of pure lightning test combat mastery

**Fire Dao Path:**
- **Core Philosophy:** "Burn away impurities to reveal true essence"
- **Personality Changes:** More passionate, quick to anger, charismatic but volatile
- **Unique Mechanics:** "Flame Heart" state - emotional intensity that boosts power but risks burning out relationships
- **Special Resources:** Divine Flames, Phoenix Blood, Solar Essence
- **Tribulation Type:** Inferno Tribulation - seas of heavenly fire test purification mastery

**Death Dao Path:**
- **Core Philosophy:** "Understanding ending leads to true beginning"
- **Personality Changes:** Becomes contemplative, detached from mortal concerns, eerily calm
- **Unique Mechanics:** "Death Sight" - can see lifespans and death omens, but constant exposure to mortality damages psyche
- **Special Resources:** Soul Essence, Yin Energy, Spectral Materials
- **Tribulation Type:** Soul Tribulation - attacks on the spirit itself test understanding of existence

**Life Dao Path:**
- **Core Philosophy:** "Nurture all things to achieve cosmic harmony"
- **Personality Changes:** More empathetic, protective, sometimes naively optimistic
- **Unique Mechanics:** "Life Force Resonance" - can heal and strengthen others but takes on their pain
- **Special Resources:** Vitality Essence, Spring Water of Life, Growth Catalysts
- **Tribulation Type:** Vitality Tribulation - must maintain life in increasingly harsh conditions

**Time Dao Path:**
- **Core Philosophy:** "Past, present, and future are illusions to transcend"
- **Personality Changes:** Becomes prophetic, speaks cryptically, detached from immediate concerns
- **Unique Mechanics:** "Temporal Perception" - glimpses of possible futures, but each vision ages the cultivator
- **Special Resources:** Temporal Crystals, Chronos Herbs, Paradox Stones
- **Tribulation Type:** Temporal Tribulation - fractured timelines test causality comprehension

**Space Dao Path:**
- **Core Philosophy:** "Distance and barriers exist only in limited minds"
- **Personality Changes:** More versatile, adaptable, sometimes feels disconnected from reality
- **Unique Mechanics:** "Spatial Sense" - perceive hidden dimensions and pocket realms
- **Special Resources:** Void Crystals, Dimensional Anchors, Folded Space Materials
- **Tribulation Type:** Dimensional Tribulation - reality warping tests spatial mastery

**Cultivation Stages with Branching Paths:**

**Stage 1 (Cultivation 100+): Qi Awakening**
- **Universal Unlock:** "Spiritual Sense" (Passive)
{
    "skillName": "Spiritual Sense",
    "skillDescription": "Your consciousness expands beyond physical limits, allowing perception of Qi flows and spiritual presences within a growing radius.",
    "rarity": "Common",
    "type": "Utility",
    "effectDetails": "Detect cultivators, spiritual beasts, treasures, and formation arrays. Range increases with cultivation level."
}

**Stage 2 (Cultivation 250+): Foundation Laying**
Choose specialization path. Each grants different abilities:

- **Sword Path:** "Blade Qi Projection" - Launch cutting energy attacks
- **Fire Path:** "Flame Manipulation" - Control and generate various fires
- **Death Path:** "Soul Gaze" - Detect lies, see spiritual injuries, cause fear
- **Life Path:** "Healing Palm" - Restore health and cure basic ailments
- **Time Path:** "Moment's Insight" - Brief glimpses of immediate future combat moves
- **Space Path:** "Short Blink" - Instant short-distance teleportation

**Stage 3 (Cultivation 500+): Core Formation**
Dao-specific core types with unique properties:

- **Golden Core (Sword/Fire):** Explosive power, high combat effectiveness
- **Yin Core (Death):** Stealth abilities, resistance to mental attacks
- **Yang Core (Life):** Regeneration, immunity to most poisons/diseases
- **Prismatic Core (Time):** Temporal manipulation, aging resistance
- **Void Core (Space):** Dimensional storage, phase abilities

**Advanced Path Mechanics:**

**Dual Cultivation Paths:**
- Characters can attempt to merge compatible Daos (Fire+Life=Phoenix Path, Sword+Space=Void Blade Path)
- Incompatible combinations (Life+Death, Time+Space) create dangerous instabilities
- Successful fusion grants legendary powers but risks catastrophic failure

**Forbidden Techniques:**
- **Blood Cultivation:** Rapidly increase power by sacrificing others (+200 Cultivation, +100 Inner Demons, -300 Karma)
- **Soul Devouring:** Steal cultivation from defeated enemies (+50-150 Cultivation, +150 Inner Demons, curses from victims)
- **Demonic Transformation:** Embrace corruption for immediate power (+300 Cultivation, +500 Inner Demons, changes appearance)

**Righteous Techniques:**
- **Merit Accumulation:** Slow but safe growth through good deeds (+10-30 Cultivation,+50 Karma)
- **Tribulation Sharing:** Help others survive tribulations (+20-50 Cultivation, +100 Karma, shared risk)
- **Dao Teaching:** Enlighten junior cultivators (+15-40 Cultivation, +75 Karma, creates loyal followers)

**Sectarian Politics System:**

**Sect Reputation States:**
Create separate reputation states for different organizations:
- **Righteous Alliance Standing**
- **Demonic Cult Influence**
- **Imperial Court Favor**
- **Mercantile Guild Relations**
- **Wanderer Network Connections**

**Sect-Specific Benefits:**
- **Orthodox Sects:** Access to pure techniques, protection from tribulations, moral restrictions
- **Demonic Cults:** Powerful forbidden arts, corruption acceleration, constant conflict
- **Imperial Forces:** Political power, resource access, duty obligations
- **Merchant Networks:** Rare materials, information, financial costs

**Dynamic Opposition System:**

**Heavenly Tribulations (Scaling Challenges):**
- **Minor Tribulation (Cultivation 300+):** 3 waves of lightning, tests basic mastery
- **Major Tribulation (Cultivation 600+):** 6 waves plus elemental attacks, tests Dao comprehension
- **Divine Tribulation (Cultivation 1000+):** 9 waves plus reality distortions, tests worthiness for immortality
- **Karmic Tribulation (Variable):** Difficulty scales with negative karma, past victims may manifest

**Rival Cultivator Systems:**
- **Dao Rivals:** NPCs following conflicting paths naturally oppose the character
- **Resource Competition:** Limited cultivation materials create conflict
- **Generational Grudges:** Actions affect relationships with entire bloodlines and sects

**Advanced Resource Management:**

**Cultivation Resources:**
- **Spirit Stones:** Basic currency, energy source for techniques
- **Dao Crystals:** Rare items that enhance specific path comprehension
- **Heavenly Materials:** Components for powerful artifacts and breakthrough aids
- **Pill Recipes:** Knowledge to create cultivation-enhancing medicines

**Alchemical Complexity:**
- **Ingredient Quality:** Higher grade materials create better pills but risk explosive failure
- **Pill Tribulations:** Powerful concoctions attract heavenly attention
- **Addiction Mechanics:** Excessive pill use creates dependency and reduces natural cultivation speed

**Artifact Crafting System:**
- **Weapon Spirits:** Powerful items develop consciousness and personality
- **Formation Arrays:** Environmental modifications that enhance cultivation or provide defense
- **Spatial Treasures:** Portable storage and hidden realms

**Psychological Transformation Mechanics:**

**Dao Heart Evolution:**
- **Initial State:** Normal human emotions and limitations
- **Enlightened State:** Reduced emotional volatility, enhanced focus
- **Transcendent State:** Near-emotionless perfection, risk of losing humanity
- **Dao Madness:** Complete obsession with path leads to inhuman behavior

**Longevity Consequences:**
- **Century Mark:** Begin losing connection to mortal concerns
- **Millennium:** Difficulty relating to short-lived beings
- **Ten Millennia:** Risk of complete detachment from all relationships

**Social Relationship Dynamics:**

**Cultivation Level Barriers:**
- Higher realm cultivators struggle torelate to lower realms
- Massive power gaps make meaningful relationships difficult
- Junior cultivators may worship or fear powerful seniors

**Mortal Integration Challenges:**
- Growing power creates physical and social distance from normal humans
- Moral frameworks shift as lifespan and power increase
- Responsibility for protecting or ruling mortal populations

**Unique Victory Conditions:**

**Immortal Ascension Paths:**
- **Righteous Immortal:** Achieve immortality through virtue and wisdom
- **Demon Lord:** Conquer through power and fear
- **Sage Emperor:** Rule vast territories with cultivation-backed authority
- **Wandering Master:** Achieve freedom from all worldly attachments
- **Dao Ancestor:** Become the embodiment of a fundamental force

**Failure States:**
- **Qi Deviation:** Cultivation goes wrong, causing death or permanent damage
- **Heart Demon Victory:** Inner corruption overwhelms the cultivator's true self
- **Divine Punishment:** Negative karma triggers unstoppable heavenly retribution
- **Soul Destruction:** Complete erasure from existence for the most severe violations

**Master-Disciple Relationship Mechanics:**

**Teaching Benefits:**
- Masters gain cultivation progress by successfully guiding students
- Disciples provide karma through grateful service
- Shared tribulations can be survived through mutual support

**Betrayal Consequences:**
- Killing one's master creates massive negative karma
- Abandoning disciples without cause generates heart demons
- Sectarian conflicts may force impossible loyalty choices

Thisenhanced system creates a rich web of meaningful choices where every decision affects multiple progression tracks, creating emergent storytelling through mechanical consequences.`;

export const cultivationSystemDescRu = `### УСОВЕРШЕНСТВОВАННАЯ СИСТЕМА КУЛЬТИВАЦИИ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для прогрессии.**
Путешествие культиватора отслеживается через множество взаимосвязанных состояний, создающих сложную сеть роста, порчи и просветления.

**Основные механики:**

1. **Культивация (Основная прогрессия):**
Создайте Пользовательское Состояние "Культивация" с 'currentValue: 0', 'minValue: 0', 'maxValue: 2000+'.
Увеличивается через медитацию (+5-15), поглощение Ци (+10-25), употребление пилюль (+20-50), постижение Дао (+30-80), выживание в испытаниях (+100-200).

2. **Постижение Дао (Путь Просветления):**
Создайте "Понимание Дао" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Представляет философские и духовные прозрения. Выберите основное Дао (Меч, Огонь, Смерть, Жизнь, Время, Пространство и т.д.).
Разные Дао открывают уникальные способности и влияют на личность.

3. **Чистота Ци (Метрика качества):**
Создайте "Очищение Ци" с 'currentValue: 50', 'minValue: 0', 'maxValue: 100'.
Высшая чистота умножает силу, но замедляет продвижение. Уменьшается от поспешной культивации (-10), нечистых ресурсов (-5), демонических методов (-20).
Увеличивается от терпеливого совершенствования (+2-5), чистых ресурсов (+5-10), праведных техник (+3-8).

4. **Порча Сердечных Демонов (Психологическое состояние):**
Создайте "Внутренние Демоны" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Накапливается от негативных эмоций, жестоких поступков, запретных техник или травматических переживаний.
При 200+: случайная потеря контроля.
При 500+: изменения личности.
При 800+: риск отклонения ци и разрушения души.

5. **Баланс Кармы (Космическое положение):**
Создайте "Небесная Карма" с 'currentValue: 0', 'minValue: -1000', 'maxValue: 1000'.
Позитивная карма от добрых дел облегчает испытания.
Негативная карма привлекает божественное наказание, усиливает врагов и блокирует определенные возможности.

6. **Обратный отсчет Испытания (Божественное противодействие):**
Создайте "Таймер Испытания", который уменьшается по мере роста культивации.
Когда он достигает 0, персонаж должен пройти Небесное Испытание - потенциально смертельный тест, который может уничтожить или значительно усилить его.

**Специализации Пути Дао:**

**Путь Дао Меча:**
- **Основная философия:** "Прорубай все препятствия непоколебимой волей"
- **Изменения личности:** Становится более решительным, прямым, иногда беспощадно прагматичным
- **Уникальные механики:** Культиваторы Дао Меча получают состояние "Сердце Меча" - эмоциональная ясность, увеличивающая точность атак, но снижающая эмпатию
- **Специальные ресурсы:** Намерение Меча, Намерение Убийства, Духи Оружия
- **Тип Испытания:** Испытание Клинка - оружие из чистых молний тестирует мастерство боя

**Путь Дао Огня:**
- **Основная философия:** "Сжигай примеси, чтобы раскрыть истинную сущность"
- **Изменения личности:** Более страстный, быстро гневающийся, харизматичный, но неустойчивый
- **Уникальные механики:** Состояние "Сердце Пламени" - эмоциональная интенсивность, усиливающая силу, но рискующая сжечь отношения
- **Специальные ресурсы:** Божественные Пламена, Кровь Феникса, Солнечная Эссенция
- **Тип Испытания:** Испытание Инферно - моря небесного огня тестируют мастерство очищения

**Путь Дао Смерти:**
- **Основная философия:** "Понимание конца ведет к истинному началу"
- **Изменения личности:** Становится созерцательным, отстраненным от смертных забот, жутко спокойным
- **Уникальные механики:** "Зрение Смерти" - может видеть продолжительность жизни и предзнаменования смерти, но постоянное воздействие смертности повреждает психику
- **Специальные ресурсы:** Эссенция Души, Энергия Инь, Призрачные Материалы
- **Тип Испытания:** Испытание Души - атаки на сам дух тестируют понимание существования

**Путь Дао Жизни:**
- **Основная философия:** "Взращивай все сущее для достижения космическойгармонии"
- **Изменения личности:** Более эмпатичный, защищающий, иногда наивно оптимистичный
- **Уникальные механики:** "Резонанс Жизненной Силы" - может исцелять и укреплять других, но принимает на себя их боль
- **Специальные ресурсы:** Эссенция Жизненности, Родниковая Вода Жизни, Катализаторы Роста
- **Тип Испытания:** Испытание Жизненности - должен поддерживать жизнь во все более суровых условиях

**Путь Дао Времени:**
- **Основная философия:** "Прошлое, настоящее и будущее - иллюзии для превосхождения"
- **Изменения личности:** Становится пророческим, говорит загадочно, отстранен от непосредственных забот
- **Уникальные механики:** "Временное Восприятие" - проблески возможных будущих, но каждое видение старит культиватора
- **Специальные ресурсы:** Временные Кристаллы, Травы Хроноса, Камни Парадокса
- **Тип Испытания:** Временное Испытание - расколотые временные линии тестируют понимание причинности

**Путь Дао Пространства:**
- **Основная философия:** "Расстояние и барьеры существуют только в ограниченных умах"
- **Изменения личности:** Более универсальный, адаптивный, иногда чувствует отключенность от реальности
- **Уникальные механики:** "Пространственное Чувство" - восприятие скрытых измерений и карманных миров
- **Специальные ресурсы:** Кристаллы Пустоты, Измерительные Якоря, Материалы Сложенного Пространства
- **Тип Испытания:** Размерное Испытание - искажение реальности тестирует мастерство пространства

**Стадии Культивации с Разветвляющимися Путями:**

**Стадия 1 (Культивация 100+): Пробуждение Ци**
- **Универсальная разблокировка:** "Духовное Чувство" (Пассивная)
{
    "skillName": "Духовное Чувство",
    "skillDescription": "Ваше сознание расширяется за физические пределы, позволяя воспринимать потоки Ци и духовные присутствия в растущем радиусе.",
    "rarity": "Common",
    "type": "Utility",
    "effectDetails": "Обнаружение культиваторов, духовных зверей, сокровищ и формационных массивов. Дальность увеличивается с уровнем культивации."
}

**Стадия 2 (Культивация 250+): Закладка Основы**
Выберите путь специализации. Каждый дарует разные способности:

- **Путь Меча:** "Проекция Ци Клинка" - Запуск режущих энергетических атак
- **Путь Огня:** "Манипуляция Пламенем" - Контроль и генерация различных огней
- **Путь Смерти:** "Взгляд Души" - Обнаружение лжи, видение духовных ран, наведение страха
- **Путь Жизни:** "Ладонь Исцеления" - Восстановление здоровья и лечение базовых недугов
- **Путь Времени:** "Прозрение Мгновения" - Краткие проблески ближайших боевых движений будущего
- **Путь Пространства:** "Короткий Прыжок" - Мгновенная телепортация на короткие дистанции

**Стадия 3 (Культивация 500+): Формирование Ядра**
Типы ядер, специфичные для Дао, с уникальными свойствами:

- **Золотое Ядро (Меч/Огонь):** Взрывная сила, высокая боевая эффективность
- **Ядро Инь (Смерть):** Способности скрытности, сопротивление ментальным атакам
- **Ядро Ян (Жизнь):** Регенерация, иммунитет к большинству ядов/болезней
- **Призматическое Ядро (Время):** Временная манипуляция, сопротивление старению
- **Ядро Пустоты (Пространство):** Размерное хранилище, фазовые способности

**Продвинутые Механики Пути:**

**Двойные Пути Культивации:**
- Персонажи могут попытаться слить совместимые Дао (Огонь+Жизнь=Путь Феникса, Меч+Пространство=Путь Клинка Пустоты)
- Несовместимые комбинации (Жизнь+Смерть, Время+Пространство) создают опасные нестабильности
- Успешное слияние дарует легендарные силы, но рискует катастрофической неудачей

**Запретные Техники:**
- **Культивация Крови:** Быстро увеличить силу, жертвуя другими (+200 Культивации, +100 Внутренних Демонов, -300 Кармы)
- **Пожирание Души:** Красть культивацию у побежденных врагов (+50-150 Культивации, +150 Внутренних Демонов, проклятия жертв)
- **Демоническое Преобразование:** Принять порчу ради немедленной силы (+300 Культивации, +500 Внутренних Демонов, изменение внешности)

**Праведные Техники:**
- **Накопление Заслуг:** Медленный, но безопасный рост через добрые дела (+10-30 Культивации, +50 Кармы)
- **Разделение Испытаний:** Помощь другим в выживании испытаний (+20-50 Культивации, +100 Кармы, разделенный риск)
- **Обучение Дао:** Просвещение младших культиваторов (+15-40 Культивации, +75 Кармы, создание верных последователей)

**Система Сектантской Политики:**

**Состояния Репутации Секты:**
Создайте отдельные состояния репутации для разных организаций:
- **Положение в Праведном Альянсе**
- **Влияние в Демоническом Культе**
- **Благосклонность Имперского Двора**
- **Отношения с Торговой Гильдией**
- **Связи Сети Странников**

**Преимущества, Специфичные для Секты:**
- **Ортодоксальные Секты:** Доступ к чистым техникам, защита от испытаний, моральные ограничения
- **Демонические Культы:** Мощные запретные искусства, ускорение порчи, постоянный конфликт
- **Имперские Силы:** Политическая власть, доступ к ресурсам, обязательства долга
- **Торговые Сети:** Редкие материалы, информация, финансовые затраты

**Система Динамического Противодействия:**

**Небесные Испытания (Масштабируемые Вызовы):**
- **Малое Испытание (Культивация 300+):** 3 волны молний, тестирует базовое мастерство
- **Большое Испытание (Культивация 600+):** 6 волн плюс стихийные атаки, тестирует понимание Дао
- **Божественное Испытание (Культивация 1000+):** 9 волн плюс искажения реальности, тестирует достойность бессмертия
- **Кармическое Испытание (Переменная):** Сложность масштабируется с негативной кармой, прошлые жертвы могут проявиться

**Системы Соперничающих Культиваторов:**
- **Соперники Дао:** НПС, следующие конфликтующим путям, естественно противостоят персонажу
- **Конкуренция за Ресурсы:** Ограниченные материалы культивации создают конфликт
- **Поколенческие Обиды:** Действия влияют на отношения с целыми родословными и сектами

**Продвинутое Управление Ресурсами:**

**Ресурсы Культивации:**
- **Камни Духа:** Базовая валюта, источник энергии для техник
- **Кристаллы Дао:** Редкие предметы, усиливающие понимание конкретного пути
- **Небесные Материалы:** Компоненты для мощных артефактов и помощников прорыва
- **Рецепты Пилюль:** Знания для создания лекарств, усиливающих культивацию

**Алхимическая Сложность:**
- **Качество Ингредиентов:** Материалы высшего сорта создают лучшие пилюли, но рискуют взрывной неудачей
- **Испытания Пилюль:** Мощные отвары привлекают небесное внимание
- **Механики Зависимости:** Чрезмерное использование пилюль создает зависимость и снижает естественную скорость культивации

**Система Создания Артефактов:**
- **Духи Оружия:** Мощные предметы развивают сознание и личность
- **Формационные Массивы:** Модификации окружающей среды, усиливающие культивацию или обеспечивающие защиту
- **Пространственные Сокровища:** Портативное хранилище и скрытые миры

**Механики Психологического Преобразования:**

**Эволюция Сердца Дао:**
- **Начальное Состояние:** Нормальные человеческие эмоции и ограничения
- **Просвещенное Состояние:** Сниженная эмоциональная неустойчивость, усиленная концентрация
- **Трансцендентное Состояние:** Почти безэмоциональное совершенство, риск потери человечности
- **Безумие Дао:** Полная одержимость путем ведет к нечеловеческому поведению

**Последствия Долголетия:**
- **Столетняя Отметка:** Начинает терять связь со смертными заботами
- **Тысячелетие:** Трудности в отношениях с короткоживущими существами
- **Десять Тысячелетий:** Риск полной отстраненности от всех отношений

**Динамика Социальных Отношений:**

**Барьеры Уровня Культивации:**
- Культиваторы высших миров с трудом относятся к низшим мирам
- Огромные разрывы в силе делают значимые отношения трудными
- Младшие культиваторы могут поклоняться или бояться могущественных старших

**Вызовы Интеграции Смертных:**
- Растущая сила создает физическую и социальную дистанцию от обычных людей
- Моральные рамки смещаются по мере увеличения продолжительности жизни и силы
- Ответственность за защиту или правление смертными популяциями

**Уникальные Условия Победы:**

**Пути Восхождения к Бессмертию:**
- **Праведный Бессмертный:** Достичь бессмертия через добродетель и мудрость
- **Повелитель Демонов:** Завоевать через силу и страх
- **Император-Мудрец:** Править обширными территориями с опорой на культивацию
- **Странствующий Мастер:** Достичь свободы от всех мирских привязанностей
- **Предок Дао:** Стать воплощением фундаментальной силы

**Состояния Неудачи:**
- **Отклонение Ци:** Культивация идет неправильно, вызывая смерть или постоянный ущерб
- **Победа Сердечного Демона:** Внутренняя порча подавляет истинное "я" культиватора
- **Божественное Наказание:** Негативная карма вызывает неостановимое небесное возмездие
- **Разрушение Души:** Полное стирание из существования за самые серьезные нарушения

**Механики Отношений Учитель-Ученик:**

**Преимущества Обучения:**
- Мастера получают прогресс культивации, успешно направляя учеников
- Ученики обеспечивают карму через благодарное служение
- Разделенные испытания могут быть пройдены через взаимную поддержку

**Последствия Предательства:**
- Убийство своего учителя создает огромную негативную карму
- Оставление учеников без причины генерирует сердечных демонов
- Сектантские конфликты могут заставить делать невозможный выбор лояльности

Эта усовершенствованная система создает богатую сеть значимых выборов, где каждое решение влияет на множественные треки прогрессии, создавая эмергентное повествование через механические последствия.`;
