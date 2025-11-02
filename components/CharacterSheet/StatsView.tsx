import React from 'react';
import { PlayerCharacter, NPC } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface StatsViewProps {
    character: PlayerCharacter | NPC;
    canUpgrade: boolean;
    onSpendAttributePoint: (characteristic: string) => void;
    onOpenDetailModal: (title: string, data: any) => void;
    equipmentBonuses: Record<string, number>;
    passiveSkillBonuses: Record<string, number>;
}

const CHARACTERISTICS_LIST = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'faith', 'attractiveness', 'trade', 'persuasion', 'perception', 'luck', 'speed'];

const StatsView: React.FC<StatsViewProps> = ({
    character,
    canUpgrade,
    onSpendAttributePoint,
    onOpenDetailModal,
    equipmentBonuses,
    passiveSkillBonuses,
}) => {
    const { t } = useLocalization();

    return (
        <div className="space-y-4">
            {canUpgrade && (character as PlayerCharacter).attributePoints > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                    <p className="font-bold text-yellow-300">
                        {t("You have {points} attribute points to spend!", { points: (character as PlayerCharacter).attributePoints })}
                    </p>
                    <p className="text-xs text-yellow-400/80">{t("Click the '+' next to a characteristic to increase it.")}</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CHARACTERISTICS_LIST.map(charName => {
                    const charNameRaw = charName.charAt(0).toUpperCase() + charName.slice(1);
                    const standardKey = `standard${charNameRaw}` as keyof typeof character.characteristics;
                    const modifiedKey = `modified${charNameRaw}` as keyof typeof character.characteristics;
                    const baseValue = character.characteristics[standardKey];
                    const modifiedValue = character.characteristics[modifiedKey];
                    const equipmentBonus = equipmentBonuses[charName] || 0;
                    const skillBonus = passiveSkillBonuses[charName] || 0;
                    const isCapped = baseValue >= 100;

                    return (
                        <div key={charName} className="bg-gray-700/40 p-3 rounded-lg flex items-center justify-between shadow-inner group relative">
                            <button onClick={() => onOpenDetailModal(t("Characteristic: {name}", { name: t(charName) }), {type: 'characteristic', name: charName, value: modifiedValue})} className="w-full text-left flex items-center justify-between group-hover:bg-gray-700/50 -m-3 p-3 rounded-lg transition-colors">
                                <span className="text-gray-300 capitalize text-sm font-semibold">{t(charName)}</span>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 mb-1 h-5">
                                        {equipmentBonus !== 0 && (
                                            <span 
                                            className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${equipmentBonus > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
                                            title={t('equipmentBonusTooltip')}
                                            >
                                                {equipmentBonus > 0 ? '+' : ''}{equipmentBonus} {t('EQ')}
                                            </span>
                                        )}
                                        {skillBonus !== 0 && (
                                            <span 
                                                className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${skillBonus > 0 ? 'bg-purple-500/20 text-purple-300' : 'bg-red-500/20 text-red-300'}`}
                                                title={t('passiveSkillBonusTooltip')}
                                            >
                                                {skillBonus > 0 ? '+' : ''}{skillBonus} {t('SK')}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-bold text-2xl text-cyan-400 font-mono">{modifiedValue}</span>
                                    <span className="text-xs font-mono text-gray-400">({t('Base')}: {baseValue})</span>
                                </div>
                            </button>
                            {canUpgrade && (
                                <button
                                    onClick={() => onSpendAttributePoint(charName)}
                                    disabled={isCapped}
                                    className={`absolute -right-2 -top-2 p-0.5 rounded-full text-white transform transition-transform ${isCapped ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 hover:scale-110'}`}
                                    title={isCapped ? t("Characteristic is at its maximum.") : t("increase_characteristic", { name: t(charName) })}
                                >
                                    <PlusCircleIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}

export default StatsView;
