export const magicSystemDescEn = `### ARCANE WEAVE MANIPULATION SYSTEM ###
**GM, you MUST implement this system using Custom States mechanics for comprehensive magical progression.**
Magic in this world operates through complex interconnected forces that shape both power and consequence.
A mage's journey involves multiple parallel progressions that can enhance or corrupt their abilities.

**Core Progression States:**

1. **Arcane Attunement (Primary State):**
Create a Custom State "Arcane Attunement" with 'currentValue: 0', 'minValue: 0', 'maxValue: 2000+'.
Represents connection to magical energies.
Increases through: spell casting (+5-15), studying ancient texts (+10-25), magical meditation (+8-12), overcoming supernatural challenges (+20-50), absorbing ambient magic (+3-8).
Decreases with: failed experiments (-10-20), magical overexertion (-15), neglecting practice (-2 per week).

2. **Weave Corruption (Danger State):**
Create "Weave Corruption" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Tracks magical contamination from forbidden practices.
Increases with: dark magic usage (+20-40), forbidden rituals (+50-80), soul magic (+30-60), temporal manipulation (+25-45), necromancy (+35-70).
At 300+: physical mutations begin.
At 600+: personality alterations.
At 900+: risk of becoming an aberration.

3. **Elemental Affinity (Branching State):**
Create separate states for each element:
   - **Fire Mastery** (0-500): Passion, destruction, purification
   - **Water Mastery** (0-500): Adaptation, healing, emotional control  
   - **Earth Mastery** (0-500): Stability, protection, endurance
   - **Air Mastery** (0-500): Freedom, communication, speed
   - **Void Mastery** (0-300): Forbidden - entropy, nullification, erasure

4. **Arcane Schools (Specialization States):**
   - **Evocation Mastery** (0-400): Combat magic, raw power projection
   - **Transmutation Mastery** (0-400): Matter manipulation, alchemy
   - **Divination Mastery** (0-400): Knowledge, foresight, detection
   - **Enchantment Mastery** (0-400): Mind magic, charm, illusion
   - **Conjuration Mastery** (0-400): Summoning, teleportation, creation
   - **Necromancy Mastery** (0-300): Death magic, undead, soul manipulation

5. **Mana Resonance (Resource State):**
Create "Mana Resonance" with 'currentValue: 100', 'minValue: 50', 'maxValue: 500+'.
Represents maximum energy capacity.
Increases with: successful high-level casting (+5-15), magical conditioning (+3-8), resonance crystals (+20-40).
Decreases with: severe overexertion (-10-25), magical drain effects (-5-20).

6. **Astral Sensitivity (Perception State):**
Create "Astral Sensitivity" with 'currentValue: 0', 'minValue: 0', 'maxValue: 300'.
Ability to perceive magical phenomena.
Unlocks detection abilities and vulnerability to psychic attacks.

**Advanced Magical Phenomena:**

**Mana Burn Syndrome:** When casting beyond safe limits:
- Create "Mana Burn" temporary state (0-100)
- Causes physical pain, reduces spellcasting efficiency
- High levels risk permanent magical scarring
- Recovery requires rest and healing magic

**Arcane Overdrive:** Temporary power boost at great cost:
- Multiply spell effectiveness by 1.5-3x for single cast
- Massive energy cost (50-150% of normal)
- Guaranteed Mana Burn accumulation
- Risk of Weave Corruption increase

**Magical Specialization Paths:**

**Path of the Elementalist (Fire/Water/Earth/Air Focus):**
- **Stage 1 (Affinity 50+):** "Elemental Sight" - See elemental auras and weaknesses
- **Stage 2 (Affinity 150+):** "Primal Bond" - Communicate with elemental spirits
- **Stage 3 (Affinity 300+):** "Elemental Avatar" - Temporary elemental transformation
- **Mastery (Affinity 500+):** "Primordial Ascension" - Become a minor elemental lord

**Path of the Voidwalker (Void Focus - Dangerous):**
- **Stage 1 (Void 50+):** "Entropy Vision" - See decay, weakness, endings
- **Stage 2 (Void 150+):** "Void Step" - Short-range teleportation through nothingness  
- **Stage 3 (Void 250+):** "Reality Erasure" - Temporarily delete small objects/effects
- **WARNING:** Each Void advancement increases Weave Corruption significantly

**Path of the Battle Mage (Evocation Focus):**
- **Stage 1 (Evocation 100+):** "Combat Casting" - Maintain spells while fighting
- **Stage 2 (Evocation 200+):** "Spell Sword" - Imbue weapons with magic
- **Stage 3 (Evocation 350+):** "Arcane Artillery" - Devastating area spells
- **Mastery (Evocation 400+):** "Mage Knight Transformation" - Magical warrior form

**Path of the Transmuter (Transmutation Focus):**
- **Stage 1 (Transmutation 100+):** "Matter Sense" - Understand material composition
- **Stage 2 (Transmutation 200+):** "Alchemical Mastery" - Create magical substances
- **Stage 3 (Transmutation 350+):** "Form Shaping" - Alter living creatures temporarily
- **Mastery (Transmutation 400+):** "Reality Sculptor" - Reshape environment at will

**Path of the Oracle (Divination Focus):**
- **Stage 1 (Divination 100+):** "Mystic Insight" - Sense immediate dangers and lies
- **Stage 2 (Divination 200+):** "Temporal Glimpses" - Brief visions of possible futures
- **Stage 3 (Divination 350+):** "Akashic Reading" - Access universal knowledge briefly
- **Mastery (Divination 400+):** "Omniscient Moment" - Perfect knowledge for one question

**Path of the Enchanter (Enchantment Focus):**
- **Stage 1 (Enchantment 100+):** "Emotion Reading" - Sense feelings and motivations
- **Stage 2 (Enchantment 200+):** "Mind Palace" - Enhanced memory and mental defenses
- **Stage 3 (Enchantment 350+):** "Mass Suggestion" - Influence multiple minds
- **Mastery (Enchantment 400+):** "Reality Revision" - Alter memories and perceptions

**Path of the Summoner (Conjuration Focus):**
- **Stage 1 (Conjuration 100+):** "Planar Sense" - Detect extraplanar entities
- **Stage 2 (Conjuration 200+):** "Faithful Servant" - Permanent minor elemental companion
- **Stage 3 (Conjuration 350+):** "Portal Mastery" - Create stable dimensional gateways
- **Mastery (Conjuration 400+):** "Planar Lord" - Command powerful extraplanar beings

**Path of the Necromancer (Necromancy Focus - Corrupting):**
- **Stage 1 (Necromancy 75+):** "Death Sight" - See undead, ghosts, life force
- **Stage 2 (Necromancy 150+):** "Soul Communication" - Speak with recently deceased
- **Stage 3 (Necromancy 250+):** "Undead Mastery" - Create and command intelligent undead
- **WARNING:** Each Necromancy advancement significantly increases Weave Corruption

**Unique Magical Phenomena:**

**Mana Storms:** Random environmental events:
- Sudden surge of magical energy in area
- All spells become unpredictable (random effects)
- Opportunity for rapid Attunement gains (+50-100)
- Risk of Corruption from chaotic energies (+20-40)

**Ley Line Convergences:** Powerful magical locations:
- Drastically reduced energy costs (50-75% reduction)
- Enhanced spell effects (2x power)
- Potential for unique spell discovery
- Attracts dangerous magical creatures

**Arcane Echoes:** Magical imprints in locations:
- Learn spells cast repeatedly in area
- Experience past magical events
- Risk of absorbing old curses or blessings
- Valuable for magical archaeology

**Spell Invention System:**
When Arcane Attunement reaches 750+, characters can attempt to create original spells:
- Requires extensive research (weeks/months of game time)
- Intelligence + relevant School Mastery checks
- Success creates permanent new spell
- Failure risks Corruption or Mana Burn
- Unique spells scale with creator's advancement

**Magical Resonance Interactions:**
Multiple mages can combine powers:
- **Spell Weaving:** Combine different schools for unique effects
- **Power Circle:** Multiple casters enhance single spell exponentially
- **Harmonic Casting:** Synchronized casting for perfect efficiency
- **Dissonance Risk:** Conflicting magical styles cause dangerous feedback

**Corruption Manifestations by Level:**

**Minor Corruption (100-299):**
- Slight physical changes (eye color, hair texture)
- Occasional magical surges beyond control
- Enhanced magical senses but mundane sense dulling
- Mild personality shifts toward magical thinking

**Moderate Corruption (300-599):**
- Visible mutations (unusual skin patterns, extra fingers)
- Difficulty controlling magical emissions
- Compulsive need to use magic for simple tasks
- Alienation from non-magical individuals

**Major Corruption (600-899):**
- Significant physical transformation (scales, claws, glowing eyes)
- Magic constantly leaking from body
- Personality dominated by magical pursuits
- Painful to be near non-magical materials

**Severe Corruption (900-1000):**
- Barely human appearance, elemental/aberrant features
- Reality distorts in character's presence
- Complete loss of mortal empathy and concerns
- Risk of transformation into magical creature/force of nature

**Magical Artifacts and Tools:**

**Focusing Crystals:** Enhance specific schools
- **Ruby:** Fire magic amplification (+25% Fire damage)
- **Sapphire:** Water/healing magic enhancement
- **Emerald:** Nature/earth magic boost
- **Diamond:** Pure energy focus (general +10% effectiveness)
- **Obsidian:** Void magic enhancement (DANGEROUS: +5 Corruption per use)

**Grimoires and Tomes:**
- **Novice Codex:** Basic spell collection, +15 School Mastery
- **Master's Manual:** Advanced techniques, +30 School Mastery
- **Forbidden Grimoire:** Powerful but corrupting magic (+50 Mastery, +25 Corruption)
- **Living Tome:** Sentient spellbook that grows with wielder

**Magical Reagents and Components:**
Different spells require specific materials:
- **Common Herbs:** Basic healing and utility spells
- **Rare Minerals:** Combat and protection magic
- **Creature Parts:** Summoning and transformation
- **Temporal Fragments:** Time magic (extremely rare)
- **Soul Essence:** Necromancy (highly corrupting)

**Environmental Magical Zones:**

**High Magic Areas:**
- Spell effects enhanced
- Faster Attunement gain
- Increased random magical events
- Higher chance of magical creature encounters

**Dead Magic Zones:**
- No magic functions
- Slow Attunement decay if stayed too long
- Refuge from magical threats
- May contain unique non-magical treasures

**Wild Magic Zones:**
- All spells have random additional effects
- Chance for spell mutation into new forms
- Dangerous but potential for great discovery
- Chaotic energy surges

**Planar Touched Regions:**
- Influenced by other planes of existence
- Unique magical properties per plane
- Access to extraplanar magic
- Risk of planar entity encounters

**Advanced Character Development:**

**Magical Awakening Types:**
- **Natural Born:** Gradual power development, stable progression
- **Trauma Triggered:** Sudden awakening, initial power surge, potential instability
- **Scholarly Approach:** Book learning first, practical application second
- **Wild Awakening:** Chaotic magical exposure, unpredictable abilities
- **Inherited Power:** Family magical traditions, guided development

**Cross-School Synergies:**
Combining different magical approaches creates unique possibilities:
- **Evocation + Transmutation:** Energy shaping, matter-energy conversion
- **Divination + Enchantment:** Mind reading, memory manipulation
- **Conjuration + Necromancy:** Summoning undead, binding souls
- **Transmutation + Divination:** Perfect matter analysis, atomic manipulation

**Legendary Advancement (Attunement 1500+):**
Characters transcend normal magical limitations:
- **Spell Permanency:** Make temporary effects permanent
- **Reality Anchoring:** Stabilize chaotic magical effects
- **Planar Mastery:** Travel between dimensions at will
- **Magical Singularity:** Become a source of magical energy for others
- **Ascension Path:** Potential transformation into magical entity/deity

**Magical Politics and Organizations:**

**The Circle of Eight:** Archmages governing magical society
- Access to ultimate magical knowledge
- Political power over magical communities  
- Responsibility for preventing magical catastrophes
- Target for ambitious younger mages

**The Purifiers:** Anti-corruption zealots
- Hunt corrupted mages relentlessly
- Provide cleansing rituals (painful but effective)
- May become corrupted by their methods
- Create powerful magical immunities

**Wild Mages Guild:** Chaos magic practitioners
- Embrace unpredictable magical effects
- Develop unique improvised spells
- Often exiled from civilized magical society
- Masters of adapting to magical disasters

**The Vault Keepers:** Magical knowledge preservers
- Maintain vast libraries of spells and techniques
- Control access to dangerous magical information
- Neutral in magical politics
- Invaluable for research and spell development

This expanded system creates multiple paths for character development while maintaining meaningful choices and consequences.
The interconnected states ensure that power comes with risk, and specialization opens unique storylines while closing others.
The corruption system provides dramatic tension, while the various schools and elements offer diverse playstyles within the same magical framework.
`;

