import React, { useMemo } from 'react';
import { WorldEvent, NPC, Faction, Location, InvolvedNPC, AffectedFaction, AffectedLocation, GameSettings } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import {
    InformationCircleIcon, ClockIcon, GlobeAltIcon, EyeIcon,
    UserIcon, UserGroupIcon, MapPinIcon,
    ScaleIcon as PoliticalIcon, ShieldExclamationIcon as MilitaryIcon,
    CurrencyDollarIcon as EconomicIcon, BuildingLibraryIcon as SocialIcon, BoltIcon as MysticalIcon,
    FireIcon as DisasterIcon, UserIcon as PersonalIcon, EyeIcon as PublicIcon, EyeSlashIcon as SecretIcon,
    UsersIcon as RegionalIcon,
} from '@heroicons/react/24/outline';
import { useSpeech } from '../../context/SpeechContext';
import { BookOpenIcon as BookOpenSolidIcon, SpeakerWaveIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import ImageRenderer from '../ImageRenderer';

interface WorldEventDetailsProps extends Omit<DetailRendererProps, 'data'> {
    event: WorldEvent;
}

const stripMarkdown = (text: string | null | undefined): string => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')   // images
    .replace(/(\*\*|__)(.*?)\1/g, '$2')    // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')       // italics
    .replace(/#{1,6}\s/g, '')              // headers
    .replace(/`/g, '');                    // code
};

const WorldEventDetailsRenderer: React.FC<WorldEventDetailsProps> = ({ event, onOpenDetailModal, allNpcs, allFactions, allLocations, onShowMessageModal, imageCache, onImageGenerated, gameSettings, onOpenImageModal }) => {
    const { t } = useLocalization();
    const { speak, isSpeaking, currentlySpeakingText } = useSpeech();

    const eventTypeMapping = useMemo(() => ({
        'Political': { icon: PoliticalIcon, colorClass: 'event-type-Political', label: t('Political') },
        'Military': { icon: MilitaryIcon, colorClass: 'event-type-Military', label: t('Military') },
        'Economic': { icon: EconomicIcon, colorClass: 'event-type-Economic', label: t('Economic') },
        'Social': { icon: SocialIcon, colorClass: 'event-type-Social', label: t('Social') },
        'Mystical': { icon: MysticalIcon, colorClass: 'event-type-Mystical', label: t('Mystical') },
        'Disaster': { icon: DisasterIcon, colorClass: 'event-type-Disaster', label: t('Disaster') },
        'Personal': { icon: PersonalIcon, colorClass: 'event-type-Personal', label: t('Personal') },
    }), [t]);

    const visibilityMapping = useMemo(() => ({
        'Public': { icon: PublicIcon, colorClass: 'visibility-Public', label: t('Public') },
        'Regional': { icon: RegionalIcon, colorClass: 'visibility-Regional', label: t('Regional') },
        'Faction-Internal': { icon: UserGroupIcon, colorClass: 'visibility-Faction-Internal', label: t('Faction-Internal') },
        'Secret': { icon: SecretIcon, colorClass: 'visibility-Secret', label: t('Secret') },
    }), [t]);

    const typeInfo = eventTypeMapping[event.eventType as keyof typeof eventTypeMapping] || { icon: PersonalIcon, colorClass: 'event-type-Personal', label: t(event.eventType as any) || t('Personal') };
    const visibilityInfo = visibilityMapping[event.visibility as keyof typeof visibilityMapping];
    
    const strippedSummary = useMemo(() => stripMarkdown(event.summary), [event.summary]);
    const isSummarySpeaking = isSpeaking && currentlySpeakingText === strippedSummary;

    const strippedVignette = useMemo(() => stripMarkdown(event.vignette), [event.vignette]);
    const isVignetteSpeaking = isSpeaking && currentlySpeakingText === strippedVignette;

    const handleImageClick = () => {
        if (event.image_prompt && onOpenImageModal) {
            onOpenImageModal(event.image_prompt, event.image_prompt);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-3xl font-bold text-cyan-300">{event.headline}</h3>
            
            {event.image_prompt && (
                <div 
                    className="w-full h-48 rounded-lg overflow-hidden bg-gray-900 group relative cursor-pointer"
                    onClick={handleImageClick}
                >
                    <ImageRenderer 
                        prompt={event.image_prompt}
                        originalTextPrompt={event.image_prompt}
                        alt={event.headline}
                        imageCache={imageCache || {}}
                        onImageGenerated={onImageGenerated}
                        model={gameSettings?.pollinationsImageModel}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        gameSettings={gameSettings}
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <p className="text-white font-bold text-lg">{t('Enlarge')}</p>
                    </div>
                </div>
            )}
            
            <div className="mt-6">
                <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-cyan-500/20">
                    <h4 className="text-lg font-bold text-cyan-300/80 uppercase tracking-wider flex items-center gap-2">
                        <InformationCircleIcon className="w-5 h-5" />
                        {t("Summary")}
                    </h4>
                    {onShowMessageModal && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => speak(strippedSummary)}
                                className="p-1 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                                title={isSummarySpeaking ? t("Stop speech") : t("Read aloud")}
                            >
                                {isSummarySpeaking
                                    ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
                                    : <SpeakerWaveIcon className="w-5 h-5" />
                                }
                            </button>
                            <button
                                onClick={() => onShowMessageModal(t("Summary"), event.summary)}
                                className="p-1 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                                title={t("Read")}
                            >
                                <BookOpenSolidIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="space-y-3 text-gray-300">
                    <MarkdownRenderer content={event.summary} />
                </div>
            </div>

            {event.vignette && (
                <div className="mt-6">
                     <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-cyan-500/20">
                        <h4 className="text-lg font-bold text-cyan-300/80 uppercase tracking-wider flex items-center gap-2">
                            <BookOpenSolidIcon className="w-5 h-5" />
                            {t("Vignette")}
                        </h4>
                        {onShowMessageModal && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => speak(strippedVignette)}
                                    className="p-1 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                                    title={isVignetteSpeaking ? t("Stop speech") : t("Read aloud")}
                                >
                                    {isVignetteSpeaking
                                        ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
                                        : <SpeakerWaveIcon className="w-5 h-5" />
                                    }
                                </button>
                                <button
                                    onClick={() => onShowMessageModal(t("Vignette"), event.vignette)}
                                    className="p-1 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors"
                                    title={t("Read")}
                                >
                                    <BookOpenSolidIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                     <blockquote className="border-l-4 border-cyan-500/30 pl-4 italic text-gray-300 narrative-text">
                        <MarkdownRenderer content={event.vignette} />
                    </blockquote>
                </div>
            )}

            <Section title={t("Details")} icon={InformationCircleIcon}>
                <DetailRow label={t("Turn")} value={event.turnNumber} icon={ClockIcon} />
                <DetailRow label={t("Day")} value={event.worldTime.day} icon={ClockIcon} />
                {typeInfo && <DetailRow label={t("Type")} value={<span className={typeInfo.colorClass}>{typeInfo.label}</span>} icon={typeInfo.icon} />}
                {visibilityInfo && <DetailRow label={t("Visibility")} value={<span className={visibilityInfo.colorClass}>{visibilityInfo.label}</span>} icon={visibilityInfo.icon} />}
            </Section>
            
            {event.involvedNPCs && event.involvedNPCs.length > 0 && (
                <Section title={t("Involved NPCs")} icon={UserIcon}>
                     <div className="space-y-3">
                        {event.involvedNPCs.map((npcRef: InvolvedNPC) => {
                            const npcData = allNpcs?.find(n => n.NPCId === npcRef.NPCId);
                            return (
                                <div key={npcRef.NPCId} className="bg-gray-800/50 p-3 rounded-lg">
                                    <button
                                        onClick={() => { if (npcData) onOpenDetailModal(t("NPC: {name}", { name: npcData.name }), npcData); }}
                                        disabled={!npcData}
                                        className="font-semibold text-cyan-300 hover:underline disabled:text-gray-500 disabled:no-underline flex items-center gap-2"
                                    >
                                        <UserIcon className="w-5 h-5" />
                                        {npcRef.NPCName}
                                    </button>
                                    {npcRef.roleInEvent && (
                                        <blockquote className="mt-2 pl-3 border-l-2 border-gray-600 text-sm text-gray-400 italic">
                                            {npcRef.roleInEvent}
                                        </blockquote>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Section>
            )}

            {event.affectedFactions && event.affectedFactions.length > 0 && (
                <Section title={t("Affected Factions")} icon={UserGroupIcon}>
                    <div className="space-y-3">
                        {event.affectedFactions.map((facRef: AffectedFaction) => {
                            const factionData = allFactions?.find(f => f.factionId === facRef.factionId);
                            return (
                                <div key={facRef.factionId} className="bg-gray-800/50 p-3 rounded-lg">
                                    <button
                                        onClick={() => { if (factionData) onOpenDetailModal(t("Faction: {name}", { name: factionData.name }), { ...factionData, type: 'faction' }); }}
                                        disabled={!factionData}
                                        className="font-semibold hover:underline disabled:text-gray-500 disabled:no-underline flex items-center gap-2"
                                        style={{ color: factionData?.color || 'inherit' }}
                                    >
                                        <UserGroupIcon className="w-5 h-5" />
                                        {facRef.factionName}
                                    </button>
                                    {facRef.impactDescription && (
                                        <blockquote className="mt-2 pl-3 border-l-2 border-gray-600 text-sm text-gray-400 italic">
                                            {facRef.impactDescription}
                                        </blockquote>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Section>
            )}

            {event.affectedLocations && event.affectedLocations.length > 0 && (
                <Section title={t("Affected Locations")} icon={MapPinIcon}>
                    <div className="space-y-3">
                        {event.affectedLocations.map((locRef: AffectedLocation) => {
                            const locationData = allLocations?.find(l => l.locationId === locRef.locationId);
                            return (
                                <div key={locRef.locationId} className="bg-gray-800/50 p-3 rounded-lg">
                                    <button
                                        onClick={() => { if (locationData) onOpenDetailModal(t("Location: {name}", { name: locationData.name }), { ...locationData, type: 'location' }); }}
                                        disabled={!locationData}
                                        className="font-semibold text-cyan-300 hover:underline disabled:text-gray-500 disabled:no-underline flex items-center gap-2"
                                    >
                                        <MapPinIcon className="w-5 h-5" />
                                        {locRef.locationName}
                                    </button>
                                    {locRef.impactDescription && (
                                        <blockquote className="mt-2 pl-3 border-l-2 border-gray-600 text-sm text-gray-400 italic">
                                            {locRef.impactDescription}
                                        </blockquote>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Section>
            )}

        </div>
    );
};

export default WorldEventDetailsRenderer;