
import { CombatActionEffect } from '../../types';

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

export const qualityColorMap: Record<string, string> = {
    'Trash': 'text-gray-500',
    'Common': 'text-gray-300',
    'Uncommon': 'text-green-400',
    'Good': 'text-blue-400',
    'Rare': 'text-indigo-400',
    'Epic': 'text-purple-400',
    'Legendary': 'text-orange-400',
    'Unique': 'text-yellow-400',
};

export const parseAndTranslateTargetType = (targetType: string, t: TFunction): string => {
    const match = targetType.match(/(\w+)\s*\((.+)\)/);
    if (match) {
        const mainType = match[1];
        const subType = match[2];
        return `${t(mainType as any)} (${t(subType as any)})`;
    }
    return t(targetType as any);
};

export const generateEffectDescription = (effect: CombatActionEffect, t: TFunction): string => {
    const templates: Record<string, { timed: string; permanent: string }> = {
        'Damage': { timed: 'deals_dot_effect_template', permanent: 'deals_damage_effect_template' },
        'DamageOverTime': { timed: 'deals_dot_effect_template', permanent: 'deals_dot_effect_template' },
        'Heal': { timed: 'heals_hot_effect_template', permanent: 'heals_effect_template' },
        'HealOverTime': { timed: 'heals_hot_effect_template', permanent: 'heals_hot_effect_template' },
        'Buff': { timed: 'buffs_effect_template', permanent: 'buffs_effect_template_permanent' },
        'Debuff': { timed: 'debuffs_effect_template', permanent: 'debuffs_effect_template_permanent' },
        'Control': { timed: 'controls_effect_template', permanent: 'controls_effect_template_permanent' },
        'DamageReduction': { timed: 'reduces_damage_effect_template', permanent: 'reduces_damage_effect_template_permanent' },
    };
    const allTemplateKeys = new Set(Object.values(templates).flatMap(v => [v.timed, v.permanent]));

    if (effect.effectDescription && !allTemplateKeys.has(effect.effectDescription)) {
        return effect.effectDescription;
    }
    
    const target = effect.targetTypeDisplayName || parseAndTranslateTargetType(effect.targetType, t);
    const value = effect.value;
    const duration = effect.duration;

    const templateKeys = templates[effect.effectType];
    if (templateKeys) {
        // If the description IS a template key, use it. Otherwise, determine from type/duration.
        const key = allTemplateKeys.has(effect.effectDescription || '') 
            ? effect.effectDescription!
            : (duration ? templateKeys.timed : templateKeys.permanent);

        const replacements: Record<string, string | number> = { value, target };
        if (duration) {
            replacements.duration = duration;
        }
        return t(key, replacements);
    }

    // Generic fallback for unknown types
    let desc = `${t(effect.effectType as any)}: ${value}`;
    if (target) desc += ` ${target}`;
    if (duration) desc += ` (${t('{duration} turns', { duration })})`;
    return desc;
};
