import React, { useState } from 'react';
import { Project, CompletedProject } from '../../../types';
import Modal from '../../Modal';
import { useLocalization } from '../../../context/LocalizationContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import MarkdownRenderer from '../../MarkdownRenderer';
import ConfirmationModal from '../../ConfirmationModal';

interface ProjectViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  factionName: string;
  activeProjects: Project[];
  completedProjects: CompletedProject[];
  allowHistoryManipulation?: boolean;
  onDeleteActiveProject?: (project: Project) => void;
  onDeleteCompletedProject?: (project: CompletedProject) => void;
  onClearAllCompletedProjects?: (factionId: string) => void;
  factionId: string;
}

const ProjectCard: React.FC<{ project: Project; onDelete?: () => void }> = ({ project, onDelete }) => {
    const { t } = useLocalization();
    const timeProgress = project.totalTimeCostMinutes > 0 ? (project.timeSpentMinutes / project.totalTimeCostMinutes) * 100 : 0;
    
    return (
        <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/50 group relative">
            <h4 className="font-bold text-cyan-400 text-lg">{project.projectName}</h4>
            <p className="text-sm text-gray-400 italic mt-1 mb-3">{project.description}</p>
            
            <div className="space-y-3 text-xs">
                <div>
                    <div className="flex justify-between items-center text-gray-300 mb-1">
                        <span className="font-medium">{t('Time Progress')}</span>
                        <span className="font-mono">{Math.floor(project.timeSpentMinutes / 60)}{t('h_short')} / {Math.floor(project.totalTimeCostMinutes / 60)}{t('h_short')}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{width: `${timeProgress}%`}}></div>
                    </div>
                </div>
            </div>
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                    title={t('Delete Project')}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

const CompletedProjectCard: React.FC<{ project: CompletedProject; onDelete?: () => void }> = ({ project, onDelete }) => {
    const { t } = useLocalization();
    const isSuccess = project.finalState === 'Completed';

    return (
        <div className={`bg-gray-800/60 p-3 rounded-lg border-l-4 ${isSuccess ? 'border-green-600' : 'border-red-600'} group relative`}>
            <div>
                <h4 className={`font-semibold ${isSuccess ? 'text-green-300' : 'text-red-300'}`}>{project.projectName}</h4>
                <p className="text-xs text-gray-400">{t('Completed on turn {turn}', { turn: project.completionTurn })} - {isSuccess ? t('Completed') : t('Abandoned')}</p>
            </div>
            {onDelete && (
                <button
                    onClick={onDelete}
                    className="absolute top-2 right-2 p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                    title={t('Delete Project')}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};


const ProjectViewerModal: React.FC<ProjectViewerModalProps> = ({ isOpen, onClose, factionName, activeProjects, completedProjects, allowHistoryManipulation, onDeleteActiveProject, onDeleteCompletedProject, onClearAllCompletedProjects, factionId }) => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleClearConfirm = () => {
    if (onClearAllCompletedProjects && factionId) {
        onClearAllCompletedProjects(factionId);
    }
    setIsClearConfirmOpen(false);
  };

  const handleDeleteProjectConfirm = () => {
    if (projectToDelete && onDeleteActiveProject) {
        onDeleteActiveProject(projectToDelete);
    }
    setProjectToDelete(null);
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={t('Projects for {name}', { name: factionName })}>
        <div className="flex border-b border-gray-700/60 mb-4">
            <button onClick={() => setActiveTab('active')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'active' ? 'border-cyan-400 text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('Active')} ({activeProjects.length})</button>
            <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'completed' ? 'border-cyan-400 text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('Completed')} ({completedProjects.length})</button>
        </div>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {activeTab === 'active' && (
                <section>
                    <h3 className="text-xl font-semibold text-cyan-300 mb-3 border-b-2 border-cyan-500/20 pb-2">{t('Active Projects')}</h3>
                    {activeProjects.length > 0 ? (
                        <div className="space-y-4">
                        {activeProjects.map(proj => (
                            <ProjectCard 
                                key={proj.projectId} 
                                project={proj} 
                                onDelete={allowHistoryManipulation && onDeleteActiveProject ? () => setProjectToDelete(proj) : undefined} 
                            />
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center p-4">{t('No active projects.')}</p>
                    )}
                </section>
            )}
            {activeTab === 'completed' && (
                <section>
                    <h3 className="text-xl font-semibold text-gray-400 mb-3 border-b-2 border-gray-600/20 pb-2">{t('Completed Projects')}</h3>
                    {completedProjects.length > 0 ? (
                        <div className="space-y-3">
                        {completedProjects.map(proj => (
                            <CompletedProjectCard key={proj.projectId} project={proj} onDelete={allowHistoryManipulation && onDeleteCompletedProject ? () => onDeleteCompletedProject(proj) : undefined} />
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center p-4">{t('No completed projects.')}</p>
                    )}
                    {allowHistoryManipulation && onClearAllCompletedProjects && completedProjects.length > 0 && (
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
        title={t('Clear Completed Projects')}
    >
        <p>{t('Are you sure you want to clear all completed projects for this faction?')}</p>
    </ConfirmationModal>
    <ConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteProjectConfirm}
        title={t('delete_project_title')}
    >
        <p>{t('delete_project_confirm', { name: projectToDelete?.projectName || '' })}</p>
    </ConfirmationModal>
    </>
  );
};

export default ProjectViewerModal;
