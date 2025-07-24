## What is The Book of Eternity?

The Book of Eternity is not just a game; it's a dynamic storytelling engine. At its core, it's a solo RPG experience where a sophisticated Large Language Model (LLM) takes on the role of the Game Master (GM). Unlike traditional video games with pre-scripted quests and limited dialogue trees, The Book of Eternity generates the world, its inhabitants, and the unfolding narrative in real-time, based entirely on your actions and the established rules of the universe.

Your every decision, from the way you speak to an NPC to the items you choose to craft, has a tangible and persistent impact on the world. The GM remembers your history, adapts the plot to your choices, and creates a unique, personalized adventure every time you play.

The entire game state and all GM actions are communicated via a structured JSON protocol, making this project a powerful engine for creating rich, interactive narrative experiences.

## Key Features

-   **🤖 LLM as the Game Master:** A state-of-the-art LLM serves as the storyteller, world-builder, and rules adjudicator, providing a level of reactivity and creativity impossible in traditional games.
-   **📖 Dynamic Narrative Generation:** The plot is not pre-written. The GM maintains a `plotOutline` that evolves based on player actions, creating a story that is truly yours.
-   **🧠 Complex NPC System:** NPCs are more than just quest-givers. They have:
    -   **Relationship Levels:** A 0-200 scale tracking their opinion of you, directly influencing their behavior.
    -   **Unlockable Memories:** Deepen your bond with an NPC to unlock detailed memories from their past, revealing their history and motivations.
    -   **Dynamic Fate Cards:** Each key NPC has a set of potential futures. Your actions can invalidate old paths and generate new ones, changing their destiny from a trusted ally to a bitter rival, or vice versa.
-   **🌍 A Living World:** The world feels alive and persistent through systems like:
    -   **Faction & Reputation:** Your actions affect your standing with various factions, causing cascading reputation changes with their allies and enemies.
    -   **Dynamic Weather & Time:** The world state, including time of day and biome-specific weather, impacts gameplay, NPC availability, and the narrative atmosphere.
-   **⚔️ Deep Character Progression:** Go beyond simple leveling. Your character develops through:
    -   **Core Characteristics:** A full suite of classic RPG stats.
    -   **Active & Passive Skills:** A vast array of abilities that can be learned and improved.
    -   **Skill Mastery:** Repeatedly using skills increases your mastery, enhancing their effects.
-   **⚙️ Structured Data Exchange:** The GM's output is not just text, but a rich, structured JSON object. This allows for a clean separation between the AI's "brain" and the game's UI/client, enabling complex mechanics like inventory management, status effects, and combat logs.
-   **🔧 Modular Prompt System:** The GM's core "personality" and the game's rules are defined in a highly detailed, human-readable XML-like structure (`GameMasterGuide_JSONFormattingRules`). This allows for easier debugging, modification, and expansion of game mechanics.

## How It Works: The Core Loop

The engine operates on a turn-based loop that transforms player input into a comprehensive game state update.

1.  **Player Input:** The player sends a message describing their character's action (e.g., "I try to pick the lock on the ancient chest.").
2.  **Context Assembly:** The system gathers all relevant data about the current game state: the player's character sheet, inventory, active quests, world state, location details, known NPCs, etc.
3.  **Prompt Generation:** The `mainPromptModule.js` constructs a massive, detailed prompt. This prompt includes the "Game Master's Guide" (the core rules), the full game context, and the player's message.
4.  **LLM Processing:** The complete prompt is sent to the LLM. The LLM assumes the role of the Game Master, processes the player's action according to the rules, simulates the world's reaction, and makes all necessary calculations.
5.  **JSON Response:** The LLM's entire output is a single, structured JSON object containing everything that happened in the turn: the narrative response, combat logs, inventory changes, quest updates, NPC relationship changes, and more.
6.  **Game State Update:** The system parses this JSON object and updates the master game state, preparing for the player's next turn.

## Project Goals

-   To push the boundaries of interactive storytelling and create a truly dynamic RPG experience.
-   To build a world that genuinely remembers and reacts to player choice on a granular level.
-   To bridge the gap between the infinite freedom of tabletop RPGs and the accessibility of video games.
-   To create a robust and extensible engine that other developers can use to build their own LLM-powered narrative games.


ДЛЯ РУССКОЯЗЫЧНЫХ:

Небольшое пояснение. Эта игра - своего рода эксперимент, и на данный момент, текущие нейросети (Gemini 2.5 Flash) с ней не справляются. Каждый ход занимает очень много времени.
Но, тем не менее, эта игра сделана по принципу "компьютерной игры". Она имеет полный набор различных правил, которые регулируют почти все возможное взаимодействие с миром.
В будущем, при появлении более быстрых нейросетей, она станет более играбельной.
Поэтому - не переживайте, что у вас слишком долго грузится игра. Пока что, так и должно быть.
Вы можете сделать свой проект на основе представленного кода. Прошу лишь упомянуть данный проект в описании своего, если вы позаимствовали из-него что-либо. Давайте развивать игры с LLM вместе!
