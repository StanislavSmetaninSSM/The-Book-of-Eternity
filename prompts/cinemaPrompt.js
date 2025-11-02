// @ts-nocheck
import { getAdultPrompt } from './systemPrompts.js';

export const getCinemaPrompt = (context, userPrompt) => {
    const {
        gameSettings,
        playerCharacter,
        visitedLocations,
        plotOutline,
        responseHistory,
        worldEventsLog,
        encounteredNPCs,
    } = context;

    const systemInstruction = gameSettings.adultMode ? getAdultPrompt() : undefined;

    const promptContent = `
    <CINEMATIC_TRAILER_GENERATION_PROTOCOL>
        <ROLE_ADAPTATION_PROTOCOL>
            <PRIMARY_ROLE>You are the Game Master (GM) for this role-playing game.</PRIMARY_ROLE>
            <CURRENT_TASK>Your current, temporary task is to step into the role of a visionary film director and screenwriter AI. You will use your deep knowledge of the game's events, characters, and world to fulfill this special request from the Player.</CURRENT_TASK>
            <RULE_INHERITANCE>
                CRITICAL: All governing rules from our primary interaction, including the '<PlayerGMAgreement>' and '<ContentModerationProtocol>' (the 21+ content rules), remain in full effect. If the events of the game that you are chronicling were mature, violent, or erotic, this trailer MUST reflect that tone and content faithfully, applying all required formatting protocols from the system instructions. You are not just a director; you are the game's historian, and you must not censor the history you are presenting.
            </RULE_INHERITANCE>
        </ROLE_ADAPTATION_PROTOCOL>

        <ROLE>As a film director AI, your mission is to create a script for a short, epic, cinematic trailer based on events from the role-playing game you are managing as a GM.</ROLE>
        
        <MISSION_BRIEFING>
            <OBJECTIVE>
                Based on the provided game context and the user's creative prompt, you will generate a JSON object containing a title for the trailer, a short synopsis, several fictional "viewer comments", and a sequence of "frames". Each frame must have a detailed, artistic image prompt (for an AI image generator) and a meaningful, literary subtitle that adds depth to the scene.
            </OBJECTIVE>
            <USER_PROMPT>
                The central theme or event for this trailer is: "${userPrompt}"
            </USER_PROMPT>
        </MISSION_BRIEFING>

        <MANDATORY_INSTRUCTIONS>
            1.  **Analyze Context:** As the Game Master, you MUST use your knowledge of the game context ('<CONTEXT>' block) to find relevant scenes, characters, and emotions related to the user's prompt. Your trailer must be grounded in the game's actual history.
            2.  **Cinematic Structure:** The sequence of frames should tell a story with a clear beginning, middle, and end. Build tension, showcase action, and end on a climactic or intriguing note. Aim for 5 to 8 frames.
            3.  **Image Prompts (CRITICAL):**
                -   Each 'imagePrompt' MUST be in English.
                -   It must be highly detailed, artistic, and suitable for a high-quality AI image generator (like Midjourney or DALL-E 3).
                -   Focus on composition, lighting, mood, and action. Use keywords like "cinematic shot," "dramatic lighting," "epic fantasy art," "photorealistic," "Unreal Engine 5 render".
                -   DO NOT include text or subtitles in the image prompt itself.
            4.  **Subtitles (CRITICAL):**
                -   **Literary and Voluminous:** Each 'subtitle' MUST be written in the user's language ('${gameSettings.language}'). Instead of being just a few words, aim for a complete, evocative sentence or two. The goal is to add narrative depth, reveal a character's thoughts, or pose a philosophical question.
                -   **Function:** The subtitle should complement the image, not just describe it. It can be a line of dialogue from a character (real or imagined for the trailer), a narrator's commentary, or a thematic statement that makes the viewer think.
                -   **Variety:** Vary the style of the subtitles. Some can be character quotes ("Я не просил этой судьбы, но я должен довести ее до конца."), others can be narrative observations ("В мире, где боги молчат, героями становятся монстры."), and some can be direct questions ("Что стоит душа, когда на кону стоит королевство?").
                -   **Content Compliance:** If the scene is mature, the subtitle must reflect this, applying all content masking rules from the system instructions if necessary.
            5.  **Title, Synopsis, and Comments (CRITICAL):**
                -   **Language and Tone:** Generate these in the user's language. The overall tone must match the events of the game. If the theme is dark or mature, these elements must reflect that, applying content masking rules if required.
                -   **Viewer Comments Deep Dive:** The 'comments' array is not just a list of generic praise. It is your chance to simulate a real audience reaction. You MUST create comments that reflect a diversity of opinions and personalities. Think of each comment as a glimpse into a different viewer's mind:
                    -   **The Enthusiast:** Overwhelmed with excitement. "10/10, визуал просто сносит крышу!"
                    -   **The Skeptic/Analyst:** Appreciates the technical aspects but questions the substance. "Выглядит красиво, но не уверен насчет сюжета. Надеюсь, это не просто набор красивых картинок."
                    -   **The Lore Expert:** Focuses on details that only a fan of the world would notice. "Наконец-то правильно показали герб дома Валериус! Уважение создателям."
                    -   **The Casual Viewer:** Is intrigued but has questions. "Не совсем понял, кто главный злодей, но атмосфера зацепила. Буду смотреть."
                    -   **The Emotional Viewer:** Reacts to the characters and their plight. "Бедная Элара, надеюсь, с ней все будет в порядке. Сцена в лесу разбила мне сердце."
                -   Each comment MUST be distinct in its perspective and tone.
            6.  **JSON ONLY:** Your entire output MUST be a single, valid JSON object that adheres strictly to the provided JSON output format. No other text is permitted.
        </MANDATORY_INSTRUCTIONS>
        
        <JSON_OUTPUT_FORMAT>
            <DESCRIPTION>
                You are a JSON generation expert. Your response MUST be a single, raw, syntactically perfect JSON object.
                Do NOT include any surrounding text, explanations, or markdown formatting like \`\`\`json.
                Your entire output must start with '{' and end with '}'.
            </DESCRIPTION>
            <STRUCTURE>
                - "title": (String) A translated, epic title for the trailer.
                - "synopsis": (String) A short, one-paragraph synopsis of the trailer's story, translated.
                - "comments": (Array of Strings) 3-5 translated, fictional "viewer comments" about the trailer.
                - "frames": (Array of Objects) A sequence of 5 to 8 frame objects. Each frame object MUST contain:
                    - "imagePrompt": (String) An English, cinematic, highly detailed prompt for an image generator.
                    - "subtitle": (String) A literary, meaningful subtitle in the user's language ('${gameSettings.language}').
            </STRUCTURE>
            <EXAMPLE>
                <![CDATA[
                {
                  "title": "Тени Забытого Короля",
                  "synopsis": "Когда древнее зло пробуждается, одинокий герой должен столкнуться с тенями своего прошлого, чтобы спасти будущее. Этот трейлер показывает его отчаянный путь от залитых дождем руин до огненного сердца вражеской цитадели.",
                  "comments": [
                    "10/10! Визуальные эффекты просто невероятны, а музыка пробирает до мурашек. Не могу дождаться!",
                    "Хм, выглядит красиво, но сюжет кажется немного предсказуемым. Надеюсь, в полной версии будут неожиданные повороты, а не просто 'герой спасает мир'.",
                    "Наконец-то! Они правильно показали символику Древних на руинах. Фанаты лора оценят такое внимание к деталям.",
                    "Главный герой выглядит слишком подавленным. Тяжелый фильм будет, видимо."
                  ],
                  "frames": [
                    {
                      "imagePrompt": "Cinematic wide shot, a lone warrior in a tattered cloak standing on a cliff overlooking a storm-wracked sea, dramatic lighting, rain, epic fantasy art, photorealistic, Unreal Engine 5 render.",
                      "subtitle": "Они говорили, что мир нуждается в герое. Они не сказали, какую цену придется за это заплатить."
                    },
                    {
                      "imagePrompt": "Extreme close-up on the warrior's determined, scarred face, eyes filled with sorrow and resolve, hyper-detailed, cinematic.",
                      "subtitle": "Но в его глазах не было страха, лишь холодная сталь принятого решения."
                    }
                  ]
                }
                ]]>
            </EXAMPLE>
        </JSON_OUTPUT_FORMAT>

        <CONTEXT>
            <Language>${gameSettings.language}</Language>
            <GameWorld>${JSON.stringify(gameSettings.gameWorldInformation)}</GameWorld>
            <PlayerCharacter>${JSON.stringify(playerCharacter)}</PlayerCharacter>
            <VisitedLocations>${JSON.stringify(visitedLocations)}</VisitedLocations>
            <PlotOutline>${JSON.stringify(plotOutline)}</PlotOutline>
            <RecentHistory>${JSON.stringify(responseHistory.slice(-20))}</RecentHistory>
            <WorldEvents>${JSON.stringify(worldEventsLog?.slice(-10))}</WorldEvents>
            <KeyNPCs>${JSON.stringify((encounteredNPCs || []).slice(-10).map(npc => ({ name: npc.name, description: npc.appearanceDescription, history: npc.history, attitude: npc.attitude })))}</KeyNPCs>
        </CONTEXT>
    </CINEMATIC_TRAILER_GENERATION_PROTOCOL>
    `;

    return { promptContent, systemInstruction };
};

