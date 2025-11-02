
import React, { useState, useMemo, useEffect } from 'react';
import { PlayerCharacter, GameSettings } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import Modal from './Modal';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';

const CHARACTERISTICS_LIST = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'faith', 'attractiveness', 'trade', 'persuasion', 'perception', 'luck', 'speed'];

const initialFormData = {
  playerName: '',
  characterDescription: '',
  initialPrompt: '',
  race: 'Human',
  charClass: 'Warrior',
  age: 25,
  isCustomRace: false,
  customRaceName: '',
  customRaceDescription: '',
  customAttributes: CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 1 }), {} as Record<string, number>),
  attributePoints: 5,
  isCustomClass: false,
  customClassName: '',
  customClassDescription: '',
  customClassAttributes: CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 0 }), {} as Record<string, number>),
  customClassAttributePoints: 3,
};

interface PlayerCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (creationData: any) => void;
    templatePlayer?: PlayerCharacter | null;
    universe: string;
    currentWorldData: any;
    gameSettings: GameSettings | null;
    partyLevel: number;
    shareCharacteristics: boolean;
}

const PlayerCreationModal: React.FC<PlayerCreationModalProps> = ({ isOpen, onClose, onSubmit, templatePlayer, universe, currentWorldData, gameSettings, partyLevel, shareCharacteristics }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState(initialFormData);
    const { attributePoints, customAttributes, isCustomRace, isCustomClass, customClassAttributePoints, customClassAttributes } = formData;
    const [showAttributePoints, setShowAttributePoints] = useState(false);

    const [raceSearch, setRaceSearch] = useState('');
    const [classSearch, setClassSearch] = useState('');

    useEffect(() => {
        if (templatePlayer) {
            const isStandardRace = Object.keys(currentWorldData.races).includes(templatePlayer.race);
            const isStandardClass = Object.keys(currentWorldData.classes).includes(templatePlayer.class);
            setFormData(prev => ({
                ...initialFormData,
                race: isStandardRace ? templatePlayer.race : Object.keys(currentWorldData.races)[0] || 'Human',
                charClass: isStandardClass ? templatePlayer.class : Object.keys(currentWorldData.classes)[0] || 'Warrior',
                isCustomRace: !isStandardRace,
                isCustomClass: !isStandardClass,
                customRaceName: !isStandardRace ? templatePlayer.race : '',
                customRaceDescription: !isStandardRace ? templatePlayer.raceDescription : '',
                customClassName: !isStandardClass ? templatePlayer.class : '',
                customClassDescription: !isStandardClass ? templatePlayer.classDescription : '',
            }));
        } else {
            const defaultRace = Object.keys(currentWorldData.races)[0] || 'Human';
            const defaultClass = Object.keys(currentWorldData.classes)[0] || 'Warrior';
            setFormData(prev => ({ ...initialFormData, race: defaultRace, charClass: defaultClass }));
        }
    }, [templatePlayer, currentWorldData]);

    useEffect(() => {
        if (!shareCharacteristics && partyLevel > 1) {
            const points = (partyLevel - 1) * 5;
            setShowAttributePoints(true);
            setFormData(prev => ({
                ...prev,
                attributePoints: points,
                customAttributes: CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 1 }), {}),
            }));
        } else {
            setShowAttributePoints(false);
            setFormData(prev => ({ ...prev, attributePoints: initialFormData.attributePoints }));
        }
    }, [partyLevel, shareCharacteristics]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        if (name === 'race') {
            const newRace = value;
            const selectedRaceData = currentWorldData.races[newRace];
            const availableClasses = selectedRaceData?.availableClasses || null;
            const allClasses = Object.keys(currentWorldData.classes);
            const newClassOptions = availableClasses
                ? allClasses.filter((c: string) => availableClasses.includes(c))
                : allClasses;
            
            const firstClassForNewRace = newClassOptions[0] || '';
            setClassSearch(''); // Also reset search
    
            setFormData(prev => ({
                ...prev,
                race: newRace,
                charClass: firstClassForNewRace,
                isCustomRace: false
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: finalValue }));
        }
    };

    const handleAttributeChange = (attr: string, delta: number) => {
        setFormData(prev => {
            const currentVal = prev.customAttributes[attr];
            const remainingPoints = prev.attributePoints;

            if (delta > 0 && remainingPoints > 0) {
                return { ...prev, attributePoints: remainingPoints - 1, customAttributes: { ...prev.customAttributes, [attr]: currentVal + 1 } };
            }
            if (delta < 0 && currentVal > 1) { // Cannot go below base 1
                return { ...prev, attributePoints: remainingPoints + 1, customAttributes: { ...prev.customAttributes, [attr]: currentVal - 1 } };
            }
            return prev;
        });
    };

    const handleCustomClassAttributeChange = (attr: string, delta: number) => {
        setFormData(prev => {
            const currentPoints = prev.customClassAttributes[attr];
            const remainingPoints = prev.customClassAttributePoints;

            if (delta > 0 && remainingPoints > 0) {
                return { ...prev, customClassAttributePoints: remainingPoints - 1, customClassAttributes: { ...prev.customClassAttributes, [attr]: currentPoints + 1 } };
            }
            if (delta < 0 && currentPoints > 0) {
                return { ...prev, customClassAttributePoints: remainingPoints + 1, customClassAttributes: { ...prev.customClassAttributes, [attr]: currentPoints - 1 } };
            }
            return prev;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const isLevelSyncedCreation = !shareCharacteristics && partyLevel > 1;
        const isCharacteristicsLocked = !!templatePlayer && shareCharacteristics;

        if (!isCharacteristicsLocked) {
            if (isCustomRace && !isLevelSyncedCreation && (attributePoints > 0 || !formData.customRaceName.trim())) {
                alert(t("Please enter a custom race name and allocate all attribute points."));
                return;
            }
            if (isLevelSyncedCreation && attributePoints > 0) {
                alert(t("please_spend_all_attribute_points"));
                return;
            }
            if (isCustomClass && (customClassAttributePoints > 0 || !formData.customClassName.trim())) {
                alert(t("Please enter a custom class name and allocate all 3 bonus points."));
                return;
            }
        }

        const finalData = {
            ...formData,
            initialPrompt: `[System Action] A new ${formData.isCustomClass ? formData.customClassName : formData.charClass} named ${formData.playerName} has joined the party.`,
            templatePlayer
        };
        onSubmit(finalData);
    };

    const raceOptions = useMemo(() => Object.keys(currentWorldData.races), [currentWorldData]);
    
    const availableClassesForRace = useMemo(() => {
        if (isCustomRace) {
            return null;
        }
        const selectedRaceData = currentWorldData.races[formData.race];
        return selectedRaceData?.availableClasses || null;
    }, [formData.race, isCustomRace, currentWorldData]);

    const classOptions = useMemo(() => {
        const allClasses = Object.keys(currentWorldData.classes);
        if (availableClassesForRace) {
            return allClasses.filter(c => availableClassesForRace.includes(c));
        }
        return allClasses;
    }, [currentWorldData.classes, availableClassesForRace]);

    const filteredRaceOptions = useMemo(() => {
        if (!raceSearch.trim()) {
            return raceOptions;
        }
        return raceOptions.filter(race =>
            t(race as any).toLowerCase().includes(raceSearch.toLowerCase())
        );
    }, [raceOptions, raceSearch, t]);

    const filteredClassOptions = useMemo(() => {
        if (!classSearch.trim()) {
            return classOptions;
        }
        return classOptions.filter(cls =>
            t(cls as any).toLowerCase().includes(classSearch.toLowerCase())
        );
    }, [classOptions, classSearch, t]);
    
    const isCharacteristicsLocked = !!templatePlayer && shareCharacteristics;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('Create New Player')}>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
                 <div>
                    <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-1">{t("Character Name")}</label>
                    <input id="playerName" name="playerName" type="text" onChange={handleInputChange} value={formData.playerName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition" required />
                </div>
                 <div>
                    <label htmlFor="characterDescription" className="block text-sm font-medium text-gray-300 mb-1">{t("Character Description")}</label>
                    <textarea id="characterDescription" name="characterDescription" onChange={handleInputChange} value={formData.characterDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition" rows={2} required />
                </div>
                
                {isCharacteristicsLocked && templatePlayer ? (
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-2">
                        <h4 className="text-lg font-semibold text-cyan-400">{t('Copied from Template')}</h4>
                        <p className="text-xs text-gray-400">{t("Race, class, and characteristics will be copied from {name}.", { name: templatePlayer.name })}</p>
                        <p><strong>{t('Race')}:</strong> {t(templatePlayer.race as any)}</p>
                        <p><strong>{t('Class')}:</strong> {t(templatePlayer.class as any)}</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <label htmlFor="race" className="block text-sm font-medium text-gray-300">{t("Race")}</label>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isCustomRace" name="isCustomRace" onChange={handleInputChange} checked={isCustomRace} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
                                <label htmlFor="isCustomRace" className="text-xs text-gray-400">{t("Create Custom Race")}</label>
                            </div>
                        </div>
                        {isCustomRace ? (
                             <div className="p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-2">
                                <div>
                                    <label htmlFor="customRaceName" className="block text-sm font-medium text-gray-300 mb-1">{t("Race Name")}</label>
                                    <input id="customRaceName" name="customRaceName" type="text" onChange={handleInputChange} value={formData.customRaceName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200" required />
                                </div>
                                 <div>
                                    <label htmlFor="customRaceDescription" className="block text-sm font-medium text-gray-300 mb-1">{t("Custom Race Description")}</label>
                                    <textarea id="customRaceDescription" name="customRaceDescription" onChange={handleInputChange} value={formData.customRaceDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200" rows={2} />
                                </div>
                                 { !showAttributePoints && (
                                 <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t("Distribute Attribute Points (Remaining: {points})", { points: attributePoints })}</label>
                                    <p className="text-xs text-yellow-400/80 mb-2">{t('custom_race_zero_attribute_warning')}</p>
                                    {CHARACTERISTICS_LIST.map(attr => (
                                        <div key={attr} className="flex justify-between items-center bg-gray-700/50 p-1 rounded-md mb-1 text-xs">
                                            <span className="capitalize">{t(attr as any)}</span>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => handleAttributeChange(attr, -1)} disabled={customAttributes[attr as keyof typeof customAttributes] <= 1} className="p-1 rounded-full bg-red-600/50 hover:bg-red-500 disabled:bg-gray-600 text-white"><MinusIcon className="w-3 h-3" /></button>
                                                <span>{customAttributes[attr as keyof typeof customAttributes]}</span>
                                                <button type="button" onClick={() => handleAttributeChange(attr, 1)} disabled={attributePoints <= 0} className="p-1 rounded-full bg-green-600/50 hover:bg-green-500 disabled:bg-gray-600 text-white"><PlusIcon className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    placeholder={t('Search by name or ID...')}
                                    value={raceSearch}
                                    onChange={(e) => setRaceSearch(e.target.value)}
                                    className="w-full bg-gray-800/60 border border-gray-600 rounded-md p-2 mt-1 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                                />
                                <select id="race" name="race" onChange={handleInputChange} value={formData.race} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 mt-1">
                                    {filteredRaceOptions.map(r => <option key={r} value={r}>{t(r as any)}</option>)}
                                </select>
                            </>
                        )}

                        <div className="flex items-center gap-2">
                            <label htmlFor="charClass" className="block text-sm font-medium text-gray-300">{t("Class")}</label>
                             <div className="flex items-center gap-2">
                                <input type="checkbox" id="isCustomClass" name="isCustomClass" onChange={handleInputChange} checked={isCustomClass} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
                                <label htmlFor="isCustomClass" className="text-xs text-gray-400">{t("Create Custom Class")}</label>
                            </div>
                        </div>
                        {isCustomClass ? (
                            <div className="p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-2">
                                <div>
                                    <label htmlFor="customClassName" className="block text-sm font-medium text-gray-300 mb-1">{t("Custom Class Name")}</label>
                                    <input id="customClassName" name="customClassName" type="text" onChange={handleInputChange} value={formData.customClassName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200" required />
                                </div>
                                 <div>
                                    <label htmlFor="customClassDescription" className="block text-sm font-medium text-gray-300 mb-1">{t("Custom Class Description")}</label>
                                    <textarea id="customClassDescription" name="customClassDescription" onChange={handleInputChange} value={formData.customClassDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200" rows={2} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t("Distribute Bonus Points (Remaining: {points})", { points: customClassAttributePoints })}</label>
                                    {CHARACTERISTICS_LIST.map(attr => (
                                        <div key={attr} className="flex justify-between items-center bg-gray-700/50 p-1 rounded-md mb-1 text-xs">
                                            <span className="capitalize">{t(attr as any)}</span>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => handleCustomClassAttributeChange(attr, -1)} disabled={customClassAttributes[attr as keyof typeof customClassAttributes] <= 0} className="p-1 rounded-full bg-red-600/50 hover:bg-red-500 disabled:bg-gray-600 text-white"><MinusIcon className="w-3 h-3" /></button>
                                                <span>{customClassAttributes[attr as keyof typeof customClassAttributes]}</span>
                                                <button type="button" onClick={() => handleCustomClassAttributeChange(attr, 1)} disabled={customClassAttributePoints <= 0} className="p-1 rounded-full bg-green-600/50 hover:bg-green-500 disabled:bg-gray-600 text-white"><PlusIcon className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                             <>
                                <input
                                    type="text"
                                    placeholder={t('Search by name or ID...')}
                                    value={classSearch}
                                    onChange={(e) => setClassSearch(e.target.value)}
                                    className="w-full bg-gray-800/60 border border-gray-600 rounded-md p-2 mt-1 text-gray-200 focus:ring-1 focus:ring-cyan-500 transition"
                                />
                                <select id="charClass" name="charClass" onChange={handleInputChange} value={formData.charClass} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 mt-1">
                                  {filteredClassOptions.map(c => <option key={c} value={c}>{t(c as any)}</option>)}
                                </select>
                            </>
                        )}

                        {showAttributePoints && (
                             <div className="p-3 bg-gray-900/30 rounded-lg border border-yellow-500/20 space-y-2">
                                <h4 className="text-lg font-semibold text-yellow-300">{t("Level {level} Character", { level: partyLevel })}</h4>
                                <p className="text-xs text-yellow-200/80">{t("level_sync_desc", { level: partyLevel, points: attributePoints })}</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t("Distribute Attribute Points (Remaining: {points})", { points: attributePoints })}</label>
                                    {CHARACTERISTICS_LIST.map(attr => (
                                        <div key={attr} className="flex justify-between items-center bg-gray-700/50 p-1 rounded-md mb-1 text-xs">
                                            <span className="capitalize">{t(attr as any)}</span>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => handleAttributeChange(attr, -1)} disabled={customAttributes[attr as keyof typeof customAttributes] <= 1} className="p-1 rounded-full bg-red-600/50 hover:bg-red-500 disabled:bg-gray-600 text-white"><MinusIcon className="w-3 h-3" /></button>
                                                <span>{customAttributes[attr as keyof typeof customAttributes]}</span>
                                                <button type="button" onClick={() => handleAttributeChange(attr, 1)} disabled={attributePoints <= 0} className="p-1 rounded-full bg-green-600/50 hover:bg-green-500 disabled:bg-gray-600 text-white"><PlusIcon className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
                
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition">{t('Cancel')}</button>
                    <button type="submit" className="px-4 py-2 text-sm rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition">{t('Create')}</button>
                </div>
            </form>
        </Modal>
    );
};

export default PlayerCreationModal;
