import React, { useState } from 'react';
import { Item, Quest, NPC, Location, PlayerCharacter, CombatAction, Faction, CustomState, PassiveSkill, ActiveSkill, Effect, Wound, UnlockedMemory } from '../../types';
import { DetailRendererProps } from './types';
import ConfirmationModal from '../ConfirmationModal';
import { useLocalization } from '../../context/LocalizationContext';

// Import all the new renderer components
import ItemDetailsRenderer from './ItemDetailsRenderer';
import QuestDetailsRenderer from './QuestDetailsRenderer';
import ActiveSkillDetailsRenderer from './ActiveSkillDetailsRenderer';
import PassiveSkillDetailsRenderer from './PassiveSkillDetailsRenderer';
import EffectDetailsRenderer from './EffectDetailsRenderer';
import WoundDetailsRenderer from './WoundDetailsRenderer';
import NpcDetailsRenderer from './NpcDetailsRenderer';
import CharacteristicDetailsRenderer from './CharacteristicDetailsRenderer';
import PrimaryStatDetailsRenderer from './PrimaryStatDetailsRenderer';
import DerivedStatDetailsRenderer from './DerivedStatDetailsRenderer';
import LocationDetailsRenderer from './LocationDetailsRenderer';
import PlayerCharacterDetailsRenderer from './PlayerCharacterDetailsRenderer';
import CombatActionDetails from './Shared/CombatActionDetails';
import Section from './Shared/Section';
import FactionDetailsRenderer from './FactionDetailsRenderer'; // Import the new component
import { ExclamationTriangleIcon, CogIcon } from '@heroicons/react/24/outline';
import MarkdownRenderer from '../MarkdownRenderer';

// Local component for Custom State Details
const CustomStateDetailsRenderer: React.FC<{ state: CustomState }> = ({ state }) => {
    const { t } = useLocalization();
    return (
        <div className="space-y-4">
            {state.description && (
                <div className="italic text-gray-400">
                    <MarkdownRenderer content={state.description} />
                </div>
            )}
            <Section title={t("Rules")} icon={CogIcon}>
                <div className="bg-gray-700/50 p-3 rounded-md space-y-2">
                    <p><strong>{t("Current Value")}:</strong> {state.currentValue} / {state.maxValue}</p>
                    {state.progressionRule && (
                        <p><strong>{t("Progression")}:</strong> {state.progressionRule.description}</p>
                    )}
                </div>
            </Section>
            {state.thresholds && state.thresholds.length > 0 && (
                <Section title={t("Thresholds")} icon={ExclamationTriangleIcon}>
                    {state.thresholds.map((t, i) => (
                        <div key={i} className="bg-gray-700/50 p-3 rounded-md">
                            <p className="font-bold text-cyan-400">{t.levelName}</p>
                            <p className="text-sm text-gray-400">{t.triggerCondition === 'value_greater_than_or_equal_to' ? '>=' : '<='} {t.triggerValue}</p>
                        </div>
                    ))}
                </Section>
            )}
        </div>
    );
};


// Type guards
const isItem = (data: any): data is Item & { ownerType?: 'player' | 'npc', ownerId?: string, isEquippedByOwner?: boolean } => data && typeof data.quality === 'string' && typeof data.weight === 'number';
const isQuest = (data: any): data is Quest => data && typeof data.questGiver === 'string' && Array.isArray(data.objectives);
const isPassiveSkill = (data: any): data is PassiveSkill => data && typeof data.skillName === 'string' && data.masteryLevel !== undefined;
const isActiveSkill = (data: any): data is ActiveSkill => data && typeof data.skillName === 'string' && data.masteryLevel === undefined && !isPassiveSkill(data);
const isEffect = (data: any): data is Effect => data && typeof data.effectType === 'string' && data.duration !== undefined;
const isWound = (data: any): data is Wound & { type: 'wound' } => data && data.type === 'wound';
const isNpc = (data: any): data is NPC => data && (data.relationshipLevel !== undefined || data.NPCId !== undefined) && data.attitude !== undefined;
const isCharacteristic = (data: any): data is { type: 'characteristic', name: string, value: number, description?: string } => data && data.type === 'characteristic';
const isPrimaryStat = (data: any): data is { type: 'primaryStat', name: string, description: string } => data && data.type === 'primaryStat';
const isLocation = (data: any): data is Location & { type: 'location' } => data && data.type === 'location' && data.difficultyProfile !== undefined;
const isPlayerCharacter = (data: any): data is PlayerCharacter & { type: 'playerCharacter' } => data && data.type === 'playerCharacter';
const isDerivedStat = (data: any): data is { type: 'derivedStat', name: string, value: string, breakdown: { label: string, value: string }[], description: string } => data && data.type === 'derivedStat';
const isCombatAction = (data: any): data is CombatAction => data && Array.isArray(data.effects) && data.actionName !== undefined && data.quality === undefined && data.skillName === undefined;
const isFaction = (data: any): data is Faction & { type: 'faction', perspectiveFor?: { name: string; rank: string } } => data && data.type === 'faction' && data.reputation !== undefined;
const isCustomState = (data: any): data is CustomState & { type: 'customState' } => data && data.type === 'customState' && data.stateName !== undefined;


