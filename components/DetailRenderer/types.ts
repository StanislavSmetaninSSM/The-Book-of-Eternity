
import { Item, Quest, NPC, Location, PlayerCharacter, Faction, GameSettings, Wound, UnlockedMemory } from '../../types';

export interface WoundDetailsProps extends Omit<DetailRendererProps, 'data'> {
    wound: Wound & { characterType?: 'player' | 'npc', characterId?: string | null };
}

export interface DetailRendererProps {
    data: any;
    onForgetNpc?: (npcId: string) => void;
    onClearNpcJournal?: (npcId: string) => void;
    onDeleteOldestNpcJournalEntries?: (npcId: string, count: number) => void;
    onDeleteNpcJournalEntry?: (npcId: string, entryIndex: number) => void;
    onCloseModal?: () => void;
    onOpenImageModal?: (prompt: string, onRegenerate?: (newPrompt: string) => void) => void;
    onForgetLocation?: (locationId: string) => void;
    onForgetQuest?: (questId: string) => void;
    playerCharacter: PlayerCharacter | null;
    setAutoCombatSkill?: (skillName: string | null) => void;
    onOpenDetailModal: (title: string, data: any) => void;
    onShowMessageModal?: (title: string, content: string) => void;
    disassembleItem?: (item: Item) => void;
    disassembleNpcItem?: (npcId: string, item: Item) => void;
    currentLocationId?: string;
    allowHistoryManipulation: boolean;
    onEditNpcData: (npcId: string, field: keyof NPC, value: any) => void;
    onEditQuestData: (questId: string, field: keyof Quest, value: any) => void;
    onEditItemData: (itemId: string, field: keyof Item, value: any) => void;
    onEditLocationData: (locationId: string, field: keyof Location, value: any) => void;
    onEditPlayerData: (field: keyof PlayerCharacter, value: any) => void;
    onEditFactionData: (factionId: string, field: keyof Faction, value: any) => void;
    onRegenerateId?: (entity: any, entityType: string) => void;
    encounteredFactions?: Faction[];
    gameSettings: GameSettings | null;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    forgetHealedWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
    forgetActiveWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
    clearAllHealedWounds: (characterType: 'player' | 'npc', characterId: string | null) => void;
    visitedLocations?: Location[];
    deleteNpcCustomState?: (npcId: string, stateId: string) => void;
    deleteCustomState?: (stateId: string) => void;
    deleteWorldStateFlag?: (flagId: string) => void;
    onEditNpcMemory?: (npcId: string, memory: UnlockedMemory) => void;
    onDeleteNpcMemory?: (npcId: string, memoryId: string) => void;
    // Companion interaction handlers
    handleTransferItem?: (sourceType: 'player' | 'npc', targetType: 'player' | 'npc', npcId: string, item: Item, quantity: number) => void;
    handleEquipItemForNpc?: (npcId: string, item: Item, slot: string) => void;
    handleUnequipItemForNpc?: (npcId: string, item: Item) => void;
    handleMoveItemForNpc?: (npcId: string, item: Item, containerId: string | null) => void;
    handleSplitItemForNpc?: (npcId: string, item: Item, quantity: number) => void;
    handleMergeItemsForNpc?: (npcId: string, sourceItem: Item, targetItem: Item) => void;
    updateNpcItemSortOrder?: (npcId: string, newOrder: string[]) => void;
    updateNpcItemSortSettings?: (npcId: string, criteria: PlayerCharacter['itemSortCriteria'], direction: PlayerCharacter['itemSortDirection']) => void;
}
