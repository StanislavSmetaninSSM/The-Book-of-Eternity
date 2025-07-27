


import React, { useMemo } from 'react';
import { Quest } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../context/LocalizationContext';

interface QuestLogProps {
  activeQuests: Quest[];
  completedQuests: Quest[];
  onOpenModal: (title: string, data: any) => void;
  lastUpdatedQuestId?: string | null;
}

const QuestItem: React.FC<{ quest: Quest, isCompleted?: boolean, onOpenModal: (title: string, data: any) => void }> = ({ quest, isCompleted = false, onOpenModal }) => {
    const { t } = useLocalization();
    return (
        <button 
            onClick={() => onOpenModal(t("Quest: {name}", { name: quest.questName }), quest)}
            className="w-full text-left bg-gray-900/40 rounded-lg border border-gray-700/50 shadow-md transition-all hover:ring-1 hover:ring-cyan-500/50 hover:border-cyan-500/50"
        >
            <div className="p-4 cursor-pointer font-semibold text-gray-200 flex justify-between items-center text-left">
            <span>{quest.questName}</span>
            {isCompleted && (
                quest.status === 'Completed' 
                    ? <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                    : <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
            )}
            </div>
        </button>
    );
};

export default function QuestLog({ activeQuests, completedQuests, onOpenModal, lastUpdatedQuestId }: QuestLogProps): React.ReactNode {
  const { t } = useLocalization();
  const sortedActiveQuests = useMemo(() => {
    if (!lastUpdatedQuestId) {
      return activeQuests;
    }
    const updatedQuest = activeQuests.find(q => q.questId === lastUpdatedQuestId);
    if (!updatedQuest) {
      return activeQuests;
    }
    const otherQuests = activeQuests.filter(q => q.questId !== lastUpdatedQuestId);
    return [updatedQuest, ...otherQuests];
  }, [activeQuests, lastUpdatedQuestId]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('Active Quests')}</h3>
        {sortedActiveQuests.length > 0 ? (
          <div className="space-y-3">
            {sortedActiveQuests.map((quest) => (
              <QuestItem key={quest.questId || quest.questName} quest={quest} onOpenModal={onOpenModal} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            {t('No active quests.')}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xl font-bold text-cyan-400 mt-6 mb-3 narrative-text">{t('Completed Quests')}</h3>
         {completedQuests.length > 0 ? (
          <div className="space-y-3">
            {completedQuests.map((quest) => (
              <QuestItem key={quest.questId || quest.questName} quest={quest} isCompleted={true} onOpenModal={onOpenModal} />
            ))}
          </div>
        ) : (
           <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
            <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            {t('No quests completed yet.')}
          </div>
        )}
      </div>
    </div>
  );
}