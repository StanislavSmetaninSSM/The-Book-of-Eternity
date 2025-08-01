import React from 'react';
import { Quest, GameSettings } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import EditableField from './Shared/EditableField';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import {
    UserIcon, DocumentTextIcon, CheckCircleIcon, StarIcon, ExclamationTriangleIcon, TrashIcon, CogIcon
} from '@heroicons/react/24/outline';

interface QuestDetailsProps extends Omit<DetailRendererProps, 'data'> {
  quest: Quest;
  onOpenForgetConfirm: () => void;
  gameSettings: GameSettings | null;
}

const QuestDetailsRenderer: React.FC<QuestDetailsProps> = ({ quest, onOpenForgetConfirm, allowHistoryManipulation, onEditQuestData, gameSettings }) => {
    const { t } = useLocalization();
    const currencyName = gameSettings?.gameWorldInformation?.currencyName || 'Gold';
    
    return (
    <div className="space-y-4">
        <div className="text-xl font-bold">
            <EditableField 
                label={t('Name')}
                value={quest.questName}
                isEditable={allowHistoryManipulation && !!quest.questId}
                onSave={(val) => { if (quest.questId) onEditQuestData(quest.questId, 'questName', val) }}
                as="input"
                className="font-bold text-xl"
            />
        </div>
        <div className="italic text-gray-400">
            <EditableField 
                label={t('questBackground')}
                value={quest.questBackground}
                isEditable={allowHistoryManipulation && !!quest.questId}
                onSave={(val) => { if (quest.questId) onEditQuestData(quest.questId, 'questBackground', val) }}
            />
        </div>
        <Section title={t("Giver")} icon={UserIcon}>{quest.questGiver}</Section>
        <Section title={t("Description")} icon={DocumentTextIcon}>
            <EditableField 
                label={t('Description')}
                value={quest.description}
                isEditable={allowHistoryManipulation && !!quest.questId}
                onSave={(val) => { if (quest.questId) onEditQuestData(quest.questId, 'description', val) }}
            />
        </Section>
        <Section title={t("Objectives")} icon={CheckCircleIcon}>
            <ul className="space-y-2">
                {quest.objectives.map((obj, i) => (
                    <li key={obj.objectiveId || i} className={`flex items-start gap-3 p-2 rounded-md ${obj.status === 'Completed' ? 'bg-gray-800/50 text-gray-500' : 'text-gray-300'}`}>
                        {obj.status === 'Completed' ? <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> : <div className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-cyan-500"></div></div>}
                        <div className={`flex-1 ${obj.status === 'Completed' ? 'line-through' : ''}`}>
                             <EditableField 
                                label={`${t('Objective')} ${i + 1}`}
                                value={obj.description}
                                isEditable={allowHistoryManipulation && !!quest.questId}
                                onSave={(newDesc) => {
                                    if (quest.questId) {
                                        const newObjectives = quest.objectives.map((o, idx) => i === idx ? { ...o, description: newDesc } : o);
                                        onEditQuestData(quest.questId, 'objectives', newObjectives);
                                    }
                                }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </Section>
        {quest.detailsLog && quest.detailsLog.length > 0 && (
            <Section title={t("Details Log")} icon={DocumentTextIcon}>
                <div className="space-y-2 bg-gray-900/30 p-3 rounded-md">
                    {quest.detailsLog.map((log, i) => (
                        <div key={i} className="text-sm text-gray-400 border-b border-gray-700/50 pb-2 last:border-b-0 last:pb-0">
                           <EditableField 
                                label={`${t('Log Entry')} ${i + 1}`}
                                value={log}
                                isEditable={allowHistoryManipulation && !!quest.questId}
                                onSave={(newLog) => {
                                    if (quest.questId) {
                                        const newLogs = [...quest.detailsLog!];
                                        newLogs[i] = newLog;
                                        onEditQuestData(quest.questId, 'detailsLog', newLogs);
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            </Section>
        )}
        {quest.rewards && (
            <Section title={t("Rewards")} icon={StarIcon}>
                {quest.rewards.experience && <DetailRow label={t("Experience")} value={quest.rewards.experience} />}
                {quest.rewards.money && <DetailRow label={t("Money")} value={`${quest.rewards.money} ${t(currencyName as any)}`} />}
                {quest.rewards.items && quest.rewards.items.length > 0 && <DetailRow label={t("Items")} value={quest.rewards.items.join(', ')} />}
                {quest.rewards.other && <MarkdownRenderer content={quest.rewards.other} />}
            </Section>
        )}
        {quest.failureConsequences && (
            <Section title={t("Failure Consequences")} icon={ExclamationTriangleIcon}>
                <div className="bg-red-900/20 p-3 rounded-md text-red-300/90">
                    <MarkdownRenderer content={quest.failureConsequences} />
                </div>
            </Section>
        )}
        {quest.questId && (
            <Section title={t("Actions")} icon={CogIcon}>
                <button
                    onClick={onOpenForgetConfirm}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-300 bg-red-600/20 rounded-md hover:bg-red-600/40 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                    {t("Forget Quest")}
                </button>
            </Section>
        )}
    </div>
);
};

export default QuestDetailsRenderer;