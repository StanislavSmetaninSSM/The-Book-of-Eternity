

import React, { useState, useMemo } from 'react';
import { PlayerCharacter, Item, ActiveSkill, PassiveSkill, Effect, Wound, GameSettings, StructuredBonus, CustomState } from '../types';
import {
    HeartIcon, ShieldCheckIcon, StarIcon, ArchiveBoxIcon, // Main Stats
    BoltIcon, // Energy
    ScaleIcon, // Weight
    UserCircleIcon, // Character
    RectangleStackIcon, // Inventory
    SparklesIcon, // Skills
    ExclamationTriangleIcon, // Conditions
    ShieldExclamationIcon, // Wounds
    SunIcon, // Buffs
    CloudIcon, // Debuffs
    AcademicCapIcon, // Stats
    CurrencyDollarIcon,
    InformationCircleIcon,
    Squares2X2Icon,
    PlusCircleIcon,
    ClockIcon,
    TrashIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { 
    FireIcon as FireSolidIcon, 
    ShieldCheckIcon as ShieldCheckSolidIcon, 
    SparklesIcon as SparklesSolidIcon,
    LightBulbIcon as LightBulbSolidIcon,
    SunIcon as SunSolidIcon,
    HandRaisedIcon as HandRaisedSolidIcon,
} from '@heroicons/react/24/solid';
import { useLocalization } from '../context/LocalizationContext';
import MarkdownRenderer from './MarkdownRenderer';
import ConfirmationModal from './ConfirmationModal';

interface CharacterSheetProps {
  character: PlayerCharacter;
  gameSettings: GameSettings | null;
  onOpenModal: (title: string, data: any) => void;
  onOpenInventory: () => void;
  onSpendAttributePoint: (characteristic: string) => void;
  forgetHealedWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
  forgetActiveWound: (characterType: 'player' | 'npc', characterId: string | null, woundId: string) => void;
  clearAllHealedWounds: (characterType: 'player' | 'npc', characterId: string | null) => void;
  onDeleteCustomState: (stateId: string) => void;
}

const CHARACTERISTICS_LIST = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'faith', 'attractiveness', 'trade', 'persuasion', 'perception', 'luck', 'speed'];

