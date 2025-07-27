import React, { useState, useMemo } from 'react';
import { EnemyCombatObject, AllyCombatObject, Combatant, NPC, Item, ActiveSkill, PassiveSkill, CombatAction, PlayerCharacter } from '../types';
import { ShieldExclamationIcon, BoltIcon, ShieldCheckIcon, SunIcon, CloudIcon, DocumentTextIcon, SparklesIcon, ArchiveBoxIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { FireIcon } from '@heroicons/react/24/solid';
import ImageRenderer from './ImageRenderer';
import { useLocalization } from '../context/LocalizationContext';
import MarkdownRenderer from './MarkdownRenderer';

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="mt-4">
        <h5 className="text-sm font-semibold text-cyan-300/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Icon className="w-4 h-4" />
            {title}
        </h5>
        <div className="space-y-2 pl-1">{children}</div>
    </div>
);

const qualityColorMap: Record<string, string> = {
    'Trash': 'text-gray-500 border-gray-700',
    'Common': 'text-gray-300 border-gray-500',
    'Uncommon': 'text-green-400 border-green-700/80',
    'Good': 'text-blue-400 border-blue-700/80',
    'Rare': 'text-indigo-400 border-indigo-700/80',
    'Epic': 'text-purple-400 border-purple-700/80',
    'Legendary': 'text-orange-400 border-orange-700/80',
    'Unique': 'text-yellow-400 border-yellow-600/80',
};

