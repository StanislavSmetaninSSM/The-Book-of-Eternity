export const hungerSystemDescEn = `### ADVANCED HUNGER SURVIVAL SYSTEM ###
**GM, you MUST implement this system using Custom States mechanics and active skills.**

**Core Mechanics:**

1. **Hunger Level (Primary State):**
Create a Custom State "Hunger" with 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Represents starvation progression.
Increases by +10 per turn, +15 for strenuous activity (running, combat), +25 for extreme exertion (prolonged fighting, heavy labor).
Decreases when eating based on food quality and freshness.

2. **Nutrition Quality (Secondary State):**
Create "Nutrition Balance" with 'currentValue: 500', 'minValue: 0', 'maxValue: 1000'.
Represents overall nutritional health.
Poor quality food provides calories but doesn't restore this value. Only fresh, varied foods increase it.
Below 200 causes vitamin deficiency effects.

3. **Metabolism Rate (Dynamic State):**
Create "Metabolism" with 'currentValue: 100', 'minValue: 50', 'maxValue: 200'.
Affects hunger progression speed.
Increases with stress (+20), cold exposure (+15), injuries (+10). Decreases with rest (-5), warm shelter (-10), meditation (-5).

4. **Food Poisoning Risk (Tracking State):**
Create "Contamination Exposure" with 'currentValue: 0', 'minValue: 0', 'maxValue: 500'.
Increases when eating spoiled/questionable food.
At 200+, risk of serious illness.
At 400+, severe food poisoning occurs.

**Detailed Food Categories:**

**Fresh Foods (High Quality):**
- **Fresh Meat/Fish:** Hunger -80, Nutrition +30, Contamination +0 (if properly cooked)
- **Fresh Vegetables/Fruits:** Hunger -40, Nutrition +40, Contamination +0
- **Clean Water:** Dehydration -100, minor Hunger -5

**Preserved/Canned Foods (Medium Quality):**
- **Canned Goods:** Hunger -60, Nutrition +10, Contamination +5
- **Dried/Smoked Meat:** Hunger -50, Nutrition +5, Contamination +10
- **Military Rations:** Hunger -70, Nutrition +0, Contamination +0

**Questionable Foods (Poor Quality):**
- **Spoiled Meat:** Hunger -40, Nutrition -10, Contamination +50
- **Wild Plants (Unknown):** Hunger -20, Nutrition +20, Contamination +30 (risk of poisoning)
- **Dirty Water:** Dehydration -50, Contamination +40

**Desperation Foods (Survival):**
- **Insects/Grubs:** Hunger -25, Nutrition +5, Contamination +20
- **Tree Bark/Roots:** Hunger -15, Nutrition -5, Contamination +15
- **Scavenged Scraps:** Hunger -30, Nutrition -20, Contamination +80

**Advanced Hunger Thresholds:**

**Well-Fed (0-100):**
- 'associatedEffects': [{
    "effectType": "Buff",
    "value": "+15%",
    "targetType": "constitution",
    "duration": 999,
    "sourceSkill": { "skill": "Well Nourished"},
    "description": "Well-Fed: Constitution increased by 15%. Peak physical condition."
}]
- Enhanced healing, improved morale, bonus to physical tasks

**Satisfied (101-200):**
- No penalties, normal performance
- 'description: "You feel comfortably full and energized."

**Peckish (201-300):**
- 'description: "You're starting to feel hungry. Your stomach occasionally rumbles."
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-5%",
    "targetType": "agility",
    "duration": 999,
    "sourceSkill": { "skill": "Minor Hunger" },
    "description": "Peckish: Agility reduced by 5%. Slight distraction from hunger."
}]

**Hungry (301-500):**
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-10%",
    "targetType": "constitution",
    "duration": 999,
    "sourceSkill": { "skill": "Hunger" },
    "description": "Hungry: Constitution reduced by 10%. Body begins conserving energy."
},
{
    "effectType": "Debuff",
    "value": "-10%",
    "targetType": "intelligence",
    "duration": 999,
    "sourceSkill": { "skill": "Hunger Distraction" },
    "description": "Hungry: Intelligence reduced by 10%. Difficulty concentrating due to hunger."
}]

**Very Hungry (501-700):**
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-20%",
    "targetType": "strength",
    "duration": 999,
    "sourceSkill": { "skill": "Severe Hunger" },
    "description": "Very Hungry: Strength reduced by 20%. Muscle weakness from lack of nutrition."
},
{
    "effectType": "Debuff",
    "value": "-15%",
    "targetType": "agility",
    "duration": 999,
    "sourceSkill": { "skill": "Weakness" },
    "description": "Very Hungry: Agility reduced by 15%. Sluggish movements from energy depletion."
}]

**Starving (701-850):**
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-30%",
    "targetType": "constitution",
    "duration": 999,
    "sourceSkill": { "skill": "Starvation" },
    "description": "Starving: Constitution reduced by 30%. Body consuming muscle for energy."
},
{
    "effectType": "Debuff",
    "value": "-25%",
    "targetType": "intelligence",
    "duration": 999,
    "sourceSkill": { "skill": "Mental Fog" },
    "description": "Starving: Intelligence reduced by 25%. Severe mental impairment from starvation."
}]
- Character begins hallucinating food, becomes obsessed with finding sustenance

**Critical Starvation (851-950):**
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-40%",
    "targetType": "strength",
    "duration": 999,
    "sourceSkill": { "skill": "Critical Malnutrition" },
    "description": "Critical Starvation: Strength reduced by 40%. Extreme muscle wasting."
},
{
    "effectType": "DamageOverTime",
    "value": "3%",
    "targetType": "dark",
    "duration": 999,
    "sourceSkill": { "skill": "Organ Failure" },
    "description": "Critical Starvation: Taking 3% damage per turn as organs begin shutting down."
}]
- Character may resort to cannibalism, extreme desperation sets in

**Death's Door (951-1000):**
- 'associatedEffects': [{
    "effectType": "DamageOverTime",
    "value": "8%",
    "targetType": "dark",
    "duration": 999,
    "sourceSkill": { "skill": "Imminent Death" },
    "description": "Death's Door: Taking 8% damage per turn. Multiple organ failure from complete starvation."
},
{
    "effectType": "Debuff",
    "value": "-60%",
    "targetType": "constitution",
    "duration": 999,
    "sourceSkill": { "skill": "Total System Failure" },
    "description": "Death's Door: Constitution reduced by 60%. Body completely shutting down."
}]
- Character unconscious most of the time, death imminent without immediate intervention

**Active Survival Skills:**

**"Scavenge for Food" (Active):**
Cost: 20 Energy. Requirements: None. 
Effects: Search environment for edible items. Success rate depends on location and survival skills.
May find anything from fresh food to contaminated scraps. Higher survival skill reduces contamination risk.

**"Purify Water" (Active):**
Cost: 15 Energy. Requirements: Fire source or purification tablets.
Effects: Convert dirty water to clean water. Reduces contamination risk by 80%. Essential for long-term survival.

**"Hunt/Fish" (Active):**
Cost: 35 Energy. Requirements: Appropriate tools, suitable environment.
Effects: Attempt to catch fresh meat. Success provides high-quality protein. Failure wastes energy and may attract dangerous attention.

**"Preserve Food" (Active):**
Cost: 25 Energy. Requirements: Salt, smoke source, or cold storage.
Effects: Convert fresh food to preserved food, extending shelf life. Reduces nutrition value but prevents spoilage.

**"Forage Knowledge" (Active):**
Cost: 10 Energy. Requirements: Survival/Nature knowledge.
Effects: Identify safe vs. dangerous wild plants. Prevents accidental poisoning. Experience increases success rate.

**"Emergency Rationing" (Active):**
Cost: 5 Energy. Requirements: Food supplies.
Effects: Divide available food into smaller portions to last longer. Reduces immediate hunger relief but extends food supply duration.

**"Cannibalistic Desperation" (Active):**
Cost: 50 Energy. Requirements: Hunger 800+, access to human remains.
Effects: Hunger -150, Nutrition -50, Contamination +100. Permanent psychological trauma.
'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-25%",
    "targetType": "charisma",
    "duration": 9999,
    "sourceSkill": { "skill": "Cannibalistic Trauma" },
    "description": "Cannibalistic Trauma: Charisma permanently reduced by 25%. The horror of what you've done haunts you."
}]

**"Medicinal Herbs" (Active):**
Cost: 30 Energy. Requirements: Herbal knowledge, suitable plants.
Effects: Create remedies for food poisoning. Reduces Contamination by 50-100 depending on skill and available plants.

**Environmental Factors:**

**Seasonal Variations:**
- **Winter:** +5 hunger gain per turn (cold increases caloric needs), reduced foraging success
- **Summer:** Normal progression, increased water needs, higher food spoilage rates
- **Spring:** Improved foraging opportunities, fresh water more available
- **Autumn:** Harvest season, increased food availability, opportunity to build winter stores

**Location-Based Modifiers:**
- **Urban Ruins:** Higher chance of canned goods, but competition with other survivors
- **Wilderness:** Better hunting/foraging opportunities, but requires survival skills
- **Coastal Areas:** Fishing opportunities, seaweed and shellfish available
- **Desert:** Extreme water scarcity, very limited food sources
- **Forest:** Abundant plant life, small game, natural shelter

**Psychological Effects of Starvation:**

**Hunger Obsession State:** Create "Food Fixation" with 'currentValue: 0', 'minValue: 0', 'maxValue: 500'. Increases as hunger rises above 500. Causes:
- Hallucinations of food at 200+
- Aggressive behavior around food at 300+
- Complete mental breakdown at 450+

**Social Breakdown State:** Create "Humanity Loss" with 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'. Decreases with:
- Stealing food from others (-50)
- Hoarding food while others starve (-100)
- Cannibalism (-300)
- Violence over food (-200)

**Group Dynamics:**

**Food Sharing Mechanics:**
- Sharing food with starving companions: Humanity +25, but personal hunger increases
- Hoarding food: Humanity -50, but better personal survival chances
- Group hunting: Bonus to success rate, shared risks and rewards

**Leadership During Crisis:**
- Characters with high Charisma can organize group rationing
- Leadership decisions affect group morale and survival rates
- Failed leadership can lead to group fragmentation

**Advanced Scenarios:**

**Food Source Contamination:**
Entire food supplies may become contaminated, forcing difficult choices between starvation and poison risk.

**Competing Survivor Groups:**
Food scarcity creates conflict with other survivors. Players must choose between cooperation and competition.

**Moral Dilemmas:**
- Found food cache belonging to another group
- Pregnant/injured group member needs extra food
- Child vs. adult food priority decisions

**Seasonal Food Crises:**
- Nuclear winter reducing all food sources
- Contaminated rain killing crops
- Animal populations fleeing irradiated areas

**Recovery and Long-term Effects:**

**Nutritional Rehabilitation:**
Characters who survive extreme starvation have permanent effects:
- Reduced maximum health
- Digestive system sensitivity 
- Higher metabolism for months
- Psychological trauma around food

**Community Building:**
Successfully establishing sustainable food sources can become major campaign goal, requiring:
- Securing fertile land
- Obtaining seeds/livestock
- Defending agricultural areas
- Trading relationships with other communities

This system creates moral complexity where survival requires increasingly desperate choices, while maintaining hope through cooperation, skill development, and long-term planning.`;

