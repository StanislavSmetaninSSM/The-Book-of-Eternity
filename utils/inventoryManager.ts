
import { GameState, Item, PlayerCharacter, NPC } from '../types';
import { recalculateDerivedStats } from './gameContext';

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const equipItem = (itemToEquip: Item, slot: string, currentState: GameState): GameState => {
    if (itemToEquip.durability === '0%') {
        console.warn("Attempted to equip a broken item.");
        return currentState;
    }

    const newState = JSON.parse(JSON.stringify(currentState));
    const pc = newState.playerCharacter as PlayerCharacter;
    const inventory = pc.inventory as Item[];

    // --- UNEQUIP LOGIC ---
    // If equipping a two-hander, clear both hand slots regardless of target slot.
    if (itemToEquip.requiresTwoHands && (slot === 'MainHand' || slot === 'OffHand')) {
        pc.equippedItems.MainHand = null;
        pc.equippedItems.OffHand = null;
    } else {
        // For one-handed items or other slots, only clear the target slot and handle displacing a two-hander.
        const displacedItemId = pc.equippedItems[slot];
        if (displacedItemId) {
            const displacedItem = inventory.find(i => i.existedId === displacedItemId);
            if (displacedItem && displacedItem.requiresTwoHands) {
                pc.equippedItems.MainHand = null;
                pc.equippedItems.OffHand = null;
            } else {
                pc.equippedItems[slot] = null;
            }
        }

        if ((slot === 'MainHand' || slot === 'OffHand')) {
            const otherHand = slot === 'MainHand' ? 'OffHand' : 'MainHand';
            const otherHandItemId = pc.equippedItems[otherHand];
            if (otherHandItemId) { // Check if other hand is occupied
                const otherHandItem = inventory.find(i => i.existedId === otherHandItemId);
                // If the other hand has a two-hander, we must unequip it to make room for this new item.
                if (otherHandItem && otherHandItem.requiresTwoHands) {
                    pc.equippedItems.MainHand = null;
                    pc.equippedItems.OffHand = null;
                }
            }
        }
    }


    // --- EQUIP LOGIC ---
    if (itemToEquip.requiresTwoHands && (slot === 'MainHand' || slot === 'OffHand')) {
        pc.equippedItems.MainHand = itemToEquip.existedId;
        pc.equippedItems.OffHand = itemToEquip.existedId;
    } else {
        pc.equippedItems[slot] = itemToEquip.existedId;
    }

    // --- POST-EQUIP CLEANUP ---
    const equippedItemInInventory = inventory.find(i => i.existedId === itemToEquip.existedId);
    if (equippedItemInInventory) {
        equippedItemInInventory.contentsPath = null;
    }

    return newState;
};

export const unequipItem = (itemToUnequip: Item, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const pc = newState.playerCharacter as PlayerCharacter;
    const inventory = pc.inventory as Item[];

    Object.keys(pc.equippedItems).forEach(slot => {
        if (pc.equippedItems[slot] === itemToUnequip.existedId) {
            pc.equippedItems[slot] = null;
        }
    });

    const itemInInventory = inventory.find(i => i.existedId === itemToUnequip.existedId);
    if (itemInInventory) {
        itemInInventory.contentsPath = null;
    }

    return newState;
};

export const dropItem = (itemToDrop: Item, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const pc = newState.playerCharacter as PlayerCharacter;

    // 1. Unequip the item if it was equipped
    Object.keys(pc.equippedItems).forEach(slot => {
        if (pc.equippedItems[slot] === itemToDrop.existedId) {
            pc.equippedItems[slot] = null;
        }
    });

    // 2. Remove the item from inventory
    pc.inventory = pc.inventory.filter(i => i.existedId !== itemToDrop.existedId);

    // 3. Add the item to the temporary stash
    if (!newState.temporaryStash) {
        newState.temporaryStash = [];
    }
    
    // Ensure the item isn't already there before adding
    if (!newState.temporaryStash.find(i => i.existedId === itemToDrop.existedId)) {
        // Dropped items should not have a contentsPath. When taken back, they go to root inventory.
        const itemForStash = { ...itemToDrop, contentsPath: null };
        newState.temporaryStash.push(itemForStash);
    }

    return newState;
};

