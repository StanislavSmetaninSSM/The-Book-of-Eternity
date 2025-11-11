import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { FilmIcon, PlayIcon, ArrowDownTrayIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, DocumentArrowUpIcon, ArrowPathIcon, XCircleIcon, PencilIcon, CheckIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { Cinematic, CinemaFrame } from '../types';
import ConfirmationModal from './ConfirmationModal';
import LoadingSpinner from './LoadingSpinner';
import ImageRenderer from './ImageRenderer';
import Modal from './Modal';

interface CinemaHallProps {
    cinematics: Cinematic[];
    onGenerateTrailer: (prompt: string) => void;
    isGenerating: boolean;
    progress: { current: number; total: number; message: string };
    onPlay: (cinematicId: string) => void;
    onExport: (cinematicId: string) => void;
    onDelete: (cinematicId: string) => void;
    onImport: () => void;
    onContinue: (cinematicId: string) => void;
    extendingCinematicId: string | null;
    onCancel: () => void;
    updateCinematic: (cinematicId: string, updates: Partial<Omit<Cinematic, 'id'>>) => void;
    regenerateCinemaFrame: (cinematicId: string, frameIndex: number, newPrompt: string) => Promise<boolean>;
    generateCinematicAudio: (cinematicId: string, voice: string) => Promise<void>;
    onExpand?: () => void;
    isFullScreen?: boolean;
    onCollapse?: () => void;
}

const CinematicEditorModal: React.FC<{
    cinematic: Cinematic;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Omit<Cinematic, 'id'>>) => void;
    onRegenerateFrame: (id: string, frameIndex: number, prompt: string) => Promise<boolean>;
}> = ({ cinematic, onClose, onSave, onRegenerateFrame }) => {
    const { t } = useLocalization();
    const [title, setTitle] = useState(cinematic.title);
    const [synopsis, setSynopsis] = useState(cinematic.synopsis);
    const [frames, setFrames] = useState<CinemaFrame[]>(cinematic.frames);
    const [regeneratingFrame, setRegeneratingFrame] = useState<number | null>(null);
    const [frameToDelete, setFrameToDelete] = useState<number | null>(null);

    useEffect(() => {
        // This effect syncs the local state if the parent's prop changes,
        // which happens after a successful regeneration in useGameLogic.
        const originalCinematic = cinematic;
        setTitle(originalCinematic.title);
        setSynopsis(originalCinematic.synopsis);
        setFrames(originalCinematic.frames);
    }, [cinematic]);

    const handleFrameChange = (index: number, field: keyof CinemaFrame, value: string) => {
        setFrames(prev => {
            const newFrames = [...prev];
            newFrames[index] = { ...newFrames[index], [field]: value };
            return newFrames;
        });
    };

    const handleRegenerate = async (index: number) => {
        setRegeneratingFrame(index);
        await onRegenerateFrame(cinematic.id, index, frames[index].imagePrompt);
        setRegeneratingFrame(null);
    };

    const handleSave = () => {
        onSave(cinematic.id, { title, synopsis, frames });
        onClose();
    };

    const handleConfirmDeleteFrame = () => {
        if (frameToDelete !== null) {
            setFrames(prev => prev.filter((_, i) => i !== frameToDelete));
            setFrameToDelete(null);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={t('EditCinematic')} size="fullscreen">
            <div className="flex flex-col h-full gap-4">
                <div className="flex-shrink-0 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('Title')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{t('Synopsis')}</label>
                        <textarea
                            value={synopsis}
                            onChange={(e) => setSynopsis(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200"
                            rows={3}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 -mr-4 space-y-4">
                    {frames.map((frame, index) => (
                        <div key={index} className="bg-gray-900/40 rounded-lg border border-gray-700/50 p-4 space-y-3">
                             <div className="w-full aspect-video bg-black rounded-md overflow-hidden relative">
                                {frame.imageUrl && <img src={frame.imageUrl} alt={`Frame ${index + 1}`} className="w-full h-full object-contain" />}
                                {regeneratingFrame === index && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                        <LoadingSpinner />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">{t('ImagePrompt')}</label>
                                <div className="flex gap-2">
                                    <textarea
                                        value={frame.imagePrompt}
                                        onChange={(e) => handleFrameChange(index, 'imagePrompt', e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-xs text-gray-300 font-mono"
                                        rows={3}
                                    />
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleRegenerate(index)} disabled={regeneratingFrame !== null} className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 disabled:opacity-50 flex items-center justify-center gap-1.5">
                                            {regeneratingFrame === index ? <LoadingSpinner /> : <ArrowPathIcon className="w-4 h-4" />}
                                            {t('RegenerateFrame')}
                                        </button>
                                        <button onClick={() => setFrameToDelete(index)} disabled={regeneratingFrame !== null} className="px-3 py-1 text-xs font-semibold rounded-md bg-red-600/20 text-red-300 hover:bg-red-600/40 disabled:opacity-50 flex items-center justify-center gap-1.5">
                                            <TrashIcon className="w-4 h-4" />
                                            {t('Delete Frame')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">{t('Subtitle')}</label>
                                <textarea
                                    value={frame.subtitle}
                                    onChange={(e) => handleFrameChange(index, 'subtitle', e.target.value)}
                                    className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-300"
                                    rows={2}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t border-gray-700/50">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition">{t('Cancel')}</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center gap-2">
                        <CheckIcon className="w-5 h-5" />
                        {t('SaveAndClose')}
                    </button>
                </div>
            </div>
            <ConfirmationModal
                isOpen={frameToDelete !== null}
                onClose={() => setFrameToDelete(null)}
                onConfirm={handleConfirmDeleteFrame}
                title={t('Delete Frame')}
            >
                <p>{t('Are you sure you want to permanently delete this frame?')}</p>
            </ConfirmationModal>
        </Modal>
    );
};

interface CinematicCardProps {
    cinematic: Cinematic;
    onPlay: () => void;
    onExport: () => void;
    onDelete: () => void;
    onContinue: () => void;
    onEdit: () => void;
    isExtending: boolean;
    generateCinematicAudio: (cinematicId: string, voice: string) => Promise<void>;
    isGenerating: boolean;
}

const CinematicCard: React.FC<CinematicCardProps> = ({ cinematic, onPlay, onExport, onDelete, onContinue, onEdit, isExtending, generateCinematicAudio, isGenerating }) => {
    const { t } = useLocalization();
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('Kore');
    const voices = ['Kore', 'Puck', 'Charon', 'Zephyr', 'Fenrir'];
    const posterUrl = cinematic.frames[0]?.imageUrl;

    const handleGenerateAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        generateCinematicAudio(cinematic.id, selectedVoice);
    };

    return (
        <div className="bg-gray-900/40 rounded-lg border border-gray-700/50 overflow-hidden">
            <div
                className="p-4 flex flex-col justify-end items-start h-48 bg-cover bg-center relative group cursor-pointer"
                style={{
                    backgroundImage: posterUrl ? `linear-gradient(to top, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.1)), url(${posterUrl})` : 'none',
                    backgroundColor: '#1f2937' // slate-800 fallback
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h4 className="font-bold text-2xl text-white drop-shadow-lg narrative-text">{cinematic.title}</h4>
                <div className="absolute bottom-2 right-2 p-1 text-white/70 group-hover:text-white transition-colors">
                    {isExpanded ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
                </div>
            </div>
            {isExpanded && (
                <div className="p-4 border-t border-gray-700/50 space-y-4 animate-fade-in-down-fast">
                     <div>
                        <h5 className="text-sm font-semibold text-gray-300 mb-2">{t('Synopsis')}</h5>
                        <p className="text-sm text-gray-400 italic">
                            {cinematic.synopsis}
                        </p>
                    </div>
                    <div>
                        <h5 className="text-sm font-semibold text-gray-300 mb-2">{t('UserPrompt')}</h5>
                        <p className="text-sm text-gray-400 italic">
                            "{cinematic.userPrompt}"
                        </p>
                    </div>
                    <div>
                        <h5 className="text-sm font-semibold text-gray-300 mb-2">{t('Comments')}</h5>
                        <div className="space-y-2 text-xs text-gray-400 italic">
                            {cinematic.comments.map((comment, i) => (
                                <blockquote key={i} className="pl-2 border-l-2 border-gray-600">
                                    "{comment}"
                                </blockquote>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end flex-wrap items-center pt-2 border-t border-gray-700/50">
                        <div className="flex items-center gap-2 mr-auto">
                            <label htmlFor={`voice-select-${cinematic.id}`} className="text-xs text-gray-400">{t('SelectVoice')}:</label>
                            <select
                                id={`voice-select-${cinematic.id}`}
                                value={selectedVoice}
                                onChange={(e) => { e.stopPropagation(); setSelectedVoice(e.target.value); }}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isGenerating || isExtending}
                                className="dark-select !py-1 !px-2 !text-xs"
                            >
                                {voices.map(voice => (
                                    <option key={voice} value={voice}>{voice}</option>
                                ))}
                            </select>
                            <button onClick={handleGenerateAudio} disabled={isGenerating || isExtending} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-teal-600/20 text-teal-300 hover:bg-teal-600/40 disabled:opacity-50">
                                <SpeakerWaveIcon className="w-4 h-4" />
                                {t('GenerateAudio')}
                            </button>
                        </div>
                        <button onClick={onEdit} disabled={isGenerating || isExtending} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/40 disabled:opacity-50">
                            <PencilIcon className="w-4 h-4" />{t('Edit')}
                        </button>
                        <button onClick={onContinue} disabled={isGenerating || isExtending} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 disabled:opacity-50">
                            {isExtending ? <LoadingSpinner /> : <ArrowPathIcon className="w-4 h-4" />}
                            {t('ContinueGeneration')}
                        </button>
                        <button onClick={onPlay} disabled={isGenerating || isExtending} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-green-600/20 text-green-300 hover:bg-green-600/40 disabled:opacity-50">
                            <PlayIcon className="w-4 h-4" />{t('Play')}
                        </button>
                        <button onClick={onExport} disabled={isGenerating || isExtending} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 disabled:opacity-50">
                            <ArrowDownTrayIcon className="w-4 h-4" />{t('Export')}
                        </button>
                        <button onClick={onDelete} disabled={isGenerating || isExtending} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-red-600/20 text-red-300 hover:bg-red-600/40 disabled:opacity-50">
                            <TrashIcon className="w-4 h-4" />{t('Delete')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CinemaHall: React.FC<CinemaHallProps> = ({ 
    cinematics = [], 
    onGenerateTrailer, 
    isGenerating, 
    progress,
    onPlay,
    onExport,
    onDelete,
    onImport,
    onContinue,
    extendingCinematicId,
    onCancel,
    updateCinematic,
    regenerateCinemaFrame,
    generateCinematicAudio,
    onExpand,
    isFullScreen,
    onCollapse,
}) => {
    const { t } = useLocalization();
    const [prompt, setPrompt] = useState('');
    const [cinematicToDelete, setCinematicToDelete] = useState<Cinematic | null>(null);
    const [editingCinematic, setEditingCinematic] = useState<Cinematic | null>(null);

    useEffect(() => {
        if (editingCinematic) {
            const updatedCinematic = cinematics.find(c => c.id === editingCinematic.id);
            if (updatedCinematic && JSON.stringify(updatedCinematic) !== JSON.stringify(editingCinematic)) {
                setEditingCinematic(updatedCinematic);
            }
        }
    }, [cinematics, editingCinematic]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isGenerating) {
            onGenerateTrailer(prompt);
            setPrompt('');
        }
    };

    const handleDeleteConfirm = () => {
        if (cinematicToDelete) {
            onDelete(cinematicToDelete.id);
            setCinematicToDelete(null);
        }
    };

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-cyan-400 narrative-text flex items-center gap-2">
                        <FilmIcon className="w-6 h-6" />
                        {t('CinemaHall')}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onImport}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 disabled:opacity-50"
                        >
                            <DocumentArrowUpIcon className="w-4 h-4" />
                            {t('ImportCinematic')}
                        </button>
                        {!isFullScreen && onExpand && (
                            <button onClick={onExpand} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/80" title={t('Expand')}>
                                <ArrowsPointingOutIcon className="w-5 h-5" />
                            </button>
                        )}
                        {isFullScreen && onCollapse && (
                            <button onClick={onCollapse} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/80" title={t('Collapse')}>
                                <ArrowsPointingInIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">{t('CinemaHallDescription')}</p>
                
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('DescribeMoment')}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[100px]"
                        rows={3}
                        disabled={isGenerating}
                    />
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={isGenerating || !prompt.trim()}
                            className="flex-1 bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-500 transition-all text-base shadow-lg shadow-cyan-500/10 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? t('Generating...') : t('GenerateTrailer')}
                        </button>
                        {isGenerating && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 font-semibold text-white bg-red-700 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <XCircleIcon className="w-5 h-5" />
                                {t('Cancel')}
                            </button>
                        )}
                    </div>
                </form>

                {isGenerating && (
                    <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
                        <p className="text-center text-cyan-300 font-semibold">{progress.message}</p>
                        {progress.total > 0 && (
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                <div
                                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
                    {cinematics.length > 0 ? (
                        [...cinematics].reverse().map(cinematic => (
                            <CinematicCard
                                key={cinematic.id}
                                cinematic={cinematic}
                                onPlay={() => onPlay(cinematic.id)}
                                onExport={() => onExport(cinematic.id)}
                                onDelete={() => setCinematicToDelete(cinematic)}
                                onContinue={() => onContinue(cinematic.id)}
                                onEdit={() => setEditingCinematic(cinematic)}
                                isExtending={extendingCinematicId === cinematic.id}
                                generateCinematicAudio={generateCinematicAudio}
                                isGenerating={isGenerating}
                            />
                        ))
                    ) : (
                        !isGenerating && <p className="text-center text-gray-500 p-4">{t('NoCinematics')}</p>
                    )}
                </div>
            </div>
            
            {editingCinematic && (
                <CinematicEditorModal
                    cinematic={editingCinematic}
                    onClose={() => setEditingCinematic(null)}
                    onSave={updateCinematic}
                    onRegenerateFrame={regenerateCinemaFrame}
                />
            )}

            <ConfirmationModal
                isOpen={!!cinematicToDelete}
                onClose={() => setCinematicToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title={t('DeleteCinematicTitle')}
            >
                <p>{t('DeleteCinematicConfirm', { title: cinematicToDelete?.title || '' })}</p>
            </ConfirmationModal>
        </>
    );
};

export default CinemaHall;