export const magicSystemDescRu = `### СИСТЕМА МАНИПУЛЯЦИИ МАГИЧЕСКИМ ПЛЕТЕНИЕМ ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний для всеобъемлющего магического развития.**
Магия в этом мире действует через сложные взаимосвязанные силы, которые формируют как силу, так и последствия.
Путь мага включает множественные параллельные прогрессии, способные усилить или развратить их способности.

**Основные состояния прогрессии:**

1. **Тайная Гармония (Основное состояние):**
Создайте Пользовательское Состояние "Тайная Гармония" с 'currentValue: 0', 'minValue: 0', 'maxValue: 2000+'.
Представляет связь с магическими энергиями. Увеличивается через: сотворение заклинаний (+5-15), изучение древних текстов (+10-25), магическую медитацию (+8-12), преодоление сверхъестественных испытаний (+20-50), поглощение окружающей магии (+3-8).
Уменьшается при: неудачных экспериментах (-10-20), магическом переутомлении (-15), пренебрежении практикой (-2 в неделю).

2. **Искажение Плетения (Состояние опасности):**
Создайте "Искажение Плетения" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Отслеживает магическое заражение от запретных практик.
Увеличивается при: использовании темной магии (+20-40), запретных ритуалах (+50-80), магии души (+30-60), временных манипуляциях (+25-45), некромантии (+35-70).
При 300+: начинаются физические мутации. При 600+: изменения личности.
При 900+: риск превращения в аберрацию.

3. **Стихийное Сродство (Разветвляющееся состояние):**
Создайте отдельные состояния для каждой стихии:
   - **Владение Огнем** (0-500): Страсть, разрушение, очищение
   - **Владение Водой** (0-500): Адаптация, исцеление, контроль эмоций
   - **Владение Землей** (0-500): Стабильность, защита, выносливость
   - **Владение Воздухом** (0-500): Свобода, общение, скорость
   - **Владение Пустотой** (0-300): Запретное - энтропия, аннигиляция, стирание

4. **Тайные Школы (Состояния специализации):**
   - **Владение Эвокацией** (0-400): Боевая магия, проекция сырой силы
   - **Владение Трансмутацией** (0-400): Манипуляция материей, алхимия
   - **Владение Дивинацией** (0-400): Знание, предвидение, обнаружение
   - **Владение Очарованием** (0-400): Магия разума, очарование, иллюзия
   - **Владение Вызовом** (0-400): Призыв, телепортация, создание
   - **Владение Некромантией** (0-300): Магия смерти, нежить, манипуляция душами

5. **Магический Резонанс (Состояние ресурса):**
Создайте "Магический Резонанс" с 'currentValue: 100', 'minValue: 50', 'maxValue: 500+'.
Представляет максимальную энергетическую емкость.
Увеличивается при: успешном высокоуровневом колдовстве (+5-15), магической тренировке (+3-8), резонансных кристаллах (+20-40).
Уменьшается при: сильном переутомлении (-10-25), эффектах магического истощения (-5-20).

6. **Астральная Чувствительность (Состояние восприятия):**
Создайте "Астральная Чувствительность" с 'currentValue: 0', 'minValue: 0', 'maxValue: 300'.
Способность воспринимать магические феномены.
Открывает способности обнаружения и уязвимость к психическим атакам.

**Продвинутые магические феномены:**

**Синдром Магического Выгорания:** При колдовстве за безопасными пределами:
- Создайте временное состояние "Магическое Выгорание" (0-100)
- Вызывает физическую боль, снижает эффективность заклинаний
- Высокие уровни рискуют постоянными магическими шрамами
- Восстановление требует отдыха и целительной магии

**Тайная Перегрузка:** Временное усиление силы за большую цену:
- Умножает эффективность заклинания в 1.5-3 раза за одно применение
- Массивные энергозатраты (50-150% от нормы)
- Гарантированное накопление Магического Выгорания
- Риск увеличения Искажения Плетения

**Пути магической специализации:**

**Путь Стихийника (Фокус на Огне/Воде/Земле/Воздухе):**
- **Стадия 1 (Сродство 50+):** "Стихийное Зрение" - Видит стихийные ауры и слабости
- **Стадия 2 (Сродство 150+):** "Изначальная Связь" - Общается со стихийными духами
- **Стадия 3 (Сродство 300+):** "Стихийный Аватар" - Временная стихийная трансформация
- **Мастерство (Сродство 500+):** "Изначальное Вознесение" - Становится малым стихийным лордом

**Путь Вуалехода (Фокус на Пустоте - Опасно):**
- **Стадия 1 (Пустота 50+):** "Зрение Энтропии" - Видит распад, слабость, окончания
- **Стадия 2 (Пустота 150+):** "Шаг Пустоты" - Телепортация на короткие дистанции через ничто
- **Стадия 3 (Пустота 250+):** "Стирание Реальности" - Временно удаляет малые объекты/эффекты
- **ПРЕДУПРЕЖДЕНИЕ:** Каждый прогресс Пустоты значительно увеличивает Искажение Плетения

**Путь Боевого Мага (Фокус на Эвокации):**
- **Стадия 1 (Эвокация 100+):** "Боевое Колдовство" - Поддерживает заклинания во время сражения
- **Стадия 2 (Эвокация 200+):** "Заклинательный Меч" - Насыщает оружие магией
- **Стадия 3 (Эвокация 350+):** "Тайная Артиллерия" - Разрушительные заклинания области
- **Мастерство (Эвокация 400+):** "Трансформация Мага-Рыцаря" - Форма магического воина

**Путь Трансмутера (Фокус на Трансмутации):**
- **Стадия 1 (Трансмутация 100+):** "Чувство Материи" - Понимает состав материала
- **Стадия 2 (Трансмутация 200+):** "Алхимическое Мастерство" - Создает магические субстанции
- **Стадия 3 (Трансмутация 350+):** "Формовка" - Временно изменяет живых существ
- **Мастерство (Трансмутация 400+):** "Скульптор Реальности" - Изменяет окружение по воле

**Путь Оракула (Фокус на Дивинации):**
- **Стадия 1 (Дивинация 100+):** "Мистическое Озарение" - Чувствует непосредственные опасности и ложь
- **Стадия 2 (Дивинация 200+):** "Временные Проблески" - Краткие видения возможного будущего
- **Стадия 3 (Дивинация 350+):** "Чтение Акаши" - Кратко получает доступ к универсальному знанию
- **Мастерство (Дивинация 400+):** "Всезнающий Момент" - Совершенное знание на один вопрос

**Путь Чародея (Фокус на Очаровании):**
- **Стадия 1 (Очарование 100+):** "Чтение Эмоций" - Чувствует чувства и мотивации
- **Стадия 2 (Очарование 200+):** "Дворец Разума" - Улучшенная память и ментальная защита
- **Стадия 3 (Очарование 350+):** "Массовое Внушение" - Влияет на множественные разумы
- **Мастерство (Очарование 400+):** "Пересмотр Реальности" - Изменяет воспоминания и восприятие

**Путь Призывателя (Фокус на Вызове):**
- **Стадия 1 (Вызов 100+):** "Планарное Чувство" - Обнаруживает внепланарные сущности
- **Стадия 2 (Вызов 200+):** "Верный Слуга" - Постоянный малый стихийный спутник
- **Стадия 3 (Вызов 350+):** "Мастерство Порталов" - Создает стабильные измерительные врата
- **Мастерство (Вызов 400+):** "Планарный Лорд" - Командует могущественными внепланарными существами

**Путь Некроманта (Фокус на Некромантии - Развращающий):**
- **Стадия 1 (Некромантия 75+):** "Зрение Смерти" - Видит нежить, призраков, жизненную силу
- **Стадия 2 (Некромантия 150+):** "Общение с Душами" - Говорит с недавно умершими
- **Стадия 3 (Некромантия 250+):** "Мастерство Нежити" - Создает и командует разумной нежитью
- **ПРЕДУПРЕЖДЕНИЕ:** Каждый прогресс Некромантии значительно увеличивает Искажение Плетения

**Уникальные магические феномены:**

**Магические Бури:** Случайные экологические события:
- Внезапный всплеск магической энергии в области
- Все заклинания становятся непредсказуемыми (случайные эффекты)
- Возможность для быстрого роста Гармонии (+50-100)
- Риск Искажения от хаотичных энергий (+20-40)

**Схождения Лей-линий:** Мощные магические места:
- Значительно сниженные энергозатраты (50-75% снижение)
- Усиленные эффекты заклинаний (2x сила)
- Потенциал для открытия уникальных заклинаний
- Привлекает опасных магических существ

**Тайные Отголоски:** Магические отпечатки в местах:
- Изучает заклинания, многократно произнесенные в области
- Переживает прошлые магические события
- Риск поглощения старых проклятий или благословений
- Ценно для магической археологии

**Система изобретения заклинаний:**
Когда Тайная Гармония достигает 750+, персонажи могут пытаться создавать оригинальные заклинания:
- Требует обширных исследований (недели/месяцы игрового времени)
- Проверки Интеллекта + соответствующего Владения Школой
- Успех создает постоянное новое заклинание
- Неудача рискует Искажением или Магическим Выгоранием
- Уникальные заклинания масштабируются с прогрессом создателя

**Взаимодействия магического резонанса:**
Множественные маги могут объединять силы:
- **Плетение Заклинаний:** Сочетание разных школ для уникальных эффектов
- **Круг Силы:** Множественные колдуны экспоненциально усиливают одно заклинание
- **Гармоничное Колдовство:** Синхронизированное произнесение для идеальной эффективности
- **Риск Диссонанса:** Конфликтующие магические стили вызывают опасную обратную связь

**Проявления искажения по уровням:**

**Малое Искажение (100-299):**
- Незначительные физические изменения (цвет глаз, текстура волос)
- Случайные магические всплески вне контроля
- Усиленные магические чувства, но притупление обычных
- Мягкие сдвиги личности к магическому мышлению

**Умеренное Искажение (300-599):**
- Видимые мутации (необычные кожные узоры, дополнительные пальцы)
- Трудности контроля магических излучений
- Компульсивная потребность использовать магию для простых задач
- Отчуждение от немагических индивидуумов

**Крупное Искажение (600-899):**
- Значительная физическая трансформация (чешуя, когти, светящиеся глаза)
- Магия постоянно утекает из тела
- Личность доминируется магическими стремлениями
- Болезненно находиться рядом с немагическими материалами

**Тяжелое Искажение (900-1000):**
- Едва человеческий вид, стихийные/аберрантные черты
- Реальность искажается в присутствии персонажа
- Полная потеря смертной эмпатии и забот
- Риск трансформации в магическое существо/силу природы

**Магические артефакты и инструменты:**

**Фокусирующие Кристаллы:** Усиливают определенные школы
- **Рубин:** Усиление огненной магии (+25% урон Огнем)
- **Сапфир:** Усиление воды/исцеления
- **Изумруд:** Усиление природы/земли
- **Алмаз:** Фокус чистой энергии (общий +10% эффективности)
- **Обсидиан:** Усиление магии пустоты (ОПАСНО: +5 Искажения за использование)

**Гримуары и Фолианты:**
- **Кодекс Новичка:** Коллекция базовых заклинаний, +15 Владения Школой
- **Руководство Мастера:** Продвинутые техники, +30 Владения Школой
- **Запретный Гримуар:** Мощная, но развращающая магия (+50 Владения, +25 Искажения)
- **Живой Том:** Разумная книга заклинаний, растущая с владельцем

**Магические реагенты и компоненты:**
Разные заклинания требуют специфических материалов:
- **Обычные Травы:** Базовые исцеляющие и утилитарные заклинания
- **Редкие Минералы:** Боевая и защитная магия
- **Части Существ:** Призыв и трансформация
- **Временные Фрагменты:** Магия времени (крайне редко)
- **Эссенция Души:** Некромантия (крайне развращающая)

**Экологические магические зоны:**

**Области Высокой Магии:**
- Эффекты заклинаний усилены
- Быстрый рост Гармонии
- Увеличенные случайные магические события
- Больший шанс встреч с магическими существами

**Зоны Мертвой Магии:**
- Никакая магия не функционирует
- Медленный распад Гармонии при долгом пребывании
- Убежище от магических угроз
- Может содержать уникальные немагические сокровища

**Зоны Дикой Магии:**
- Все заклинания имеют случайные дополнительные эффекты
- Шанс мутации заклинания в новые формы
- Опасно, но потенциал для великих открытий
- Хаотичные энергетические всплески

**Регионы Планарного Касания:**
- Под влиянием других планов существования
- Уникальные магические свойства на каждый план
- Доступ к внепланарной магии
- Риск встреч с планарными сущностями

**Продвинутое развитие персонажа:**

**Типы Магического Пробуждения:**
- **Рожденный Естественно:** Постепенное развитие силы, стабильная прогрессия
- **Вызванное Травмой:** Внезапное пробуждение, начальный всплеск силы, потенциальная нестабильность
- **Ученический Подход:** Сначала книжное обучение, затем практическое применение
- **Дикое Пробуждение:** Хаотичное магическое воздействие, непредсказуемые способности
- **Унаследованная Сила:** Семейные магические традиции, направляемое развитие

**Синергии между школами:**
Сочетание разных магических подходов создает уникальные возможности:
- **Эвокация + Трансмутация:** Формирование энергии, конверсия материи-энергии
- **Дивинация + Очарование:** Чтение мыслей, манипуляция памятью
- **Вызов + Некромантия:** Призыв нежити, связывание душ
- **Трансмутация + Дивинация:** Совершенный анализ материи, атомная манипуляция

**Легендарное продвижение (Гармония 1500+):**
Персонажи превосходят нормальные магические ограничения:
- **Постоянство Заклинаний:** Делает временные эффекты постоянными
- **Якорение Реальности:** Стабилизирует хаотичные магические эффекты
- **Планарное Мастерство:** Путешествует между измерениями по воле
- **Магическая Сингулярность:** Становится источником магической энергии для других
- **Путь Вознесения:** Потенциальная трансформация в магическую сущность/божество

**Магическая политика и организации:**

**Круг Восьми:** Архимаги, управляющие магическим обществом
- Доступ к высшему магическому знанию
- Политическая власть над магическими сообществами
- Ответственность за предотвращение магических катастроф
- Мишень для амбициозных младших магов

**Очистители:** Фанатики против искажения
- Безжалостно охотятся на искаженных магов
- Предоставляют ритуалы очищения (болезненные, но эффективные)
- Могут быть развращены своими методами
- Создают мощные магические иммунитеты

**Гильдия Диких Магов:** Практики хаотичной магии
- Принимают непредсказуемые магические эффекты
- Разрабатывают уникальные импровизированные заклинания
- Часто изгнаны из цивилизованного магического общества
- Мастера адаптации к магическим бедствиям

**Хранители Хранилища:** Сохранители магического знания
- Поддерживают обширные библиотеки заклинаний и техник
- Контролируют доступ к опасной магической информации
- Нейтральны в магической политике
- Бесценны для исследований и разработки заклинаний

Эта расширенная система создает множественные пути для развития персонажа, сохраняя при этом значимые выборы и последствия.
Взаимосвязанные состояния обеспечивают, что сила приходит с риском, а специализация открывает уникальные сюжетные линии, закрывая другие.
Система искажения обеспечивает драматическое напряжение, в то время как различные школы и стихии предлагают разнообразные стили игры в рамках одной магической системы.
`;