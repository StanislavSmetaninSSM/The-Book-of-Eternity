import React, { useCallback, useMemo } from 'react';
import { PlayerCharacter, NPC, GameSettings, ImageCacheEntry } from '../../types';
import { useLocalization } from '../../context/LocalizationContext';
import ImageRenderer from '../ImageRenderer';
import EditableField from '../DetailRenderer/Shared/EditableField';
import StatBar from './Shared/StatBar';
import { 
    HeartIcon, 
    BoltIcon,
    ScaleIcon,
    StarIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface CharacterSheetHeaderProps {
    character: PlayerCharacter | NPC;
    isViewOnly: boolean;
    isAdminEditable: boolean;
    onEditPlayerData?: (field: keyof PlayerCharacter, value: any) => void;
    onEditNpcData?: (npcId: string, field: keyof NPC, value: any) => void;
    onOpenImageModal: (prompt: string, originalTextPrompt: string, onClearCustom?: () => void, onUpload?: (base64: string) => void) => void;
    updatePlayerPortrait?: (playerId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
    updateNpcPortrait?: (npcId: string, portraitData: { prompt?: string | null; custom?: string | null; }) => void;
    imageCache: Record<string, ImageCacheEntry>;
    onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
    gameSettings: GameSettings;
    onOpenDetailModal: (title: string, data: any) => void;
    onSwitchView: (view: string) => void;
    isLoading: boolean;
}

const CharacterSheetHeader: React.FC<CharacterSheetHeaderProps> = ({
    character,
    isViewOnly,
    isAdminEditable,
    onEditPlayerData,
    onEditNpcData,
    onOpenImageModal,
    updatePlayerPortrait,
    updateNpcPortrait,
    imageCache,
    onImageGenerated,
    gameSettings,
    onOpenDetailModal,
    onSwitchView,
    isLoading
}) => {
    const { t } = useLocalization();
    const isPlayer = 'playerId' in character;
    const canUpgrade = isPlayer && !isViewOnly && (character as PlayerCharacter).attributePoints > 0;

    const portraitPrompt = useMemo(() => {
        if (isPlayer) {
            return (character as PlayerCharacter).portrait || (character as PlayerCharacter).image_prompt;
        } else {
            return (character as NPC).custom_image_prompt || (character as NPC).image_prompt;
        }
    }, [character, isPlayer]);
    
    const originalImagePrompt = useMemo(() => {
        if (isPlayer) {
            return (character as PlayerCharacter).image_prompt;
        } else {
            return (character as NPC).image_prompt;
        }
    }, [character, isPlayer]);

    const handleOpenModal = useCallback(() => {
        if (isLoading || !onOpenImageModal || !portraitPrompt) return;

        let onClearCustom: (() => void) | undefined;
        let onUpload: ((base64: string) => void) | undefined;

        if (isPlayer && updatePlayerPortrait) {
            onClearCustom = () => updatePlayerPortrait((character as PlayerCharacter).playerId, { custom: null });
            onUpload = (base64) => updatePlayerPortrait((character as PlayerCharacter).playerId, { custom: base64 });
        } 
        else if (!isPlayer && updateNpcPortrait) {
            onClearCustom = () => updateNpcPortrait!((character as NPC).NPCId, { custom: null });
            onUpload = (base64) => updateNpcPortrait!((character as NPC).NPCId, { custom: base64 });
        }
        
        onOpenImageModal(portraitPrompt, originalImagePrompt || portraitPrompt, onClearCustom, onUpload);
    }, [character, isPlayer, onOpenImageModal, portraitPrompt, originalImagePrompt, updatePlayerPortrait, updateNpcPortrait, isLoading]);


    const handleNameSave = (val: any) => {
        if (isPlayer && onEditPlayerData) onEditPlayerData('name', val);
        else if (!isPlayer && onEditNpcData) onEditNpcData((character as NPC).NPCId, 'name', val);
    };

    const handleHealthClick = () => {
        onOpenDetailModal(t('Health'), {
            type: 'derivedStat',
            name: t('Health'),
            value: `${character.currentHealth} / ${character.maxHealth}`,
            breakdown: [
                { label: t('Base Health'), value: '100' },
                { label: t('Constitution Bonus'), value: `+${Math.floor(character.characteristics.standardConstitution * 2.0)}` },
                { label: t('Strength Bonus'), value: `+${Math.floor(character.characteristics.standardStrength * 1.0)}` }
            ],
            description: t('primary_stat_description_health')
        });
    };
    
    const handleEnergyClick = () => {
        if ('currentEnergy' in character) {
            onOpenDetailModal(t('Energy'), {
                type: 'derivedStat',
                name: t('Energy'),
                value: `${character.currentEnergy} / ${character.maxEnergy}`,
                breakdown: [
                    { label: t('Base Energy'), value: '100' },
                    { label: t('Constitution Bonus'), value: `+${Math.floor(character.characteristics.standardConstitution * 0.75)}` },
                    { label: t('Intelligence Bonus'), value: `+${Math.floor(character.characteristics.standardIntelligence * 0.75)}` },
                    { label: t('Wisdom Bonus'), value: `+${Math.floor(character.characteristics.standardWisdom * 0.75)}` },
                    { label: t('Faith Bonus'), value: `+${Math.floor(character.characteristics.standardFaith * 0.75)}` }
                ],
                description: t('primary_stat_description_energy')
            });
        }
    };

    const handleExperienceClick = () => {
        if ('experience' in character) {
            onOpenDetailModal(t('Experience'), {
                type: 'derivedStat',
                name: t('Experience'),
                value: `${(character as PlayerCharacter).experience} / ${(character as PlayerCharacter).experienceForNextLevel}`,
                breakdown: [
                    { label: t('Formula for Next Level'), value: 'floor(100 * (Lvl ^ 2.5))' }
                ],
                description: t('primary_stat_description_experience')
            });
        }
    };
    
    const handleWeightClick = () => {
        onOpenDetailModal(t('Weight'), {
            type: 'derivedStat',
            name: t('Weight'),
            value: `${character.totalWeight?.toFixed(1)} / ${character.maxWeight?.toFixed(0)} kg`,
            breakdown: [
                { label: t('Base Capacity'), value: `30 ${t('kg_short')}` },
                { label: t('Strength Bonus'), value: `+${Math.floor(character.characteristics.standardStrength * 1.8)} ${t('kg_short')}` },
                { label: t('Constitution Bonus'), value: `+${Math.floor(character.characteristics.standardConstitution * 0.4)} ${t('kg_short')}` },
                { label: '---', value: '' }, // Separator
                { label: t('Max Weight (Overload Threshold)'), value: `${character.maxWeight?.toFixed(0)} ${t('kg_short')}` },
                { label: t('Critical Weight'), value: `${((character.maxWeight || 0) + ((character as PlayerCharacter).criticalExcessWeight || 15)).toFixed(0)} ${t('kg_short')}` },
            ],
            description: t('primary_stat_description_weight')
        });
    };

    const handleRelationshipClick = () => {
        const tiers = [
            { lowerBound: -400, upperBound: -201, name: t('relationship_tier_implacable_foe'), desc: t('relationship_desc_implacable_foe') },
            { lowerBound: -200, upperBound: -51, name: t('relationship_tier_adversary'), desc: t('relationship_desc_adversary') },
            { lowerBound: -50, upperBound: -1, name: t('relationship_tier_dislike'), desc: t('relationship_desc_dislike') },
            { lowerBound: 0, upperBound: 100, name: t('relationship_tier_neutral'), desc: t('relationship_desc_neutral') },
            { lowerBound: 101, upperBound: 250, name: t('relationship_tier_familiarity_trust'), desc: t('relationship_desc_familiarity_trust') },
            { lowerBound: 251, upperBound: 350, name: t('relationship_tier_deep_bond'), desc: t('relationship_desc_deep_bond') },
            { lowerBound: 351, upperBound: 400, name: t('relationship_tier_legendary_bond'), desc: t('relationship_desc_legendary_bond') },
        ];
        onOpenDetailModal(t('Relationship'), {
            type: 'relationship',
            tiers: tiers,
            current: (character as NPC).relationshipLevel
        });
    };
    
    return (
        <div className="grid grid-cols-[208px_1fr] gap-x-6 items-start">
            {/* Left Column: Avatar */}
            <div className="w-52 h-72 rounded-md overflow-hidden bg-gray-900 group relative cursor-pointer flex-shrink-0" onClick={handleOpenModal}>
                <ImageRenderer 
                    prompt={portraitPrompt} 
                    originalTextPrompt={originalImagePrompt}
                    alt={character.name} 
                    className="w-full h-full object-cover"
                    imageCache={imageCache} 
                    onImageGenerated={onImageGenerated} 
                    width={512} 
                    height={768}
                    gameSettings={gameSettings}
                    gameIsLoading={isLoading}
                />
            </div>

            {/* Right Column: Info */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Name & Level */}
                <div>
                    <EditableField
                        label={t('Name')}
                        value={character.name}
                        isEditable={isAdminEditable && !isViewOnly}
                        onSave={handleNameSave}
                        as="input"
                        className="font-bold text-3xl text-cyan-400 narrative-text"
                    />
                    {character.level !== undefined && (
                        <div className="mt-1">
                            <span className="font-bold px-2 py-0.5 rounded-md bg-cyan-600 text-white text-xs whitespace-nowrap">
                                {t('Lvl_short')} {character.level}
                            </span>
                        </div>
                    )}
                </div>
                
                {/* Sub-info */}
                <p className="text-gray-400 text-sm mt-2">
                    {t(character.race as any)} {t(character.class as any)}, {character.age} {t('years_old')}
                </p>
                
                {/* Stat Bars (Vertical Stack) */}
                <div className="mt-4 space-y-3">
                    <StatBar
                        label={t('Health')}
                        value={character.currentHealth}
                        max={character.maxHealth}
                        color="bg-red-500"
                        icon={HeartIcon}
                        onClick={handleHealthClick}
                        title={t("Click to view details about Health")}
                        character={character}
                    />
                    {'currentEnergy' in character && character.currentEnergy !== undefined && (
                        <StatBar
                            label={t('Energy')}
                            value={character.currentEnergy}
                            max={character.maxEnergy!}
                            color="bg-blue-500"
                            icon={BoltIcon}
                            onClick={handleEnergyClick}
                            title={t("Click to view details about Energy")}
                            character={character}
                        />
                    )}
                     {'experience' in character && character.experience !== undefined && (
                        <StatBar
                            label={t('Experience')}
                            value={character.experience}
                            max={character.experienceForNextLevel!}
                            color="bg-yellow-500"
                            icon={StarIcon}
                            onClick={handleExperienceClick}
                            title={t("Click to view details about Experience")}
                            character={character}
                        />
                    )}
                    {isPlayer && 'money' in character && (
                        <div title={t('Money')}>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-medium text-gray-300">{t('Money')}</span>
                                </div>
                                <span className="text-sm font-mono text-gray-200 font-semibold">
                                    {character.money} {t(gameSettings.gameWorldInformation.currencyName as any)}
                                </span>
                            </div>
                            {/* Spacer to align with other stat bars that have a progress bar */}
                            <div className="h-2.5" />
                        </div>
                    )}
                     {character.totalWeight !== undefined && character.maxWeight !== undefined && (
                        <StatBar
                            label={t('Weight')}
                            value={character.totalWeight}
                            max={character.maxWeight}
                            threshold={character.maxWeight}
                            color="bg-orange-500"
                            unit={t('kg_short')}
                            icon={ScaleIcon}
                            onClick={handleWeightClick}
                            title={t("Click to view details about Weight")}
                            character={character}
                        />
                    )}
                     {!isPlayer && (character as NPC).relationshipLevel !== undefined && (
                        <StatBar
                            label={t('Relationship')}
                            value={(character as NPC).relationshipLevel}
                            min={-400}
                            max={400}
                            color="bg-pink-500"
                            icon={HeartIcon}
                            onClick={handleRelationshipClick}
                            title={t("Click to view details about Relationship")}
                            character={character}
                        />
                    )}
                </div>
                {canUpgrade && (
                    <div className="mt-4">
                        <button
                            onClick={() => onSwitchView('Stats')}
                            className="w-full p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center animate-pulse hover:bg-yellow-500/20 transition-colors"
                        >
                            <p className="font-bold text-yellow-300">
                                {t("You have {points} attribute points to spend!", { points: (character as PlayerCharacter).attributePoints })}
                            </p>
                            <p className="text-xs text-yellow-400/80">{t("Click here to go to the Stats tab.")}</p>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CharacterSheetHeader;