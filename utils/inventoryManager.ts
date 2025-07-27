
import { GameState, Item, PlayerCharacter } from '../types';

export const equipItem = (itemToEquip: Item, slot: string, currentState: GameState): GameState => {
    const newState = JSON.parse(JSON.stringify(currentState));
    const pc = newState.playerCharacter as PlayerCharacter;
    const inventory = pc.inventory as Item[];

    const slotsToClear = new Set<string>();

    if (itemToEquip.requiresTwoHands) {
        slotsToClear.add('MainHand');
        slotsToClear.add('OffHand');
    } else {
        slotsToClear.add(slot);
        const mainHandId = pc.equippedItems['MainHand'];
        if (['MainHand', 'OffHand'].includes(slot) && mainHandId && mainHandId === pc.equippedItems['OffHand']) {
            slotsToClear.add('MainHand');
            slotsToClear.add('OffHand');
        }
    }

    slotsToClear.forEach(slotToClear => {
        const currentlyEquippedId = pc.equippedItems[slotToClear];
        if (currentlyEquippedId) {
            const unequippedItem = inventory.find(i => i.existedId === currentlyEquippedId);
            if (unequippedItem) {
                unequippedItem.contentsPath = null;
            }
            pc.equippedItems[slotToClear] = null;
        }
    });

    if (itemToEquip.requiresTwoHands) {
        pc.equippedItems['MainHand'] = itemToEquip.existedId;
        pc.equippedItems['OffHand'] = itemToEquip.existedId;
    } else {
        pc.equippedItems[slot] = itemToEquip.existedId;
    }

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