export const moveItem = (itemToMove: Item, destinationContainerId: string | null, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const pc = newState.playerCharacter as PlayerCharacter;
    const inventory = pc.inventory as Item[];

    const itemInInventory = inventory.find(i => i.existedId === itemToMove.existedId);
    if (!itemInInventory) return currentState;

    Object.keys(pc.equippedItems).forEach(slot => {
        if (pc.equippedItems[slot] === itemToMove.existedId) {
            pc.equippedItems[slot] = null;
        }
    });

    if (destinationContainerId === null) {
        itemInInventory.contentsPath = null;
    } else {
        const container = inventory.find(c => c.existedId === destinationContainerId);
        if (!container || !container.isContainer) return currentState;

        const newPathForContents = container.contentsPath ? [...container.contentsPath, container.name] : [container.name];
        const newPathForContentsStr = newPathForContents.join('/');

        const itemsInContainer = inventory.filter(i => i.contentsPath?.join('/') === newPathForContentsStr);

        if (container.capacity !== null && itemsInContainer.length >= container.capacity) {
            console.warn("Container capacity full");
            return currentState;
        }

        const currentVolumeInContainer = itemsInContainer.reduce((acc, item) => acc + (item.volume * item.count), 0);
        if (container.volume !== null && (currentVolumeInContainer + (itemInInventory.volume * itemInInventory.count)) > container.volume) {
            console.warn("Container volume full");
            return currentState;
        }

        itemInInventory.contentsPath = newPathForContents;
    }

    return newState;
};

export const moveItemForNpc = (npcId: string, itemToMove: Item, destinationContainerId: string | null, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === npcId);
    if (npcIndex === -1) return currentState;
    
    const npc = newState.encounteredNPCs[npcIndex] as NPC;
    if (!npc.inventory) npc.inventory = [];
    const inventory = npc.inventory;

    const itemInInventory = inventory.find(i => i.existedId === itemToMove.existedId);
    if (!itemInInventory) return currentState;

    if (npc.equippedItems) {
        Object.keys(npc.equippedItems).forEach(slot => {
            if ((npc.equippedItems as any)[slot] === itemToMove.existedId) {
                (npc.equippedItems as any)[slot] = null;
            }
        });
    }

    if (destinationContainerId === null) {
        itemInInventory.contentsPath = null;
    } else {
        const container = inventory.find(c => c.existedId === destinationContainerId);
        if (!container || !container.isContainer) return currentState;
        
        const newPathForContents = container.contentsPath ? [...container.contentsPath, container.name] : [container.name];
        
        const newPathForContentsStr = newPathForContents.join('/');
        const itemsInContainer = inventory.filter(i => i.contentsPath?.join('/') === newPathForContentsStr);

        if (container.capacity !== null && itemsInContainer.length >= container.capacity) {
            console.warn("Container capacity full");
            return currentState;
        }

        const currentVolumeInContainer = itemsInContainer.reduce((acc, item) => acc + (item.volume * item.count), 0);
        if (container.volume !== null && (currentVolumeInContainer + (itemInInventory.volume * itemInInventory.count)) > container.volume) {
            console.warn("Container volume full");
            return currentState;
        }

        itemInInventory.contentsPath = newPathForContents;
    }
    
    newState.encounteredNPCs[npcIndex] = npc;
    return newState;
};

export function recalculateAllWeights<T extends (PlayerCharacter | NPC)>(pc: T): T {
    const newPc = JSON.parse(JSON.stringify(pc));
    const inventory: Item[] = newPc.inventory || [];
    
    // This map will store the calculated total weight FOR THE ENTIRE STACK of an item.
    const calculatedWeights = new Map<string, number>();

    // Sort containers by depth, deepest first, to calculate weights from the inside out.
    const containers = inventory
        .filter(item => item.isContainer)
        .sort((a, b) => (b.contentsPath?.length || 0) - (a.contentsPath?.length || 0));

    containers.forEach(container => {
        if (!container.existedId) return;

        const containerPath = container.contentsPath ? [...container.contentsPath, container.name] : [container.name];
        const containerPathStr = containerPath.join('/');

        const contents = inventory.filter(i => i.contentsPath?.join('/') === containerPathStr);
        
        const rawContentsWeight = contents.reduce((sum, item) => {
            // Get the already calculated total weight of the content stack.
            // If not calculated yet (i.e., not a container), calculate from base weight.
            const itemTotalWeight = calculatedWeights.get(item.existedId!) ?? (item.weight * item.count);
            return sum + itemTotalWeight;
        }, 0);

        const weightReduction = container.weightReduction || 0;
        const reducedContentsWeight = rawContentsWeight * (1 - (weightReduction / 100));

        // Use containerWeight if it exists as the canonical empty weight.
        // Fallback to the item's own base weight property if containerWeight is missing.
        const emptyWeight = container.containerWeight ?? container.weight;
        
        // A container is always a single item, count is 1.
        calculatedWeights.set(container.existedId, emptyWeight + reducedContentsWeight);
    });

    // Sum up weights of all root-level items.
    const totalWeight = inventory
        .filter(item => !item.contentsPath)
        .reduce((sum, item) => {
            if (!item.existedId) return sum + (item.weight * item.count);

            // Use the calculated weight if it's a container, otherwise use its base weight.
            const itemTotalWeight = calculatedWeights.get(item.existedId) ?? (item.weight * item.count);
            return sum + itemTotalWeight;
        }, 0);

    newPc.totalWeight = parseFloat(totalWeight.toFixed(2));
    
    // newPc.inventory is NOT modified. The original item weights are preserved in the state.
    return newPc;
}

