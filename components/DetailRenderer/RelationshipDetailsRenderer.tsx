import React from 'react';
import { useLocalization } from '../../context/LocalizationContext';
import MarkdownRenderer from '../MarkdownRenderer';

interface RelationshipTier {
    lowerBound: number;
    upperBound: number;
    name: string;
    desc: string;
}

interface RelationshipDetailsProps {
    data: {
        type: 'relationship';
        tiers: RelationshipTier[];
        current: number;
    };
}

const RelationshipDetailsRenderer: React.FC<RelationshipDetailsProps> = ({ data }) => {
    const { t } = useLocalization();
    const { tiers, current } = data;

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-cyan-300 capitalize">{t('Relationship Tiers')}</h3>
            <p className="text-lg text-gray-300">{t('Current Level')}: <span className="font-bold font-mono text-white">{current}</span></p>

            <div className="space-y-3">
                {tiers.map((tier, index) => {
                    const isCurrent = current >= tier.lowerBound && current <= tier.upperBound;
                    return (
                        <div key={index} className={`p-4 rounded-lg border-l-4 transition-all ${isCurrent ? 'bg-cyan-900/40 border-cyan-400 scale-105 shadow-lg' : 'bg-gray-800/60 border-gray-600'}`}>
                            <h4 className={`font-bold text-lg ${isCurrent ? 'text-cyan-300' : 'text-gray-200'}`}>{tier.name}</h4>
                            <div className="text-sm text-gray-400 italic">
                                <MarkdownRenderer content={tier.desc} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RelationshipDetailsRenderer;