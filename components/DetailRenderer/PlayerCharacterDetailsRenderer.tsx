
import React from 'react';
import { PlayerCharacter } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import EditableField from './Shared/EditableField';
import { useLocalization } from '../../context/LocalizationContext';
import { UserIcon, TagIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface PlayerCharacterDetailsProps extends Omit<DetailRendererProps, 'data'> {
  character: PlayerCharacter;
}

const PlayerCharacterDetailsRenderer: React.FC<PlayerCharacterDetailsProps> = ({ character, allowHistoryManipulation, onEditPlayerData }) => {
    const { t } = useLocalization();
    return (
        <div className="space-y-4">
            <Section title={t("Appearance")} icon={UserIcon}>
            <EditableField 
                label={t('Appearance')}
                value={character.appearanceDescription}
                isEditable={allowHistoryManipulation}
                onSave={(val) => onEditPlayerData('appearanceDescription', val)}
            />
            </Section>
            {character.raceDescription && (
            <Section title={t("Race Description")} icon={TagIcon}>
                <EditableField 
                    label={t('Race Description')}
                    value={t(character.raceDescription as any)}
                    isEditable={allowHistoryManipulation}
                    onSave={(val) => onEditPlayerData('raceDescription', val)}
                />
            </Section>
            )}
            {character.classDescription && (
            <Section title={t("Class Description")} icon={AcademicCapIcon}>
                 <EditableField 
                    label={t('Class Description')}
                    value={t(character.classDescription as any)}
                    isEditable={allowHistoryManipulation}
                    onSave={(val) => onEditPlayerData('classDescription', val)}
                />
            </Section>
            )}
        </div>
    );
};

export default PlayerCharacterDetailsRenderer;