import React, { useState, useMemo, useCallback } from 'react';
import { Item, GameSettings } from '../../types';
import { DetailRendererProps } from './types';
import Section from './Shared/Section';
import DetailRow from './Shared/DetailRow';
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
    Squares2X2Icon, WrenchScrewdriverIcon, TrashIcon, AcademicCapIcon, PhotoIcon
} from '@heroicons/react/24/outline';
import { PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ItemDetailsProps extends Omit<DetailRendererProps, 'data'> {
  item: Item & { ownerType?: 'player' | 'npc', ownerId?: string, isEquippedByOwner?: boolean };
}

const ItemDetailsRenderer: React.FC<ItemDetailsProps> = ({ item, onOpenImageModal, allowHistoryManipulation, onEditItemData, playerCharacter, disassembleItem, disassembleNpcItem, onCloseModal, gameSettings, imageCache, onImageGenerated, onRegenerateId, onShowMessageModal }) => {
    const { t } = useLocalization();
    const [isDisassembleConfirmOpen, setIsDisassembleConfirmOpen] = useState(false);
    const [isEditingTextContent, setIsEditingTextContent] = useState(false);
    const [editedText, setEditedText] = useState(item.textContent || '');
    const canHaveBond = ['Rare', 'Epic', 'Legendary', 'Unique'].includes(item.quality);
    const imagePrompt = item.custom_image_prompt || item.image_prompt || `A detailed, photorealistic fantasy art image of a single ${item.quality} ${item.name}. ${item.description.split('. ')[0]}`;
    const currencyName = gameSettings?.gameWorldInformation?.currencyName || 'Gold';

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

    const handleFateCardImageRegenerated = useCallback((cardId: string, newPrompt: string) => {
        if (!onEditItemData || !item.existedId) return;

        const newFateCards = (item.fateCards || []).map(card => {
            if (card.cardId === cardId) {
                return { ...card, image_prompt: newPrompt };
            }
            return card;
        });

        onEditItemData(item.existedId, 'fateCards', newFateCards);
    }, [item, onEditItemData]);

    return (
    <div className="space-y-4">
        <div className="w-full h-48 rounded-lg overflow-hidden mb-4 bg-gray-900 group relative cursor-pointer" onClick={() => onOpenImageModal?.(imagePrompt)}>
            <ImageRenderer prompt={imagePrompt} alt={item.name} width={1024} height={1024} imageCache={imageCache} onImageGenerated={onImageGenerated} model={gameSettings?.pollinationsImageModel} />
             <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-bold text-lg">{t('Enlarge')}</p>
            </div>
        </div>
        
        {allowHistoryManipulation && onEditItemData && (
             <Section title={t("Custom Image Prompt")} icon={PhotoIcon}>
                <EditableField 
                    label={t("Image Prompt")}
                    value={item.custom_image_prompt || ''}
                    isEditable={true}
                    onSave={(val) => { if (item.existedId) onEditItemData(item.existedId, 'custom_image_prompt', val) }}
                    as="textarea"
                />
                <p className="text-xs text-gray-400 mt-2"><strong>{t("Default prompt from AI:")}</strong> {item.image_prompt}</p>
             </Section>
        )}

        <div className="text-xl font-bold">
             <EditableField 
                label={t('Name')}
                value={item.name}
                isEditable={allowHistoryManipulation && !!item.existedId}
                onSave={(val) => { if (item.existedId) onEditItemData(item.existedId, 'name', val) }}
                as="input"
                className={`${qualityColorMap[item.quality] || 'text-gray-300'} font-bold text-xl`}
             />
        </div>
        
        <div className={`${qualityColorMap[item.quality] || 'text-gray-300'} italic`}>
             <EditableField 
                label={t('Description')}
                value={item.description}
                isEditable={allowHistoryManipulation && !!item.existedId}
                onSave={(val) => { if (item.existedId) onEditItemData(item.existedId, 'description', val) }}
             />
        </div>

        <Section title={t("Core Properties")} icon={InformationCircleIcon}>
            <DetailRow label={t("Quality")} value={<span className={qualityColorMap[item.quality] || 'text-gray-300'}>{t(item.quality)}</span>} icon={TagIcon} />
            {item.type && <DetailRow label={t("Type")} value={t(item.type as any)} icon={PuzzlePieceIcon} />}
            {item.group && <DetailRow label={t("Group")} value={t(item.group as any)} icon={Squares2X2Icon} />}
            <DetailRow label={t("Price")} value={`${item.price} ${t(currencyName as any)}`} icon={CurrencyDollarIcon} />
            <DetailRow label={t("Count")} value={item.count} icon={HashtagIcon} />
            <DetailRow label={t("Weight")} value={`${item.weight} ${t('kg')}`} icon={ScaleIcon} />
            <DetailRow label={t("Volume")} value={`${item.volume} dm³`} icon={CubeIcon} />
            <DetailRow label={t("Durability")} value={item.durability} icon={ShieldCheckIcon} />
        </Section>
        
        {item.textContent && (
            <Section title={t("Text Content")} icon={BookOpenIcon}>
                {!isEditingTextContent ? (
                    <>
                        <div className="bg-gray-900/30 p-3 rounded-md text-sm italic text-gray-400">
                            <div className="line-clamp-4 whitespace-pre-wrap">
                                <MarkdownRenderer content={item.textContent} />
                            </div>
                        </div>
                        <div className="pt-2 flex gap-2">
                            <button
                                onClick={() => onShowMessageModal && onShowMessageModal(item.name, item.textContent || '')}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-md hover:bg-cyan-500/20 transition-colors"
                            >
                                <BookOpenIcon className="w-4 h-4" />
                                {t('Read Full Text')}
                            </button>
                            {allowHistoryManipulation && item.existedId && onEditItemData && (
                                <button
                                    onClick={() => {
                                        setEditedText(item.textContent || '');
                                        setIsEditingTextContent(true);
                                    }}
                                    className="flex-shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-yellow-300 bg-yellow-500/10 rounded-md hover:bg-yellow-500/20 transition-colors"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    {t('Edit')}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="pt-2">
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[150px] whitespace-pre-wrap"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button 
                                onClick={() => setIsEditingTextContent(false)} 
                                className="px-3 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition flex items-center gap-1">
                                <XMarkIcon className="w-4 h-4"/>{t('Cancel')}
                            </button>
                            <button 
                                onClick={() => {
                                    if (item.existedId) onEditItemData(item.existedId, 'textContent', editedText);
                                    setIsEditingTextContent(false);
                                }} 
                                className="px-3 py-1 text-xs rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition flex items-center gap-1">
                                <CheckIcon className="w-4 h-4"/>{t('Save')}
                            </button>
                        </div>
                    </div>
                )}
            </Section>
        )}

        {(item.equipmentSlot || item.isConsumption) && (
            <Section title={t("Usage & Equipment")} icon={CogIcon}>
                <DetailRow label={t("Consumable")} value={item.isConsumption ? t('Yes') : t('No')} icon={FireIcon} />
                <DetailRow label={t("Equip Slot")} value={item.equipmentSlot ? (Array.isArray(item.equipmentSlot) ? item.equipmentSlot.map(s => t(s as any)).join(', ') : t(item.equipmentSlot as any)) : t('N/A')} icon={PaperClipIcon} />
                <DetailRow label={t("Two-Handed")} value={item.requiresTwoHands ? t('Yes') : t('No')} icon={HandRaisedIcon} />
            </Section>
        )}

        {item.resource != null && (
            <Section title={t("Resource")} icon={BoltIcon}>
                <DetailRow 
                    label={t("Resource")} 
                    value={
                        item.maximumResource != null
                        ? `${item.resource} / ${item.maximumResource}`
                        : item.resource
                    } 
                    icon={BeakerIcon} 
                />
                {item.resourceType && <DetailRow label={t("Resource Type")} value={t(item.resourceType as any)} icon={TagIcon} />}
            </Section>
        )}

        {item.isContainer && (
             <Section title={t("Container Details")} icon={ArchiveBoxIcon}>
                <DetailRow label={t("Is Container")} value={t("Yes")} icon={CheckCircleIcon} />
                <DetailRow label={t("Capacity")} value={item.capacity === null ? t('Unlimited') : `${item.capacity} ${t('slots')}`} icon={HashtagIcon} />
                {item.containerWeight != null && <DetailRow label={t("Empty Weight")} value={`${item.containerWeight} ${t('kg')}`} icon={ScaleIcon} />}
                {item.weightReduction != null && <DetailRow label={t("Weight Reduction")} value={`${item.weightReduction}%`} icon={MinusCircleIcon} />}
                {item.contentsPath && <DetailRow label={t("Location")} value={item.contentsPath.join(' > ')} icon={MapPinIcon} />}
             </Section>
        )}
        
        {(item.bonuses && item.bonuses.length > 0 || item.combatEffect && item.combatEffect.length > 0 || item.customProperties && item.customProperties.length > 0 || item.structuredBonuses && item.structuredBonuses.length > 0) && (
             <Section title={t("Special Properties")} icon={SparklesIcon}>
                {item.structuredBonuses && item.structuredBonuses.length > 0 && (
                    <div className="mt-4">
                        <h5 className="font-semibold text-gray-400 flex items-center gap-2"><Cog6ToothIcon className="w-4 h-4" />{t("Mechanical Bonuses")}</h5>
                        <div className="space-y-3 mt-2">
                            {item.structuredBonuses.map((bonus, i) => {
                                const { icon: Icon, colorClass, titleKey } = (() => {
                                    switch(bonus.bonusType) {
                                        case 'Characteristic': return { icon: AcademicCapIcon, colorClass: 'border-cyan-500', titleKey: 'Characteristic Bonus' };
                                        case 'ActionCheck': return { icon: ShieldCheckIcon, colorClass: 'border-green-500', titleKey: 'Action Check Bonus' };
                                        case 'Utility': return { icon: WrenchScrewdriverIcon, colorClass: 'border-blue-500', titleKey: 'Utility Effect' };
                                        default: return { icon: SparklesIcon, colorClass: 'border-indigo-500', titleKey: 'Other Bonus' };
                                    }
                                })();
                                
                                return (
                                    <div key={i} className={`bg-gray-800/60 p-3 rounded-md border-l-4 ${colorClass}`}>
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
                            })}
                        </div>
                    </div>
                )}
                 {item.bonuses && item.bonuses.length > 0 && (
                    <div className="mt-4">
                        <h5 className="font-semibold text-gray-400 flex items-center gap-2"><StarIcon className="w-4 h-4" />{t("All Bonuses")}</h5>
                        <ul className="list-disc list-inside space-y-1 text-cyan-300/90 pl-2 mt-2">
                            {item.bonuses.map((bonus, i) => {
                                const cleanBonus = bonus.replace(/^[\s*\-\u2022]+\s*/, '');
                                return <li key={i}><MarkdownRenderer content={cleanBonus} inline /></li>;
                            })}
                        </ul>
                    </div>
                )}
                {item.combatEffect && item.combatEffect.length > 0 && (
                    <div className="mt-4">
                        <h5 className="font-semibold text-gray-400 flex items-center gap-2"><BoltIcon className="w-5 h-5" />{t("Combat Effects")}</h5>
                        <div className="space-y-3 mt-2">
                            {item.combatEffect.map((action, i) => (
                                <CombatActionDetails key={i} action={action} />
                            ))}
                        </div>
                    </div>
                )}
                {item.customProperties && item.customProperties.length > 0 && (
                     <div className="mt-4">
                        <h5 className="font-semibold text-gray-400 flex items-center gap-2"><Cog6ToothIcon className="w-4 h-4" />{t("Custom Properties")}</h5>
                        <div className="space-y-2 text-sm mt-2">
                            {item.customProperties.map((prop, i) => (
                                <div key={i} className="bg-gray-800/60 p-2 rounded">
                                    <p className="font-semibold text-gray-200">{t(prop.interactionType)}: {prop.targetStateName} ({prop.changeValue > 0 ? `+${prop.changeValue}` : prop.changeValue})</p>
                                    <p className="text-gray-400 italic">{prop.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Section>
        )}
        
        <Section title={t("Crafting & Lore")} icon={BookOpenIcon}>
             {canHaveBond && (
                 <DetailRow label={t("Owner Bond")} value={`${item.ownerBondLevelCurrent || 0} / 100`} icon={UserPlusIcon} />
             )}
             <DetailRow 
                label={t("Disassembles To")} 
                value={item.disassembleTo && item.disassembleTo.length > 0 
                    ? item.disassembleTo.map((m: any) => `${m.quantity}x ${m.materialName}`).join(', ') 
                    : t('No')
                } 
                icon={WrenchIcon} 
            />
             {item.disassembleTo && item.disassembleTo.length > 0 && (
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
            )}
        </Section>
        
        {item.fateCards && item.fateCards.length > 0 && (
            <Section title={t("Fate Cards")} icon={SparklesIcon}>
                <div className="space-y-3">
                    {item.fateCards.map(card => {
                        const openCardImageModal = () => {
                            if (onOpenImageModal) {
                                const prompt = card.image_prompt || `A detailed fantasy art image of a tarot card representing "${card.name}". ${card.description}`;
                                onOpenImageModal(prompt, (newPrompt: string) => handleFateCardImageRegenerated(card.cardId, newPrompt));
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
                            />
                        );
                    })}
                </div>
            </Section>
        )}

        {allowHistoryManipulation && onRegenerateId && (
            <Section title={t("System Information")} icon={CogIcon}>
                <IdDisplay 
                    id={item.existedId} 
                    name={item.name} 
                    onRegenerate={() => onRegenerateId(item, 'Item')}
                />
            </Section>
        )}

        <ConfirmationModal
            isOpen={isDisassembleConfirmOpen}
            onClose={() => setIsDisassembleConfirmOpen(false)}
            onConfirm={handleDisassembleConfirm}
            title={t("Confirm Disassembly")}
        >
            <p className="text-sm text-gray-300">{t("Are you sure you want to disassemble {name}?", { name: item.name })}</p>
            <div className="mt-4 text-left bg-gray-900/50 p-3 rounded-md border border-gray-600">
                <p className="text-sm font-semibold text-gray-300 mb-2">{t("You will receive the following materials:")}</p>
                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                    {item.disassembleTo?.map((mat: any, index: number) => (
                        <li key={index}>{mat.quantity}x {mat.materialName}</li>
                    ))}
                </ul>
            </div>
        </ConfirmationModal>
    </div>
    );
};

export default ItemDetailsRenderer;