




import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Faction, NPC, PlayerCharacter, Location, Project, CompletedProject, StructuredBonus, GameSettings, FactionRank, CustomState, FactionRankBranch } from '../../types';
import { DetailRendererProps } from './types';
import { useLocalization } from '../../context/LocalizationContext';
import SectionHeader from '../CharacterSheet/Shared/SectionHeader';
import EditableField from './Shared/EditableField';
import IdDisplay from './Shared/IdDisplay';
import ImageRenderer from '../ImageRenderer';
import MarkdownRenderer from '../MarkdownRenderer';
import StatBar from '../CharacterSheet/Shared/StatBar';
import {
    UserGroupIcon, PhotoIcon, CogIcon, BookOpenIcon, GlobeAltIcon,
    ScaleIcon as EconomicIcon, FireIcon as MilitaryIcon, ChatBubbleLeftRightIcon as SocialIcon,
    EyeSlashIcon as CovertIcon, TruckIcon as LogisticsIcon, ShieldCheckIcon as StabilityIcon,
    BeakerIcon as ArcaneTechIcon, MapPinIcon as ExplorationIcon, BanknotesIcon as WealthIcon,
    UsersIcon, SpeakerWaveIcon as InfluenceIcon, MapPinIcon,
    ChevronDownIcon, ChevronUpIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon,
    TrashIcon,
    StarIcon,
    AcademicCapIcon,
    WrenchScrewdriverIcon,
    ClipboardDocumentListIcon,
    ExclamationCircleIcon,
    CheckIcon,
    FlagIcon,
    ArrowUturnLeftIcon,
    InformationCircleIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import ConfirmationModal from '../ConfirmationModal';
import FactionChronicleView from './Shared/FactionChronicleView';

interface FactionDetailsProps extends Omit<DetailRendererProps, 'data'> {
  faction: Faction & { initialView?: string, perspectiveFor?: { name: string; rank: string | null; branch?: string | null; } };
  onViewCharacterSheet: (character: PlayerCharacter | NPC) => void;
  allNpcs: NPC[];
  deleteFactionProject?: (factionId: string, projectId: string) => void;
  deleteFactionCustomState?: (factionId: string, stateId: string) => void;
}

const FactionHeader: React.FC<FactionDetailsProps> = ({ faction, onOpenImageModal, imageCache, onImageGenerated, gameSettings, onEditFactionData, allowHistoryManipulation, playerCharacter, onOpenDetailModal }) => {
    const { t } = useLocalization();
    const displayImagePrompt = faction.custom_image_prompt || faction.image_prompt;
    const originalImagePrompt = faction.image_prompt;

    const handleOpenModal = useCallback(() => {
        if (!onOpenImageModal || !displayImagePrompt) return;

        let onClearCustom: (() => void) | undefined;
        let onUpload: ((base64: string) => void) | undefined;

        if (allowHistoryManipulation && onEditFactionData) {
            onClearCustom = () => onEditFactionData(faction.factionId, 'custom_image_prompt', null);
            onUpload = (base64) => onEditFactionData(faction.factionId, 'custom_image_prompt', base64);
        }
        
        onOpenImageModal(displayImagePrompt, originalImagePrompt || displayImagePrompt, onClearCustom, onUpload);
    }, [displayImagePrompt, originalImagePrompt, onOpenImageModal, allowHistoryManipulation, onEditFactionData, faction.factionId]);

    const handleReputationClick = useCallback(() => {
        if (!onOpenDetailModal) return;
        const tiers = [
            { lowerBound: -400, upperBound: -201, name: t('faction_rep_tier_arch_enemy'), desc: t('faction_rep_desc_arch_enemy') },
            { lowerBound: -200, upperBound: -51, name: t('faction_rep_tier_enemy_of_the_state'), desc: t('faction_rep_desc_enemy_of_the_state') },
            { lowerBound: -50, upperBound: -1, name: t('faction_rep_tier_distrusted_outsider'), desc: t('faction_rep_desc_distrusted_outsider') },
            { lowerBound: 0, upperBound: 100, name: t('faction_rep_tier_unaffiliated'), desc: t('faction_rep_desc_unaffiliated') },
            { lowerBound: 101, upperBound: 250, name: t('faction_rep_tier_known_sympathizer'), desc: t('faction_rep_desc_known_sympathizer') },
            { lowerBound: 251, upperBound: 350, name: t('faction_rep_tier_honored_member'), desc: t('faction_rep_desc_honored_member') },
            { lowerBound: 351, upperBound: 400, name: t('faction_rep_tier_living_legend'), desc: t('faction_rep_desc_living_legend') },
        ];
        onOpenDetailModal(t('Reputation'), {
            type: 'relationship',
            tiers: tiers,
            current: faction.reputation
        });
    }, [t, onOpenDetailModal, faction.reputation]);
    
    const handleExperienceClick = useCallback(() => {
        if (!onOpenDetailModal || faction.experience === undefined || faction.experienceForNextLevel === undefined) return;
        onOpenDetailModal(t('Faction Experience'), {
            type: 'derivedStat',
            name: t('Faction Experience'),
            value: `${faction.experience} / ${faction.experienceForNextLevel}`,
            breakdown: [
                { label: t('faction_xp_formula_label'), value: 'floor(1000 * (Lvl + 1) * 1.2)' },
            ],
            description: t('faction_xp_description')
        });
    }, [t, onOpenDetailModal, faction.experience, faction.experienceForNextLevel]);

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-48 h-48 rounded-md overflow-hidden bg-gray-900 group relative cursor-pointer flex-shrink-0" onClick={handleOpenModal}>
                <ImageRenderer 
                    prompt={displayImagePrompt} 
                    originalTextPrompt={originalImagePrompt}
                    alt={faction.name} 
                    className="w-full h-full object-cover"
                    imageCache={imageCache} 
                    onImageGenerated={onImageGenerated} 
                    width={256} 
                    height={256}
                    model={gameSettings?.pollinationsImageModel}
                    gameSettings={gameSettings}
                />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-4">
                <div>
                    <div className="flex items-center gap-4">
                        <h3 className="font-bold text-3xl narrative-text truncate" style={{ color: faction.color }}>{faction.name}</h3>
                        {faction.isPlayerFaction && (
                            <span title={t('is_player_faction_tooltip') as string} className="flex items-center gap-1.5 text-xs font-bold text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded-full">
                                <StarIcon className="w-4 h-4"/>
                                {t('Player Controlled')}
                            </span>
                        )}
                    </div>
                    {faction.developmentArchetype && (
                         <p className="text-sm font-semibold text-gray-400 -mt-1">{t(faction.developmentArchetype as any)}</p>
                    )}
                </div>
                {faction.level !== undefined && (
                    <span className="font-bold px-2 py-0.5 rounded-md bg-cyan-600 text-white text-xs self-start">
                        {t('Lvl {level}', { level: faction.level })}
                    </span>
                )}
                 <div className="mt-2 space-y-3">
                    <StatBar
                        label={t('Reputation')}
                        value={faction.reputation}
                        min={-400}
                        max={400}
                        color="bg-pink-500"
                        icon={StarIcon}
                        character={playerCharacter!}
                        onClick={handleReputationClick}
                        title={t('Reputation')}
                    />
                     {faction.experience !== undefined && faction.experienceForNextLevel !== undefined && (
                        <StatBar
                            label={t('Experience')}
                            value={faction.experience}
                            max={faction.experienceForNextLevel}
                            color="bg-yellow-500"
                            icon={StarIcon}
                            character={playerCharacter!}
                            onClick={handleExperienceClick}
                            title={t('Faction Experience')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const OverviewView: React.FC<{ faction: Faction, allowHistoryManipulation: boolean, onEditFactionData: (id: string, field: keyof Faction, value: any) => void }> = ({ faction, allowHistoryManipulation, onEditFactionData }) => {
    const { t } = useLocalization();
    return (
        <div className="space-y-4">
             <div className="bg-gray-800/40 p-3 rounded-lg border-l-4 border-cyan-500/50">
                <p className="text-sm font-semibold text-gray-400">{t('Current relationship')}</p>
                <p className="text-sm text-gray-300 italic">{t(faction.reputationDescription as any)}</p>
            </div>
            <EditableField 
                label=""
                value={faction.description}
                isEditable={allowHistoryManipulation}
                onSave={(val) => onEditFactionData(faction.factionId, 'description', val)}
            />
        </div>
    );
};

const powerProfileIcons: Record<string, React.ElementType> = {
    military: MilitaryIcon, economic: EconomicIcon, social: SocialIcon, covert: CovertIcon,
    logistics: LogisticsIcon, stability: StabilityIcon, arcane_tech: ArcaneTechIcon, exploration: ExplorationIcon,
};

const PowerAndDoctrineView: React.FC<{ faction: Faction, onShowMessageModal: (title: string, content: string) => void }> = ({ faction, onShowMessageModal }) => {
    const { t } = useLocalization();

    return (
        <div className="space-y-6">
            <div>
                <SectionHeader title={t('Power Profile')} icon={StarIcon} />
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(faction.powerProfile || {}).map(([key, value]) => {
                        const Icon = powerProfileIcons[key] || StarIcon;
                        return (
                            <div key={key} className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-5 h-5 text-cyan-400" />
                                    <p className="text-sm text-gray-300 capitalize font-semibold">{t(key as any)}</p>
                                    <button 
                                        onClick={() => onShowMessageModal(t(key as any), t(`power_profile_${key}_tooltip` as any))}
                                        className="ml-auto text-gray-500 hover:text-cyan-400 transition-colors"
                                        title={t('learn_more') as string}
                                    >
                                        <InformationCircleIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold font-mono text-white">{value as number}</p>
                                </div>
                                <div className="w-full bg-gray-800/70 rounded-full h-1.5 mt-2">
                                    <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, value as number)}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

const EconomyAndResourcesView: React.FC<FactionDetailsProps> = (props) => {
    const { faction } = props;
    const { t } = useLocalization();

    const resourceIcons: Record<string, React.ElementType> = {
        Wealth: WealthIcon,
        Influence: InfluenceIcon,
        Manpower: UsersIcon,
    };
    
    return (
        <div className="space-y-6">
            <div>
                <SectionHeader title={t('Treasury & Resources')} icon={WealthIcon} />
                <p className="text-xs text-gray-400 -mt-2 mb-3 italic">{t('faction_economy_desc')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(faction.resources?.metaResources || []).map(res => {
                        const Icon = resourceIcons[res.resourceName] || ExclamationCircleIcon;
                        return (
                            <div key={res.resourceName} className="bg-gray-700/50 p-3 rounded-lg" title={t(`${res.resourceName}_tooltip` as any)}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="w-6 h-6 text-cyan-400" />
                                    <p className="text-md text-gray-200 font-semibold">{t(res.resourceName as any)}</p>
                                </div>
                                <p className="text-3xl font-bold font-mono text-white">{res.currentStockpile}</p>
                                <div className="flex justify-between items-center text-xs mt-1 text-gray-400">
                                    <span className="text-green-400" title={t('Income_tooltip') as string}>+{res.incomePerCycle}/{t('cycle')}</span>
                                    <span className="text-red-400" title={t('Upkeep_tooltip') as string}>-{res.upkeepPerCycle}/{t('cycle')}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            {(faction.resources?.strategicGoods || []).length > 0 && (
                <div>
                    <SectionHeader title={t('Strategic Goods')} icon={WrenchScrewdriverIcon} />
                    <p className="text-xs text-gray-400 -mt-2 mb-3 italic">{t('strategic_goods_tooltip')}</p>
                    <div className="grid grid-cols-2 gap-2">
                        {(faction.resources?.strategicGoods || []).map(good => (
                            <div key={good.resourceName} className="bg-gray-700/50 p-2 rounded-lg text-sm">
                                <p className="font-semibold text-gray-300">{good.resourceName}</p>
                                <div className="flex justify-between items-center text-xs">
                                    <p className="text-gray-400">{t('Stockpile')}: <span className="font-mono text-white">{good.currentStockpile}</span></p>
                                    <p className="text-green-400">+{good.incomePerCycle}/{t('cycle')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const formatDuration = (totalMinutes: number, t: (key: string) => string): string => {
    const minutesNum = Math.round(totalMinutes);
    if (minutesNum < 1) return `0${t('min_short')}`;

    const hours = Math.floor(minutesNum / 60);
    const minutes = minutesNum % 60;

    const parts = [];
    if (hours > 0) {
        parts.push(`${hours}${t('h_short')}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes}${t('min_short')}`);
    }

    if (parts.length === 0) return `0${t('min_short')}`;
    
    return parts.join(' ');
};

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
                        <span className="font-mono">{formatDuration(project.timeSpentMinutes, t)} / {formatDuration(project.totalTimeCostMinutes, t)}</span>
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

const ProjectsView: React.FC<FactionDetailsProps> = (props) => {
    const { faction, allowHistoryManipulation, deleteFactionProject, clearAllCompletedFactionProjects } = props;
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

    const handleDeleteProjectConfirm = () => {
        if (projectToDelete && deleteFactionProject) {
            deleteFactionProject(faction.factionId, projectToDelete.projectId);
        }
        setProjectToDelete(null);
    };

    const handleClearConfirm = () => {
        if (clearAllCompletedFactionProjects) {
            clearAllCompletedFactionProjects(faction.factionId);
        }
        setIsClearConfirmOpen(false);
    };

    return (
         <>
            <div className="flex border-b border-gray-700/60 mb-4">
                <button onClick={() => setActiveTab('active')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'active' ? 'border-cyan-400 text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('Active')} ({(faction.activeProjects || []).length})</button>
                <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'completed' ? 'border-cyan-400 text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}>{t('Completed')} ({(faction.completedProjects || []).length})</button>
            </div>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {activeTab === 'active' && (
                    <section>
                        {(faction.activeProjects || []).length > 0 ? (
                            <div className="space-y-4">
                            {(faction.activeProjects || []).map(proj => (
                                <ProjectCard 
                                    key={proj.projectId} 
                                    project={proj} 
                                    onDelete={allowHistoryManipulation && deleteFactionProject ? () => setProjectToDelete(proj) : undefined} 
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
                        {(faction.completedProjects || []).length > 0 ? (
                            <div className="space-y-3">
                            {(faction.completedProjects || []).map(proj => (
                                <CompletedProjectCard key={proj.projectId} project={proj} onDelete={allowHistoryManipulation ? () => {} : undefined} />
                            ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center p-4">{t('No completed projects.')}</p>
                        )}
                        {allowHistoryManipulation && clearAllCompletedFactionProjects && (faction.completedProjects || []).length > 0 && (
                             <button
                                onClick={() => setIsClearConfirmOpen(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs bg-red-900/50 hover:bg-red-900/80 rounded-md text-red-300 font-semibold transition-colors mt-4"
                            >
                                <TrashIcon className="w-4 h-4" />
                                {t('Clear All Completed')}
                            </button>
                        )}
                    </section>
                )}
            </div>
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


const TerritoryAndRelationsView: React.FC<FactionDetailsProps> = ({ faction, onOpenDetailModal, allLocations, encounteredFactions }) => {
    const { t } = useLocalization();
    const factionMap = useMemo(() => new Map(encounteredFactions?.map(f => [f.factionId, f])), [encounteredFactions]);
    return (
        <div className="space-y-6">
            <div>
                <SectionHeader title={t('Controlled Territories')} icon={MapPinIcon} />
                {(faction.controlledTerritories || []).length > 0 ? (
                    <div className="space-y-2">
                        {(faction.controlledTerritories || []).map(territory => {
                            const location = allLocations.find(l => l.locationId === territory.locationId);
                            return (
                                <button key={territory.locationId} onClick={() => location && onOpenDetailModal(t("Location: {name}", { name: location.name }), { ...location, type: 'location' })} disabled={!location} className="w-full text-left p-3 rounded-md bg-gray-700/50 hover:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-2 group">
                                    <MapPinIcon className="w-5 h-5 text-cyan-400" />
                                    <span className="font-semibold text-gray-200 group-hover:underline">{territory.locationName}</span>
                                </button>
                            )
                        })}
                    </div>
                ) : <p className="text-sm text-gray-500 text-center p-4">{t('no_controlled_territories')}</p>}
            </div>
             <div>
                <SectionHeader title={t('Relations')} icon={UsersIcon} />
                 {(faction.relations || []).length > 0 ? (
                    <div className="space-y-3">
                        {(faction.relations || []).map(relation => {
                            const targetFaction = factionMap.get(relation.targetFactionId);
                            const statusStyles: Record<string, { style: string, icon: React.ElementType }> = {
                                'Allied': { style: 'border-green-500 text-green-300', icon: UsersIcon },
                                'War': { style: 'border-red-500 text-red-300', icon: MilitaryIcon },
                                'Rivalry': { style: 'border-orange-500 text-orange-300', icon: ExclamationCircleIcon },
                                'Neutral': { style: 'border-gray-500 text-gray-300', icon: UserGroupIcon },
                            };
                            const { style, icon: Icon } = statusStyles[relation.status] || { style: 'border-gray-500 text-gray-300', icon: UserGroupIcon };
                            return (
                                <div key={relation.targetFactionId} className={`bg-gray-700/50 p-3 rounded-lg border-l-4 ${style.split(' ')[0]}`}>
                                    <div className="flex justify-between items-center">
                                        <button onClick={() => targetFaction && onOpenDetailModal(t("Faction: {name}", { name: targetFaction.name }), { ...targetFaction, type: 'faction' })} disabled={!targetFaction} className="font-bold text-lg hover:underline disabled:cursor-not-allowed" style={{ color: targetFaction?.color || 'inherit' }}>
                                            {targetFaction?.name || relation.targetFactionId}
                                        </button>
                                        <span className={`text-sm font-semibold flex items-center gap-1.5 ${style.split(' ')[1]}`}><Icon className="w-4 h-4"/>{t(relation.status as any)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 italic mt-1">{relation.description}</p>
                                </div>
                            );
                        })}
                    </div>
                 ) : <p className="text-sm text-gray-500 text-center p-4">{t('no_relations_log')}</p>}
            </div>
        </div>
    );
};

const BonusesAndStatesView: React.FC<FactionDetailsProps> = ({ faction, onOpenDetailModal, allowHistoryManipulation, deleteFactionCustomState }) => {
    const { t } = useLocalization();
    const [confirmDeleteState, setConfirmDeleteState] = useState<CustomState | null>(null);

    const handleDeleteState = () => {
        if (confirmDeleteState && deleteFactionCustomState && confirmDeleteState.stateId) {
            deleteFactionCustomState(faction.factionId, confirmDeleteState.stateId);
        }
        setConfirmDeleteState(null);
    };
    
    const bonusIcons: Record<string, React.ElementType> = {
        'PowerProfileScale': CogIcon, 'ActionCheck': CheckIcon, 'Resource': WealthIcon, 'Utility': WrenchScrewdriverIcon, 'CustomStatePower': BoltIcon
    }
    return (
        <>
            <div className="space-y-6">
                <div>
                    <SectionHeader title={t('Mechanical Bonuses')} icon={StarIcon} />
                    {(faction.structuredBonuses || []).length > 0 ? (
                        <div className="space-y-3">
                            {(faction.structuredBonuses || []).map((bonus, i) => {
                                const Icon = bonusIcons[bonus.bonusType] || StarIcon;
                                return (
                                    <div key={i} className="bg-gray-800/60 p-3 rounded-md">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-5 h-5 text-cyan-400" />
                                            <h5 className="font-semibold text-gray-200">{bonus.description}</h5>
                                        </div>
                                        <div className="text-xs text-gray-400 pl-7">{t('Target')}: {bonus.target}, {t('Value')}: {bonus.value} ({t(bonus.valueType as any)})</div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : <p className="text-sm text-gray-500 text-center p-4">{t('no_bonuses_log')}</p>}
                </div>
                <div>
                     <SectionHeader title={t('Custom States')} icon={ClipboardDocumentListIcon} />
                     {(faction.customStates || []).length > 0 ? (
                        <div className="space-y-3">
                            {(faction.customStates || []).map(state => (
                               <div key={state.stateId} className="flex items-center gap-2 group">
                                    <div className="flex-1">
                                       <StatBar 
                                            value={state.currentValue} 
                                            max={state.maxValue} 
                                            min={state.minValue} 
                                            color="bg-purple-500" 
                                            label={t(state.stateName as any)} 
                                            icon={ExclamationCircleIcon} 
                                            onClick={() => onOpenDetailModal(t("CustomState: {name}", { name: state.stateName }), { ...state, type: 'customState' })} 
                                        />
                                    </div>
                                    {allowHistoryManipulation && deleteFactionCustomState && (
                                        <button 
                                            onClick={() => setConfirmDeleteState(state)} 
                                            className="p-1 text-gray-500 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" 
                                            title={t('Delete State')}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                               </div>
                            ))}
                        </div>
                     ) : <p className="text-sm text-gray-500 text-center p-4">{t('no_custom_states_log')}</p>}
                </div>
            </div>
             <ConfirmationModal 
                isOpen={!!confirmDeleteState} 
                onClose={() => setConfirmDeleteState(null)} 
                onConfirm={handleDeleteState} 
                title={t('delete_faction_state_title', { name: confirmDeleteState?.stateName ?? ''})}
            >
                <p>{t('delete_faction_state_confirm', { name: confirmDeleteState?.stateName ?? ''})}</p>
            </ConfirmationModal>
        </>
    );
}

const HierarchyView: React.FC<Omit<FactionDetailsProps, 'faction'> & { faction: Faction, perspectiveFor?: { name: string; rank: string | null; branch?: string | null; } }> = ({ faction, perspectiveFor, ...props }) => {
    const { t } = useLocalization();
    
    const characterRank = perspectiveFor ? perspectiveFor.rank : (faction.isPlayerMember ? faction.playerRank : null);
    
    const characterBranchId = useMemo(() => {
        if (perspectiveFor) {
            return perspectiveFor.branch;
        }
        return faction.isPlayerMember ? faction.playerBranch : null;
    }, [perspectiveFor, faction.isPlayerMember, faction.playerBranch]);

    const branches = useMemo(() => faction.ranks?.branches || [], [faction.ranks]);

    const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

    useEffect(() => {
        if (branches.length > 0) {
            if (characterBranchId && branches.some(b => b.branchId === characterBranchId)) {
                setActiveBranchId(characterBranchId);
            } else {
                const coreBranch = branches.find(b => b.isCoreBranch);
                setActiveBranchId(coreBranch ? coreBranch.branchId : branches[0].branchId);
            }
        }
    }, [branches, characterBranchId]);

    const activeBranch = useMemo(() => {
        if (!activeBranchId) return null;
        return branches.find(b => b.branchId === activeBranchId);
    }, [branches, activeBranchId]);

    if (branches.length === 0) {
        return <p className="text-sm text-gray-500 italic">{t('This faction has no defined hierarchy.')}</p>;
    }

    return (
        <div className="space-y-6">
            {characterRank && (
                <div className="p-3 bg-cyan-900/40 rounded-lg border-l-4 border-cyan-400">
                    <p className="text-sm font-semibold text-gray-400">{perspectiveFor ? t('Rank of {name}', { name: perspectiveFor.name }) : t('Your Rank')}</p>
                    <p className="text-lg font-bold text-cyan-300">{characterRank}</p>
                    {characterBranchId && (
                        <p className="text-xs text-gray-400 mt-1">
                            {t('Branch')}: <span className="font-semibold">{t(branches.find(b => b.branchId === characterBranchId)?.displayName as any)}</span>
                        </p>
                    )}
                </div>
            )}
            
            {branches.length > 1 && (
                <div className="flex border-b border-gray-700/60">
                    {branches.map(branch => (
                        <button 
                            key={branch.branchId} 
                            onClick={() => setActiveBranchId(branch.branchId)}
                            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${activeBranchId === branch.branchId ? 'border-cyan-400 text-white' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}
                        >
                            {t(branch.displayName as any)}
                        </button>
                    ))}
                </div>
            )}
            
            {activeBranch && (
                <div className="space-y-3 animate-fade-in-down-fast">
                    {activeBranch.ranks.map((rank, index) => {
                        const isCharacterRank = (characterRank === rank.rankNameMale || characterRank === rank.rankNameFemale) && (characterBranchId === activeBranch.branchId);
                        return (
                            <div key={rank.rankNameMale + index} className={`p-4 rounded-lg border-l-4 transition-all ${isCharacterRank ? 'bg-cyan-900/20 border-cyan-500 shadow-lg' : 'bg-gray-800/40 border-gray-600'}`}>
                                <div className="flex justify-between items-baseline flex-wrap gap-x-4">
                                        <h4 className="font-semibold text-gray-200">{rank.rankNameMale} / {rank.rankNameFemale}</h4>
                                        <p className="text-sm text-gray-400">{t('next rank at {rep} reputation', { rep: rank.requiredReputation })}</p>
                                </div>
                                {rank.unlockCondition && (
                                    <p className="text-xs text-yellow-400/80 italic mt-1">{t('unlock_condition')}: {t(rank.unlockCondition as any)}</p>
                                )}
                                {rank.benefits && rank.benefits.length > 0 && (
                                    <div className="mt-2">
                                        <h5 className="text-xs font-bold text-gray-400 mb-1">{t('Benefits')}:</h5>
                                        <ul className="list-disc list-inside text-xs text-gray-300 space-y-1 pl-2">
                                            {rank.benefits.map((benefit, i) => <li key={i}>{t(benefit as any)}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {rank.isJunctionPoint && rank.availableBranches && (
                                    <div className="mt-3 pt-2 border-t border-gray-700/50">
                                        <h5 className="text-xs font-bold text-purple-300">{t('Available paths')}:</h5>
                                        <ul className="text-xs text-purple-400/90 space-y-1 pl-4">
                                            {rank.availableBranches.map(branchId => {
                                                const availableBranch = branches.find(b => b.branchId === branchId);
                                                return <li key={branchId}>- {availableBranch ? t(availableBranch.displayName as any) : branchId}</li>
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
             {faction.isPlayerMember && !faction.playerRank && branches.some(b => b.ranks.length > 0) && (
                <div className="p-3 bg-yellow-900/30 rounded-lg border-l-4 border-yellow-500 text-yellow-300 text-sm">
                    {t('You do not have a rank in this faction yet.')}
                </div>
            )}
             {faction.isPlayerMember && faction.playerRank && faction.ranks?.branches.find(b => b.branchId === faction.playerBranch)?.ranks.find(r => r.rankNameMale === faction.playerRank || r.rankNameFemale === faction.playerRank)?.isJunctionPoint && (
                <div className="p-3 bg-yellow-900/30 rounded-lg border-l-4 border-yellow-500 text-yellow-300 text-sm">
                    {t('STATUS: A choice of specialization is required!')}
                </div>
            )}
        </div>
    );
};

const StrategyAndDirectivesView: React.FC<FactionDetailsProps> = ({ faction, allowHistoryManipulation, onEditFactionData }) => {
    const { t } = useLocalization();
    const priorities = faction.customArchetypePriorities;

    if (faction.isPlayerFaction) {
        return (
            <div className="space-y-4">
                <SectionHeader title={t('Strategic Directive')} icon={WrenchScrewdriverIcon} />
                <p className="text-sm text-gray-400 italic">{t('player_directive_desc')}</p>
                <EditableField
                    label=""
                    value={faction.playerStrategyDirective || ''}
                    isEditable={true}
                    onSave={(val) => onEditFactionData(faction.factionId, 'playerStrategyDirective', val)}
                    as="textarea"
                />
            </div>
        )
    }

    return (
         <div className="space-y-4">
            <SectionHeader title={t('Observed Doctrine')} icon={BookOpenIcon} />
            <div className="bg-gray-700/50 p-4 rounded-lg space-y-3">
                <div>
                    <p className="text-sm font-semibold text-gray-400">{t('Development Archetype')}</p>
                    <p className="text-lg font-bold text-cyan-300" title={t('development_archetype_tooltip') as string}>{t(faction.developmentArchetype as any)}</p>
                </div>
                {priorities && (
                    <div>
                         <p className="text-sm font-semibold text-gray-400 mb-1">{t('Priorities')}</p>
                         <div className="text-sm space-y-1">
                            <p><span className="font-semibold text-yellow-400">1. {t('Primary')}:</span> {t(priorities.primary as any)}</p>
                            <p><span className="font-semibold text-orange-400">2. {t('Secondary')}:</span> {t(priorities.secondary as any)}</p>
                            <p><span className="font-semibold text-gray-400">3. {t('Tertiary')}:</span> {t(priorities.tertiary as any)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const SystemView: React.FC<FactionDetailsProps> = ({ faction, onRegenerateId, onEditFactionData }) => {
    const { t } = useLocalization();
    const [color, setColor] = useState(faction.color || '#cccccc');
    
    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        onEditFactionData(faction.factionId, 'color', newColor);
    };

    return (
        <div className="space-y-4">
            <IdDisplay id={faction.factionId} name={faction.name} onRegenerate={() => onRegenerateId(faction, 'Faction')} />
            <EditableField label={t('Image Prompt')} value={faction.image_prompt || ''} isEditable={true} onSave={(val) => onEditFactionData(faction.factionId, 'image_prompt', val)} as="textarea" />
            <EditableField label={t('Custom Image Prompt')} value={faction.custom_image_prompt || ''} isEditable={true} onSave={(val) => onEditFactionData(faction.factionId, 'custom_image_prompt', val)} as="textarea" />
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">{t('Faction Color')}</label>
                <input type="color" value={color} onChange={(e) => handleColorChange(e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
            </div>
        </div>
    );
};


const FactionDetailsRenderer: React.FC<FactionDetailsProps> = (props) => {
    const { faction: factionWithUiProps, onEditFactionData, allowHistoryManipulation, onOpenTextReader, ...rest } = props;
    const { initialView, perspectiveFor, ...faction } = factionWithUiProps;
    const { t } = useLocalization();
    const [activeView, setActiveView] = useState(initialView || 'menu');
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    const menuItems = useMemo(() => [
        { name: 'Power Profile', icon: StarIcon, view: 'Power Profile' },
        { name: 'faction_menu_economy_resources', icon: EconomicIcon, view: 'faction_menu_economy_resources' },
        { name: 'Projects', icon: CogIcon, view: 'Projects' },
        { name: 'faction_menu_territory_relations', icon: GlobeAltIcon, view: 'faction_menu_territory_relations' },
        { name: 'Hierarchy & Standing', icon: AcademicCapIcon, view: 'Hierarchy & Standing' },
        { name: 'Strategy & Directives', icon: FlagIcon, view: 'Strategy & Directives' },
        { name: 'faction_menu_chronicle', icon: BookOpenIcon, view: 'faction_menu_chronicle', show: (faction.scribeChronicle?.length || 0) > 0 || allowHistoryManipulation },
        { name: 'Bonuses & States', icon: ClipboardDocumentListIcon, view: 'Bonuses & States' },
        { name: 'faction_menu_system_info', icon: CogIcon, view: 'faction_menu_system_info', show: allowHistoryManipulation },
    ].filter(item => item.show !== false), [faction, allowHistoryManipulation]);

    const handleSwitchView = (view: string) => {
        setActiveView(view);
    };

    const renderViewContent = () => {
        switch (activeView) {
            case 'Power Profile': return <PowerAndDoctrineView faction={faction} onShowMessageModal={props.onShowMessageModal!} />;
            case 'faction_menu_economy_resources': return <EconomyAndResourcesView {...props} faction={faction} />;
            case 'Projects': return <ProjectsView {...props} faction={faction} />;
            case 'faction_menu_territory_relations': return <TerritoryAndRelationsView {...props} faction={faction} />;
            case 'Hierarchy & Standing': return <HierarchyView {...props} faction={faction} perspectiveFor={perspectiveFor} />;
            case 'Strategy & Directives': return <StrategyAndDirectivesView {...props} faction={faction} />;
            case 'faction_menu_chronicle': return <FactionChronicleView {...props} faction={faction} isAdminEditable={allowHistoryManipulation} onOpenTextReader={onOpenTextReader} />;
            case 'Bonuses & States': return <BonusesAndStatesView {...props} faction={faction} />;
            case 'faction_menu_system_info': return <SystemView {...props} faction={faction} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${!isHeaderCollapsed ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 bg-gray-800/30 rounded-lg mb-4">
                    <FactionHeader {...props} faction={faction} />
                </div>
                 <div className="bg-slate-900/40 rounded-lg border border-slate-700/60 mb-4 p-4">
                    <OverviewView faction={faction} allowHistoryManipulation={allowHistoryManipulation} onEditFactionData={onEditFactionData} {...props} />
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {activeView === 'menu' ? (
                     <div className="p-4 md:p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text flex items-center gap-2">
                               <UserGroupIcon className="w-6 h-6" /> {t('Menu')}
                            </h3>
                             <button onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} title={t(isHeaderCollapsed ? 'Expand Header' : 'Collapse Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                {isHeaderCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {menuItems.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => handleSwitchView(tab.view)}
                                    className="bg-slate-800/70 hover:bg-slate-700/90 rounded-lg p-3 flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 transform hover:scale-105 border border-slate-700 hover:border-cyan-500"
                                >
                                    <tab.icon className="w-7 h-7 text-cyan-400" />
                                    <span className="font-semibold text-gray-200 text-sm">{t(tab.name as any)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                         <div className="flex-shrink-0 border-b border-gray-700 flex items-center p-2 gap-3">
                            <button onClick={() => setActiveView('menu')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded-md transition-colors hover:bg-gray-700/50">
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                                {t('Back to Menu')}
                            </button>
                            <div className="w-px h-6 bg-gray-700"></div>
                            <h3 className="text-xl font-bold text-cyan-400 narrative-text flex-1">{t(activeView as any)}</h3>
                            <button onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)} title={t(isHeaderCollapsed ? 'Expand Header' : 'Collapse Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                {isHeaderCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in-down-fast">
                            {renderViewContent()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FactionDetailsRenderer;