

import React, { useState } from 'react';
import { CurrentActivity, CompletedActivity } from '../../../types';
import Modal from '../../Modal';
import { useLocalization } from '../../../context/LocalizationContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import MarkdownRenderer from '../../MarkdownRenderer';
import ConfirmationModal from '../../ConfirmationModal';

interface ActivityViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  npcName: string;
  currentActivity: CurrentActivity | null;
  completedActivities: CompletedActivity[];
  allowHistoryManipulation?: boolean;
  onDeleteCurrentActivity?: () => void;
  onDeleteCompletedActivity?: (activity: CompletedActivity) => void;
  onClearAllCompletedActivities?: (npcId: string) => void;
  npcId: string;
}

const ActivityViewerModal: React.FC<ActivityViewerModalProps> = ({ isOpen, onClose, npcName, currentActivity, completedActivities, allowHistoryManipulation, onDeleteCurrentActivity, onDeleteCompletedActivity, onClearAllCompletedActivities, npcId }) => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>(currentActivity ? 'current' : 'completed');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<{ type: 'current' | 'completed', data: any } | null>(null);

  const timeProgress = currentActivity && currentActivity.totalTimeCostMinutes > 0
    ? (currentActivity.timeSpentMinutes / currentActivity.totalTimeCostMinutes) * 100
    : 0;

  const handleClearConfirm = () => {
    if (onClearAllCompletedActivities && npcId) {
        onClearAllCompletedActivities(npcId);
    }
    setIsClearConfirmOpen(false);
  };

  const handleDeleteActivityConfirm = () => {
    if (!activityToDelete) return;
    if (activityToDelete.type === 'current' && onDeleteCurrentActivity) {
      onDeleteCurrentActivity();
    } else if (activityToDelete.type === 'completed' && onDeleteCompletedActivity) {
      onDeleteCompletedActivity(activityToDelete.data);
    }
    setActivityToDelete(null);
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={t('Activities for {name}', { name: npcName })}>
      <div className="flex border-b border-gray-700/60 mb-4">
        <button onClick={() => setActiveTab('current')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'current' ? 'border-cyan-400 text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('Current')} ({currentActivity ? 1 : 0})</button>
        <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'completed' ? 'border-cyan-400 text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('Completed')} ({completedActivities.length})</button>
      </div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {activeTab === 'current' && (
            <section>
                <h3 className="text-xl font-semibold text-cyan-300 mb-3 border-b-2 border-cyan-500/20 pb-2">{t('Active Activity')}</h3>
                {currentActivity ? (
                    <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/50 group relative">
                    <h4 className="font-bold text-cyan-400 text-lg">{currentActivity.activityName}</h4>
                    <p className="text-sm text-gray-400 italic mt-1 mb-3">{currentActivity.description}</p>
                    <div className="space-y-3 text-xs">
                        <div>
                        <div className="flex justify-between items-center text-gray-300 mb-1">
                            <span className="font-medium">{t('Time Progress')}</span>
                            <span className="font-mono">{Math.floor(currentActivity.timeSpentMinutes / 60)}{t('h_short')} / {Math.floor(currentActivity.totalTimeCostMinutes / 60)}{t('h_short')}</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{width: `${timeProgress}%`}}></div>
                        </div>
                        </div>
                    </div>
                    {allowHistoryManipulation && onDeleteCurrentActivity && (
                        <button
                            onClick={() => setActivityToDelete({ type: 'current', data: currentActivity })}
                            className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                            title={t('Delete Activity')}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center p-4">{t('No current activity.')}</p>
                )}
            </section>
        )}

        {activeTab === 'completed' && (
            <section>
                <h3 className="text-xl font-semibold text-gray-400 mb-3 border-b-2 border-gray-600/20 pb-2">{t('Completed Activities')}</h3>
                {completedActivities.length > 0 ? (
                    <div className="space-y-3">
                    {completedActivities.map((activity, index) => {
                        const isSuccess = activity.finalOutcome.startsWith('Success');
                        return (
                        <div key={`${activity.activityName}-${index}`} className={`bg-gray-800/60 p-3 rounded-lg border-l-4 ${isSuccess ? 'border-green-600' : 'border-red-600'} group relative`}>
                            <div>
                            <h4 className={`font-semibold ${isSuccess ? 'text-green-300' : 'text-red-300'}`}>{activity.activityName}</h4>
                            <p className="text-xs text-gray-400">{t('Completed on turn {turn}', { turn: activity.completionTurn })} - {t(activity.finalOutcome as any)}</p>
                            <p className="text-sm text-gray-300 mt-1"><MarkdownRenderer content={activity.narrativeSummary} /></p>
                            </div>
                            {allowHistoryManipulation && onDeleteCompletedActivity && (
                                <button
                                    onClick={() => setActivityToDelete({ type: 'completed', data: activity })}
                                    className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                    title={t('Delete Activity')}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        )
                    })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center p-4">{t('No completed activities.')}</p>
                )}

                {allowHistoryManipulation && onClearAllCompletedActivities && completedActivities.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <button
                            onClick={() => setIsClearConfirmOpen(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs bg-red-900/50 hover:bg-red-900/80 rounded-md text-red-300 font-semibold transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            {t('Clear All Completed')}
                        </button>
                    </div>
                )}
            </section>
        )}
      </div>
    </Modal>
    <ConfirmationModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearConfirm}
        title={t('Clear Completed Activities')}
    >
        <p>{t('Are you sure you want to clear all completed activities for this NPC?')}</p>
    </ConfirmationModal>
    <ConfirmationModal
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        onConfirm={handleDeleteActivityConfirm}
        title={t('Delete Activity')}
    >
        <p>
            {activityToDelete?.type === 'current' 
                ? t('confirm_delete_current_activity_p1', { name: activityToDelete.data.activityName })
                : t('confirm_delete_completed_activity_p1', { name: activityToDelete?.data.activityName })
            }
        </p>
    </ConfirmationModal>
    </>
  );
};

export default ActivityViewerModal;