const StatBar: React.FC<{ 
    value: number; 
    max: number; 
    color: string; 
    label: string; 
    unit?: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    onClick: () => void;
}> = ({ value, max, color, label, unit = '', icon: Icon, onClick }) => (
  <button onClick={onClick} className="w-full text-left group transition-transform transform hover:scale-[1.02]">
    <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
            <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-300">{label}</span>
        </div>
      <span className="text-sm font-mono text-gray-400">{value}{unit} / {max}{unit}</span>
    </div>
    <div className="w-full bg-gray-700/50 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }}></div>
    </div>
  </button>
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

const qualityOrder: Record<string, number> = {
    'Trash': 0, 'Common': 1, 'Uncommon': 2, 'Good': 3,
    'Rare': 4, 'Epic': 5, 'Legendary': 6, 'Unique': 7,
};

const TABS = [
    { name: 'Stats', icon: AcademicCapIcon },
    { name: 'Combat', icon: ShieldCheckSolidIcon },
    { name: 'Inventory', icon: RectangleStackIcon },
    { name: 'Skills', icon: SparklesIcon },
    { name: 'Bonuses', icon: SparklesSolidIcon },
    { name: 'Conditions', icon: ExclamationTriangleIcon },
];

export default function CharacterSheet({ character, gameSettings, onOpenModal, onOpenInventory, onSpendAttributePoint, forgetHealedWound, forgetActiveWound, clearAllHealedWounds, onDeleteCustomState }: CharacterSheetProps): React.ReactNode {
  const [activeTab, setActiveTab] = useState(TABS[0].name);
  const { t } = useLocalization();
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmForget, setConfirmForget] = useState<Wound | null>(null);
  const [confirmForgetActive, setConfirmForgetActive] = useState<Wound | null>(null);
  const [healedWoundsCollapsed, setHealedWoundsCollapsed] = useState(true);
  const [confirmDeleteState, setConfirmDeleteState] = useState<CustomState | null>(null);

  const currencyName = gameSettings?.gameWorldInformation?.currencyName || 'Gold';

  const handleClearAllHealedWounds = () => {
    clearAllHealedWounds('player', null);
    setConfirmClear(false);
  };
  
  const handleForgetWound = () => {
    if (confirmForget && confirmForget.woundId) {
      forgetHealedWound('player', null, confirmForget.woundId);
    }
    setConfirmForget(null);
  };
  
  const handleForgetActiveWound = () => {
    if (confirmForgetActive && confirmForgetActive.woundId) {
      forgetActiveWound('player', null, confirmForgetActive.woundId);
    }
    setConfirmForgetActive(null);
  };

  const handleDeleteCustomState = () => {
    if (confirmDeleteState && (confirmDeleteState.stateId || confirmDeleteState.stateName)) {
        onDeleteCustomState(confirmDeleteState.stateId || confirmDeleteState.stateName);
    }
    setConfirmDeleteState(null);
  };

  const equipmentBonuses = useMemo(() => {
    if (!character) return {};
    const bonuses: Record<string, number> = {};
    CHARACTERISTICS_LIST.forEach(char => bonuses[char] = 0); // Initialize

    const equippedItemIds = new Set(Object.values(character.equippedItems));

    character.inventory.forEach((item: Item) => {
        if (!item || !item.existedId || !equippedItemIds.has(item.existedId)) return;

        if (item.structuredBonuses && item.structuredBonuses.length > 0) {
            item.structuredBonuses.forEach((bonus: StructuredBonus) => {
                if (
                    bonus.bonusType === 'Characteristic' &&
                    bonus.application === 'Permanent' &&
                    bonus.valueType === 'Flat' &&
                    typeof bonus.value === 'number' &&
                    CHARACTERISTICS_LIST.includes(bonus.target.toLowerCase())
                ) {
                    bonuses[bonus.target.toLowerCase()] += bonus.value;
                }
            });
        } 
        else if (item.bonuses) {
            item.bonuses.forEach((bonus: string) => {
                const match = bonus.match(/^([+-]?\d+)\s+(.+)$/);
                const charName = match?.[2]?.toLowerCase();
                if (match && charName && CHARACTERISTICS_LIST.includes(charName)) {
                    bonuses[charName] += parseInt(match[1]);
                }
            });
        }
    });

    return bonuses;
  }, [character.equippedItems, character.inventory]);
  
  const passiveSkillBonuses = useMemo(() => {
    if (!character) return {};
    const bonuses: Record<string, number> = {};
    CHARACTERISTICS_LIST.forEach(char => bonuses[char] = 0);

    (character.passiveSkills || []).forEach(skill => {
        let bonusApplied = false;
        if (skill.structuredBonuses && skill.structuredBonuses.length > 0) {
            skill.structuredBonuses.forEach(bonus => {
                if (
                    bonus.bonusType === 'Characteristic' &&
                    bonus.application === 'Permanent' &&
                    bonus.valueType === 'Flat' &&
                    typeof bonus.value === 'number' &&
                    CHARACTERISTICS_LIST.includes(bonus.target.toLowerCase())
                ) {
                    bonuses[bonus.target.toLowerCase()] += bonus.value;
                    bonusApplied = true;
                }
            });
        }
        
        if (!bonusApplied && skill.playerStatBonus) {
            const match = skill.playerStatBonus.match(/^([+-]?\d+)\s+(.+)$/);
            const charName = match?.[2]?.toLowerCase();
            if (match && charName && CHARACTERISTICS_LIST.includes(charName)) {
                 bonuses[charName] += parseInt(match[1]);
            }
        }
    });

    return bonuses;
  }, [character.passiveSkills]);

  const derivedStats = useMemo(() => {
    if (!character) return null;

    const { level, characteristics } = character;
    const { 
        modifiedStrength, modifiedDexterity, modifiedConstitution, 
        modifiedIntelligence, modifiedWisdom, modifiedFaith,
        modifiedLuck, modifiedSpeed 
    } = characteristics;

    // From 5.7.2
    const levelAttackBonus = 5 + Math.floor(level / 10) * 2;
    const levelResistance = Math.floor(level / 10) * 2;

    // From 5.7.4
    const strAttackBonus = Math.floor(modifiedStrength / 2.5);
    const precisionAttackBonus = Math.floor(modifiedDexterity / 2.5);
    const speedAttackBonus = Math.floor(modifiedSpeed / 2.5);
    const arcaneAttackBonus = Math.floor(modifiedIntelligence / 2.5);
    const willpowerAttackBonus = Math.floor(modifiedWisdom / 2.5);
    const divineAttackBonus = Math.floor(modifiedFaith / 2.5);

    const conResistance = Math.floor(modifiedConstitution / 10);
    const critDamageLuckBonus = Math.floor(modifiedLuck / 2);
    const finalCritMultiplier = 1.5 + (critDamageLuckBonus / 100);

    const totalMeleeAttackBonus = levelAttackBonus + strAttackBonus;
    const totalPrecisionAttackBonus = levelAttackBonus + precisionAttackBonus;
    const totalSpeedAttackBonus = levelAttackBonus + speedAttackBonus;
    const totalArcaneAttackBonus = levelAttackBonus + arcaneAttackBonus;
    const totalWillpowerAttackBonus = levelAttackBonus + willpowerAttackBonus;
    const totalDivineAttackBonus = levelAttackBonus + divineAttackBonus;

    const totalGeneralResistance = levelResistance + conResistance;

    return {
        levelAttackBonus,
        levelResistance,
        strAttackBonus,
        precisionAttackBonus,
        speedAttackBonus,
        arcaneAttackBonus,
        willpowerAttackBonus,
        divineAttackBonus,
        conResistance,
        critDamageLuckBonus,
        finalCritMultiplier,
        totalMeleeAttackBonus,
        totalPrecisionAttackBonus,
        totalSpeedAttackBonus,
        totalArcaneAttackBonus,
        totalWillpowerAttackBonus,
        totalDivineAttackBonus,
        totalGeneralResistance
    };
  }, [character]);
  
  const situationalBonuses = useMemo(() => {
    if (!character) return [];
    const equippedItemIds = new Set(Object.values(character.equippedItems).filter(id => id !== null));
    const itemsWithBonuses = character.inventory
        .filter(item => item && item.existedId && equippedItemIds.has(item.existedId) && item.structuredBonuses && item.structuredBonuses.length > 0)
        .map(item => {
            const relevantBonuses = item.structuredBonuses!.filter(bonus => bonus.application === 'Conditional' || bonus.bonusType !== 'Characteristic');
            return { item, bonuses: relevantBonuses };
        })
        .filter(entry => entry.bonuses.length > 0);
    return itemsWithBonuses;
  }, [character]);
  
  const rootInventoryItems = useMemo(() => {
    return character.inventory.filter(item => item && !item.contentsPath);
  }, [character.inventory]);
  
  const sortedInventory = useMemo(() => {
    const itemsToProcess = [...rootInventoryItems];
    const { itemSortCriteria = 'manual', itemSortDirection = 'asc', itemSortOrder = [] } = character;

    let sortedList: Item[] = [];

    // Step 1: Apply sorting to the entire list of items in view
    if (itemSortCriteria === 'manual') {
        if (itemSortOrder && itemSortOrder.length > 0) {
            const itemMap = new Map(itemsToProcess.map(item => [item.existedId, item]));
            const sorted = itemSortOrder.map(id => itemMap.get(id!))
                .filter((item): item is Item => !!item && itemsToProcess.some(i => i.existedId === item.existedId));
            const newItems = itemsToProcess.filter(item => item.existedId && !itemSortOrder.includes(item.existedId));
            sortedList = [...sorted, ...newItems];
        } else {
            sortedList = itemsToProcess; // If manual but no order, keep as is
        }
    } else { // Automatic sorting
        const sortFn = (a: Item, b: Item) => {
            if (!a || typeof a !== 'object') return 1;
            if (!b || typeof b !== 'object') return -1;
            
            let valA: string | number;
            let valB: string | number;

            switch (itemSortCriteria) {
                case 'quality':
                    valA = qualityOrder[a.quality] ?? -1;
                    valB = qualityOrder[b.quality] ?? -1;
                    break;
                case 'weight':
                    valA = (a.weight || 0) * (a.count || 1);
                    valB = (b.weight || 0) * (b.count || 1);
                    break;
                case 'price':
                    valA = (a.price || 0) * (a.count || 1);
                    valB = (b.price || 0) * (b.count || 1);
                    break;
                case 'type':
                    valA = (typeof a.type === 'string' ? a.type : '').toLowerCase();
                    valB = (typeof b.type === 'string' ? b.type : '').toLowerCase();
                    break;
                default: // name
                    valA = (typeof a.name === 'string' ? a.name : '').toLowerCase();
                    valB = (typeof b.name === 'string' ? b.name : '').toLowerCase();
                    break;
            }

            let comparison = 0;
            if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else {
                if (valA < valB) comparison = -1;
                if (valA > valB) comparison = 1;
            }
            
            return itemSortDirection === 'asc' ? comparison : -comparison;
        };

        const containers = itemsToProcess.filter(i => i && i.isContainer);
        const normalItems = itemsToProcess.filter(i => i && !i.isContainer);
        sortedList = [...containers.sort(sortFn), ...normalItems.sort(sortFn)];
    }

    // Step 2: Bubble equipped items to the top, preserving their relative sorted order
    const equippedItemIds = new Set(Object.values(character.equippedItems).filter(id => id !== null));
    const equippedItems: Item[] = [];
    const unequippedItems: Item[] = [];

    sortedList.forEach(item => {
        if (item && item.existedId && equippedItemIds.has(item.existedId)) {
            equippedItems.push(item);
        } else if (item) {
            unequippedItems.push(item);
        }
    });
    
    return [...equippedItems, ...unequippedItems];
    
}, [rootInventoryItems, character.equippedItems, character.itemSortCriteria, character.itemSortDirection, character.itemSortOrder]);

  if (!character) {
      return null;
  }

  const isEquipped = (itemId: string | null): boolean => {
      if (!itemId || !character.equippedItems) return false;
      return Object.values(character.equippedItems).includes(itemId);
  }

  const renderStats = () => (
    <div className="space-y-4">
        {(character?.attributePoints ?? 0) > 0 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                <p className="font-bold text-yellow-300">
                    {t("You have {points} attribute points to spend!", { points: character.attributePoints })}
                </p>
                <p className="text-xs text-yellow-400/80">{t("Click the '+' next to a characteristic to increase it.")}</p>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.keys(character?.characteristics ?? {}).filter(k => k.startsWith('standard')).map(key => {
                const charNameRaw = key.replace('standard', '');
                const charName = charNameRaw.charAt(0).toLowerCase() + charNameRaw.slice(1);
                const standardKey = `standard${charNameRaw}` as keyof typeof character.characteristics;
                const modifiedKey = `modified${charNameRaw}` as keyof typeof character.characteristics;
                const baseValue = character.characteristics[standardKey];
                const modifiedValue = character.characteristics[modifiedKey];
                const equipmentBonus = equipmentBonuses[charName] || 0;
                const skillBonus = passiveSkillBonuses[charName] || 0;
                const canUpgrade = character.attributePoints > 0;
                const isCapped = baseValue >= 100;

                return (
                    <div key={key} className="bg-gray-700/40 p-3 rounded-lg flex items-center justify-between shadow-inner group relative">
                        <button onClick={() => onOpenModal(t("Characteristic: {name}", { name: t(charName) }), {type: 'characteristic', name: charName, value: modifiedValue})} className="w-full text-left flex items-center justify-between group-hover:bg-gray-700/50 -m-3 p-3 rounded-lg transition-colors">
                            <span className="text-gray-300 capitalize text-sm font-semibold">{t(charName)}</span>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 mb-1 h-5">
                                    {equipmentBonus !== 0 && (
                                        <span 
                                          className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${equipmentBonus > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}
                                          title={t('equipmentBonusTooltip')}
                                        >
                                            {equipmentBonus > 0 ? '+' : ''}{equipmentBonus} {t('EQ')}
                                        </span>
                                    )}
                                    {skillBonus !== 0 && (
                                        <span 
                                            className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${skillBonus > 0 ? 'bg-purple-500/20 text-purple-300' : 'bg-red-500/20 text-red-300'}`}
                                            title={t('passiveSkillBonusTooltip')}
                                        >
                                            {skillBonus > 0 ? '+' : ''}{skillBonus} {t('SK')}
                                        </span>
                                    )}
                                </div>
                                <span className="font-bold text-2xl text-cyan-400 font-mono">{modifiedValue}</span>
                                <span className="text-xs font-mono text-gray-400">({t('Base')}: {baseValue})</span>
                            </div>
                        </button>
                         {canUpgrade && (
                             <button
                                 onClick={() => onSpendAttributePoint(charName)}
                                 disabled={isCapped}
                                 className={`absolute -right-2 -top-2 p-0.5 rounded-full text-white transform transition-transform ${isCapped ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 hover:scale-110'}`}
                                 title={isCapped ? t("Characteristic is at its maximum.") : t("Increase {name}", { name: t(charName) })}
                             >
                                 <PlusCircleIcon className="w-5 h-5" />
                             </button>
                         )}
                    </div>
                )
            })}
        </div>
    </div>
  );
  
  const renderInventory = () => {
    return (
        <div className="space-y-2">
          <div className="flex justify-end mb-2">
            <button
              onClick={onOpenInventory}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
            >
              <Squares2X2Icon className="w-4 h-4" />
              {t('Manage Inventory')}
            </button>
          </div>
          {sortedInventory.length > 0 ? sortedInventory.map((item, index) => {
            if (!item || typeof item.name !== 'string' || typeof item.description !== 'string') {
              return null; // Don't render corrupted items
            }
            const itemName = item.name;
            return (
                <button key={item.existedId || index} onClick={() => onOpenModal(t("Item: {name}", { name: itemName }), item)} className={`w-full text-left p-3 rounded-md border-l-4 ${qualityColorMap[item.quality] || 'border-gray-500'} bg-gray-700/50 shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}>
                  <div className="flex justify-between items-start">
                    <span className={`font-semibold ${qualityColorMap[item.quality]?.split(' ')[0] || 'text-gray-200'}`}>
                        {itemName} {item.count > 1 ? `(x${item.count})` : ''}
                    </span>
                    {isEquipped(item.existedId) && <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">{t('Equipped')}</span>}
                  </div>
                  <p className="text-sm text-gray-400 italic my-1 line-clamp-2">{item.description}</p>
                </button>
            );
          }) : <p className="text-sm text-gray-500 text-center p-4">{t('Your pockets are empty.')}</p>}
        </div>
      );
  };

  const renderSkills = (active: ActiveSkill[], passive: PassiveSkill[]) => {
    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="mt-4">
            <h4 className="text-sm font-bold text-cyan-300/80 uppercase tracking-wider mb-3 pb-1 border-b border-cyan-500/20">{title}</h4>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
    return (
     <div className="space-y-4">
      <Section title={t('Active Skills')}>
        {(active ?? []).length > 0 ? (active ?? []).map((skill, index) => {
            const masteryData = character.skillMasteryData.find(m => m.skillName.toLowerCase() === skill.skillName.toLowerCase());
            const masteryProgress = (masteryData && masteryData.masteryProgressNeeded > 0) 
                ? (masteryData.currentMasteryProgress / masteryData.masteryProgressNeeded) * 100 
                : 0;
            return (
            <button key={index} onClick={() => onOpenModal(t("Active Skill: {name}", { name: skill.skillName }), { ...skill, owner: 'player' })} className={`w-full text-left bg-gray-700/50 p-3 rounded-md border-l-4 ${qualityColorMap[skill.rarity] || 'border-gray-500'} shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}>
                <div className="flex justify-between items-baseline flex-wrap gap-x-4 gap-y-1">
                    <span className={`font-semibold ${qualityColorMap[skill.rarity]?.split(' ')[0] || 'text-gray-200'} flex items-center gap-2 text-lg`}>
                        {skill.skillName}
                        {character.autoCombatSkill === skill.skillName && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full font-mono">{t('AUTO')}</span>
                        )}
                    </span>
                    <div className="text-xs space-x-3 flex items-center text-gray-400">
                        {masteryData && (
                             <span className="font-semibold whitespace-nowrap flex items-center gap-1.5">{t('Mastery Level')}: <span className="text-cyan-300 font-bold text-sm">{masteryData.currentMasteryLevel ?? '?'}/{masteryData.maxMasteryLevel ?? '?'}</span></span>
                        )}
                        {skill.energyCost && <span className="flex items-center gap-1"><BoltIcon className="w-3 h-3 text-blue-400"/>{skill.energyCost} {t('EnergyUnit')}</span>}
                        {skill.cooldownTurns != null && <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3 text-purple-400"/>{t('CooldownAbbr')}: {skill.cooldownTurns}{t('TurnUnit')}</span>}
                    </div>
                </div>
                <p className="text-sm text-gray-400 italic mt-2 line-clamp-2">{skill.skillDescription}</p>
                {masteryData && masteryData.masteryProgressNeeded > 0 && (
                    <div className="mt-2">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                            <span className="font-medium">{t('Progress')}</span>
                            <span className="font-mono">{masteryData.currentMasteryProgress ?? '?'}/{masteryData.masteryProgressNeeded ?? '?'}</span>
                        </div>
                        <div className="w-full bg-gray-800/70 rounded-full h-2 overflow-hidden">
                            <div className="bg-cyan-500 h-2 rounded-full transition-all duration-300" style={{width: `${masteryProgress}%`}}></div>
                        </div>
                    </div>
                )}
            </button>
        )}) : <p className="text-sm text-gray-500 text-center p-2">{t('No active skills known.')}</p>}
      </Section>
       <Section title={t('Passive Skills')}>
        {(passive ?? []).length > 0 ? (passive ?? []).map((skill, index) => (
            <button key={index} onClick={() => onOpenModal(t("Passive Skill: {name}", { name: skill.skillName }), skill)} className={`w-full text-left bg-gray-700/50 p-3 rounded-md border-l-4 ${qualityColorMap[skill.rarity] || 'border-gray-500'} shadow-sm hover:bg-gray-700/80 hover:border-cyan-400 transition-colors`}>
                <div className="flex justify-between items-start">
                    <span className={`font-semibold ${qualityColorMap[skill.rarity]?.split(' ')[0] || 'text-gray-200'}`}>{skill.skillName}</span>
                    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap pl-2">{t('Mastery Level')}: <span className="text-cyan-300 font-bold">{skill.masteryLevel} / {skill.maxMasteryLevel}</span></span>
                </div>
                <p className="text-sm text-gray-400 italic mt-1 line-clamp-2">{skill.skillDescription}</p>
            </button>
        )) : <p className="text-sm text-gray-500 text-center p-2">{t('No passive skills known.')}</p>}
      </Section>
    </div>
    )
  };

  const renderConditions = (effects: Effect[], wounds: Wound[], customStates: PlayerCharacter['playerCustomStates']) => {
    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="mt-4">
            <h4 className="text-sm font-bold text-cyan-300/80 uppercase tracking-wider mb-3 pb-1 border-b border-cyan-500/20">{title}</h4>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
    const activeWounds = (wounds ?? []).filter(w => w.healingState.currentState !== 'Healed');
    const healedWounds = (wounds ?? []).filter(w => w.healingState.currentState === 'Healed');

    return (
     <div className="space-y-4">
      <Section title={t('Active Effects')}>
        {(effects ?? []).length > 0 ? (effects ?? []).map((effect, index) => {
             if (effect.effectType === 'WoundReference' && effect.sourceWoundId) {
                let linkedWound = wounds.find(w => w.woundId === effect.sourceWoundId);
                
                // Fallback: If not found by ID, try to find by name, using sourceSkill as the name.
                if (!linkedWound && effect.sourceSkill) {
                    linkedWound = wounds.find(w => w.woundName === effect.sourceSkill);
                }

                if (linkedWound) {
                    const cleanWound = {
                        type: 'wound',
                        characterType: 'player',
                        characterId: null,
                        woundId: linkedWound.woundId,
                        woundName: linkedWound.woundName,
                        severity: linkedWound.severity,
                        descriptionOfEffects: linkedWound.descriptionOfEffects,
                        generatedEffects: linkedWound.generatedEffects,
                        healingState: linkedWound.healingState,
                    };
                    return (
                        <button key={index} onClick={() => onOpenModal(t("Wound: {name}", { name: linkedWound.woundName }), cleanWound)} className="w-full text-left p-3 rounded-md text-sm flex items-start gap-3 hover:scale-105 transition-transform bg-purple-900/40 text-purple-300">
                            <ShieldExclamationIcon className="w-5 h-5 mt-0.5 text-purple-400 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <span className="font-semibold">{t('Wound')}</span>
                                    {effect.duration < 999 && <span className="text-xs">{t('({duration} turns left)', { duration: effect.duration })}</span>}
                                </div>
                                <p>{effect.description}</p>
                            </div>
                        </button>
                    );
                }
            }
            // Fallback for regular effects or broken references
            return (
             <button key={index} onClick={() => onOpenModal(t("Effect: {name}", { name: effect.sourceSkill || t('Effect') }), effect)} className={`w-full text-left p-3 rounded-md text-sm flex items-start gap-3 hover:scale-105 transition-transform ${effect.effectType.includes('Buff') ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                {effect.effectType.includes('Buff') ? <SunIcon className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" /> : <CloudIcon className="w-5 h-5 mt-0.5 text-red-400 flex-shrink-0" />}
                <div className="flex-1">
                    <div className="flex justify-between">
                        <span className="font-semibold">{effect.sourceSkill || t('Effect')}</span>
                        {effect.duration < 999 && <span className="text-xs">{t('({duration} turns left)', { duration: effect.duration })}</span>}
                    </div>
                    <p>{effect.description}</p>
                </div>
             </button>
            );
        }) : <p className="text-sm text-gray-500 text-center p-2">{t('You are free of temporary effects.')}</p>}
      </Section>
      <Section title={t('Wounds')}>
        {(activeWounds.length > 0) ? (activeWounds.map((wound, index) => (
             <div key={wound.woundId || index} className="w-full bg-gray-900/60 rounded-md border border-red-800/50 flex items-center justify-between gap-3 group">
                <button 
                    onClick={() => {
                        const cleanWound = {
                            type: 'wound', characterType: 'player', characterId: null,
                            ...wound,
                        };
                        onOpenModal(t("Wound: {name}", { name: wound.woundName }), cleanWound)
                    }}
                    className="flex-1 text-left p-3 flex items-start gap-3"
                >
                    <ShieldExclamationIcon className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                        <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-red-400">{wound.woundName}</span>
                            <span className="text-xs text-red-500 bg-red-900/50 px-2 py-0.5 rounded-full">{t(wound.severity as any)}</span>
                        </div>
                        <p className="text-sm text-gray-400 italic mt-1 line-clamp-2">{wound.descriptionOfEffects}</p>
                    </div>
                </button>
                {gameSettings?.allowHistoryManipulation && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setConfirmForgetActive(wound); }}
                        className="p-1 mr-2 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                        title={t('Forget Active Wound')}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        ))) : <p className="text-sm text-gray-500 text-center p-2">{t('You are unwounded.')}</p>}
      </Section>
        {gameSettings?.allowHistoryManipulation && healedWounds.length > 0 && (
            <div className="mt-4">
                <div className="border-b border-cyan-500/20 mb-3">
                    <button onClick={() => setHealedWoundsCollapsed(prev => !prev)} className="w-full flex justify-between items-center text-left pb-1 group">
                        <h4 className="text-sm font-bold text-cyan-300/80 uppercase tracking-wider group-hover:text-cyan-200">{t('Healed Wounds')}</h4>
                        {healedWoundsCollapsed ? <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : <ChevronUpIcon className="w-5 h-5 text-gray-400" />}
                    </button>
                </div>
                {!healedWoundsCollapsed && (
                    <div className="space-y-3 animate-fade-in-down">
                        {healedWounds.map((wound, index) => (
                            <div key={wound.woundId || index} className="w-full bg-gray-900/60 p-3 rounded-md border border-green-800/50 flex items-center justify-between gap-3">
                                <button onClick={() => {
                                    const cleanWound = {
                                        type: 'wound',
                                        woundId: wound.woundId,
                                        woundName: wound.woundName,
                                        severity: wound.severity,
                                        descriptionOfEffects: wound.descriptionOfEffects,
                                        generatedEffects: wound.generatedEffects,
                                        healingState: wound.healingState,
                                    };
                                    onOpenModal(t("Wound: {name}", { name: wound.woundName }), cleanWound);
                                }} className="flex-1 text-left">
                                    <span className="font-semibold text-green-400/80 hover:text-green-300 transition-colors">{wound.woundName}</span>
                                </button>
                                <button
                                    onClick={() => setConfirmForget(wound)}
                                    className="p-1 text-gray-400 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors flex-shrink-0"
                                    title={t('Forget Wound')}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <div className="!mt-4">
                            <button
                                onClick={() => setConfirmClear(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs bg-red-900/50 hover:bg-red-900/80 rounded-md text-red-300 font-semibold transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                                {t('Clear All Healed Wounds')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      <Section title={t('States')}>
        {(customStates ?? []).length > 0 ? (customStates ?? []).map((state, index) => (
            <div key={state.stateId || state.stateName} className="flex items-center gap-2 group">
                <div className="flex-1">
                    <StatBar 
                        value={state.currentValue}
                        max={state.maxValue}
                        color="bg-purple-500"
                        label={t(state.stateName as any)}
                        icon={ExclamationTriangleIcon}
                        onClick={() => onOpenModal(t("CustomState: {name}", { name: state.stateName }), { ...state, type: 'customState' })}
                    />
                </div>
                {gameSettings?.allowHistoryManipulation && (
                    <button
                        onClick={() => setConfirmDeleteState(state)}
                        className="p-1 text-gray-500 rounded-full hover:bg-red-900/50 hover:text-red-300 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                        title={t('Delete State')}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        )) : <p className="text-sm text-gray-500 text-center p-2">{t('No custom states are active.')}</p>}
      </Section>
    </div>
    )
  };
  
  const renderCombat = () => {
    if (!derivedStats) return null;
    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mt-4">
            <h4 className="text-sm font-bold text-cyan-300/80 uppercase tracking-wider mb-3 pb-1 border-b border-cyan-500/20">{title}</h4>
            {children}
        </div>
    );
    return (
        <div className="space-y-4">
            <Section title={t("Physical Combat")}>
                <div className="space-y-2">
                    <button onClick={() => onOpenModal(t("Derived Stat: {name}", { name: t("Melee Attack Bonus") }), { type: 'derivedStat', name: t("Melee Attack Bonus"), value: `+${derivedStats.totalMeleeAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Strength Bonus'), value: `+${derivedStats.strAttackBonus}%` }], description: t('derived_stat_description_melee_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-red-300"><FireSolidIcon className="w-5 h-5 text-red-400" />{t('Melee Attack Bonus')}</span>
                        <span className="font-mono text-red-300 font-bold">+{derivedStats.totalMeleeAttackBonus}%</span>
                    </button>
                    <button onClick={() => onOpenModal(t("Derived Stat: {name}", { name: t("Precision Attack Bonus") }), { type: 'derivedStat', name: t("Precision Attack Bonus"), value: `+${derivedStats.totalPrecisionAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Dexterity Bonus'), value: `+${derivedStats.precisionAttackBonus}%` }], description: t('derived_stat_description_precision_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-red-300"><FireSolidIcon className="w-5 h-5 text-red-400" />{t('Precision Attack Bonus')}</span>
                        <span className="font-mono text-red-300 font-bold">+{derivedStats.totalPrecisionAttackBonus}%</span>
                    </button>
                    <button onClick={() => onOpenModal(t("Derived Stat: {name}", { name: t("Speed Attack Bonus") }), { type: 'derivedStat', name: t("Speed Attack Bonus"), value: `+${derivedStats.totalSpeedAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Speed Bonus'), value: `+${derivedStats.speedAttackBonus}%` }], description: t('derived_stat_description_speed_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-red-300"><FireSolidIcon className="w-5 h-5 text-red-400" />{t('Speed Attack Bonus')}</span>
                        <span className="font-mono text-red-300 font-bold">+{derivedStats.totalSpeedAttackBonus}%</span>
                    </button>
                </div>
            </Section>
            <Section title={t("Magical & Psionic Combat")}>
                <div className="space-y-2">
                    <button onClick={() => onOpenModal(t("Derived Stat: {name}", { name: t("Arcane Attack Bonus") }), { type: 'derivedStat', name: t("Arcane Attack Bonus"), value: `+${derivedStats.totalArcaneAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Intelligence Bonus'), value: `+${derivedStats.arcaneAttackBonus}%` }], description: t('derived_stat_description_arcane_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-indigo-300"><LightBulbSolidIcon className="w-5 h-5 text-indigo-400" />{t('Arcane Attack Bonus')}</span>
                        <span className="font-mono text-indigo-300 font-bold">+{derivedStats.totalArcaneAttackBonus}%</span>
                    </button>
                    <button onClick={() => onOpenModal(t("Derived Stat: {name}", { name: t("Willpower Attack Bonus") }), { type: 'derivedStat', name: t("Willpower Attack Bonus"), value: `+${derivedStats.totalWillpowerAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Wisdom Bonus'), value: `+${derivedStats.willpowerAttackBonus}%` }], description: t('derived_stat_description_willpower_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-cyan-300"><HandRaisedSolidIcon className="w-5 h-5 text-cyan-400" />{t('Willpower Attack Bonus')}</span>
                        <span className="font-mono text-cyan-300 font-bold">+{derivedStats.totalWillpowerAttackBonus}%</span>
                    </button>
                    <button onClick={() => onOpenModal(t("Derived Stat: {name}", { name: t("Divine Attack Bonus") }), { type: 'derivedStat', name: t("Divine Attack Bonus"), value: `+${derivedStats.totalDivineAttackBonus}%`, breakdown: [{ label: t('Level Bonus'), value: `+${derivedStats.levelAttackBonus}%` }, { label: t('Faith Bonus'), value: `+${derivedStats.divineAttackBonus}%` }], description: t('derived_stat_description_divine_attack')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-yellow-300"><SunSolidIcon className="w-5 h-5 text-yellow-400" />{t('Divine Attack Bonus')}</span>
                        <span className="font-mono text-yellow-300 font-bold">+{derivedStats.totalDivineAttackBonus}%</span>
                    </button>
                </div>
            </Section>
            <Section title={t("General Combat")}>
                <div className="space-y-2">
                    <button onClick={() => onOpenModal(t("Derived Stat: {name}", { name: t("Critical Damage Multiplier") }), { type: 'derivedStat', name: t("Critical Damage Multiplier"), value: `${derivedStats.finalCritMultiplier.toFixed(2)}x`, breakdown: [{ label: t('Base Multiplier'), value: `1.50x` }, { label: t('Luck Bonus'), value: `+${derivedStats.critDamageLuckBonus}%` }], description: t('derived_stat_description_crit_multiplier')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-yellow-300"><SparklesSolidIcon className="w-5 h-5 text-yellow-400" />{t('Critical Damage Multiplier')}</span>
                        <span className="font-mono text-yellow-300 font-bold">{derivedStats.finalCritMultiplier.toFixed(2)}x</span>
                    </button>
                    <button onClick={() => onOpenModal(t("Derived Stat: {name}", { name: t("General Resistance") }), { type: 'derivedStat', name: t("General Resistance"), value: `${derivedStats.totalGeneralResistance}%`, breakdown: [{ label: t('Level Bonus'), value: `${derivedStats.levelResistance}%` }, { label: t('Constitution Bonus'), value: `${derivedStats.conResistance}%` }], description: t('derived_stat_description_general_resistance')})} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
                        <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-green-300"><ShieldCheckSolidIcon className="w-5 h-5 text-green-400" />{t('General Resistance')}</span>
                        <span className="font-mono text-green-300 font-bold">{derivedStats.totalGeneralResistance}%</span>
                    </button>
                </div>
            </Section>
        </div>
    );
  };
  
  const renderBonuses = () => (
    <div className="space-y-4">
        {situationalBonuses.length > 0 ? (
            situationalBonuses.map(({ item, bonuses }) => (
                <div key={item.existedId} className="bg-gray-700/40 p-3 rounded-lg shadow-inner">
                    <h4 className="font-semibold text-cyan-400 border-b border-cyan-500/20 pb-2 mb-2">{item.name}</h4>
                    <ul className="space-y-2 list-disc list-inside">
                        {bonuses.map((bonus, index) => (
                            <li key={index} className="text-gray-300 text-sm">
                                <MarkdownRenderer content={bonus.description} inline />
                            </li>
                        ))}
                    </ul>
                </div>
            ))
        ) : (
            <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
                <SparklesSolidIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p>{t('No conditional bonuses from equipped items.')}</p>
            </div>
        )}
    </div>
  );


  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-cyan-400 narrative-text">{character.name}</h2>
            <button onClick={() => onOpenModal(t("Character Details"), { ...character, type: 'playerCharacter' })} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors">
                <InformationCircleIcon className="w-5 h-5" />
            </button>
        </div>
        <p className="text-gray-400">{t("Level {level} {race} {charClass}", { level: character.level, race: t(character.race as any), charClass: t(character.class as any) })}</p>
      </div>

      <div className="space-y-3">
        <StatBar value={character.currentHealth} max={character.maxHealth} color="bg-red-500" label={t('Health')} icon={HeartIcon} onClick={() => onOpenModal(t('Primary Stat: {name}', { name: t('Health') }), { type: 'primaryStat', name: t('Health'), description: t('primary_stat_description_health') })} />
        <StatBar value={character.currentEnergy} max={character.maxEnergy} color="bg-blue-500" label={t('Energy')} icon={BoltIcon} onClick={() => onOpenModal(t('Primary Stat: {name}', { name: t('Energy') }), { type: 'primaryStat', name: t('Energy'), description: t('primary_stat_description_energy') })} />
        <StatBar value={character.experience} max={character.experienceForNextLevel} color="bg-yellow-500" label={t('Experience')} icon={StarIcon} onClick={() => onOpenModal(t('Primary Stat: {name}', { name: t('Experience') }), { type: 'primaryStat', name: t('Experience'), description: t('primary_stat_description_experience') })} />
        <StatBar value={character.totalWeight} max={character.maxWeight} color="bg-orange-500" label={t('Weight')} unit={t('kg')} icon={ScaleIcon} onClick={() => onOpenModal(t('Primary Stat: {name}', { name: t('Weight') }), { type: 'primaryStat', name: t('Weight'), description: t('primary_stat_description_weight') })} />
      </div>

       <button onClick={() => onOpenModal(t('Resource: {name}', { name: t('Money') }), { type: 'primaryStat', name: t('Money'), description: t('primary_stat_description_money') })} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
            <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-yellow-300"><CurrencyDollarIcon className="w-5 h-5 text-yellow-400" />{t('Money')}</span>
            <span className="font-mono text-yellow-300 font-bold">{character.money} {t(currencyName as any)}</span>
      </button>

      <button onClick={() => onOpenModal(t('Primary Stat: {name}', { name: t('Auto-Crit Threshold') }), { type: 'primaryStat', name: t('Auto-Crit Threshold'), description: t('primary_stat_description_critchance') })} className="w-full text-left bg-gray-700/70 p-3 rounded-lg flex justify-between items-center text-base hover:bg-gray-700 transition-colors group">
            <span className="text-gray-300 font-semibold flex items-center gap-2 group-hover:text-cyan-300"><SparklesIcon className="w-5 h-5 text-cyan-400" />{t('Auto-Crit Threshold')}</span>
            <span className="font-mono text-cyan-300 font-bold">{character.critChanceThreshold}+</span>
      </button>
      
      <div className="flex flex-wrap gap-1 rounded-lg bg-gray-900/50 p-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.name;
            return (
              <button 
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-auto rounded-md py-2 text-xs font-medium leading-5 transition flex items-center justify-center gap-1.5 ${isActive ? 'bg-gray-700 text-cyan-400 shadow' : 'text-gray-300 hover:bg-gray-700/50'}`}
              >
                  <Icon className="w-4 h-4" />
                  {t(tab.name)}
              </button>
            )
          })}
      </div>

      <div className="mt-2">
          {activeTab === 'Stats' && renderStats()}
          {activeTab === 'Combat' && renderCombat()}
          {activeTab === 'Inventory' && renderInventory()}
          {activeTab === 'Skills' && renderSkills(character.activeSkills, character.passiveSkills)}
          {activeTab === 'Bonuses' && renderBonuses()}
          {activeTab === 'Conditions' && renderConditions(character.activePlayerEffects, character.playerWounds, character.playerCustomStates)}
      </div>
       <ConfirmationModal
          isOpen={confirmClear}
          onClose={() => setConfirmClear(false)}
          onConfirm={handleClearAllHealedWounds}
          title={t('Clear All Healed Wounds')}
      >
          <p>{t('Are you sure you want to clear all healed wounds? This will remove them permanently.')}</p>
      </ConfirmationModal>
      <ConfirmationModal
          isOpen={!!confirmForget}
          onClose={() => setConfirmForget(null)}
          onConfirm={handleForgetWound}
          title={t('Forget Wound')}
      >
          <p>{t('Are you sure you want to forget this healed wound?')}</p>
      </ConfirmationModal>
       <ConfirmationModal
          isOpen={!!confirmForgetActive}
          onClose={() => setConfirmForgetActive(null)}
          onConfirm={handleForgetActiveWound}
          title={t('Forget Active Wound')}
        >
          <p>{t('forget_active_wound_confirm')}</p>
        </ConfirmationModal>
      <ConfirmationModal
        isOpen={!!confirmDeleteState}
        onClose={() => setConfirmDeleteState(null)}
        onConfirm={handleDeleteCustomState}
        title={t('delete_state_title', { name: confirmDeleteState?.stateName ?? '' })}
      >
        <p>{t('delete_state_confirm', { name: confirmDeleteState?.stateName ?? '' })}</p>
      </ConfirmationModal>
    </div>
  );
}
