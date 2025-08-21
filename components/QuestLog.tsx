
import React, { useMemo, useState } from 'react';
import { Quest } from '../types';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';
import ConfirmationModal from './ConfirmationModal';

interface QuestLogProps {
  activeQuests: Quest[];
  completedQuests: Quest[];
  onOpenModal: (title: string, data: any) => void;
  lastUpdatedQuestId?: string | null;
  allowHistoryManipulation?: boolean;
  forgetQuest?: (questId: string) => void;
}

const QuestItem: React.FC<{ 
    quest: Quest, 
    isCompleted?: boolean, 
    onOpenModal: (title: string, data: any) => void,
    allowHistoryManipulation?: boolean;
    onDelete: () => void;
}> = ({ quest, isCompleted = false, onOpenModal, allowHistoryManipulation, onDelete }) => {
    const { t } = useLocalization();
    return (
        <div className="relative w-full text-left bg-gray-900/40 rounded-lg border border-gray-700/50 shadow-md transition-all hover:ring-1 hover:ring-cyan-500/50 hover:border-cyan-500/50 group">
            {allowHistoryManipulation && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 z-10"
                    title={t('Forget Quest')}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
            <button 
                onClick={() => onOpenModal(t("Quest: {name}", { name: quest.questName }), quest)}
                className="w-full text-left p-4 font-semibold text-gray-200 flex justify-between items-center"
            >
                <span>{quest.questName}</span>
                {isCompleted && (
                    quest.status === 'Completed' 
                        ? <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                        : <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                )}
            </button>
        </div>
    );
};


export default function QuestLog({ activeQuests, completedQuests, onOpenModal, lastUpdatedQuestId, allowHistoryManipulation, forgetQuest }: QuestLogProps): React.ReactNode {
  const { t } = useLocalization();
  const [questToDelete, setQuestToDelete] = useState<Quest | null>(null);

  const handleDeleteConfirm = () => {
    if (questToDelete && questToDelete.questId && forgetQuest) {
        forgetQuest(questToDelete.questId);
    }
    setQuestToDelete(null);
  };

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
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text">{t('Active Quests')}</h3>
          {sortedActiveQuests.length > 0 ? (
            <div className="space-y-3">
              {sortedActiveQuests.map((quest) => (
                <QuestItem 
                    key={quest.questId || quest.questName} 
                    quest={quest} 
                    onOpenModal={onOpenModal} 
                    allowHistoryManipulation={allowHistoryManipulation}
                    onDelete={() => setQuestToDelete(quest)}
                />
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
                <QuestItem 
                    key={quest.questId || quest.questName} 
                    quest={quest} 
                    isCompleted={true} 
                    onOpenModal={onOpenModal} 
                    allowHistoryManipulation={allowHistoryManipulation}
                    onDelete={() => setQuestToDelete(quest)}
                />
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
      <ConfirmationModal
        isOpen={!!questToDelete}
        onClose={() => setQuestToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('Forget Quest')}
      >
        <p>{t("Are you sure you want to permanently remove this quest?")}</p>
      </ConfirmationModal>
    </>
  );
}
