import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PlayerCharacter, NPC, Location, Faction, FactionAffiliation } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';
import SectionHeader from './Shared/SectionHeader';
import ReadableEditableField from './Shared/ReadableEditableField';
import EditableField from '../DetailRenderer/Shared/EditableField';
import IdDisplay from '../DetailRenderer/Shared/IdDisplay';
import {
    PhotoIcon,
    UserCircleIcon,
    TagIcon,
    ArrowUpTrayIcon,
    ArrowUturnLeftIcon,
    UserIcon,
    MapPinIcon,
    BookOpenIcon,
    CogIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import ImageRenderer from '../ImageRenderer';

interface ProfileViewProps {
    character: PlayerCharacter | NPC;
    playerCharacter: PlayerCharacter;
    isPlayer: boolean;
    isAdminEditable: boolean;
    isViewOnly: boolean;
    onEditPlayerData?: (field: keyof PlayerCharacter, value: any) => void;
    onEditNpcData?: (npcId: string, field: keyof NPC, value: any) => void;
    onShowMessageModal: (title: string, content: string) => void;
    updatePlayerPortrait?: (playerId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
    updateNpcPortrait?: (npcId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
    allLocations: Location[];
    onOpenDetailModal: (title: string, data: any) => void;
    onSwitchView: (view: string) => void;
    onRegenerateId?: (entity: any, entityType: string) => void;
    gameSettings: any; // should be GameSettings
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    encounteredFactions: Faction[];
}

const FactionAffiliationDisplay: React.FC<{ affiliations: FactionAffiliation[], allFactions: Faction[], onOpenDetailModal: (title: string, data: any) => void, character: PlayerCharacter | NPC }> = ({ affiliations, allFactions, onOpenDetailModal, character }) => {
    const { t } = useLocalization();
    if (!affiliations || affiliations.length === 0) {
        return <p className="text-sm text-gray-400 italic">{t('No known faction affiliations.')}</p>;
    }
    return (
        <div className="space-y-2">
            {affiliations.map((aff, index) => {
                const factionData = allFactions.find(f => f.factionId === aff.factionId);
                let branchName = '';
                if (factionData && aff.branch) {
                    const branch = factionData.ranks?.branches.find(b => b.branchId === aff.branch);
                    branchName = branch ? ` (${t(branch.displayName as any)})` : ` (${aff.branch})`;
                }

                return (
                    <div key={index} className="bg-gray-800/40 p-2 rounded-md">
                        <button 
                            onClick={() => factionData && onOpenDetailModal(t("Faction: {name}", { name: factionData.name }), { ...factionData, type: 'faction' })}
                            disabled={!factionData}
                            className="font-semibold hover:underline disabled:no-underline"
                            style={{ color: factionData?.color || 'inherit' }}
                        >
                            {aff.factionName}
                        </button>
                        <button 
                            onClick={() => {
                                if (factionData) {
                                    onOpenDetailModal(
                                        t("Faction: {name}", { name: factionData.name }), 
                                        { 
                                            ...factionData, 
                                            type: 'faction', 
                                            initialView: 'Hierarchy & Standing',
                                            perspectiveFor: { name: character.name, rank: aff.rank, branch: aff.branch } 
                                        }
                                    );
                                }
                            }}
                            className="text-xs text-gray-400 block hover:underline"
                            disabled={!factionData}
                            title={t('View Rank in Hierarchy')}
                        >
                            {t('Rank')}: {aff.rank || 'N/A'}{branchName}
                        </button>
                        <p className="text-xs text-gray-500">({t(aff.membershipStatus as any)})</p>
                    </div>
                );
            })}
        </div>
    );
};


const ProfileView: React.FC<ProfileViewProps> = ({
    character,
    isPlayer,
    isAdminEditable,
    isViewOnly,
    onEditPlayerData,
    onEditNpcData,
    onShowMessageModal,
    updatePlayerPortrait,
    updateNpcPortrait,
    allLocations,
    onOpenDetailModal,
    onSwitchView,
    onRegenerateId,
    gameSettings,
    imageCache,
    onImageGenerated,
    encounteredFactions
}) => {
    const { t } = useLocalization();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const portraitInitAttempted = useRef<Record<string, boolean>>({});
    
    const [localPrompt, setLocalPrompt] = useState('');

    const currentLocation = useMemo(() => {
        if (isPlayer || !(character as NPC).currentLocationId) return null;
        return allLocations.find(loc => loc.locationId === (character as NPC).currentLocationId);
    }, [character, isPlayer, allLocations]);


    useEffect(() => {
        const characterId = 'playerId' in character ? character.playerId : character.NPCId;
        const isCustom = isPlayer ? (character as PlayerCharacter).portrait?.startsWith('custom-portrait-') : !!(character as NPC).custom_image_prompt;
        const prompt = isPlayer ? (character as PlayerCharacter).portrait : ((character as NPC).custom_image_prompt || (character as NPC).image_prompt);
        setLocalPrompt(isCustom ? '' : (prompt || character.appearanceDescription || ''));

        if (isPlayer && !isViewOnly && updatePlayerPortrait && (character as PlayerCharacter).portrait === null && character.appearanceDescription) {
            if (!portraitInitAttempted.current[characterId]) {
                portraitInitAttempted.current[characterId] = true;
                if (updatePlayerPortrait) {
                    updatePlayerPortrait((character as PlayerCharacter).playerId, { prompt: character.appearanceDescription });
                }
            }
        }
    }, [character, isPlayer, isViewOnly, updatePlayerPortrait]);

    const isCustomPortrait = isPlayer ? (character as PlayerCharacter).portrait?.startsWith('custom-portrait-') ?? false : !!(character as NPC).custom_image_prompt;

    const handleSavePrompt = useCallback((newPrompt: string) => {
        if (isPlayer && updatePlayerPortrait) {
            updatePlayerPortrait((character as PlayerCharacter).playerId, { prompt: newPrompt });
        } else if (!isPlayer && onEditNpcData && 'NPCId' in character) {
            onEditNpcData(character.NPCId, 'custom_image_prompt', newPrompt);
        } else if (!isPlayer && updateNpcPortrait && 'NPCId' in character) {
            updateNpcPortrait(character.NPCId, { prompt: newPrompt });
        }
    }, [updatePlayerPortrait, onEditNpcData, isPlayer, character, updateNpcPortrait]);
    
    const handleUploadCustomPortrait = useCallback((base64: string) => {
        if(isPlayer && updatePlayerPortrait) {
            updatePlayerPortrait((character as PlayerCharacter).playerId, { custom: base64 });
        } else if (!isPlayer && updateNpcPortrait && 'NPCId' in character) {
            updateNpcPortrait(character.NPCId, { custom: base64 });
        }
    }, [updatePlayerPortrait, updateNpcPortrait, isPlayer, character]);
    
    const handleRevertPortrait = useCallback(() => {
        if (isPlayer && updatePlayerPortrait) {
          updatePlayerPortrait((character as PlayerCharacter).playerId, { custom: null, prompt: character.appearanceDescription });
        } else if (!isPlayer && updateNpcPortrait && 'NPCId' in character) {
            updateNpcPortrait(character.NPCId, { custom: null });
        }
    }, [updatePlayerPortrait, updateNpcPortrait, isPlayer, character]);

    const handleUploadClick = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert(t("Please select an image file."));
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                handleUploadCustomPortrait(base64data);
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const worldviewOptions = [
        "Lawful Good", "Neutral Good", "Chaotic Good",
        "Lawful Neutral", "True Neutral", "Chaotic Neutral",
        "Lawful Evil", "Neutral Evil", "Chaotic Evil"
    ];
    
    const showManageInventoryButton = isPlayer || (!isPlayer && (character as NPC).progressionType === 'Companion');

    return (
        <div className="space-y-6">
            <SectionHeader title={t('Portrait')} icon={PhotoIcon} />
            <div className="space-y-3 p-3 bg-gray-900/30 rounded-lg">
                {isAdminEditable && !isViewOnly && (
                    <>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <button onClick={handleUploadClick} className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-600/20 rounded-md hover:bg-cyan-600/40 transition-colors">
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            {t('Upload Custom Portrait')}
                        </button>
                        {isCustomPortrait && (
                            <button onClick={handleRevertPortrait} className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-semibold text-yellow-300 bg-yellow-600/20 rounded-md hover:bg-yellow-600/40 transition-colors">
                                <ArrowUturnLeftIcon className="w-4 h-4" />
                                {t('revert_to_generated')}
                            </button>
                        )}
                    </>
                )}
                <div className="pt-2">
                    <EditableField label={t('Image Prompt')} value={localPrompt} isEditable={!isCustomPortrait && isAdminEditable && !isViewOnly} onSave={handleSavePrompt} onChange={setLocalPrompt} as="textarea" />
                    {!isPlayer && (
                         <p className="text-xs text-gray-400 mt-2">
                            <strong>{t("Default prompt from AI:")}</strong> 
                            {(character as NPC).image_prompt}
                        </p>
                    )}
                </div>
            </div>
    
            <div className="flex flex-col sm:flex-row gap-2">
                {showManageInventoryButton && (
                    <button
                        onClick={() => onSwitchView('Inventory')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
                    >
                        <UserIcon className="w-5 h-5" />
                        {t('Manage Inventory')}
                    </button>
                )}
            </div>
            {!isPlayer && (
                <>
                    <SectionHeader title={t('Core Identity')} icon={UserIcon} />
                    <div className="space-y-4">
                        {currentLocation && (
                             <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <h5 className="text-sm font-semibold text-gray-400 flex items-center gap-2"><MapPinIcon className="w-4 h-4" />{t('Current Location')}</h5>
                                </div>
                                <div className="pl-2 border-l-2 border-gray-700/50">
                                     <button
                                        onClick={() => onOpenDetailModal(t("Location: {name}", { name: currentLocation.name }), { ...currentLocation, type: 'location' })}
                                        className="text-sm text-cyan-400 hover:underline"
                                    >
                                        {currentLocation.name}
                                    </button>
                                </div>
                            </div>
                        )}
                        {(character as NPC).lastRelationshipChangeReason && (
                            <ReadableEditableField
                                label={t('last_rep_change_reason')}
                                value={(character as NPC).lastRelationshipChangeReason || ''}
                                isEditable={false}
                                onSave={() => {}}
                                onRead={() => onShowMessageModal(t('last_rep_change_reason'), (character as NPC).lastRelationshipChangeReason || '')}
                                t={t}
                            />
                        )}
                        {(character as NPC).progressionType === 'Companion' && (
                            <ReadableEditableField
                                label={t('Player Directive')}
                                value={(character as NPC).playerCompanionDirective || ''}
                                isEditable={isAdminEditable && !isViewOnly}
                                onSave={(val) => onEditNpcData?.((character as NPC).NPCId, 'playerCompanionDirective', val)}
                                onRead={() => onShowMessageModal(t('Player Directive'), (character as NPC).playerCompanionDirective || '')}
                                t={t}
                                as="textarea"
                            />
                        )}
                        <ReadableEditableField
                            label={t('History')}
                            value={(character as NPC).history || ''}
                            isEditable={isAdminEditable && !isViewOnly}
                            onSave={(val) => onEditNpcData?.((character as NPC).NPCId, 'history', val)}
                            onRead={() => onShowMessageModal(t('History'), (character as NPC).history || '')}
                            t={t}
                        />

                        <div>
                            <div className="flex justify-between items-center">
                                <h5 className="text-sm font-semibold text-gray-400">{t('Worldview')}</h5>
                            </div>
                            <div className="pl-2 border-l-2 border-gray-700/50">
                                {isAdminEditable && !isViewOnly ? (
                                    <select
                                        value={(character as NPC).worldview || 'True Neutral'}
                                        onChange={(e) => onEditNpcData?.((character as NPC).NPCId, 'worldview', e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                                    >
                                        {worldviewOptions.map(opt => <option key={opt} value={opt}>{t(opt as any)}</option>)}
                                    </select>
                                ) : (
                                    <p className="text-sm text-gray-300">{t((character as NPC).worldview as any) || ''}</p>
                                )}
                            </div>
                        </div>

                        <ReadableEditableField
                            label={t('Personality Archetype')}
                            value={(character as NPC).personalityArchetype || ''}
                            isEditable={isAdminEditable && !isViewOnly}
                            onSave={(val) => onEditNpcData?.((character as NPC).NPCId, 'personalityArchetype', val)}
                            onRead={() => onShowMessageModal(t('Personality Archetype'), (character as NPC).personalityArchetype || '')}
                            t={t}
                            as="input"
                        />
                        <div>
                            <div className="flex justify-between items-center">
                                <h5 className="text-sm font-semibold text-gray-400">{t('Progression Type')}</h5>
                            </div>
                            <div className="pl-2 border-l-2 border-gray-700/50">
                                {isAdminEditable && !isViewOnly ? (
                                    <select
                                        value={(character as NPC).progressionType || 'Static'}
                                        onChange={(e) => onEditNpcData?.((character as NPC).NPCId, 'progressionType', e.target.value)}
                                        className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                                    >
                                        <option value="Companion">{t('Companion')}</option>
                                        <option value="PlotDriven">{t('PlotDriven')}</option>
                                        <option value="Static">{t('Static')}</option>
                                    </select>
                                ) : (
                                    <p className="text-sm text-gray-300">{t((character as NPC).progressionType as any)}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-sm font-semibold text-gray-400 flex items-center gap-2"><UserGroupIcon className="w-4 h-4" />{t('Faction Affiliations')}</h5>
                            <div className="pl-2 border-l-2 border-gray-700/50">
                                <FactionAffiliationDisplay 
                                    affiliations={(character as NPC).factionAffiliations || []}
                                    allFactions={encounteredFactions}
                                    onOpenDetailModal={onOpenDetailModal}
                                    character={character}
                                />
                            </div>
                        </div>
                         { (character as NPC).journalEntries && (
                            <div className="pt-4 border-t border-gray-700/50">
                                <button
                                    onClick={() => onSwitchView('Journal')}
                                    className="w-full text-sm font-semibold text-cyan-300 hover:bg-cyan-500/10 p-2 rounded-md transition-colors"
                                >
                                    {t('View Full Journal')} ({(character as NPC).journalEntries?.length || 0})
                                </button>
                            </div>
                         )}
                    </div>
                </>
            )}

            <SectionHeader title={t('Appearance')} icon={UserCircleIcon} />
            <ReadableEditableField
                label={t('Appearance Description')}
                value={character.appearanceDescription}
                isEditable={isAdminEditable && !isViewOnly}
                onSave={(val) => isPlayer && onEditPlayerData ? onEditPlayerData('appearanceDescription', val) : onEditNpcData?.((character as NPC).NPCId, 'appearanceDescription', val)}
                onRead={() => onShowMessageModal(t('Appearance Description'), character.appearanceDescription)}
                t={t}
            />
            
            <SectionHeader title={t('Race & Class')} icon={TagIcon} />
            <div className="space-y-4">
                <ReadableEditableField 
                    label={t('Race Name')} 
                    value={t(character.race as any)} 
                    isEditable={isAdminEditable && !isViewOnly} 
                    onSave={(val) => isPlayer && onEditPlayerData ? onEditPlayerData('race', val) : onEditNpcData?.((character as NPC).NPCId, 'race', val)} 
                    as="input"
                    onRead={() => onShowMessageModal(t('Race Name'), t(character.race as any))}
                    t={t}
                />
                <ReadableEditableField 
                    label={t('Race Description')} 
                    value={t(character.raceDescription as any)} 
                    isEditable={isAdminEditable && !isViewOnly} 
                    onSave={(val) => isPlayer && onEditPlayerData ? onEditPlayerData('raceDescription', val) : onEditNpcData?.((character as NPC).NPCId, 'raceDescription', val)}
                    onRead={() => onShowMessageModal(t('Race Description'), t(character.raceDescription as any))}
                    t={t}
                />
                <div className="pt-4 mt-4 border-t border-gray-700/50">
                    <ReadableEditableField 
                        label={t('Class Name')} 
                        value={t(character.class as any)} 
                        isEditable={isAdminEditable && !isViewOnly} 
                        onSave={(val) => isPlayer && onEditPlayerData ? onEditPlayerData('class', val) : onEditNpcData?.((character as NPC).NPCId, 'class', val)} 
                        as="input"
                        onRead={() => onShowMessageModal(t('Class Name'), t(character.class as any))}
                        t={t}
                    />
                    <ReadableEditableField 
                        label={t('Class Description')} 
                        value={t(character.classDescription as any)} 
                        isEditable={isAdminEditable && !isViewOnly} 
                        onSave={(val) => isPlayer && onEditPlayerData ? onEditPlayerData('classDescription', val) : onEditNpcData?.((character as NPC).NPCId, 'classDescription', val)}
                        onRead={() => onShowMessageModal(t('Class Description'), t(character.classDescription as any))}
                        t={t}
                    />
                </div>
            </div>
            {isAdminEditable && !isPlayer && onRegenerateId && (
                <div className="mt-6">
                    <SectionHeader title={t("System Information")} icon={CogIcon} />
                    <IdDisplay
                        id={(character as NPC).NPCId}
                        name={character.name}
                        onRegenerate={() => onRegenerateId(character, 'NPC')}
                    />
                </div>
            )}
        </div>
    );
}

export default ProfileView;