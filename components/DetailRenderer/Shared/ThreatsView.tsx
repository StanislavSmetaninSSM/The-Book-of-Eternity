import React, { useState, useMemo } from 'react';
import { ActiveThreat } from '../../../types';
import { useLocalization } from '../../../context/LocalizationContext';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../../ConfirmationModal';
import { KeyIcon } from '@heroicons/react/24/solid';

interface ThreatsViewProps {
    threats: ActiveThreat[];
    locationId: string;
    allowHistoryManipulation: boolean;
    onDeleteThreat: (locationId: string, threatId: string) => void;
}

const ThreatCard: React.FC<{ threat: ActiveThreat; onDelete?: () => void; allowHistoryManipulation: boolean; }> = ({ threat, onDelete, allowHistoryManipulation }) => {
    const { t } = useLocalization();
    const activity = threat.currentActivity;
    const lastCompletedActivity = useMemo(() => {
        if (!threat.completedActivities || threat.completedActivities.length === 0) {
            return null;
        }
        return threat.completedActivities[0];
    }, [threat.completedActivities]);
    
    const isCompleted = lastCompletedActivity && !activity;

    const timeProgress = activity && activity.totalTimeCostMinutes > 0
        ? (activity.timeSpentMinutes / activity.totalTimeCostMinutes) * 100
        : 0;
    
    const formatDuration = (totalMinutes: number): string => {
        const minutesNum = Math.round(totalMinutes);
        if (minutesNum < 1) return `0${t('min_short')}`;

        const hours = Math.floor(minutesNum / 60);
        const minutes = minutesNum % 60;

        const parts = [];
        if (hours > 0) {
            parts.push(`${hours}${t('h_short')}`);
        }
        if (minutes > 0) {
            parts.push(`${minutes}${t('min_short')}`);
        }

        if (parts.length === 0) return `0${t('min_short')}`;
        
        return parts.join(' ');
    };

    const cardStyle = useMemo(() => {
        if (isCompleted) {
            if (lastCompletedActivity.finalState === 'Completed') {
                return 'border-red-700/50'; // Threat succeeded
            }
            if (lastCompletedActivity.finalState === 'Abandoned') {
                return 'border-yellow-700/50'; // Threat gave up
            }
        }
        return 'border-gray-700/50';
    }, [isCompleted, lastCompletedActivity]);

    return (
        <div className={`bg-gray-800/60 p-4 rounded-lg border ${cardStyle} group relative`}>
            <h4 className={`font-bold text-lg flex items-center gap-2 ${isCompleted && lastCompletedActivity.finalState === 'Completed' ? 'text-red-400' : 'text-gray-200'}`}>
                <ExclamationTriangleIcon className="w-5 h-5" />
                {threat.name}
                {isCompleted ? (
                    <span className={`text-sm font-mono px-2 py-0.5 rounded-full ${lastCompletedActivity.finalState === 'Completed' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}`}>
                        {lastCompletedActivity.finalState === 'Completed' ? t('Threat Succeeded') : t('Threat Abandoned')}
                    </span>
                ) : (
                    <span className="text-sm font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                        {t('Intensity')}: {threat.intensity}
                    </span>
                )}
            </h4>
             {allowHistoryManipulation && threat.threatId && (
                <div className="flex items-center gap-1 text-xs text-gray-500 font-mono mt-1">
                    <KeyIcon className="w-3 h-3" />
                    <span title={threat.threatId}>{threat.threatId}</span>
                </div>
            )}
            
            {isCompleted ? (
                <p className="text-sm text-gray-300 italic mt-2 mb-3">{lastCompletedActivity.narrativeSummary}</p>
            ) : (
                <p className="text-sm text-gray-400 italic mt-2 mb-3">{threat.longTermGoal}</p>
            )}

             <div className="mt-4 pt-3 border-t border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                    <h5 className="font-semibold text-gray-300 mb-2">{t('Archetype')}</h5>
                    <div className="space-y-1 text-xs pl-2 border-l-2 border-gray-600">
                        <p><strong className="text-gray-500">{t('Motivation')}:</strong> <span className="text-gray-200">{t(threat.threatArchetype.customMotivation || threat.threatArchetype.motivation)}</span></p>
                        <p><strong className="text-gray-500">{t('Method')}:</strong> <span className="text-gray-200">{t(threat.threatArchetype.customMethod || threat.threatArchetype.method)}</span></p>
                    </div>
                </div>
                <div>
                    <h5 className="font-semibold text-gray-300 mb-2">{t('Impact Profile')}</h5>
                    <div className="space-y-1 text-xs pl-2 border-l-2 border-gray-600">
                        <p><strong className="text-gray-500">{t('Target')}:</strong> <span className="text-gray-200">{t(threat.impactProfile.primaryTargetType)} - {threat.impactProfile.primaryTargetName}</span></p>
                        <p><strong className="text-gray-500">{t('Impact')}:</strong> <span className="text-gray-200">{t(threat.impactProfile.primaryImpact)} ({t('Value')}: {threat.impactProfile.baseImpactValue})</span></p>
                    </div>
                </div>
            </div>

            {activity && (
                <div className="space-y-3 text-xs border-t border-gray-700/50 pt-3 mt-3">
                    <p className="font-semibold text-gray-300">{activity.activityName}</p>
                    <p className="text-sm text-gray-400">{activity.description}</p>
                    <div>
                        <div className="flex justify-between items-center text-gray-300 mb-1">
                            <span className="font-medium">{t('Time Progress')}</span>
                            <span className="font-mono">{formatDuration(activity.timeSpentMinutes)} / {formatDuration(activity.totalTimeCostMinutes)}</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-red-500 h-2.5 rounded-full" style={{width: `${timeProgress}%`}}></div>
                        </div>
                    </div>
                </div>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                    title={t('Delete Threat')}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

const ThreatsView: React.FC<ThreatsViewProps> = ({ threats, locationId, allowHistoryManipulation, onDeleteThreat }) => {
    const { t } = useLocalization();
    const [threatToDelete, setThreatToDelete] = useState<ActiveThreat | null>(null);

    const handleDeleteThreatConfirm = () => {
        if (threatToDelete && threatToDelete.threatId) {
            onDeleteThreat(locationId, threatToDelete.threatId);
        }
        setThreatToDelete(null);
    };

    if (threats.length === 0) {
        return <p className="text-sm text-gray-500 text-center p-4">{t('no_active_threats')}</p>;
    }

    return (
        <>
            <div className="space-y-4">
                {threats.map(threat => (
                    <ThreatCard 
                        key={threat.threatId || threat.name} 
                        threat={threat} 
                        onDelete={allowHistoryManipulation ? () => setThreatToDelete(threat) : undefined}
                        allowHistoryManipulation={allowHistoryManipulation}
                    />
                ))}
            </div>
            <ConfirmationModal
                isOpen={!!threatToDelete}
                onClose={() => setThreatToDelete(null)}
                onConfirm={handleDeleteThreatConfirm}
                title={t('delete_threat_title')}
            >
                <p>{t('delete_threat_confirm', { name: threatToDelete?.name || '' })}</p>
            </ConfirmationModal>
        </>
    );
};

export default ThreatsView;