export const splitItemStack = (itemToSplit: Item, splitAmount: number, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const pc = newState.playerCharacter as PlayerCharacter;

    const originalItem = pc.inventory.find(i => i.existedId === itemToSplit.existedId);
    if (!originalItem || originalItem.count <= splitAmount || splitAmount <= 0) {
        return currentState; // Invalid split
    }

    // Create the new stack
    const newItem: Item = JSON.parse(JSON.stringify(originalItem));
    newItem.existedId = generateId('item');
    newItem.count = splitAmount;
    newItem.contentsPath = null; // New stacks appear at the root

    // If the item has resources, the new stack is assumed to be of "full" items.
    if (newItem.resource !== undefined && newItem.maximumResource !== undefined) {
        newItem.resource = newItem.maximumResource;
    }
    pc.inventory.push(newItem);

    // Update the original stack
    originalItem.count -= splitAmount;

    return newState;
};

export const mergeItemStacks = (sourceItem: Item, targetItem: Item, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const pc = newState.playerCharacter as PlayerCharacter;

    const sourceInInventory = pc.inventory.find(i => i.existedId === sourceItem.existedId);
    const targetInInventory = pc.inventory.find(i => i.existedId === targetItem.existedId);

    if (!sourceInInventory || !targetInInventory || sourceInInventory.existedId === targetInInventory.existedId) {
        return currentState;
    }

    // Merge condition check
    const canMerge = sourceInInventory.name === targetInInventory.name &&
        !sourceInInventory.equipmentSlot && !targetInInventory.equipmentSlot &&
        (sourceInInventory.resource === undefined || 
            (sourceInInventory.resource === sourceInInventory.maximumResource && targetInInventory.resource === targetInInventory.maximumResource)
        );

    if (!canMerge) {
        return currentState; // Cannot merge
    }

    // Perform merge
    targetInInventory.count += sourceInInventory.count;
    pc.inventory = pc.inventory.filter(i => i.existedId !== sourceInInventory.existedId);

    return newState;
};

// --- Companion Inventory Management ---

export const transferItemBetweenCharacters = (
    sourceType: 'player' | 'npc',
    targetType: 'player' | 'npc',
    npcId: string,
    itemToMove: Item,
    quantity: number,
    currentState: GameState
): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const player = newState.playerCharacter as PlayerCharacter;
    const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === npcId);
    if (npcIndex === -1) return currentState;
    const npc = newState.encounteredNPCs[npcIndex] as NPC;

    let sourceInventory, targetInventory;
    if (sourceType === 'player') sourceInventory = player.inventory;
    else sourceInventory = npc.inventory;

    if (targetType === 'player') targetInventory = player.inventory;
    else targetInventory = npc.inventory;

    if (!sourceInventory) return currentState;
    if (!targetInventory) { // Initialize target inventory if it doesn't exist
        targetInventory = [];
        if (targetType === 'npc') npc.inventory = [];
    }
    
    const sourceItemIndex = sourceInventory.findIndex((i: Item) => i.existedId === itemToMove.existedId);
    if (sourceItemIndex === -1) return currentState;

    const sourceItem = sourceInventory[sourceItemIndex];
    const validQuantity = Math.min(quantity, sourceItem.count);

    // Create the item being moved
    const movedItemStack = { ...sourceItem, count: validQuantity, existedId: generateId('item'), contentsPath: null };
    
    // Add to target
    const existingTargetStackIndex = targetInventory.findIndex((i: Item) => i.name === movedItemStack.name && !i.equipmentSlot);
    if (existingTargetStackIndex > -1) {
        targetInventory[existingTargetStackIndex].count += validQuantity;
    } else {
        targetInventory.push(movedItemStack);
    }

    // Remove from source
    sourceItem.count -= validQuantity;
    if (sourceItem.count <= 0) {
        // If item was equipped by source, unequip it
        if (sourceType === 'player') {
             Object.keys(player.equippedItems).forEach(slot => {
                if (player.equippedItems[slot] === sourceItem.existedId) {
                    player.equippedItems[slot] = null;
                }
            });
        } else { // It's an NPC
             Object.keys(npc.equippedItems || {}).forEach(slot => {
                if (npc.equippedItems?.[slot] === sourceItem.existedId) {
                    npc.equippedItems![slot] = null;
                }
            });
        }
        sourceInventory.splice(sourceItemIndex, 1);
    }
    
    return newState;
};

