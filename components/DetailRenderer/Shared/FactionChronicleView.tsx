
import React, { useState } from 'react';
import { Faction } from '../../../types';
import EditableField from './EditableField';
import ConfirmationModal from '../../ConfirmationModal';
import { useLocalization } from '../../../context/LocalizationContext';
import { useSpeech } from '../../../context/SpeechContext';
import { stripMarkdown } from '../../../utils/textUtils';
import { 
    ChevronUpIcon,
    ChevronDownIcon,
    BookOpenIcon as BookOpenSolidIcon,
    SpeakerWaveIcon,
    StopCircleIcon,
    TrashIcon,
    MinusIcon,
    PlusIcon
} from '@heroicons/react/24/solid';
import MarkdownRenderer from '../../MarkdownRenderer';

interface FactionChronicleViewProps {
    faction: Faction;
    isAdminEditable: boolean;
    onEditFactionData: (factionId: string, field: keyof Faction, value: any) => void;
    onOpenTextReader: (title: string, content: string) => void;
}

const FactionChronicleView: React.FC<FactionChronicleViewProps> = ({ faction, isAdminEditable, onEditFactionData, onOpenTextReader }) => {
    const { t } = useLocalization();
    const { speak, isSpeaking, currentlySpeakingText } = useSpeech();

    const [fontSizeIndex, setFontSizeIndex] = useState(2);
    const FONT_SIZES = [12, 14, 16, 18, 20, 24];
    const FONT_SIZE_CLASSES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];

    const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
    const [isDeleteOldestConfirmOpen, setIsDeleteOldestConfirmOpen] = useState(false);
    const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
    const [deleteCount, setDeleteCount] = useState('10');
    const [newEntry, setNewEntry] = useState('');
    const [isAddEntryCollapsed, setIsAddEntryCollapsed] = useState(true);

    const chronicleEntries = faction.scribeChronicle || [];

    const onSaveEntry = (index: number, newContent: string) => {
        if (!faction.factionId) return;
        const newEntries = [...chronicleEntries];
        newEntries[index] = newContent;
        onEditFactionData(faction.factionId, 'scribeChronicle', newEntries);
    };
    
    const onDeleteEntry = (index: number) => {
        if (!faction.factionId) return;
        const newEntries = chronicleEntries.filter((_, i) => i !== index);
        onEditFactionData(faction.factionId, 'scribeChronicle', newEntries);
    };

    const onDeleteOldest = (count: number) => {
        if (!faction.factionId) return;
        const newEntries = chronicleEntries.slice(0, Math.max(0, chronicleEntries.length - count));
        onEditFactionData(faction.factionId, 'scribeChronicle', newEntries);
    };

    const onClearAll = () => {
        if (!faction.factionId) return;
        onEditFactionData(faction.factionId, 'scribeChronicle', []);
    };
    
    const onAddEntry = (content: string) => {
        if (!faction.factionId) return;
        const newEntries = [content, ...chronicleEntries];
        onEditFactionData(faction.factionId, 'scribeChronicle', newEntries);
    };

    const handleDeleteEntryConfirm = () => {
        if (entryToDelete !== null) {
            onDeleteEntry(entryToDelete);
        }
        setEntryToDelete(null);
    };

    const handleDeleteOldestConfirm = () => {
        const count = parseInt(deleteCount, 10);
        if (!isNaN(count) && count > 0) {
            onDeleteOldest(count);
        }
        setIsDeleteOldestConfirmOpen(false);
    };

    const handleClearAllConfirm = () => {
        onClearAll();
        setIsClearAllConfirmOpen(false);
    };

    const handleAddEntry = () => {
        if (newEntry.trim()) {
            onAddEntry(newEntry);
            setNewEntry('');
        }
    };

    if (chronicleEntries.length === 0 && !isAdminEditable) {
        return (
            <div className="text-center text-gray-500 p-6">
                <BookOpenSolidIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p>{t('no_chronicle_entries', { name: faction.name })}</p> 
            </div>
        );
    }
    
    return (
        <>
            <div className={`space-y-4 ${FONT_SIZE_CLASSES[fontSizeIndex]}`}>
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setFontSizeIndex(p => Math.max(p - 1, 0))} disabled={fontSizeIndex === 0} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"><MinusIcon className="w-5 h-5" /></button>
                    <span className="text-sm text-gray-400 font-mono w-6 text-center">{FONT_SIZES[fontSizeIndex]}px</span>
                    <button onClick={() => setFontSizeIndex(p => Math.min(p + 1, FONT_SIZES.length - 1))} disabled={fontSizeIndex === FONT_SIZES.length - 1} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"><PlusIcon className="w-5 h-5" /></button>
                </div>
                
                {isAdminEditable && (
                    <div className="bg-gray-900/40 rounded-lg border border-cyan-700/50">
                        <button
                            onClick={() => setIsAddEntryCollapsed(prev => !prev)}
                            className="w-full p-3 text-left flex justify-between items-center group"
                            aria-expanded={!isAddEntryCollapsed}
                        >
                            <h4 className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">{t('Add New Entry')}</h4>
                            {isAddEntryCollapsed ? <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : <ChevronUpIcon className="w-5 h-5 text-gray-400" />}
                        </button>
                        {!isAddEntryCollapsed && (
                            <div className="p-3 border-t border-cyan-700/50 animate-fade-in-down-fast">
                                <textarea value={newEntry} onChange={(e) => setNewEntry(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition text-sm min-h-[80px]" placeholder={t('Write your new entry here...')} />
                                <button onClick={handleAddEntry} disabled={!newEntry.trim()} className="w-full mt-2 px-4 py-2 text-sm font-bold text-white rounded-md transition-colors bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed">{t('Add Entry')}</button>
                            </div>
                        )}
                    </div>
                )}
                
                {chronicleEntries.map((entry, index) => {
                    const strippedEntry = stripMarkdown(entry);
                    const isThisEntrySpeaking = isSpeaking && currentlySpeakingText === strippedEntry;
                    const entryTitle = t('Entry #{count}', { count: chronicleEntries.length - index });
                    return (
                        <div key={index} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700/50 group">
                            <div className="flex items-start gap-2">
                                <div className="flex-1">
                                    <EditableField label={entryTitle} value={entry} onSave={(newContent) => onSaveEntry(index, newContent)} isEditable={isAdminEditable} as="textarea" className="narrative-text leading-relaxed whitespace-pre-wrap" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => onOpenTextReader(entryTitle, entry)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white opacity-40 group-hover:opacity-100 transition-opacity" title={t('Read')}><BookOpenSolidIcon className="w-5 h-5" /></button>
                                    <button onClick={() => speak(strippedEntry)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white opacity-40 group-hover:opacity-100 transition-opacity" title={isThisEntrySpeaking ? t("Stop speech") : t("Read aloud")}>
                                        {isThisEntrySpeaking ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                                    </button>
                                    {isAdminEditable && <button onClick={() => setEntryToDelete(index)} className="p-1 rounded-full text-gray-400 hover:bg-red-900/50 hover:text-red-300 opacity-40 group-hover:opacity-100 transition-opacity" title={t("Delete Entry")}><TrashIcon className="w-5 h-5" /></button>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isAdminEditable && chronicleEntries.length > 0 && (
                <footer className="mt-6 pt-4 border-t border-gray-700/60 flex flex-col sm:flex-row justify-end items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <input type="number" value={deleteCount} onChange={(e) => setDeleteCount(e.target.value)} min="1" max={chronicleEntries.length} className="w-20 bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-sm text-center text-white" aria-label={t("Number of entries to delete")} />
                        <button onClick={() => setIsDeleteOldestConfirmOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-yellow-300 bg-yellow-500/10 rounded-md hover:bg-yellow-500/20 transition-colors"><TrashIcon className="w-4 h-4" />{t("Delete Oldest")}</button>
                    </div>
                    <button onClick={() => setIsClearAllConfirmOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"><TrashIcon className="w-4 h-4" />{t("Clear All Entries")}</button>
                </footer>
            )}

            <ConfirmationModal isOpen={entryToDelete !== null} onClose={() => setEntryToDelete(null)} onConfirm={handleDeleteEntryConfirm} title={t("Delete Entry")}><p>{t("Are you sure you want to delete this journal entry?")}</p></ConfirmationModal>
            <ConfirmationModal isOpen={isDeleteOldestConfirmOpen} onClose={() => setIsDeleteOldestConfirmOpen(false)} onConfirm={handleDeleteOldestConfirm} title={t("Delete Oldest Entries")}><p>{t("Are you sure you want to delete the {count} oldest journal entries for {name}?", { count: deleteCount, name: faction.name })}</p></ConfirmationModal>
            <ConfirmationModal isOpen={isClearAllConfirmOpen} onClose={() => setIsClearAllConfirmOpen(false)} onConfirm={handleClearAllConfirm} title={t("Clear All Entries")}><p>{t("Are you sure you want to delete all journal entries for {name}? This cannot be undone.", { name: faction.name })}</p></ConfirmationModal>
        </>
    );
};

export default FactionChronicleView;
