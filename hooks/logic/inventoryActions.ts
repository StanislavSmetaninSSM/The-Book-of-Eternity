import { GameState, Item, PlayerCharacter, NPC, Wound, Effect } from '../../types';
import { 
    equipItem as equipItemUtil, 
    unequipItem as unequipItemUtil, 
    dropItem as dropItemUtil, 
    moveItem as moveItemUtil, 
    recalculateAllWeights, 
    splitItemStack as splitItemUtil, 
    mergeItemStacks as mergeItemUtil,
    transferItemBetweenCharacters,
    equipItemForNpc as equipItemForNpcUtil,
    unequipItemForNpc as unequipItemForNpcUtil,
    moveItemForNpc as moveItemForNpcUtil,
    splitItemStackForNpc as splitItemForNpcUtil,
    mergeItemStacksForNpc as mergeItemForNpcUtil
} from '../../utils/inventoryManager';
import { recalculateDerivedStats } from '../../utils/gameContext';

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

export const createInventoryActions = (
    {
        setGameState,
        gameContextRef,
        t,
        gameState
    }: {
        setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
        gameContextRef: React.MutableRefObject<any>,
        t: TFunction,
        gameState: GameState | null
    }
) => {

    const handleCompanionInventoryAction = (action: (currentState: GameState) => GameState) => {
        setGameState(prevState => {
            if (!prevState) return null;
            let newState = action(prevState);
            
            newState.playerCharacter = recalculateAllWeights(newState.playerCharacter);
            newState.playerCharacter = recalculateDerivedStats(newState.playerCharacter);

            newState.encounteredNPCs = newState.encounteredNPCs.map((npc) => {
                if (!npc) return npc;
                let updatedNpc = recalculateAllWeights(npc);
                updatedNpc = recalculateDerivedStats(updatedNpc);
                if (updatedNpc.totalWeight !== undefined && updatedNpc.maxWeight !== undefined) {
                    updatedNpc.isOverloaded = updatedNpc.totalWeight > updatedNpc.maxWeight;
                } else {
                    updatedNpc.isOverloaded = false;
                }
                return updatedNpc;
            });

            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = newState.playerCharacter;
                gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
            }
            return newState;
        });
    };

    const handleTransferItem = (sourceType: 'player' | 'npc', targetType: 'player' | 'npc', npcId: string, item: Item, quantity: number) => {
        if (targetType === 'npc') {
            const npc = gameState?.encounteredNPCs.find(n => n.NPCId === npcId);
            if (npc) {
                const validQuantity = Math.min(quantity, item.count);
                const weightOfMovedItem = item.weight * validQuantity;
                
                let npcWithStats = recalculateAllWeights(npc);
                npcWithStats = recalculateDerivedStats(npcWithStats);

                const criticalWeight = (npcWithStats.maxWeight || 0) + (npcWithStats.criticalExcessWeight || 15);
                const prospectiveWeight = (npcWithStats.totalWeight || 0) + weightOfMovedItem;

                if (prospectiveWeight > criticalWeight) {
                    alert(t('npc_overloaded_refusal'));
                    return;
                }
            }
        }
        handleCompanionInventoryAction(currentState => 
            transferItemBetweenCharacters(sourceType, targetType, npcId, item, quantity, currentState)
        );
    };

    const handleEquipItemForNpc = (npcId: string, item: Item, slot: string) => {
        handleCompanionInventoryAction(currentState => equipItemForNpcUtil(npcId, item, slot, currentState));
    };

    const handleUnequipItemForNpc = (npcId: string, item: Item) => {
        handleCompanionInventoryAction(currentState => unequipItemForNpcUtil(npcId, item, currentState));
    };
    
    const handleMoveItemForNpc = (npcId: string, item: Item, containerId: string | null) => {
        handleCompanionInventoryAction(currentState => moveItemForNpcUtil(npcId, item, containerId, currentState));
    };

    const handleSplitItemForNpc = (npcId: string, item: Item, quantity: number) => {
        handleCompanionInventoryAction(currentState => splitItemForNpcUtil(npcId, item, quantity, currentState));
    };

    const handleMergeItemsForNpc = (npcId: string, sourceItem: Item, targetItem: Item) => {
        handleCompanionInventoryAction(currentState => mergeItemForNpcUtil(npcId, sourceItem, targetItem, currentState));
    };

    const craftItem = (recipeName: string) => {
        return `[System Action] Attempt to craft item using recipe: ${recipeName}`;
    };

    const equipItem = (itemToEquip: Item, slot: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            
            const potentialNewState = equipItemUtil(itemToEquip, slot, prevState);
            const newPc = potentialNewState.playerCharacter;
            const inventory = newPc.inventory;

            const mainHandId = newPc.equippedItems.MainHand;
            const offHandId = newPc.equippedItems.OffHand;

            const mainHandItem = mainHandId ? inventory.find(i => i.existedId === mainHandId) : null;
            const offHandItem = offHandId ? inventory.find(i => i.existedId === offHandId) : null;

            const mainHandIsTwoHander = mainHandItem && mainHandItem.requiresTwoHands;
            const offHandIsTwoHander = offHandItem && offHandItem.requiresTwoHands;

            const isPenalty = (mainHandIsTwoHander && mainHandId !== offHandId) || (offHandIsTwoHander && mainHandId !== offHandId);

            if (isPenalty) {
                alert(t('two_handed_penalty_warning'));
            }
            
            let pc = recalculateAllWeights(newPc);
            pc = recalculateDerivedStats(pc);
            potentialNewState.playerCharacter = pc;

            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = pc;
            }
            
            return potentialNewState;
        });
    };

    const unequipItem = (itemToUnequip: Item) => {
        setGameState(prevState => {
          if (!prevState) return null;
          let newGameState = unequipItemUtil(itemToUnequip, prevState);
          let pc = recalculateAllWeights(newGameState.playerCharacter);
          pc = recalculateDerivedStats(pc);
          newGameState.playerCharacter = pc;
          if (gameContextRef.current) {
              gameContextRef.current.playerCharacter = newGameState.playerCharacter;
          }
          return newGameState;
        });
    };

    const dropItem = (itemToDrop: Item) => {
        setGameState(prevState => {
          if (!prevState) return null;
          let newGameState = dropItemUtil(itemToDrop, prevState);
          let pc = recalculateAllWeights(newGameState.playerCharacter);
          pc = recalculateDerivedStats(pc);
          newGameState.playerCharacter = pc;
          if (gameContextRef.current) {
              gameContextRef.current.playerCharacter = newGameState.playerCharacter;
          }
          return newGameState;
        });
    };

    const moveItem = (itemToMove: Item, destinationContainerId: string | null) => {
        setGameState(prevState => {
          if (!prevState) return null;
          let newGameState = moveItemUtil(itemToMove, destinationContainerId, prevState);
          let pc = recalculateAllWeights(newGameState.playerCharacter);
          pc = recalculateDerivedStats(pc);
          newGameState.playerCharacter = pc;
          if (gameContextRef.current) {
              gameContextRef.current.playerCharacter = newGameState.playerCharacter;
          }
          return newGameState;
        });
    };
    
    const splitItemStack = (itemToSplit: Item, splitAmount: number) => {
        setGameState(prevState => {
            if (!prevState) return null;
            let newGameState = splitItemUtil(itemToSplit, splitAmount, prevState);
            let pc = recalculateAllWeights(newGameState.playerCharacter);
            pc = recalculateDerivedStats(pc);
            newGameState.playerCharacter = pc;
            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = newGameState.playerCharacter;
            }
            return newGameState;
        });
    };

    const mergeItemStacks = (sourceItem: Item, targetItem: Item) => {
        setGameState(prevState => {
            if (!prevState) return null;
            let newGameState = mergeItemUtil(sourceItem, targetItem, prevState);
            let pc = recalculateAllWeights(newGameState.playerCharacter);
            pc = recalculateDerivedStats(pc);
            newGameState.playerCharacter = pc;
            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = pc;
            }
            return newGameState;
        });
    };

    const disassembleItem = (itemToDisassemble: Item) => {
        if (!itemToDisassemble.disassembleTo || itemToDisassemble.disassembleTo.length === 0) {
            return;
        }

        setGameState(prevState => {
            if (!prevState) return null;

            const newState = JSON.parse(JSON.stringify(prevState));
            let pc = newState.playerCharacter as PlayerCharacter;
            
            let inventory = pc.inventory as Item[];

            let itemFoundAndDecremented = false;
            inventory = inventory.map(item => {
                if (item.existedId === itemToDisassemble.existedId) {
                    itemFoundAndDecremented = true;
                    return { ...item, count: item.count - 1 };
                }
                return item;
            }).filter(item => item.count > 0);

            if (!itemFoundAndDecremented) {
                console.warn("Item to disassemble not found or already gone.");
                return prevState;
            }

            itemToDisassemble.disassembleTo.forEach((material: any) => {
                const existingStackIndex = inventory.findIndex(i => 
                    i.name === material.materialName &&
                    !i.equipmentSlot &&
                    i.type === 'Material'
                );

                if (existingStackIndex > -1) {
                    inventory[existingStackIndex].count += material.quantity;
                } else {
                    const newItem: Item = {
                        existedId: generateId('item'),
                        name: material.materialName,
                        description: material.description || t('A crafting material.'),
                        image_prompt: `crafting material, ${material.materialName}, fantasy art, plain background`,
                        quality: material.quality || 'Common',
                        type: 'Material',
                        group: 'CraftingMaterial',
                        price: material.price || 1,
                        count: material.quantity,
                        weight: material.weight || 0.1,
                        volume: material.volume || 0.1,
                        bonuses: [],
                        isContainer: false,
                        capacity: null,
                        isConsumption: true,
                        durability: "100%",
                        equipmentSlot: null,
                        requiresTwoHands: false,
                        contentsPath: null,
                    };
                    inventory.push(newItem);
                }
            });

            pc.inventory = inventory;
            pc = recalculateAllWeights(pc);
            pc = recalculateDerivedStats(pc);

            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = pc;
            }

            return { ...newState, playerCharacter: pc };
        });
    };

    const disassembleNpcItem = (npcId: string, itemToDisassemble: Item) => {
        if (!itemToDisassemble.disassembleTo || itemToDisassemble.disassembleTo.length === 0) {
            return;
        }

        setGameState(prevState => {
            if (!prevState) return null;

            const newState = JSON.parse(JSON.stringify(prevState));
            const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === npcId);
            if (npcIndex === -1) return prevState;

            let npc = newState.encounteredNPCs[npcIndex] as NPC;
            if (!npc.inventory) npc.inventory = [];
            let inventory = npc.inventory as Item[];

            let itemFoundAndDecremented = false;
            inventory = inventory.map(item => {
                if (item.existedId === itemToDisassemble.existedId) {
                    itemFoundAndDecremented = true;
                    return { ...item, count: item.count - 1 };
                }
                return item;
            }).filter(item => item.count > 0);

            if (!itemFoundAndDecremented) {
                console.warn("Item to disassemble not found in NPC inventory.");
                return prevState;
            }

            itemToDisassemble.disassembleTo.forEach((material: any) => {
                const existingStackIndex = inventory.findIndex(i => 
                    i.name === material.materialName &&
                    !i.equipmentSlot &&
                    i.type === 'Material'
                );

                if (existingStackIndex > -1) {
                    inventory[existingStackIndex].count += material.quantity;
                } else {
                    const newItem: Item = {
                        existedId: generateId('item'),
                        name: material.materialName,
                        description: material.description || t('A crafting material.'),
                        image_prompt: `crafting material, ${material.materialName}, fantasy art, plain background`,
                        quality: material.quality || 'Common',
                        type: 'Material',
                        group: 'CraftingMaterial',
                        price: material.price || 1,
                        count: material.quantity,
                        weight: material.weight || 0.1,
                        volume: material.volume || 0.1,
                        bonuses: [],
                        isContainer: false,
                        capacity: null,
                        isConsumption: true,
                        durability: "100%",
                        equipmentSlot: null,
                        requiresTwoHands: false,
                        contentsPath: null,
                    };
                    inventory.push(newItem);
                }
            });

            npc.inventory = inventory;
            let updatedNpc = recalculateAllWeights(npc);
            updatedNpc = recalculateDerivedStats(updatedNpc);
            newState.encounteredNPCs[npcIndex] = updatedNpc;

            if (gameContextRef.current) {
                gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
            }

            return newState;
        });
    };

    const moveFromStashToInventory = (itemToMove: Item, quantity: number) => {
        setGameState(prevState => {
            if (!prevState || !prevState.temporaryStash) return prevState;

            const itemInStash = prevState.temporaryStash.find(i => i.existedId === itemToMove.existedId);
            if (!itemInStash) return prevState;

            const validQuantity = Math.max(0, Math.min(quantity, itemInStash.count));
            if (validQuantity === 0) return prevState;

            const weightOfItemsToTake = itemToMove.weight * validQuantity;
            const prospectiveWeight = prevState.playerCharacter.totalWeight + weightOfItemsToTake;
            if (prospectiveWeight > prevState.playerCharacter.maxWeight + prevState.playerCharacter.criticalExcessWeight) {
                alert(t('You still cannot carry this item. Drop something else first.'));
                return prevState;
            }
            
            const newStash = [...prevState.temporaryStash];
            const stashItemIndex = newStash.findIndex(i => i.existedId === itemToMove.existedId);
            
            newStash[stashItemIndex].count -= validQuantity;
            if (newStash[stashItemIndex].count <= 0) {
                newStash.splice(stashItemIndex, 1);
            }

            let inventory = [...prevState.playerCharacter.inventory];
            const existingStackIndex = inventory.findIndex(i => i.name === itemToMove.name && !i.equipmentSlot && i.resource === undefined);
            
            if (existingStackIndex > -1) {
                inventory[existingStackIndex].count += validQuantity;
            } else {
                const newItemForInventory = { ...itemToMove, count: validQuantity };
                inventory.push(newItemForInventory);
            }
            
            let newPc = { ...prevState.playerCharacter, inventory: inventory };
            newPc = recalculateAllWeights(newPc); 
            newPc = recalculateDerivedStats(newPc);

            if (gameContextRef.current) {
                gameContextRef.current.playerCharacter = newPc;
            }

            return { ...prevState, temporaryStash: newStash, playerCharacter: newPc };
        });
    };

    const dropItemFromStash = (itemToDrop: Item) => {
        setGameState(prevState => {
            if (!prevState || !prevState.temporaryStash) return prevState;
            const newStash = prevState.temporaryStash.filter(i => i.existedId !== itemToDrop.existedId);
            return { ...prevState, temporaryStash: newStash };
        });
    };

    const forgetHealedWound = (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newState = JSON.parse(JSON.stringify(prevState));
            if (characterType === 'player') {
                const pc = newState.playerCharacter as PlayerCharacter;
                pc.playerWounds = pc.playerWounds.filter((w: Wound) => w.woundId !== woundId);
                if (gameContextRef.current) {
                    gameContextRef.current.playerCharacter.playerWounds = pc.playerWounds;
                }
            } else if (characterType === 'npc' && characterId) {
                const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === characterId);
                if (npcIndex > -1) {
                    newState.encounteredNPCs[npcIndex].wounds = (newState.encounteredNPCs[npcIndex].wounds || []).filter((w: Wound) => w.woundId !== woundId);
                     if (gameContextRef.current) {
                        gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
                    }
                }
            }
            return newState;
        });
    };

    const forgetActiveWound = (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newState = JSON.parse(JSON.stringify(prevState));
            
            let woundToRemove: Wound | undefined;

            if (characterType === 'player') {
                const pc = newState.playerCharacter as PlayerCharacter;
                const woundIndex = pc.playerWounds.findIndex((w: Wound) => w.woundId === woundId);
                if (woundIndex > -1) {
                    woundToRemove = pc.playerWounds[woundIndex];
                    pc.playerWounds.splice(woundIndex, 1);
                }
                if (woundToRemove) {
                    pc.activePlayerEffects = (pc.activePlayerEffects || []).filter((e: Effect) => e.sourceWoundId !== woundId);
                }
                if (gameContextRef.current) {
                    gameContextRef.current.playerCharacter = pc;
                }
            } else if (characterType === 'npc' && characterId) {
                const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === characterId);
                if (npcIndex > -1) {
                    const npc = newState.encounteredNPCs[npcIndex];
                    if (npc.wounds) {
                        const woundIndex = npc.wounds.findIndex((w: Wound) => w.woundId === woundId);
                        if (woundIndex > -1) {
                            woundToRemove = npc.wounds[woundIndex];
                            npc.wounds.splice(woundIndex, 1);
                        }
                    }
                    if (woundToRemove) {
                        npc.activeEffects = (npc.activeEffects || []).filter((e: Effect) => e.sourceWoundId !== woundId);
                    }
                    if (gameContextRef.current) {
                        gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
                    }
                }
            }
            return newState;
        });
    };

    const clearAllHealedWounds = (characterType: 'player' | 'npc', characterId: string | null) => {
        setGameState(prevState => {
            if (!prevState) return null;
            const newState = JSON.parse(JSON.stringify(prevState));
            if (characterType === 'player') {
                const pc = newState.playerCharacter as PlayerCharacter;
                pc.playerWounds = pc.playerWounds.filter((w: Wound) => !w.healingState || w.healingState.currentState !== 'Healed');
                 if (gameContextRef.current) {
                    gameContextRef.current.playerCharacter.playerWounds = pc.playerWounds;
                }
            } else if (characterType === 'npc' && characterId) {
                const npcIndex = newState.encounteredNPCs.findIndex((n: NPC) => n.NPCId === characterId);
                if (npcIndex > -1) {
                    newState.encounteredNPCs[npcIndex].wounds = (newState.encounteredNPCs[npcIndex].wounds || []).filter((w: Wound) => !w.healingState || w.healingState.currentState !== 'Healed');
                     if (gameContextRef.current) {
                        gameContextRef.current.encounteredNPCs = newState.encounteredNPCs;
                    }
                }
            }
            return newState;
        });
    };

    return {
        equipItem,
        unequipItem,
        dropItem,
        moveItem,
        splitItemStack,
        mergeItemStacks,
        disassembleItem,
        disassembleNpcItem,
        craftItem,
        moveFromStashToInventory,
        dropItemFromStash,
        forgetHealedWound,
        forgetActiveWound,
        clearAllHealedWounds,
        handleTransferItem,
        handleEquipItemForNpc,
        handleUnequipItemForNpc,
        handleMoveItemForNpc,
        handleSplitItemForNpc,
        handleMergeItemsForNpc
    };
}