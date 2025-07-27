
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