export const equipItemForNpc = (npcId: string, itemToEquip: Item, slot: string, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === npcId);
    if (npcIndex === -1) return currentState;
    
    const npc = newState.encounteredNPCs[npcIndex] as NPC;
    
    if (!npc.inventory) npc.inventory = [];
    if (!npc.equippedItems) {
        npc.equippedItems = {
            Head: null, Neck: null, Chest: null, Back: null, MainHand: null, OffHand: null,
            Hands: null, Wrists: null, Waist: null, Legs: null, Feet: null,
            Finger1: null, Finger2: null
        };
    }
    
    const inventory = npc.inventory as Item[];

    // --- UNEQUIP LOGIC ---
    if (itemToEquip.requiresTwoHands && (slot === 'MainHand' || slot === 'OffHand')) {
        npc.equippedItems.MainHand = null;
        npc.equippedItems.OffHand = null;
    } else {
        const displacedItemId = npc.equippedItems[slot];
        if (displacedItemId) {
            const displacedItem = inventory.find(i => i.existedId === displacedItemId);
            if (displacedItem && displacedItem.requiresTwoHands) {
                npc.equippedItems.MainHand = null;
                npc.equippedItems.OffHand = null;
            } else {
                npc.equippedItems[slot] = null;
            }
        }

        if ((slot === 'MainHand' || slot === 'OffHand')) {
            const otherHand = slot === 'MainHand' ? 'OffHand' : 'MainHand';
            const otherHandItemId = npc.equippedItems[otherHand];
            if (otherHandItemId) {
                const otherHandItem = inventory.find(i => i.existedId === otherHandItemId);
                if (otherHandItem && otherHandItem.requiresTwoHands) {
                    npc.equippedItems.MainHand = null;
                    npc.equippedItems.OffHand = null;
                }
            }
        }
    }

    // --- EQUIP LOGIC ---
    if (itemToEquip.requiresTwoHands && (slot === 'MainHand' || slot === 'OffHand')) {
        npc.equippedItems.MainHand = itemToEquip.existedId;
        npc.equippedItems.OffHand = itemToEquip.existedId;
    } else {
        npc.equippedItems[slot] = itemToEquip.existedId;
    }
    
    return newState;
};


export const unequipItemForNpc = (npcId: string, itemToUnequip: Item, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === npcId);
    if (npcIndex === -1) return currentState;
    const npc = newState.encounteredNPCs[npcIndex] as NPC;
    
    if (!npc.equippedItems) return currentState;

    Object.keys(npc.equippedItems).forEach(slot => {
        if (npc.equippedItems?.[slot] === itemToUnequip.existedId) {
            npc.equippedItems![slot] = null;
        }
    });
    
    return newState;
};

export const splitItemStackForNpc = (npcId: string, itemToSplit: Item, splitAmount: number, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === npcId);
    if (npcIndex === -1) return currentState;
    const npc = newState.encounteredNPCs[npcIndex] as NPC;
    if (!npc.inventory) return currentState;

    const originalItem = npc.inventory.find(i => i.existedId === itemToSplit.existedId);
    if (!originalItem || originalItem.count <= splitAmount || splitAmount <= 0) {
        return currentState; // Invalid split
    }

    // Create the new stack
    const newItem: Item = JSON.parse(JSON.stringify(originalItem));
    newItem.existedId = generateId('item');
    newItem.count = splitAmount;
    newItem.contentsPath = null; // New stacks appear at the root

    // If the item has resources, the new stack is assumed to be of "full" items.
    if (newItem.resource !== undefined && newItem.maximumResource !== undefined) {
        newItem.resource = newItem.maximumResource;
    }
    npc.inventory.push(newItem);

    // Update the original stack
    originalItem.count -= splitAmount;

    return newState;
};

export const mergeItemStacksForNpc = (npcId: string, sourceItem: Item, targetItem: Item, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === npcId);
    if (npcIndex === -1) return currentState;
    const npc = newState.encounteredNPCs[npcIndex] as NPC;
    if (!npc.inventory) return currentState;

    const sourceInInventory = npc.inventory.find(i => i.existedId === sourceItem.existedId);
    const targetInInventory = npc.inventory.find(i => i.existedId === targetItem.existedId);

    if (!sourceInInventory || !targetInInventory || sourceInInventory.existedId === targetInInventory.existedId) {
        return currentState;
    }

    // Merge condition check
    const canMerge = sourceInInventory.name === targetInInventory.name &&
        !sourceInInventory.equipmentSlot && !targetInInventory.equipmentSlot &&
        (sourceInInventory.resource === undefined ||
            (sourceInInventory.resource === sourceInInventory.maximumResource && targetInInventory.resource === targetInInventory.maximumResource)
        );

    if (!canMerge) {
        return currentState; // Cannot merge
    }

    // Perform merge
    targetInInventory.count += sourceInInventory.count;
    npc.inventory = npc.inventory.filter(i => i.existedId !== sourceInInventory.existedId);

    return newState;
};