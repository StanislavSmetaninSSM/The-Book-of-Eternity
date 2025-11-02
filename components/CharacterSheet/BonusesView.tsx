import React from 'react';
import { useLocalization } from '../../context/LocalizationContext';
import { Item, StructuredBonus } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import { SparklesIcon as SparklesSolidIcon } from '@heroicons/react/24/solid';

interface BonusesViewProps {
    situationalBonuses: { item: Item, bonuses: StructuredBonus[] }[];
}

const BonusesView: React.FC<BonusesViewProps> = ({ situationalBonuses }) => {
    const { t } = useLocalization();

    return (
        <div className="space-y-4">
            {situationalBonuses.length > 0 ? (
                situationalBonuses.map(({ item, bonuses }) => (
                    <div key={item.existedId} className="bg-gray-700/40 p-3 rounded-lg shadow-inner">
                        <h4 className="font-semibold text-cyan-400 border-b border-cyan-500/20 pb-2 mb-2">{item.name}</h4>
                        <ul className="space-y-2 list-disc list-inside">
                            {bonuses.map((bonus, index) => (
                                <li key={index} className="text-gray-300 text-sm">
                                    <MarkdownRenderer content={bonus.description} inline />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
                    <SparklesSolidIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p>{t('No conditional bonuses from equipped items.')}</p>
                </div>
            )}
        </div>
    );
}

export default BonusesView;
