import React, { useState, useMemo, useCallback } from 'react';
import { Item, GameSettings, StructuredBonus } from '../../types';
import { DetailRendererProps } from './types';
import SectionHeader from '../CharacterSheet/Shared/SectionHeader';
import EditableField from './Shared/EditableField';
import CombatActionDetails from './Shared/CombatActionDetails';
import IdDisplay from './Shared/IdDisplay';
import { qualityColorMap } from './utils';
import ImageRenderer from '../ImageRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import MarkdownRenderer from '../MarkdownRenderer';
import ConfirmationModal from '../ConfirmationModal';
import FateCardDetailsRenderer from './Shared/FateCardDetailsRenderer';
import {
    InformationCircleIcon, TagIcon, PuzzlePieceIcon, CurrencyDollarIcon, HashtagIcon, ScaleIcon, CubeIcon,
    ShieldCheckIcon, CogIcon, FireIcon, PaperClipIcon, HandRaisedIcon, BoltIcon, BeakerIcon, ArchiveBoxIcon,
    CheckCircleIcon, MinusCircleIcon, MapPinIcon, SparklesIcon, StarIcon, Cog6ToothIcon, BookOpenIcon, UserPlusIcon, WrenchIcon,
    Squares2X2Icon, WrenchScrewdriverIcon, TrashIcon, AcademicCapIcon, PhotoIcon, XCircleIcon, ArrowUturnLeftIcon, ChevronUpIcon, ChevronDownIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldCheckSolidIcon, WrenchScrewdriverIcon as WrenchScrewdriverSolidIcon } from '@heroicons/react/24/solid';
import InfoRow from './Shared/InfoRow';
import ReadableEditableField from '../CharacterSheet/Shared/ReadableEditableField';
import ItemJournalView from './Shared/ItemJournalView';
import ItemTextContentView from './Shared/ItemTextContentView';

interface ItemDetailsProps extends Omit<DetailRendererProps, 'data'> {
  item: Item & { ownerType?: 'player' | 'npc', ownerId?: string, isEquippedByOwner?: boolean };
}