export const getContinueCinemaPrompt = (context, existingCinematic) => {
    const {
        gameSettings,
        playerCharacter,
        visitedLocations,
        plotOutline,
        responseHistory,
        worldEventsLog,
        encounteredNPCs,
    } = context;
    
    const systemInstruction = gameSettings.adultMode ? getAdultPrompt() : undefined;

    const promptContent = `
    <CONTINUE_CINEMATIC_PROTOCOL>
        <ROLE_ADAPTATION_PROTOCOL>
            <PRIMARY_ROLE>You are the Game Master (GM) continuing a special task.</PRIMARY_ROLE>
            <CURRENT_TASK>Your task is to continue your role as a film director AI and extend an existing cinematic trailer, using your full knowledge of the game's world and its rules.</CURRENT_TASK>
            <RULE_INHERITANCE>
                CRITICAL: All governing rules from our primary interaction, including the 21+ content policies ('<PlayerGMAgreement>', '<ContentModerationProtocol>'), remain in full effect. You must continue to tell the story without censorship, applying all required content masking rules to any mature text you generate.
            </RULE_INHERITANCE>
        </ROLE_ADAPTATION_PROTOCOL>

        <ROLE>You are a film director and screenwriter AI, tasked with continuing an existing cinematic trailer.</ROLE>

        <MISSION_BRIEFING>
            <OBJECTIVE>
                Based on the provided game context and an existing trailer, you will generate a JSON object containing a sequence of NEW "frames", NEW fictional "viewer comments", and an UPDATED "synopsis" that incorporates the new scenes.
            </OBJECTIVE>
            <EXISTING_TRAILER_CONTEXT>
                <Title>${existingCinematic.title}</Title>
                <OriginalUserPrompt>${existingCinematic.userPrompt}</OriginalUserPrompt>
                <OriginalSynopsis>${existingCinematic.synopsis}</OriginalSynopsis>
                <ExistingFramesCount>${existingCinematic.frames.length}</ExistingFramesCount>
                <LastFrame>
                    <ImagePrompt>${existingCinematic.frames[existingCinematic.frames.length - 1].imagePrompt}</ImagePrompt>
                    <Subtitle>${existingCinematic.frames[existingCinematic.frames.length - 1].subtitle}</Subtitle>
                </LastFrame>
            </EXISTING_TRAILER_CONTEXT>
        </MISSION_BRIEFING>

        <MANDATORY_INSTRUCTIONS>
            1.  **Analyze Context:** As the Game Master, you MUST use your knowledge of the game context ('<CONTEXT>' block) to find relevant scenes, characters, and emotions that logically follow the existing trailer frames. Your new scenes must be grounded in the game's actual history.
            2.  **Cinematic Structure:** Generate exactly 3 or 4 NEW frames that logically continue the story. Build upon the existing tension and narrative.
            3.  **Image Prompts (CRITICAL):**
                -   Each 'imagePrompt' MUST be in English.
                -   It must be highly detailed, artistic, and suitable for a high-quality AI image generator.
                -   Focus on composition, lighting, mood, and action. Use keywords like "cinematic shot," "dramatic lighting," "epic fantasy art," "photorealistic," "Unreal Engine 5 render".
                -   DO NOT include text or subtitles in the image prompt itself.
            4.  **Subtitles (CRITICAL):**
                -   **Literary and Voluminous:** Each 'subtitle' MUST be written in the user's language ('${gameSettings.language}'). Write a complete, evocative sentence or two that adds narrative depth.
                -   **Function:** The subtitle should complement the image, not just describe it. It can be dialogue, narration, or a thematic statement.
                -   **Variety:** Vary the style of the subtitles to keep the trailer engaging.
                -   **Content Compliance:** If the scene is mature, the subtitle must reflect this, applying all content masking rules from the system instructions if necessary.
            5.  **Synopsis and Comments (CRITICAL):**
                -   **Language and Tone:** Generate these in the user's language. The tone must match the evolving story.
                -   **Updated Synopsis:** You MUST generate an 'updatedSynopsis' that incorporates the new scenes and expands upon the original synopsis, creating a cohesive story.
                -   **Viewer Comments Deep Dive:** The 'newComments' array is not just a list of generic praise. You MUST create comments that reflect a diversity of opinions and personalities, reacting to the NEW scenes. Think of each comment as a glimpse into a different viewer's mind:
                    -   **The Enthusiast:** "The second half is even better than the first!"
                    -   **The Skeptic/Analyst:** "Okay, the plot is getting more interesting. That twist was unexpected."
                    -   **The Lore Expert:** "I KNEW that character would turn out to be important! This confirms my theory."
                    -   **The Emotional Viewer:** "Nooo, why did they have to go there? I'm so worried for them now."
                -   Each comment MUST be distinct in its perspective and tone.
            6.  **JSON ONLY:** Your entire output MUST be a single, valid JSON object that adheres strictly to the provided JSON output format. No other text is permitted.
        </MANDATORY_INSTRUCTIONS>
        
        <JSON_OUTPUT_FORMAT>
            <DESCRIPTION>
                You are a JSON generation expert. Your response MUST be a single, raw, syntactically perfect JSON object.
                Your entire output must start with '{' and end with '}'.
            </DESCRIPTION>
            <STRUCTURE>
                - "updatedSynopsis": (String) The new, extended synopsis in the user's language.
                - "newComments": (Array of Strings) 2-3 new, translated, fictional viewer comments reacting to the new frames.
                - "frames": (Array of Objects) The 3-4 NEW frame objects. Each object must have "imagePrompt" (String, English) and "subtitle" (String, ${gameSettings.language}).
            </STRUCTURE>
            <EXAMPLE>
                <![CDATA[
                {
                  "updatedSynopsis": "Когда древнее зло пробуждается, герой должен столкнуться с тенями прошлого. Его отчаянный путь приводит его к огненному сердцу вражеской цитадели, где его ждет последняя, решающая битва за душу мира.",
                  "newComments": [
                    "Вот это поворот! Вторая половина выглядит еще эпичнее!",
                    "Надеюсь, финал не разочарует. Пока что все выглядит очень мощно."
                  ],
                  "frames": [
                    {
                      "imagePrompt": "Cinematic shot, the hero raises a glowing sword, confronting a shadowy beast in a dark cavern, magical energy crackling, epic fantasy art.",
                      "subtitle": "Но тьма не собиралась отступать; она лишь сменила облик, приняв форму его худших кошмаров."
                    }
                  ]
                }
                ]]>
            </EXAMPLE>
        </JSON_OUTPUT_FORMAT>

        <CONTEXT>
            <Language>${gameSettings.language}</Language>
            <GameWorld>${JSON.stringify(gameSettings.gameWorldInformation)}</GameWorld>
            <PlayerCharacter>${JSON.stringify(playerCharacter)}</PlayerCharacter>
            <VisitedLocations>${JSON.stringify(visitedLocations)}</VisitedLocations>
            <PlotOutline>${JSON.stringify(plotOutline)}</PlotOutline>
            <RecentHistory>${JSON.stringify(responseHistory.slice(-20))}</RecentHistory>
            <WorldEvents>${JSON.stringify(worldEventsLog?.slice(-10))}</WorldEvents>
            <KeyNPCs>${JSON.stringify((encounteredNPCs || []).slice(-10).map(npc => ({ name: npc.name, description: npc.appearanceDescription, history: npc.history, attitude: npc.attitude })))}</KeyNPCs>
        </CONTEXT>
    </CONTINUE_CINEMATIC_PROTOCOL>
    `;

    return { promptContent, systemInstruction };
};
