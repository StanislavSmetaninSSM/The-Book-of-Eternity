import React, { useState, useEffect, useCallback } from 'react';
import { PlayerCharacter } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import EditableField from './Shared/EditableField';
import { useLocalization } from '../../context/LocalizationContext';
import { UserIcon, TagIcon, AcademicCapIcon, PhotoIcon } from '@heroicons/react/24/outline';
import ImageRenderer from '../ImageRenderer';

interface PlayerCharacterDetailsProps extends Omit<DetailRendererProps, 'data'> {
  character: PlayerCharacter;
}

const PlayerCharacterDetailsRenderer: React.FC<PlayerCharacterDetailsProps> = ({
    character,
    allowHistoryManipulation,
    onEditPlayerData,
    updatePlayerPortrait,
    imageCache,
    onImageGenerated,
    onOpenImageModal,
    gameSettings,
    isLoading
}) => {
    const { t } = useLocalization();
    const isCustomPortrait = !!character.portrait;
    
    const [localPrompt, setLocalPrompt] = useState(character.image_prompt || '');

    useEffect(() => {
        setLocalPrompt(isCustomPortrait ? '' : (character.image_prompt || ''));
    }, [character.image_prompt, isCustomPortrait]);

    const handleSavePrompt = useCallback((newPrompt: string) => {
        if (updatePlayerPortrait) {
            updatePlayerPortrait(character.playerId, { prompt: newPrompt });
        }
    }, [updatePlayerPortrait, character.playerId]);
    
    const handleUploadFromModal = useCallback((base64: string) => {
        if (updatePlayerPortrait) {
            updatePlayerPortrait(character.playerId, { custom: base64 });
        }
    }, [updatePlayerPortrait, character.playerId]);

    const handleRevertPortrait = useCallback(() => {
        if (updatePlayerPortrait) {
            updatePlayerPortrait(character.playerId, { custom: null });
        }
    }, [updatePlayerPortrait, character.playerId]);
    
    return (
        <div className="space-y-4">
            <Section title={t("Appearance")} icon={UserIcon}>
            <EditableField
                label={t('Appearance')}
                value={character.appearanceDescription}
                isEditable={allowHistoryManipulation && onEditPlayerData !== undefined}
                onSave={(val) => onEditPlayerData && onEditPlayerData('appearanceDescription', val)}
            />
            </Section>
            {character.raceDescription && (
            <Section title={t("Race Description")} icon={TagIcon}>
                <EditableField
                    label={t('Race Description')}
                    value={t(character.raceDescription as any)}
                    isEditable={allowHistoryManipulation && onEditPlayerData !== undefined}
                    onSave={(val) => onEditPlayerData && onEditPlayerData('raceDescription', val)}
                />
            </Section>
            )}
            {character.classDescription && (
            <Section title={t("Class Description")} icon={AcademicCapIcon}>
                 <EditableField
                    label={t('Class Description')}
                    value={t(character.classDescription as any)}
                    isEditable={allowHistoryManipulation && onEditPlayerData !== undefined}
                    onSave={(val) => onEditPlayerData && onEditPlayerData('classDescription', val)}
                />
            </Section>
            )}
            <Section title={t("Portrait")} icon={PhotoIcon}>
                 <div className="space-y-4">
                    <ImageRenderer
                        prompt={character.portrait || character.image_prompt}
                        originalTextPrompt={character.image_prompt || ''}
                        alt={t("Player Portrait")}
                        imageCache={imageCache}
                        onImageGenerated={onImageGenerated}
                        showRegenerateButton={allowHistoryManipulation && updatePlayerPortrait && !isCustomPortrait}
                        onUploadCustom={allowHistoryManipulation && updatePlayerPortrait ? handleUploadFromModal : undefined}
                        uploadButtonPosition="below"
                        model={gameSettings?.pollinationsImageModel}
                        className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden"
                        gameSettings={gameSettings}
                        gameIsLoading={isLoading}
                    />
                    {allowHistoryManipulation && updatePlayerPortrait && (
                        <div className="mt-4">
                            <EditableField
                                label={t('Portrait Prompt')}
                                value={localPrompt}
                                isEditable={!isCustomPortrait}
                                onSave={handleSavePrompt}
                                onChange={setLocalPrompt}
                                as="textarea"
                            />
                            {isCustomPortrait && (
                                <p className="text-xs text-yellow-400/80 mt-1">{t('Prompt is disabled when a custom portrait is uploaded.')}</p>
                            )}
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
};

export default PlayerCharacterDetailsRenderer;