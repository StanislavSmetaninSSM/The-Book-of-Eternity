
import { Item, Quest, NPC, Location, PlayerCharacter, Faction, GameSettings, Wound } from '../../types';

export interface DetailRendererProps {
    data: any;
    onForgetNpc?: (npcId: string) => void;
    onClearNpcJournal?: (npcId: string) => void;
    onDeleteOldestNpcJournalEntries?: (npcId: string) => void;
    onCloseModal?: () => void;
    onOpenImageModal?: (prompt: string) => void;
    onForgetLocation?: (locationId: string) => void;
    onForgetQuest?: (questId: string) => void;
    playerCharacter: PlayerCharacter | null;
    setAutoCombatSkill?: (skillName: string | null) => void;
    onOpenDetailModal: (title: string, data: any) => void;
    disassembleItem?: (item: Item) => void;
    currentLocationId?: string;
    allowHistoryManipulation: boolean;
    onEditNpcData: (npcId: string, field: keyof NPC, value: any) => void;
    onEditQuestData: (questId: string, field: keyof Quest, value: any) => void;
    onEditItemData: (itemId: string, field: keyof Item, value: any) => void;
    onEditLocationData: (locationId: string, field: keyof Location, value: any) => void;
    onEditPlayerData: (field: keyof PlayerCharacter, value: any) => void;
    encounteredFactions?: Faction[];
    gameSettings: GameSettings | null;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    forgetHealedWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
    clearAllHealedWounds: (characterType: 'player' | 'npc', characterId: string | null) => void;
}