const HealthGrid: React.FC<{ healthStates: string[], maxHealth: string }> = ({ healthStates, maxHealth }) => {
    const max = parseInt(maxHealth);
    if (isNaN(max) || max === 0) return null;

    return (
        <div className="grid grid-cols-10 gap-1 mt-2">
            {healthStates.map((healthStr, i) => {
                const current = parseInt(healthStr);
                const percentage = (current / max) * 100;
                let colorClass = 'bg-green-500';
                if (percentage < 35) colorClass = 'bg-red-500';
                else if (percentage < 75) colorClass = 'bg-yellow-500';

                return (
                    <div key={i} className="w-full h-2 bg-gray-700 rounded-sm" title={`${current}/${max}`}>
                        <div className={`h-full rounded-sm ${colorClass}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                );
            })}
        </div>
    );
};


const CombatantCard: React.FC<{ 
    combatant: Combatant;
    allNpcs: NPC[];
    onOpenDetailModal: (title: string, data: any) => void;
}> = ({ combatant, allNpcs, onOpenDetailModal }) => {
    const isGroup = combatant.isGroup;
    const isDefeated = isGroup ? (combatant.count ?? 0) <= 0 : parseInt(combatant.currentHealth ?? '0') <= 0;
    
    const [activeTab, setActiveTab] = useState('Stats');
    const { t } = useLocalization();
    
    const combatantWithId = combatant as (EnemyCombatObject | AllyCombatObject);
    const fullNpcData = useMemo(() => {
        let npcData: NPC | undefined | null = null;
        // First, try to find by ID
        if (combatantWithId.NPCId) {
            npcData = allNpcs.find(npc => npc.NPCId === combatantWithId.NPCId);
        }
        // If not found by ID (even if ID exists), fall back to name
        if (!npcData && combatant.name) {
            npcData = allNpcs.find(npc => npc.name === combatant.name);
        }
        return npcData || null;
    }, [combatantWithId.NPCId, combatant.name, allNpcs]);

    const { activeSkills, passiveSkills, inventory, hasSkills, hasInventory } = useMemo(() => {
        if (fullNpcData) {
            const skills = [...(fullNpcData.activeSkills || []), ...(fullNpcData.passiveSkills || [])];
            return {
                activeSkills: fullNpcData.activeSkills || [],
                passiveSkills: fullNpcData.passiveSkills || [],
                inventory: fullNpcData.inventory || [],
                hasSkills: skills.length > 0,
                hasInventory: (fullNpcData.inventory?.length || 0) > 0,
            };
        }
        const skills = [...(combatant.actions || []), ...(combatant.passiveSkills || [])];
        return {
            activeSkills: combatant.actions || [],
            passiveSkills: combatant.passiveSkills || [],
            inventory: combatant.inventory || [],
            hasSkills: skills.length > 0,
            hasInventory: (combatant.inventory?.length || 0) > 0,
        };
    }, [combatant, fullNpcData]);

    const TABS: string[] = ['Stats'];
    if (hasSkills) TABS.push('Skills');
    if (hasInventory) TABS.push('Inventory');


    return (
        <div className={`bg-gray-900/40 rounded-lg p-3 border border-gray-700/50 transition-opacity ${isDefeated ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start gap-3">
                 <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
                    <ImageRenderer prompt={combatant.image_prompt || fullNpcData?.image_prompt} alt={combatant.name} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className={`font-bold text-lg ${isDefeated ? 'text-gray-500 line-through' : 'text-white'}`}>{combatant.name}</h4>
                             {isGroup ? (
                                <p className="text-xs text-gray-400 uppercase tracking-wider">{t('{count}x {unitName} ({type})', { count: combatant.count || 0, unitName: t(combatant.unitName as any), type: t(combatant.type as any) })}</p>
                            ) : (
                                <p className="text-xs text-gray-400 uppercase tracking-wider">{t(combatant.type as any)}</p>
                            )}
                        </div>
                        {isDefeated && <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded-full font-bold">{t('DEFEATED')}</span>}
                    </div>
                    
                    {combatant.description && (
                         <div className="text-sm text-gray-400 italic my-2 pr-2 max-h-24 overflow-y-auto">
                            <MarkdownRenderer content={combatant.description} />
                        </div>
                    )}
                    
                    {isGroup && combatant.healthStates && combatant.maxHealth ? (
                        <HealthGrid healthStates={combatant.healthStates} maxHealth={combatant.maxHealth} />
                    ) : combatant.currentHealth !== null ? (
                        <div className="mt-2">
                             <div className="flex justify-between text-xs text-gray-300 mb-1">
                                <span>HP</span>
                                <span>{combatant.currentHealth} / {combatant.maxHealth}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                {(() => {
                                    const percentage = (parseInt(combatant.currentHealth) / parseInt(combatant.maxHealth)) * 100;
                                    let colorClass = 'bg-green-500';
                                    if (percentage < 35) colorClass = 'bg-red-500';
                                    else if (percentage < 75) colorClass = 'bg-yellow-500';
                                    return <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                                })()}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {TABS.length > 1 && (
                <div className="flex space-x-1 rounded-lg bg-gray-900/50 p-1 mt-3">
                {TABS.map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-full rounded-md py-2 text-xs font-medium leading-5 transition flex items-center justify-center gap-1.5 ${activeTab === tab ? 'bg-gray-700 text-cyan-400 shadow' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    >
                        {t(tab)}
                    </button>
                ))}
                </div>
            )}
            
            <div className="mt-2">
                {activeTab === 'Stats' && (
                    <>
                        {(combatant.actions ?? []).length > 0 && (
                            <Section title={t('Actions')} icon={BoltIcon}>
                                {(combatant.actions ?? []).map((action, i) => (
                                    <div key={i} className="text-xs bg-gray-800/60 p-2 rounded">
                                        <p className="font-semibold text-gray-200">{action.actionName}</p>
                                        {(action.effects ?? []).map((e, idx) => (
                                            <p key={idx} className="text-gray-400 italic">{e.effectDescription}</p>
                                        ))}
                                    </div>
                                ))}
                            </Section>
                        )}
                        
                        {(combatant.resistances ?? []).length > 0 && (
                            <Section title={t('Resistances')} icon={ShieldCheckIcon}>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                    {(combatant.resistances ?? []).map((res, i) => (
                                        <div key={i} className="bg-gray-800/60 p-1.5 rounded flex justify-between items-center">
                                            <span className="text-gray-300">{res.resistTypeDisplayName || t(res.resistType as any)}</span>
                                            <span className={`font-mono font-semibold ${parseInt(res.resistanceValue ?? '0') > 0 ? 'text-green-400' : 'text-red-400'}`}>{res.resistanceValue}</span>
                                        </div>
                                    ))}
                                </div>
                            </Section>
                        )}

                        {(combatant.activeBuffs ?? []).length > 0 && (
                            <Section title={t('Buffs')} icon={SunIcon}>
                                {(combatant.activeBuffs ?? []).map((buff, i) => (
                                    <div key={i} className="text-xs bg-green-900/30 p-2 rounded text-green-300">
                                        {buff.description}
                                    </div>
                                ))}
                            </Section>
                        )}
                        
                        {(combatant.activeDebuffs ?? []).length > 0 && (
                            <Section title={t('Debuffs')} icon={CloudIcon}>
                                {(combatant.activeDebuffs ?? []).map((debuff, i) => (
                                    <div key={i} className="text-xs bg-red-900/30 p-2 rounded text-red-300">
                                        {debuff.description}
                                    </div>
                                ))}
                            </Section>
                        )}
                    </>
                )}

                {activeTab === 'Skills' && (
                    <>
                        {(activeSkills ?? []).length > 0 && (
                            <Section title={t('Active Skills')} icon={SparklesIcon}>
                                {(activeSkills ?? []).map((skill, i) => {
                                    if (fullNpcData) { // This is an ActiveSkill
                                        const s = skill as ActiveSkill;
                                        return (
                                            <button key={i} onClick={() => onOpenDetailModal(t("Active Skill: {name}", { name: s.skillName }), { ...s, owner: 'npc' })} className="w-full text-left bg-gray-800/60 p-2 rounded hover:bg-gray-700/80 transition-colors">
                                                <p className="font-semibold text-gray-200">{s.skillName}</p>
                                                <p className="text-xs text-gray-400 italic line-clamp-2">{s.skillDescription}</p>
                                            </button>
                                        );
                                    } else { // This is a CombatAction
                                        const a = skill as CombatAction;
                                        return (
                                            <button key={i} onClick={() => onOpenDetailModal(t("Combat Action: {name}", { name: a.actionName }), a)} className="w-full text-left bg-gray-800/60 p-2 rounded hover:bg-gray-700/80 transition-colors">
                                                <p className="font-semibold text-gray-200">{a.actionName}</p>
                                                <p className="text-xs text-gray-400 italic line-clamp-2">{(a.effects ?? []).map(e => e.effectDescription).join(' ')}</p>
                                            </button>
                                        );
                                    }
                                })}
                            </Section>
                        )}
                        {(passiveSkills ?? []).length > 0 && (
                            <Section title={t('Passive Skills')} icon={ShieldCheckIcon}>
                                {(passiveSkills ?? []).map((skill, i) => (
                                    <button key={i} onClick={() => onOpenDetailModal(t("Passive Skill: {name}", { name: skill.skillName }), skill)} className="w-full text-left bg-gray-800/60 p-2 rounded hover:bg-gray-700/80 transition-colors">
                                        <p className="font-semibold text-gray-200">{skill.skillName}</p>
                                        <p className="text-xs text-gray-400 italic line-clamp-2">{skill.skillDescription}</p>
                                    </button>
                                ))}
                            </Section>
                        )}
                    </>
                )}
                 
                {activeTab === 'Inventory' && (
                    <Section title={t('Inventory')} icon={ArchiveBoxIcon}>
                        {(inventory ?? []).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {(inventory ?? []).map((item, i) => (
                                    <button key={item.existedId || i} onClick={() => onOpenDetailModal(t("Item: {name}", { name: item.name }), item)} className={`w-full text-left p-2 rounded-md border-l-4 ${qualityColorMap[item.quality] || 'border-gray-500'} bg-gray-800/60 shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}>
                                        <span className={`font-semibold text-xs ${qualityColorMap[item.quality]?.split(' ')[0] || 'text-gray-200'}`}>
                                            {item.name} {item.count > 1 ? `(x${item.count})` : ''}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center p-4">{t('No items in inventory.')}</p>
                        )}
                    </Section>
                )}

            </div>
        </div>
    );
};

interface CombatTrackerProps {
    enemies: EnemyCombatObject[];
    allies: AllyCombatObject[];
    combatLog: string[];
    allNpcs: NPC[];
    playerCharacter: PlayerCharacter;
    setAutoCombatSkill: (skillName: string | null) => void;
    onOpenDetailModal: (title: string, data: any) => void;
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export default function CombatTracker({ enemies, allies, combatLog, allNpcs, playerCharacter, setAutoCombatSkill, onOpenDetailModal, onSendMessage, isLoading }: CombatTrackerProps): React.ReactNode {
    const { t } = useLocalization();
    const hasCombatants = (enemies && enemies.length > 0) || (allies && allies.length > 0);
    const hasLog = combatLog && combatLog.length > 0;
    const hasContent = hasCombatants || hasLog;

    const combatSkills = useMemo(() => {
        if (!playerCharacter) return [];
        return playerCharacter.activeSkills.filter(
            skill => !!skill.combatEffect && (skill.combatEffect.isActivatedEffect === undefined || skill.combatEffect.isActivatedEffect === true)
        );
    }, [playerCharacter]);

    const handleAttack = (enemy: EnemyCombatObject) => {
        if (isLoading) return;
        const message = `Я атакую ${enemy.name} ${enemy.NPCId || ''}`.trim();
        onSendMessage(message);
    };

    if (!hasContent) {
        return (
            <div className="text-center text-gray-500 p-6 flex flex-col items-center justify-center h-full">
                <ShieldExclamationIcon className="w-12 h-12 text-gray-600 mb-4" />
                <p className="font-semibold">{t('Not in Combat')}</p>
                <p className="text-sm mt-1">{t('When a battle begins, details on enemies and allies will appear here.')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {hasCombatants && playerCharacter && (
                 <div>
                    <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text flex items-center gap-2">
                        <Cog6ToothIcon className="w-6 h-6" />
                        {t('Auto-Combat Skill')}
                    </h3>
                    <div className="bg-gray-900/40 p-3 rounded-lg">
                        <label htmlFor="auto-combat-select" className="block text-sm text-gray-400 mb-2">
                            {t('Select a skill to use for general attack commands.')}
                        </label>
                        <select
                            id="auto-combat-select"
                            value={playerCharacter?.autoCombatSkill || ''}
                            onChange={(e) => setAutoCombatSkill(e.target.value || null)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                        >
                            <option value="">{t('None (Basic Attack)')}</option>
                            {combatSkills.map(skill => (
                                <option key={skill.skillName} value={skill.skillName}>
                                    {skill.skillName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            {enemies && enemies.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-red-400 mb-3 narrative-text">{t('Enemies')}</h3>
                    <div className="space-y-3">
                        {(enemies ?? []).map((enemy, index) => {
                            const isDefeated = enemy.isGroup ? (enemy.count ?? 0) <= 0 : parseInt(enemy.currentHealth ?? '0') <= 0;
                            return (
                                <div key={enemy.NPCId || `enemy-${index}`} className="flex items-start gap-2 group">
                                    <div className="flex-1">
                                        <CombatantCard combatant={enemy} allNpcs={allNpcs} onOpenDetailModal={onOpenDetailModal} />
                                    </div>
                                    {!isDefeated && (
                                        <button
                                            onClick={() => handleAttack(enemy)}
                                            disabled={isLoading}
                                            className="p-2 mt-1 rounded-full bg-red-900/50 text-red-300 hover:bg-red-800/80 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-900/50"
                                            title={`${t('Attack')} ${enemy.name}`}
                                        >
                                            <FireIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
            {allies && allies.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-green-400 mt-6 mb-3 narrative-text">{t('Allies')}</h3>
                    <div className="space-y-3">
                        {(allies ?? []).map((ally, index) => <CombatantCard key={ally.NPCId || `ally-${index}`} combatant={ally} allNpcs={allNpcs} onOpenDetailModal={onOpenDetailModal} />)}
                    </div>
                </div>
            )}
            {hasLog && (
                 <div>
                    <h3 className="text-xl font-bold text-cyan-400 mt-6 mb-3 narrative-text flex items-center gap-2">
                        <DocumentTextIcon className="w-6 h-6" />
                        {t('Combat Log')}
                    </h3>
                    <div className="space-y-2 bg-gray-900/50 p-3 rounded-lg max-h-60 overflow-y-auto">
                        {(combatLog ?? []).map((entry, index) => (
                            <div key={index} className="text-sm text-gray-300 font-mono leading-snug">
                                <MarkdownRenderer content={entry} className="prose-sm" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}