export default function DetailRenderer(props: DetailRendererProps) {
    const { onForgetNpc, onClearNpcJournal, onCloseModal, onForgetQuest, onForgetLocation, currentLocationId, onRegenerateId, deleteNpcCustomState, onEditNpcMemory, onDeleteNpcMemory, onDeleteNpcJournalEntry } = props;
    const [confirmation, setConfirmation] = useState<{ type: string | null; data: any }>({ type: null, data: null });
    const { t } = useLocalization();

    const handleConfirmationClose = () => {
        setConfirmation({ type: null, data: null });
    };

    const handleConfirmationConfirm = () => {
        if (!confirmation.type || !confirmation.data) return;

        switch (confirmation.type) {
            case 'forgetNpc':
                if (onForgetNpc && confirmation.data.NPCId) {
                    onForgetNpc(confirmation.data.NPCId);
                    if (onCloseModal) onCloseModal();
                }
                break;
            case 'clearJournal':
                if (onClearNpcJournal && confirmation.data.NPCId) {
                    onClearNpcJournal(confirmation.data.NPCId);
                    if (onCloseModal) onCloseModal();
                }
                break;
            case 'forgetLocation':
                if (onForgetLocation && confirmation.data.locationId && confirmation.data.locationId !== currentLocationId) {
                    onForgetLocation(confirmation.data.locationId);
                    if (onCloseModal) onCloseModal();
                }
                break;
            case 'forgetQuest':
                 if (onForgetQuest && confirmation.data.questId) {
                    onForgetQuest(confirmation.data.questId);
                    if (onCloseModal) onCloseModal();
                }
                break;
            case 'regenerateId':
                if (onRegenerateId) {
                    onRegenerateId(confirmation.data.entity, confirmation.data.entityType);
                }
                break;
        }
        handleConfirmationClose();
    };

    const getConfirmationContent = () => {
        if (!confirmation.type) return { title: '', content: null };
        switch (confirmation.type) {
            case 'forgetNpc':
                return {
                    title: t("Forget NPC"),
                    content: <p>{t("Are you sure you want to forget about {name}? This will remove them from your known NPCs list.", { name: confirmation.data.name })}</p>
                };
            case 'clearJournal':
                return {
                    title: t("Clear Journal"),
                    content: <p>{t("Are you sure you want to clear the journal for {name}? This cannot be undone.", { name: confirmation.data.name })}</p>
                };
            case 'forgetLocation':
                return {
                    title: t("Forget Location"),
                    content: <p>{t("Are you sure you want to forget this location? This will remove it from your map and logs.")}</p>
                };
            case 'forgetQuest':
                return {
                    title: t("Forget Quest"),
                    content: <p>{t("Are you sure you want to permanently remove this quest?")}</p>
                };
            case 'regenerateId':
                return {
                    title: t('Regenerate ID'),
                    content: (
                        <>
                            <p>{t('Are you sure you want to regenerate the ID for "{name}"?', { name: confirmation.data.name })}</p>
                            <p className="mt-2 text-sm text-gray-400">{t('This can fix issues with uneditable objects but might have unintended side effects. This action cannot be undone.')}</p>
                        </>
                    )
                }
            default:
                return { title: '', content: null };
        }
    };

    const { title: confirmationTitle, content: confirmationContent } = getConfirmationContent();
    const { data } = props;
    const { data: _data, ...rest } = props;

    let content;

    if (isItem(data)) content = <ItemDetailsRenderer item={data} {...rest} />;
    else if (isQuest(data)) content = <QuestDetailsRenderer quest={data} onOpenForgetConfirm={() => setConfirmation({ type: 'forgetQuest', data })} {...rest} />;
    else if (isActiveSkill(data)) content = <ActiveSkillDetailsRenderer skill={data} {...rest} />;
    else if (isPassiveSkill(data)) content = <PassiveSkillDetailsRenderer skill={data} {...rest} />;
    else if (isEffect(data)) content = <EffectDetailsRenderer effect={data} />;
    else if (isWound(data)) content = <WoundDetailsRenderer wound={data} {...rest} />;
    else if (isNpc(data)) content = <NpcDetailsRenderer npc={data} onOpenForgetConfirm={() => setConfirmation({ type: 'forgetNpc', data })} onOpenClearJournalConfirm={() => setConfirmation({ type: 'clearJournal', data })} deleteNpcCustomState={deleteNpcCustomState} onEditNpcMemory={onEditNpcMemory} onDeleteNpcMemory={onDeleteNpcMemory} onDeleteNpcJournalEntry={onDeleteNpcJournalEntry} {...rest} />;
    else if (isCharacteristic(data)) content = <CharacteristicDetailsRenderer data={data} />;
    else if (isPrimaryStat(data)) content = <PrimaryStatDetailsRenderer data={data} />;
    else if (isDerivedStat(data)) content = <DerivedStatDetailsRenderer data={data} />;
    else if (isLocation(data)) content = <LocationDetailsRenderer location={data} onOpenForgetConfirm={() => setConfirmation({ type: 'forgetLocation', data })} {...rest} />;
    else if (isPlayerCharacter(data)) content = <PlayerCharacterDetailsRenderer character={data} {...rest} />;
    else if (isCombatAction(data)) content = <CombatActionDetails action={data} />;
    else if (isFaction(data)) {
        const { perspectiveFor, ...factionData } = data;
        content = <FactionDetailsRenderer faction={factionData as Faction} perspectiveFor={perspectiveFor} {...rest} />;
    }
    else if (isCustomState(data)) content = <CustomStateDetailsRenderer state={data} />;
    else content = <p className="text-gray-400">{t("No details available for this selection.")}</p>;

    return (
        <>
            {content}
            <ConfirmationModal
                isOpen={!!confirmation.type}
                onClose={handleConfirmationClose}
                onConfirm={handleConfirmationConfirm}
                title={confirmationTitle}
            >
                {confirmationContent}
            </ConfirmationModal>
        </>
    );
}