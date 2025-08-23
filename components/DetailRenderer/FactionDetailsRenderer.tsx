

import React from 'react';
import { Faction, FactionRank } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import { InformationCircleIcon, UserGroupIcon, StarIcon, CheckCircleIcon, LockClosedIcon, ChevronRightIcon, UserIcon, PhotoIcon } from '@heroicons/react/24/outline';
import ImageRenderer from '../ImageRenderer';
import EditableField from './Shared/EditableField';

interface FactionDetailsProps extends Omit<DetailRendererProps, 'data'> {
  faction: Faction;
  perspectiveFor?: { name: string; rank: string };
}

const FactionDetailsRenderer: React.FC<FactionDetailsProps> = ({ faction, perspectiveFor, onOpenImageModal, imageCache, onImageGenerated, allowHistoryManipulation, onEditFactionData }) => {
    const { t } = useLocalization();

    const imagePrompt = faction.custom_image_prompt || faction.image_prompt;

    const getNextRankRep = (): number | null => {
        if (!faction.isPlayerMember || !faction.ranks || !faction.playerRank) return null;
        const playerRankLower = faction.playerRank.toLowerCase();
        const currentRankIndex = faction.ranks.findIndex(r => r.rankNameMale.toLowerCase() === playerRankLower || r.rankNameFemale.toLowerCase() === playerRankLower);
        if (currentRankIndex > -1 && currentRankIndex < faction.ranks.length - 1) {
            return faction.ranks[currentRankIndex + 1].requiredReputation;
        }
        return null;
    }

    const renderPlayerStanding = () => {
        const reputationTextOnly = t(faction.reputationDescription as any).replace(/\s*\([^)]*\)$/, '');
        const reputationValue = `${faction.reputation} / 100 (${reputationTextOnly || t(faction.reputationDescription as any)})`;
    
        const nextRankRep = getNextRankRep();
        const progressPercentage = nextRankRep ? (faction.reputation / nextRankRep) * 100 : (faction.reputation / 100) * 100;

        return (
             <Section title={t("Player Standing")} icon={UserGroupIcon}>
                <DetailRow label={t("Reputation")} value={reputationValue} icon={StarIcon} />
                <div className="w-full bg-gray-700/50 rounded-full h-4 my-2 border border-gray-600 relative overflow-hidden">
                    <div 
                        className="bg-cyan-500 h-4 rounded-full transition-all duration-500 text-center text-xs text-white font-bold flex items-center justify-center" 
                        style={{ width: `${Math.min(100, progressPercentage)}%` }}
                    >
                         {faction.reputation}
                    </div>
                </div>
                {nextRankRep && (
                    <p className="text-xs text-gray-400 text-right">{t("Next rank at {rep} reputation", { rep: nextRankRep })}</p>
                )}
                {faction.isPlayerMember && <DetailRow label={t("Your Rank")} value={<span className="font-bold text-yellow-300">{faction.playerRank}</span>} icon={CheckCircleIcon} />}
            </Section>
        );
    };

    const renderNpcStanding = () => {
        if (!perspectiveFor) return null;
        return (
            <Section title={t("{name}'s Standing", { name: perspectiveFor.name })} icon={UserIcon}>
                <DetailRow label={t("Rank")} value={<span className="font-bold text-purple-300">{perspectiveFor.rank}</span>} icon={StarIcon} />
            </Section>
        );
    };
    

    const rankStatus = (rank: FactionRank): 'highlighted' | 'current' | 'achieved' | 'locked' => {
        // NPC's rank (perspective) has the highest priority for highlighting
        if (perspectiveFor && (perspectiveFor.rank.toLowerCase() === rank.rankNameMale.toLowerCase() || perspectiveFor.rank.toLowerCase() === rank.rankNameFemale.toLowerCase())) {
            return 'highlighted';
        }
        if (faction.isPlayerMember && faction.playerRank && (faction.playerRank.toLowerCase() === rank.rankNameMale.toLowerCase() || faction.playerRank.toLowerCase() === rank.rankNameFemale.toLowerCase())) {
            return 'current';
        }
        if (faction.reputation >= rank.requiredReputation) {
            return 'achieved';
        }
        return 'locked';
    };

    const statusStyles = {
        achieved: { border: 'border-green-700/80', icon: <CheckCircleIcon className="w-5 h-5 text-green-400" />, textColor: 'text-gray-400' },
        current: { border: 'border-yellow-600/80', icon: <ChevronRightIcon className="w-5 h-5 text-yellow-400" />, textColor: 'text-yellow-300 font-bold' },
        locked: { border: 'border-gray-700/80', icon: <LockClosedIcon className="w-5 h-5 text-gray-500" />, textColor: 'text-gray-500' },
        highlighted: { border: 'border-purple-600/80', icon: <UserIcon className="w-5 h-5 text-purple-400" />, textColor: 'text-purple-300 font-bold' },
    };


    return (
        <div className="space-y-4">
            {imagePrompt && (
                <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-900 group relative cursor-pointer" onClick={() => onOpenImageModal?.(imagePrompt)}>
                    <ImageRenderer 
                        prompt={imagePrompt} 
                        alt={faction.name} 
                        imageCache={imageCache} 
                        onImageGenerated={onImageGenerated} 
                        width={1024} 
                        height={1024}
                        showRegenerateButton={allowHistoryManipulation}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-bold text-lg">{t('Enlarge')}</p>
                    </div>
                </div>
            )}
            {allowHistoryManipulation && onEditFactionData && (
                 <Section title={t("Custom Image Prompt")} icon={PhotoIcon}>
                    <EditableField 
                        label={t("Image Prompt")}
                        value={faction.custom_image_prompt || ''}
                        isEditable={true}
                        onSave={(val) => { if (faction.factionId) onEditFactionData(faction.factionId, 'custom_image_prompt', val) }}
                        as="textarea"
                    />
                    <p className="text-xs text-gray-400 mt-2"><strong>{t("Default prompt from AI:")}</strong> {faction.image_prompt}</p>
                </Section>
            )}
            <div className="italic text-gray-400">
                <MarkdownRenderer content={faction.description} />
            </div>

            {perspectiveFor ? renderNpcStanding() : renderPlayerStanding()}

            {faction.ranks && faction.ranks.length > 0 && (
                <Section title={t("Rank Hierarchy")} icon={InformationCircleIcon}>
                    <div className="space-y-3">
                        {faction.ranks.map((rank, i) => {
                            const status = rankStatus(rank);
                            const styles = statusStyles[status];
                            const rankDisplayName = rank.rankNameMale === rank.rankNameFemale 
                                ? rank.rankNameMale 
                                : `${rank.rankNameMale} / ${rank.rankNameFemale}`;
                            
                            return (
                                <div key={i} className={`bg-gray-800/60 p-3 rounded-lg border-l-4 ${styles.border}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">{styles.icon}</div>
                                        <div className="flex-1">
                                            <p className={`text-lg ${styles.textColor}`}>{rankDisplayName}</p>
                                            <p className="text-xs text-gray-500">{t("Requires {rep} Reputation", { rep: rank.requiredReputation })}</p>
                                        </div>
                                    </div>
                                    {rank.benefits && rank.benefits.length > 0 && (
                                        <ul className="list-disc list-inside space-y-1 text-sm text-cyan-300/80 pl-8 mt-2">
                                            {rank.benefits.map((benefit, j) => <li key={j}><MarkdownRenderer content={t(benefit as any)} inline /></li>)}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Section>
            )}
        </div>
    );
};

export default FactionDetailsRenderer;