const BonusCard: React.FC<{ bonus: StructuredBonus }> = ({ bonus }) => {
    const { t } = useLocalization();
    const { icon: Icon, colorClass, titleKey } = useMemo(() => {
        switch(bonus.bonusType) {
            case 'Characteristic': return { icon: AcademicCapIcon, colorClass: 'border-cyan-500', titleKey: 'Characteristic Bonus' };
            case 'ActionCheck': return { icon: ShieldCheckSolidIcon, colorClass: 'border-green-500', titleKey: 'Action Check Bonus' };
            case 'Utility': return { icon: WrenchScrewdriverIcon, colorClass: 'border-blue-500', titleKey: 'Utility Effect' };
            default: return { icon: SparklesIcon, colorClass: 'border-indigo-500', titleKey: 'Other Bonus' };
        }
    }, [bonus.bonusType]);

    return (
        <div className={`bg-gray-800/60 p-3 rounded-md border-l-4 ${colorClass}`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 flex-shrink-0 ${colorClass.replace('border-', 'text-')}`} />
                <h5 className="font-semibold text-gray-200">{t(titleKey as any)}</h5>
            </div>
            <p className="text-gray-300 font-bold text-lg mb-2 pl-7">{bonus.description}</p>
            <div className="text-xs text-gray-400 pl-7 grid grid-cols-2 gap-x-4 gap-y-1">
                <span><strong>{t("Target")}:</strong> {bonus.bonusType === 'Characteristic' ? t(bonus.target as any) : bonus.target}</span>
                <span><strong>{t("Value")}:</strong> {String(bonus.value)} ({t(bonus.valueType as any)})</span>
                <span><strong>{t("Application")}:</strong> {t(bonus.application as any)}</span>
                {bonus.condition && <span><strong>{t("Condition")}:</strong> {t(bonus.condition as any)}</span>}
            </div>
        </div>
    );
};

const ItemHeader: React.FC<ItemDetailsProps> = (props) => {
    const { item, allowHistoryManipulation, onEditItemData, onOpenImageModal, imageCache, onImageGenerated, gameSettings, onOpenTextReader } = props;
    const { t } = useLocalization();

    const displayImagePrompt = item.custom_image_prompt || item.image_prompt || `A detailed, photorealistic fantasy art image of a single ${item.quality} ${item.name}. ${item.description.split('. ')[0]}`;
    const originalImagePrompt = item.image_prompt || `A detailed, photorealistic fantasy art image of a single ${item.quality} ${item.name}. ${item.description.split('. ')[0]}`;
    
    const handleUpload = useCallback((base64: string) => {
        if (onEditItemData && item.existedId) {
            onEditItemData(item.existedId, 'custom_image_prompt', base64);
        }
    }, [onEditItemData, item.existedId]);
    
    const handleClearCustom = useCallback(() => {
        if (onEditItemData && item.existedId) {
            onEditItemData(item.existedId, 'custom_image_prompt', null);
        }
    }, [onEditItemData, item.existedId]);

    const handleOpenModal = useCallback(() => {
        if (!onOpenImageModal || !displayImagePrompt) return;

        let onClearCustomCallback: (() => void) | undefined;
        let onUploadCallback: ((base64: string) => void) | undefined;

        if (allowHistoryManipulation && onEditItemData && item.existedId) {
            onClearCustomCallback = handleClearCustom;
            onUploadCallback = handleUpload;
        }
        
        onOpenImageModal(displayImagePrompt, originalImagePrompt || displayImagePrompt, onClearCustomCallback, onUploadCallback);
    }, [displayImagePrompt, originalImagePrompt, onOpenImageModal, allowHistoryManipulation, onEditItemData, item.existedId, handleClearCustom, handleUpload]);


    return (
        <div className="grid grid-cols-1 md:grid-cols-[208px_1fr] gap-6 items-start">
            <div className="w-52 h-72 rounded-md overflow-hidden bg-gray-900 group relative cursor-pointer flex-shrink-0" onClick={handleOpenModal}>
{/* FIX: Pass 'gameSettings' prop to ImageRenderer. */}
                <ImageRenderer 
                    prompt={displayImagePrompt} 
                    originalTextPrompt={originalImagePrompt}
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    imageCache={imageCache} 
                    onImageGenerated={onImageGenerated} 
                    width={512} 
                    height={768}
                    model={gameSettings?.pollinationsImageModel}
                    gameSettings={gameSettings}
                />
            </div>
            <div className="flex-1 min-w-0 flex flex-col h-72"> {/* Set height to match image */}
                 {/* Name & Type */}
                <div className="flex-shrink-0">
                     <EditableField 
                        label={t('Name')}
                        value={item.name}
                        isEditable={allowHistoryManipulation && !!item.existedId}
                        onSave={(val) => { if (item.existedId && onEditItemData) onEditItemData(item.existedId, 'name', val) }}
                        as="input"
                        className={`${qualityColorMap[item.quality] || 'text-gray-300'} font-bold text-4xl narrative-text`}
                     />
                     <p className="text-sm text-gray-400 -mt-1">{t(item.type as any)}</p>
                </div>

                {/* NEW Description Box */}
                <div className="mt-4 flex-1 min-h-0 flex flex-col bg-gray-900/40 rounded-lg border border-gray-700/50">
                    <div className="flex-shrink-0 p-2 border-b border-gray-700/50 flex justify-between items-center">
                        <h5 className="text-sm font-semibold text-gray-400">{t('Description')}</h5>
                        <button onClick={() => onOpenTextReader(t('Description'), item.description)} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white" title={t('Read')}>
                            <BookOpenIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-3 overflow-y-auto">
                        <EditableField 
                            label="" 
                            value={item.description}
                            isEditable={allowHistoryManipulation && !!item.existedId}
                            onSave={(val) => { if (item.existedId && onEditItemData) onEditItemData(item.existedId, 'description', val) }} 
                            as="textarea"
                            className="text-sm text-gray-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

const ItemDetailsRenderer: React.FC<ItemDetailsProps> = (props) => {
    const { item, onOpenImageModal, allowHistoryManipulation, onEditItemData, playerCharacter, disassembleItem, disassembleNpcItem, onCloseModal, gameSettings, imageCache, onImageGenerated, onRegenerateId, onOpenTextReader, placeAsStorage } = props;
    const { t } = useLocalization();
    const [activeView, setActiveView] = useState('menu');
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
    const [isDisassembleConfirmOpen, setIsDisassembleConfirmOpen] = useState(false);
    
    const currencyName = gameSettings?.gameWorldInformation?.currencyName || 'Gold';
    const [newTag, setNewTag] = useState('');

    const handleAddTag = useCallback(() => {
        if (newTag.trim() && onEditItemData && item.existedId) {
            const currentTags = item.tags || [];
            const lowercasedTag = newTag.trim().toLowerCase();
            if (!currentTags.map(t => t.toLowerCase()).includes(lowercasedTag)) {
                onEditItemData(item.existedId, 'tags', [...currentTags, newTag.trim()]);
            }
            setNewTag('');
        }
    }, [newTag, item, onEditItemData]);

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        if (onEditItemData && item.existedId) {
            const currentTags = item.tags || [];
            onEditItemData(item.existedId, 'tags', currentTags.filter(t => t !== tagToRemove));
        }
    }, [item, onEditItemData]);

    const isEquipped = useMemo(() => {
        if (item.ownerType === 'npc') {
            return item.isEquippedByOwner || false;
        }
        if (!playerCharacter || !item.existedId) return false;
        return Object.values(playerCharacter.equippedItems).includes(item.existedId);
    }, [playerCharacter, item]);
    
    const handleDisassembleConfirm = () => {
        if (!onCloseModal) return;
        if (item.ownerType === 'npc' && item.ownerId && disassembleNpcItem) {
            disassembleNpcItem(item.ownerId, item);
        } else if (disassembleItem) {
            disassembleItem(item);
        }
        setIsDisassembleConfirmOpen(false);
        onCloseModal();
    };

    const menuItems = useMemo(() => {
        const hasTextContent = item.textContent && item.textContent.length > 0;
        const hasCoreLore = (['Rare', 'Epic', 'Legendary', 'Unique'].includes(item.quality) || (!!item.fateCards && item.fateCards.length > 0));

        const items = [
            { name: 'item_menu_properties', icon: InformationCircleIcon, show: true },
            { name: 'item_menu_bonuses_effects', icon: SparklesIcon, show: (item.structuredBonuses && item.structuredBonuses.length > 0) || (item.combatEffect && item.combatEffect.length > 0) },
            { name: 'Text Content', icon: BookOpenIcon, show: hasTextContent || (allowHistoryManipulation && (item.type === 'Book' || item.type === 'Document' || item.type === 'Scroll')) },
            { name: 'item_menu_lore', icon: StarIcon, show: hasCoreLore },
            { name: 'item_menu_journal', icon: BookOpenIcon, show: !!item.isSentient || (Array.isArray(item.journalEntries) && item.journalEntries.length > 0) },
            { name: 'item_menu_crafting', icon: WrenchIcon, show: (!!item.disassembleTo && item.disassembleTo.length > 0) || (allowHistoryManipulation && item.isContainer) },
            { name: 'item_menu_system', icon: CogIcon, show: allowHistoryManipulation },
        ];
        return items.filter(item => item.show);
    }, [item, allowHistoryManipulation]);

    const renderContent = () => {
        switch(activeView) {
            case 'item_menu_properties': return (
                <div className="space-y-4">
                    <SectionHeader title={t('Core Properties')} icon={InformationCircleIcon} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                        <InfoRow label={t("Quality")} value={<span className={qualityColorMap[item.quality] || 'text-gray-300'}>{t(item.quality)}</span>} icon={TagIcon} />
                        <InfoRow label={t("Price")} value={`${item.price} ${t(currencyName as any)}`} icon={CurrencyDollarIcon} />
                        <InfoRow label={t("Count")} value={item.count} icon={HashtagIcon} />
                        <InfoRow label={t("Weight")} value={`${item.weight} ${t('kg_short')}`} icon={ScaleIcon} />
                        <InfoRow label={t("Volume")} value={`${item.volume} dm³`} icon={CubeIcon} />
                        <InfoRow label={t("Durability")} value={item.durability} icon={ShieldCheckIcon} />
                        {item.group && <InfoRow label={t("Group")} value={t(item.group as any)} icon={Squares2X2Icon} />}
                    </div>

                    {(item.equipmentSlot || item.isConsumption) && (<>
                        <SectionHeader title={t("Usage & Equipment")} icon={CogIcon} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                            <InfoRow label={t("Consumable")} value={item.isConsumption ? t('Yes') : t('No')} icon={FireIcon} />
                            <InfoRow label={t("Equip Slot")} value={item.equipmentSlot ? (Array.isArray(item.equipmentSlot) ? item.equipmentSlot.map(s => t(s as any)).join(', ') : t(item.equipmentSlot as any)) : t('N/A')} icon={PaperClipIcon} />
                            <InfoRow label={t("Two-Handed")} value={item.requiresTwoHands ? t('Yes') : t('No')} icon={HandRaisedIcon} />
                        </div>
                    </>)}

                    {item.resource != null && (<>
                        <SectionHeader title={t("Resource")} icon={BoltIcon} />
                        <InfoRow label={t("Resource")} value={item.maximumResource != null ? `${item.resource} / ${item.maximumResource}` : item.resource} icon={BeakerIcon} />
                        {item.resourceType && <InfoRow label={t("Resource Type")} value={t(item.resourceType as any)} icon={TagIcon} />}
                    </>)}

                    {item.isContainer && (<>
                         <SectionHeader title={t("Container Details")} icon={ArchiveBoxIcon} />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                            <InfoRow label={t("Is Container")} value={t("Yes")} icon={CheckCircleIcon} />
                            <InfoRow label={t("Capacity")} value={item.capacity === null ? t('Unlimited') : `${item.capacity} ${t('slots')}`} icon={HashtagIcon} />
                            {item.containerWeight != null && <InfoRow label={t("Empty Weight")} value={`${item.containerWeight} ${t('kg_short')}`} icon={ScaleIcon} />}
                            {item.weightReduction != null && <InfoRow label={t("Weight Reduction")} value={`${item.weightReduction}%`} icon={MinusCircleIcon} />}
                            {item.contentsPath && <InfoRow label={t("Location")} value={item.contentsPath.join(' > ')} icon={MapPinIcon} />}
                         </div>
                    </>)}
                     {item.customProperties && item.customProperties.length > 0 && (<>
                        <SectionHeader title={t("State Interactions")} icon={Cog6ToothIcon} />
                         {item.customProperties.map((prop, i) => (
                            <div key={i} className="bg-gray-800/50 p-2 rounded-md flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full font-semibold">{t(prop.interactionType as any)}</span>
                                    <span className="text-gray-300">{prop.targetStateName}</span>
                                </div>
                                <span className={`font-mono font-bold ${prop.changeValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {prop.changeValue > 0 ? `+${prop.changeValue}` : prop.changeValue}
                                </span>
                            </div>
                        ))}
                    </>)}
                </div>
            );
            case 'item_menu_bonuses_effects': return (
                <div className="space-y-4">
                    {item.structuredBonuses && item.structuredBonuses.length > 0 && (
                        <div className="space-y-3">
                            {item.structuredBonuses.map((bonus, i) => <BonusCard key={i} bonus={bonus} />)}
                        </div>
                    )}
                    {item.combatEffect && item.combatEffect.length > 0 && (
                        <div className="mt-4">
                            <SectionHeader title={t("Combat Effects")} icon={BoltIcon} />
                            <div className="space-y-3 mt-2">
                                {item.combatEffect.map((action, i) => (
                                    <CombatActionDetails key={i} action={action} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
            case 'item_menu_lore':
                const hasBond = ['Rare', 'Epic', 'Legendary', 'Unique'].includes(item.quality);
                const hasFateCards = item.fateCards && item.fateCards.length > 0;

                if (!hasBond && !hasFateCards) {
                    return (
                        <div className="text-center text-gray-500 p-6">
                            <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                            <p>{t('no_lore_available')}</p>
                        </div>
                    );
                }
                return (
                    <div className="space-y-6">
                        {hasBond && (
                            <div>
                                <SectionHeader title={t("Owner Bond")} icon={UserPlusIcon} />
                                <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-semibold text-gray-400 flex items-center gap-2">{t("Owner Bond")}</span>
                                <span className="font-mono text-white">{item.ownerBondLevelCurrent || 0} / 100</span>
                                </div>
                                <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                                    <div className="bg-purple-500 h-2.5 rounded-full" style={{width: `${item.ownerBondLevelCurrent || 0}%`}}></div>
                                </div>
                            </div>
                        )}
                        {hasFateCards && (
                            <div>
                                <SectionHeader title={t("Fate Cards")} icon={SparklesIcon} />
                                <div className="space-y-3">
                                    {item.fateCards!.map(card => {
                                        const openCardImageModal = () => {
                                            if (onOpenImageModal) {
                                                const prompt = card.image_prompt || `A detailed fantasy art image of a tarot card representing "${card.name}". ${card.description}`;
                                                onOpenImageModal(prompt, card.image_prompt);
                                            }
                                        };
                                        return (
                                            <FateCardDetailsRenderer 
                                                key={card.cardId} 
                                                card={card}
                                                onOpenImageModal={openCardImageModal}
                                                imageCache={imageCache}
                                                onImageGenerated={onImageGenerated}
                                                model={gameSettings?.pollinationsImageModel}
                                                gameSettings={gameSettings}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'Text Content':
                return (
                    <ItemTextContentView 
                        item={item} 
                        isAdminEditable={allowHistoryManipulation} 
                        onEditItemData={onEditItemData!} 
                        onOpenTextReader={onOpenTextReader!} 
                    />
                );
            case 'item_menu_journal':
                return (
                    <ItemJournalView 
                        item={item} 
                        isAdminEditable={allowHistoryManipulation} 
                        onEditItemData={onEditItemData!} 
                        onOpenTextReader={onOpenTextReader!} 
                    />
                );
            case 'item_menu_crafting': return (
                <div className="space-y-4">
                     {item.disassembleTo && item.disassembleTo.length > 0 && (
                        <div>
                             <SectionHeader title={t("Disassembles To")} icon={WrenchIcon} />
                             <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                                {item.disassembleTo.map((m: any) => <li key={m.materialName}>{m.quantity}x {m.materialName}</li>)}
                             </ul>
                             <div className="pt-2">
                                <button
                                    onClick={() => setIsDisassembleConfirmOpen(true)}
                                    disabled={isEquipped}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-yellow-300 bg-yellow-600/20 rounded-md hover:bg-yellow-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={isEquipped ? t("Cannot disassemble equipped items.") : t("Disassemble")}
                                >
                                    <WrenchScrewdriverIcon className="w-5 h-5" />
                                    {t("Disassemble")}
                                </button>
                            </div>
                        </div>
                     )}
                     {allowHistoryManipulation && item.isContainer && placeAsStorage && (
                         <div className="pt-2">
                            <SectionHeader title={t("Actions")} icon={CogIcon} />
                            <button
                                onClick={() => placeAsStorage(item)}
                                disabled={isEquipped}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-600/20 rounded-md hover:bg-cyan-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isEquipped ? t("Cannot place equipped items.") : t("Place as Storage")}
                            >
                                <ArchiveBoxIcon className="w-5 h-5" />
                                {t("Place as Storage")}
                            </button>
                        </div>
                     )}
                </div>
            );
            case 'item_menu_system': return (
                <div className="space-y-4">
                     <EditableField label={t("Custom Image Prompt")} value={item.custom_image_prompt || ''} isEditable={true} onSave={(val) => { if (item.existedId && onEditItemData) onEditItemData(item.existedId, 'custom_image_prompt', val) }} as="textarea" />
                     <p className="text-xs text-gray-400 mt-2"><strong>{t("Default prompt from AI:")}</strong> {item.image_prompt}</p>

                     <div className="pt-4 border-t border-gray-700/50">
                        <h5 className="text-sm font-semibold text-gray-400 mb-2">{t('Tags')}</h5>
                        <div className="flex flex-wrap gap-2 items-center">
                            {(item.tags || []).length > 0 ? (item.tags || []).map(tag => (
                                <div key={tag} className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    <span>{tag}</span>
                                    {allowHistoryManipulation && (
                                        <button onClick={() => handleRemoveTag(tag)} className="text-cyan-400 hover:text-white transition-colors">
                                            <XCircleIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )) : (
                                <p className="text-xs text-gray-500 italic">{t('No tags assigned.')}</p>
                            )}
                        </div>
                         <form onSubmit={(e) => { e.preventDefault(); handleAddTag(); }} className="flex gap-2 mt-3">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder={t("Add a tag...")}
                                className="flex-1 bg-gray-800/60 border border-gray-600 rounded-md py-1 px-2 text-sm text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                            />
                            <button type="submit" className="px-4 py-1 text-xs font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors">
                                {t("Add")}
                            </button>
                        </form>
                     </div>
                     {allowHistoryManipulation && onRegenerateId && (
                        <div className="pt-4 border-t border-gray-700/50">
                             <SectionHeader title={t('System Information')} icon={CogIcon} />
                            <IdDisplay id={item.existedId} name={item.name} onRegenerate={() => onRegenerateId(item, 'Item')} />
                        </div>
                    )}
                </div>
            );
            default: return null;
        }
    }

    return (
        <>
            <div className="flex flex-col h-full">
                 <div className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden p-4 bg-gray-800/30 rounded-lg ${isHeaderExpanded ? 'max-h-[500px] mb-4' : 'max-h-0'}`}>
                    <ItemHeader {...props} />
                </div>
            
                <div className="flex-1 flex flex-col min-h-0">
                    {activeView === 'menu' ? (
                        <div className="p-1 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-cyan-400 narrative-text flex items-center gap-2">
                                    {t('item_menu_title')}
                                </h3>
                                <button onClick={() => setIsHeaderExpanded(!isHeaderExpanded)} title={t(isHeaderExpanded ? 'Collapse Header' : 'Expand Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                    {isHeaderExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {menuItems.map(tab => (
                                    <button
                                        key={tab.name}
                                        onClick={() => setActiveView(tab.name)}
                                        className="bg-slate-800/70 hover:bg-slate-700/90 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 transform hover:scale-105 border border-slate-700 hover:border-cyan-500"
                                    >
                                        <tab.icon className="w-8 h-8 text-cyan-400" />
                                        <span className="font-semibold text-gray-200">{t(tab.name as any)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                             <div className="flex-shrink-0 border-b border-gray-700 flex items-center p-2 gap-3">
                                <button onClick={() => setActiveView('menu')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded-md transition-colors hover:bg-gray-700/50">
                                    <ArrowUturnLeftIcon className="w-5 h-5" />
                                    {t('back_to_menu')}
                                </button>
                                <div className="w-px h-6 bg-gray-700"></div>
                                <h3 className="text-xl font-bold text-cyan-400 narrative-text flex-1">{t(activeView as any)}</h3>
                                <button onClick={() => setIsHeaderExpanded(!isHeaderExpanded)} title={t(isHeaderExpanded ? 'Collapse Header' : 'Expand Header')} className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 transition-colors">
                                    {isHeaderExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                {renderContent()}
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={isDisassembleConfirmOpen}
                onClose={() => setIsDisassembleConfirmOpen(false)}
                onConfirm={handleDisassembleConfirm}
                title={t("Confirm Disassembly")}
            >
                <p>{t("Are you sure you want to disassemble {name}?", { name: item.name })}</p>
                {item.disassembleTo && item.disassembleTo.length > 0 && (
                    <div className="mt-4 text-left">
                        <h4 className="font-semibold text-gray-300">{t("You will receive the following materials:")}</h4>
                        <ul className="list-disc list-inside text-sm text-gray-400 mt-2">
                            {item.disassembleTo.map((mat: any, i) => (
                                <li key={i}>{mat.quantity}x {mat.materialName}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </ConfirmationModal>
        </>
    );
};

export default ItemDetailsRenderer;