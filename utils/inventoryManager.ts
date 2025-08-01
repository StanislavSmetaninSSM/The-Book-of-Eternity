import { GameState, Item, PlayerCharacter } from '../types';

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

export function recalculateAllWeights(pc: PlayerCharacter): PlayerCharacter {
    const newPc = JSON.parse(JSON.stringify(pc));
    const inventory: Item[] = newPc.inventory;

    // Find all containers and sort them by depth, deepest first.
    const containers = inventory
        .filter(item => item.isContainer)
        .sort((a, b) => (b.contentsPath?.length || 0) - (a.contentsPath?.length || 0));

    // Iteratively calculate container weights from the inside out.
    containers.forEach(container => {
        const containerPath = container.contentsPath ? [...container.contentsPath, container.name] : [container.name];
        const containerPathStr = containerPath.join('/');
        
        const contents = inventory.filter(i => i.contentsPath?.join('/') === containerPathStr);
        
        const rawContentsWeight = contents.reduce((sum, item) => {
            // The item's `weight` property is per unit. Total contribution is weight * count.
            // For a container inside, its `weight` property has already been updated to include its own contents.
            return sum + (item.weight * item.count);
        }, 0);
        
        const weightReduction = container.weightReduction || 0;
        const reducedContentsWeight = rawContentsWeight * (1 - (weightReduction / 100));
        
        // The container's new total weight is its empty weight plus the reduced weight of its contents.
        // The `weight` property is PER UNIT, and containers always have count=1, so we just set it.
        container.weight = (container.containerWeight || 0) + reducedContentsWeight;
    });

    // Calculate the total weight of the inventory.
    // Total weight is the sum of all items at the root level (not in any container).
    const totalWeight = inventory
        .filter(item => !item.contentsPath)
        .reduce((sum, item) => sum + (item.weight * item.count), 0);

    newPc.totalWeight = parseFloat(totalWeight.toFixed(2));
    newPc.inventory = inventory;
    
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