export const hungerSystemDescRu = `### ПРОДВИНУТАЯ СИСТЕМА ВЫЖИВАНИЯ И ГОЛОДА ###
**ГМ, вы ДОЛЖНЫ реализовать эту систему, используя механику Пользовательских Состояний и активных навыков.**

**Основные Механики:**

1. **Уровень Голода (Основное состояние):**
Создайте Пользовательское Состояние "Голод" с 'currentValue: 0', 'minValue: 0', 'maxValue: 1000'.
Представляет прогрессию голодания.
Увеличивается на +10 за ход, +15 за напряженную деятельность (бег, бой), +25 за экстремальные нагрузки (длительный бой, тяжелый труд).
Уменьшается при питании в зависимости от качества и свежести пищи.

2. **Качество Питания (Вторичное состояние):**
Создайте "Баланс Питания" с 'currentValue: 500', 'minValue: 0', 'maxValue: 1000'.
Представляет общее состояние питания.
Низкокачественная пища дает калории, но не восстанавливает это значение.
Только свежая, разнообразная пища увеличивает его.
Ниже 200 вызывает эффекты авитаминоза.

3. **Скорость Метаболизма (Динамическое состояние):**
Создайте "Метаболизм" с 'currentValue: 100', 'minValue: 50', 'maxValue: 200'.
Влияет на скорость прогрессии голода.
Увеличивается при стрессе (+20), переохлаждении (+15), ранениях (+10).
Уменьшается при отдыхе (-5), теплом укрытии (-10), медитации (-5).

4. **Риск Пищевого Отравления (Состояние отслеживания):**
Создайте "Воздействие Загрязнения" с 'currentValue: 0', 'minValue: 0', 'maxValue: 500'.
Увеличивается при употреблении испорченной/сомнительной пищи.
При 200+ риск серьезного заболевания.
При 400+ происходит тяжелое пищевое отравление.

**Детальные Категории Пищи:**

**Свежие Продукты (Высокое качество):**
- **Свежее Мясо/Рыба:** Голод -80, Питание +30, Загрязнение +0 (при правильном приготовлении)
- **Свежие Овощи/Фрукты:** Голод -40, Питание +40, Загрязнение +0
- **Чистая Вода:** Обезвоживание -100, незначительный Голод -5

**Консервированные Продукты (Среднее качество):**
- **Консервы:** Голод -60, Питание +10, Загрязнение +5
- **Сушеное/Копченое Мясо:** Голод -50, Питание +5, Загрязнение +10
- **Военные Рационы:** Голод -70, Питание +0, Загрязнение +0

**Сомнительная Пища (Низкое качество):**
- **Испорченное Мясо:** Голод -40, Питание -10, Загрязнение +50
- **Дикие Растения (Неизвестные):** Голод -20, Питание +20, Загрязнение +30 (риск отравления)
- **Грязная Вода:** Обезвоживание -50, Загрязнение +40

**Пища Отчаяния (Выживание):**
- **Насекомые/Личинки:** Голод -25, Питание +5, Загрязнение +20
- **Кора/Корни Деревьев:** Голод -15, Питание -5, Загрязнение +15
- **Подобранные Отходы:** Голод -30, Питание -20, Загрязнение +80

**Продвинутые Пороги Голода:**

**Сытость (0-100):**
- 'associatedEffects': [{
    "effectType": "Buff",
    "value": "+15%",
    "targetType": "constitution",
    "duration": 999,
    "sourceSkill": { "skill": "Хорошо Питается" },
    "description": "Сытость: Телосложение увеличено на 15%. Пиковое физическое состояние."
}]
- Ускоренное исцеление, улучшенная мораль, бонус к физическим задачам

**Удовлетворен (101-200):**
- Нет штрафов, нормальная производительность
- 'description: "Вы чувствуете себя комфортно сытым и энергичным."

**Легкий Голод (201-300):**
- 'description: "Вы начинаете чувствовать голод. Ваш желудок иногда урчит."
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-5%",
    "targetType": "agility",
    "duration": 999,
    "sourceSkill": { "skill": "Незначительный Голод" },
    "description": "Легкий Голод: Ловкость снижена на 5%. Небольшое отвлечение от голода."
}]

**Голод (301-500):**
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-10%",
    "targetType": "constitution",
    "duration": 999,
    "sourceSkill": { "skill": "Голод" },
    "description": "Голод: Телосложение снижено на 10%. Тело начинает экономить энергию."
},
{
    "effectType": "Debuff",
    "value": "-10%",
    "targetType": "intelligence",
    "duration": 999,
    "sourceSkill": { "skill": "Отвлечение от Голода" },
    "description": "Голод: Интеллект снижен на 10%. Трудности с концентрацией из-за голода."
}]

**Сильный Голод (501-700):**
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-20%",
    "targetType": "strength",
    "duration": 999,
    "sourceSkill": { "skill": "Сильный Голод" },
    "description": "Сильный Голод: Сила снижена на 20%. Мышечная слабость от недостатка питания."
},
{
    "effectType": "Debuff",
    "value": "-15%",
    "targetType": "agility",
    "duration": 999,
    "sourceSkill": { "skill": "Слабость" },
    "description": "Сильный Голод: Ловкость снижена на 15%. Медленные движения от истощения энергии."
}]

**Истощение (701-850):**
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-30%",
    "targetType": "constitution",
    "duration": 999,
    "sourceSkill": { "skill": "Истощение" },
    "description": "Истощение: Телосложение снижено на 30%. Тело поглощает мышцы для получения энергии."
},
{
    "effectType": "Debuff",
    "value": "-25%",
    "targetType": "intelligence",
    "duration": 999,
    "sourceSkill": { "skill": "Умственный Туман" },
    "description": "Истощение: Интеллект снижен на 25%. Серьезные умственные нарушения от голодания."
}]
- Персонаж начинает галлюцинировать пищу, становится одержим поиском пропитания

**Критическое Истощение (851-950):**
- 'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-40%",
    "targetType": "strength",
    "duration": 999,
    "sourceSkill": { "skill": "Критическое Недоедание" },
    "description": "Критическое Истощение: Сила снижена на 40%. Крайняя атрофия мышц."
},
{
    "effectType": "DamageOverTime",
    "value": "3%",
    "targetType": "dark",
    "duration": 999,
    "sourceSkill": { "skill": "Отказ Органов" },
    "description": "Критическое Истощение: Получение 3% урона за ход при начале отказа органов."
}]
- Персонаж может прибегнуть к каннибализму, наступает крайнее отчаяние

**Врата Смерти (951-1000):**
- 'associatedEffects': [{
    "effectType": "DamageOverTime",
    "value": "8%",
    "targetType": "dark",
    "duration": 999,
    "sourceSkill": { "skill": "Неминуемая Смерть" },
    "description": "Врата Смерти: Получение 8% урона за ход. Отказ множественных органов от полного голодания."
},
{
    "effectType": "Debuff",
    "value": "-60%",
    "targetType": "constitution",
    "duration": 999,
    "sourceSkill": { "skill": "Полный Отказ Системы" },
    "description": "Врата Смерти: Телосложение снижено на 60%. Тело полностью отключается."
}]
- Персонаж без сознания большую часть времени, смерть неминуема без немедленного вмешательства

**Активные Навыки Выживания:**

**"Поиск Пищи" (Активный):**
Стоимость: 20 Энергии. Требования: Нет.
Эффекты: Поиск съедобных предметов в окружающей среде. Успех зависит от местности и навыков выживания.
Может найти от свежей пищи до зараженных обрезков. Высокий навык выживания снижает риск загрязнения.

**"Очистка Воды" (Активный):**
Стоимость: 15 Энергии. Требования: Источник огня или таблетки для очистки.
Эффекты: Преобразование грязной воды в чистую. Снижает риск загрязнения на 80%. Необходимо для долгосрочного выживания.

**"Охота/Рыбалка" (Активный):**
Стоимость: 35 Энергии. Требования: Подходящие инструменты, подходящая среда.
Эффекты: Попытка поймать свежее мясо. Успех обеспечивает высококачественный белок. Неудача тратит энергию и может привлечь опасное внимание.

**"Консервация Пищи" (Активный):**
Стоимость: 25 Энергии. Требования: Соль, источник дыма или холодное хранение.
Эффекты: Преобразование свежей пищи в консервированную, продление срока годности. Снижает питательную ценность, но предотвращает порчу.

**"Знание Собирательства" (Активный):**
Стоимость: 10 Энергии. Требования: Знания выживания/природы.
Эффекты: Определение безопасных против опасных диких растений. Предотвращает случайные отравления. Опыт увеличивает коэффициент успеха.

**"Экстренное Нормирование" (Активный):**
Стоимость: 5 Энергии. Требования: Запасы пищи.
Эффекты: Деление доступной пищи на меньшие порции для увеличения продолжительности.
Снижает немедленное облегчение голода, но продлевает продолжительность запасов пищи.

**"Каннибальское Отчаяние" (Активный):**
Стоимость: 50 Энергии. Требования: Голод 800+, доступ к человеческим останкам.
Эффекты: Голод -150, Питание -50, Загрязнение +100. Постоянная психологическая травма.
'associatedEffects': [{
    "effectType": "Debuff",
    "value": "-25%",
    "targetType": "charisma",
    "duration": 9999,
    "sourceSkill": { "skill": "Каннибальская Травма" },
    "description": "Каннибальская Травма: Харизма навсегда снижена на 25%. Ужас от содеянного преследует вас."
}]

**"Лекарственные Травы" (Активный):**
Стоимость: 30 Энергии. Требования: Знание трав, подходящие растения.
Эффекты: Создание лекарств от пищевого отравления. Снижает Загрязнение на 50-100 в зависимости от навыка и доступных растений.

**Факторы Окружающей Среды:**

**Сезонные Вариации:**
- **Зима:** +5 прироста голода за ход (холод увеличивает калорийные потребности), снижение успеха собирательства
- **Лето:** Нормальная прогрессия, повышенные потребности в воде, высокие показатели порчи пищи
- **Весна:** Улучшенные возможности собирательства, более доступная свежая вода
- **Осень:** Сезон урожая, увеличенная доступность пищи, возможность создать зимние запасы

**Модификаторы на Основе Местоположения:**
- **Городские Руины:** Больший шанс найти консервы, но конкуренция с другими выжившими
- **Дикая Природа:** Лучшие возможности охоты/собирательства, но требует навыков выживания
- **Прибрежные Области:** Возможности рыбалки, доступны водоросли и моллюски
- **Пустыня:** Крайняя нехватка воды, очень ограниченные источники пищи
- **Лес:** Обильная растительность, мелкая дичь, естественное укрытие

**Психологические Эффекты Голодания:**

**Состояние Одержимости Голодом:** Создайте "Фиксация на Пище" с 'currentValue: 0', 'minValue: 0', 'maxValue: 500'.
Увеличивается при голоде выше 500. Вызывает:
- Галлюцинации пищи при 200+
- Агрессивное поведение вокруг пищи при 300+
- Полный психический срыв при 450+

**Состояние Социального Разрушения:**
Создайте "Потеря Человечности" с 'currentValue: 1000', 'minValue: 0', 'maxValue: 1000'.
Уменьшается при:
- Краже пищи у других (-50)
- Накоплении пищи, пока другие голодают (-100)
- Каннибализме (-300)
- Насилии из-за пищи (-200)

**Групповая Динамика:**

**Механика Разделения Пищи:**
- Разделение пищи с голодающими спутниками: Человечность +25, но личный голод увеличивается
- Накопление пищи: Человечность -50, но лучшие шансы на личное выживание
- Групповая охота: Бонус к коэффициенту успеха, разделенные риски и награды

**Лидерство Во Время Кризиса:**
- Персонажи с высокой Харизмой могут организовать групповое нормирование
- Решения лидерства влияют на мораль группы и коэффициенты выживания
- Неудачное лидерство может привести к фрагментации группы

**Продвинутые Сценарии:**

**Загрязнение Источников Пищи:**
Целые запасы пищи могут стать загрязненными, вынуждая к трудному выбору между голоданием и риском отравления.

**Конкурирующие Группы Выживших:**
Дефицит пищи создает конфликт с другими выжившими. Игроки должны выбирать между сотрудничеством и конкуренцией.

**Моральные Дилеммы:**
- Найденный тайник пищи, принадлежащий другой группе
- Беременный/раненый член группы нуждается в дополнительной пище
- Решения о приоритете пищи для детей против взрослых

**Сезонные Пищевые Кризисы:**
- Ядерная зима, сокращающая все источники пищи
- Загрязненный дождь, убивающий урожай
- Популяции животных, бегущие из облученных областей

**Восстановление и Долгосрочные Эффекты:**

**Пищевая Реабилитация:**
Персонажи, пережившие крайнее голодание, имеют постоянные эффекты:
- Сниженное максимальное здоровье
- Чувствительность пищеварительной системы
- Повышенный метаболизм на месяцы
- Психологическая травма вокруг пищи

**Строительство Сообщества:**
Успешное установление устойчивых источников пищи может стать главной целью кампании, требующей:
- Обеспечения плодородной земли
- Получения семян/скота
- Защиты сельскохозяйственных областей
- Торговых отношений с другими сообществами

Эта система создает моральную сложность, где выживание требует все более отчаянных выборов, сохраняя надежду через сотрудничество, развитие навыков и долгосрочное планирование.`;