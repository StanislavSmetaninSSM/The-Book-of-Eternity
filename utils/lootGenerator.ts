import { PlayerCharacter, LootTemplate } from '../types';

// New, more detailed configuration object
const lootConfig = {
    randomness: {
        maxRoll: 1000000,
        // Base chance for a bonus to be a "special effect" rather than a stat boost.
        // This will be heavily modified by item quality.
        baseSpecialBonusChance: 30000,
        // Defines the probability distribution for non-stat bonuses.
        specialEffectDistribution: {
            curse: 0.15, // 15% chance for a curse
            conditional: 0.30, // 30% chance for a conditional stat bonus
            standard: 0.55 // 55% chance for a standard interesting effect
        },
    },
    // Chance to find no loot at all. Higher quality multipliers will reduce this chance.
    noLootChance: {
        base: 0.35, // 35% base chance to find nothing in a neutral situation.
        min: 0.05, // Minimum chance of finding nothing (5%).
        max: 0.95, // Maximum chance of finding nothing (95%).
    },
    // Chance per point of Luck to trigger a lucky strike event.
    luckyStrikeChancePerPointOfLuck: 0.005, // 0.5% chance per point of luck.
    // Rarity tiers. Re-balanced base chances and added stat bonus ranges.
    // Bonus counts are aligned with mainPromptModule.js Rule 5.12.3
    qualityTiers: [
        { name: "Unique", base: 1200, multiplier: 8, minBonuses: 12, maxBonuses: 15, specialBonusChanceMultiplier: 12.0, statBonusRange: [10, 15], conditionalStatBonusRange: [12, 18] },
        { name: "Legendary", base: 2500, multiplier: 15, minBonuses: 6, maxBonuses: 8, specialBonusChanceMultiplier: 8.0, statBonusRange: [7, 10], conditionalStatBonusRange: [9, 13] },
        { name: "Epic", base: 5000, multiplier: 25, minBonuses: 4, maxBonuses: 5, specialBonusChanceMultiplier: 5.0, statBonusRange: [5, 7], conditionalStatBonusRange: [6, 9] },
        { name: "Rare", base: 10000, multiplier: 45, minBonuses: 3, maxBonuses: 3, specialBonusChanceMultiplier: 3.0, statBonusRange: [3, 5], conditionalStatBonusRange: [4, 7] },
        { name: "Good", base: 25000, multiplier: 80, minBonuses: 1, maxBonuses: 2, specialBonusChanceMultiplier: 2.0, statBonusRange: [2, 3], conditionalStatBonusRange: [3, 4] },
        { name: "Uncommon", base: 50000, multiplier: 150, minBonuses: 1, maxBonuses: 1, specialBonusChanceMultiplier: 1.5, statBonusRange: [1, 2], conditionalStatBonusRange: [2, 3] },
        { name: "Common", base: 150000, multiplier: 280, minBonuses: 0, maxBonuses: 1, specialBonusChanceMultiplier: 1.0, statBonusRange: [1, 1], conditionalStatBonusRange: [1, 2] },
    ],
    // Using a power curve for level scaling instead of linear.
    levelScalingPower: 0.9,
};


