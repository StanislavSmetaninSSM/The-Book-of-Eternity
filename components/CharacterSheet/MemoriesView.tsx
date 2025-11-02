import React, { useState } from 'react';
import { NPC, UnlockedMemory } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';
import MemoryCard from '../DetailRenderer/Shared/MemoryCard';
import ConfirmationModal from '../ConfirmationModal';
import Modal from '../Modal';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckIcon as CheckSolidIcon } from '@heroicons/react/24/solid';

interface MemoriesViewProps {
    character: NPC;
    isPlayer: boolean;
    isAdminEditable: boolean;
    onOpenDetailModal: (title: string, data: any) => void;
    onEditNpcMemory?: (npcId: string, memory: UnlockedMemory) => void;
    onDeleteNpcMemory?: (npcId: string, memoryId: string) => void;
}

const MemoriesView: React.FC<MemoriesViewProps> = ({
    character,
    isPlayer,
    isAdminEditable,
    onOpenDetailModal,
    onEditNpcMemory,
    onDeleteNpcMemory,
}) => {
    const { t } = useLocalization();
    const [memoryToDelete, setMemoryToDelete] = useState<UnlockedMemory | null>(null);
    const [editingMemory, setEditingMemory] = useState<UnlockedMemory | null>(null);
    const [editedMemoryTitle, setEditedMemoryTitle] = useState('');
    const [editedMemoryContent, setEditedMemoryContent] = useState('');

    if (isPlayer || !character.unlockedMemories || character.unlockedMemories.length === 0) {
        return null;
    }
    
    const handleDeleteMemory = () => {
        if (!memoryToDelete || !onDeleteNpcMemory || isPlayer) return;
        onDeleteNpcMemory((character as NPC).NPCId, memoryToDelete.memoryId);
        setMemoryToDelete(null);
    };

    const handleEditMemory = (memory: UnlockedMemory) => {
        setEditingMemory(memory);
        setEditedMemoryTitle(memory.title);
        setEditedMemoryContent(memory.content);
    };
    
    const handleSaveMemory = () => {
        if (editingMemory && onEditNpcMemory && !isPlayer) {
            onEditNpcMemory((character as NPC).NPCId, { ...editingMemory, title: editedMemoryTitle, content: editedMemoryContent });
        }
        setEditingMemory(null);
    };

    return (
        <>
            <div className="space-y-2">
                {character.unlockedMemories.map(memory => (
                    <MemoryCard
                        key={memory.memoryId}
                        memory={memory}
                        onOpenMemoryModal={(title, content) => onOpenDetailModal(title, { type: 'memory', title, content })}
                        isEditable={isAdminEditable}
                        onEdit={() => handleEditMemory(memory)}
                        onDelete={() => setMemoryToDelete(memory)}
                    />
                ))}
            </div>
            <ConfirmationModal isOpen={!!memoryToDelete} onClose={() => setMemoryToDelete(null)} onConfirm={handleDeleteMemory} title={t('Delete Memory')}>
                <p>{t('Are you sure you want to permanently delete this memory?')}</p>
            </ConfirmationModal>
            {editingMemory && (
                <Modal isOpen={!!editingMemory} onClose={() => setEditingMemory(null)} title={t('Edit Memory')}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="memory-title" className="block text-sm font-medium text-gray-300 mb-1">{t('Title')}</label>
                            <input
                                id="memory-title"
                                type="text"
                                value={editedMemoryTitle}
                                onChange={(e) => setEditedMemoryTitle(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="memory-content" className="block text-sm font-medium text-gray-300 mb-1">{t('Content')}</label>
                            <textarea
                                id="memory-content"
                                value={editedMemoryContent}
                                onChange={(e) => setEditedMemoryContent(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 min-h-[200px]"
                                rows={8}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingMemory(null)} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition flex items-center gap-2">
                                <XMarkIcon className="w-5 h-5" />
                                {t('Cancel')}
                            </button>
                            <button onClick={handleSaveMemory} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-2">
                                <CheckSolidIcon className="w-5 h-5" />
                                {t('Save')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

export default MemoriesView;