export function generateLootTemplates(
    multipliers: number[],
    playerCharacter: PlayerCharacter,
    numberOfItems: number
): LootTemplate[] {
    if (!multipliers || multipliers.length < 5) {
        multipliers = [0.1, 1.1, 1.1, 1.1, 0.1];
    }
    const coefficients = {
        searchCoefficient: Number(multipliers[0]),
        locationCoefficient: Number(multipliers[1]),
        dangerCoefficient: Number(multipliers[2]),
        logicCoefficient: Number(multipliers[3]),
        characterCoefficient: Number(multipliers[4])
    };

    const luckValue = playerCharacter.characteristics.modifiedLuck;
    const luckMultiplier = 1 + (luckValue / 200); // 0.5% boost per point of luck

    // Calculate a single, comprehensive multiplier for loot quality.
    let baseQualityMultiplier = (1 + coefficients.searchCoefficient + coefficients.characterCoefficient + coefficients.logicCoefficient)
        * coefficients.locationCoefficient * coefficients.dangerCoefficient * luckMultiplier;
    
    // Clamp the multiplier to prevent extreme results where only trash or only legendary items drop.
    baseQualityMultiplier = Math.max(0.5, Math.min(5.0, baseQualityMultiplier));

    const lootTemplates: LootTemplate[] = [];

    for (let itemIndex = 0; itemIndex < numberOfItems; itemIndex++) {
        // Determine if any loot is found at all for this "slot".
        const finalNoLootChance = Math.max(lootConfig.noLootChance.min, Math.min(lootConfig.noLootChance.max, lootConfig.noLootChance.base / baseQualityMultiplier));
        if (Math.random() < finalNoLootChance) {
            continue; // No item found in this slot.
        }

        // 1. Determine Item Quality
        const randomValue = Math.floor(Math.random() * lootConfig.randomness.maxRoll) + 1;
        let assignedQuality = "Common"; // Default quality
        
        for (const quality of lootConfig.qualityTiers) {
            const currentQualityChance = (quality.base + quality.multiplier * Math.pow(playerCharacter.level, lootConfig.levelScalingPower)) * baseQualityMultiplier;
            if (randomValue <= currentQualityChance) {
                assignedQuality = quality.name;
                break;
            }
        }
        
        // 2. Lucky Strike Mechanic
        let extraBonus = 0;
        const luckyStrikeChance = luckValue * lootConfig.luckyStrikeChancePerPointOfLuck;
        if (Math.random() < luckyStrikeChance) {
            if (Math.random() < 0.5) {
                 const currentQualityIndex = lootConfig.qualityTiers.findIndex(q => q.name === assignedQuality);
                 if (currentQualityIndex > 0) {
                     assignedQuality = lootConfig.qualityTiers[currentQualityIndex - 1].name;
                 }
            } else {
                extraBonus = 1;
            }
        }
        
        // 3. Generate Bonuses
        const qualityInfo = lootConfig.qualityTiers.find(q => q.name === assignedQuality)!;
        let totalBonuses = (Math.floor(Math.random() * (qualityInfo.maxBonuses - qualityInfo.minBonuses + 1)) + qualityInfo.minBonuses) + extraBonus;
        const bonuses: string[] = [];
        
        const specialBonusChance = lootConfig.randomness.baseSpecialBonusChance * qualityInfo.specialBonusChanceMultiplier;

        for (let i = 1; i <= totalBonuses; i++) {
            const bonusRandomValue = Math.floor(Math.random() * lootConfig.randomness.maxRoll) + 1;
            
            if (bonusRandomValue < specialBonusChance * i) {
                // It's a special effect.
                const specialRand = Math.random();
                if (specialRand < lootConfig.randomness.specialEffectDistribution.curse) {
                    // Cursed item gets an extra bonus slot.
                    bonuses.push("generate_curse_or_detrimental_effect (Rule 5.11.2.4)");
                    totalBonuses++;
                } else if (specialRand < lootConfig.randomness.specialEffectDistribution.curse + lootConfig.randomness.specialEffectDistribution.conditional) {
                    const [min, max] = qualityInfo.conditionalStatBonusRange;
                    bonuses.push(`generate_conditional_stat_bonus_from_${min}_to_${max} (Rule 5.11.2.3)`);
                } else {
                    bonuses.push("generate_interesting_effect (Rule 5.11.2.1)");
                }
            } else {
                // It's a standard stat bonus.
                const [min, max] = qualityInfo.statBonusRange;
                bonuses.push(`generate_stat_bonus_from_${min}_to_${max} (Rule 5.11.2.2)`);
            }
        }
        
        // 4. Add template
        lootTemplates.push({
            baseName: `item_${itemIndex + 1}`,
            quality: assignedQuality,
            bonuses: bonuses
        });
    }
    
    return lootTemplates;
}