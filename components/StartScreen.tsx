
import React, { useState, useMemo, useEffect } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { InformationCircleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import { saveConfigurationToFile, loadConfigurationFromFile } from '../utils/fileManager';
import ConfirmationModal from './ConfirmationModal';
import { useLocalization } from '../context/LocalizationContext';
import { gameData } from '../utils/localizationGameData';
import AboutContent from './AboutContent';
import { DBSaveSlotInfo } from '../types';
import { cultivationSystemDescEn, cultivationSystemDescRu } from '../utils/translations/presetRules/fantasy/cultivation';
import { magicSystemDescEn, magicSystemDescRu } from '../utils/translations/presetRules/fantasy/magic';
import { priesthoodSystemDescEn, priesthoodSystemDescRu } from '../utils/translations/presetRules/fantasy/priesthood';
import { hungerSystemDescEn, hungerSystemDescRu } from '../utils/translations/presetRules/post_apocalypse/hunger';
import { thirstSystemDescEn, thirstSystemDescRu } from '../utils/translations/presetRules/post_apocalypse/thirst';
import { radiationSystemDescEn, radiationSystemDescRu } from '../utils/translations/presetRules/post_apocalypse/radiation';
import { psionicSystemDescEn, psionicSystemDescRu } from '../utils/translations/presetRules/post_apocalypse/psionic';
import { psionicSystemDescSciFiEn, psionicSystemDescSciFiRu } from '../utils/translations/presetRules/sci_fi/psionic';
import { urbanMagicSystemDescEn, urbanMagicSystemDescRu } from '../utils/translations/presetRules/urban_myth/null_space_magic';
import { fameSystemDescEn, fameSystemDescRu } from '../utils/translations/presetRules/history/fame';
import { oldMagicDescEn, oldMagicDescRu } from '../utils/translations/presetRules/myths/old_magic';
import { divineFavorDescEn, divineFavorDescRu } from '../utils/translations/presetRules/myths/divine_favor';
import { initializeAndPreviewSound } from '../utils/soundManager';


const CHARACTERISTICS_LIST = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'faith', 'attractiveness', 'trade', 'persuasion', 'perception', 'luck', 'speed'];

interface StartScreenProps {
  onStart: (creationData: any) => void;
  onLoadGame: () => Promise<void>;
  onLoadAutosave: () => void;
  autosaveTimestamp: string | null;
  onLoadFromSlot: (slotId: number) => Promise<void>;
  dbSaveSlots: DBSaveSlotInfo[];
}

const initialFormData = {
  universe: 'fantasy',
  selectedEra: 'king_arthurs_britain',
  customEraName: '',
  customSettingName: '',
  playerName: '',
  characterDescription: '',
  initialPrompt: '',
  worldInformation: '',
  superInstructions: '',
  race: 'Human',
  charClass: 'Warrior',
  age: 25,
  isCustomRace: false,
  customRaceName: '',
  customRaceDescription: '',
  customAttributes: CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 1 }), {}),
  attributePoints: 5,
  isCustomClass: false,
  customClassName: '',
  customClassDescription: '',
  customClassAttributes: CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 0 }), {}),
  customClassAttributePoints: 3,
  startTime: '08:00',
  weather: 'Random',
  aiProvider: 'gemini',
  modelName: 'gemini-2.5-pro',
  correctionModelName: '',
  isCustomModel: false,
  customModelName: '',
  openRouterModelName: 'google/gemini-flash-1.5',
  geminiThinkingBudget: 512,
  useDynamicThinkingBudget: true,
  nonMagicMode: false,
  adultMode: false,
  geminiApiKey: '',
  openRouterApiKey: '',
  allowHistoryManipulation: false,
  currencyName: 'Gold',
  customCurrencyValue: '',
  hardMode: false,
  notificationSound: false,
  useCultivationSystem: false,
  cultivationSystemDescription: cultivationSystemDescEn,
  useMagicSystem: false,
  magicSystemDescription: magicSystemDescEn,
  usePriesthoodSystem: false,
  priesthoodSystemDescription: priesthoodSystemDescEn,
  useHungerSystem: false,
  hungerSystemDescription: hungerSystemDescEn,
  useThirstSystem: false,
  thirstSystemDescription: thirstSystemDescEn,
  useRadiationSystem: false,
  radiationSystemDescription: radiationSystemDescEn,
  usePsionicSystem: false,
  psionicSystemDescription: psionicSystemDescEn,
  usePsionicSystemSciFi: false,
  psionicSystemDescriptionSciFi: psionicSystemDescSciFiEn,
  useUrbanMagicSystem: false,
  urbanMagicSystemDescription: urbanMagicSystemDescEn,
  useFameSystem: false,
  fameSystemDescription: fameSystemDescEn,
  useOldMagicSystem: false,
  oldMagicDescription: oldMagicDescEn,
  useDivineFavorSystem: false,
  divineFavorDescription: divineFavorDescEn,
};

const formatTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '';
    }
};

interface WorldData {
  name: string;
  description: string;
  currencyName: string;
  currencyOptions?: string[];
  races: Record<string, { description: string; bonuses: Record<string, number>; availableClasses?: string[] }>;
  classes: Record<string, { description: string; bonuses: Record<string, number> }>;
}

const universeDisplayNames: Record<string, string> = {
    fantasy: "Fantasy",
    sci_fi: "Sci-Fi",
    post_apocalypse: "Post-Apocalypse",
    urban_myth: "Urban Myth",
    history: "History",
    myths: "Myths"
};

export default function StartScreen({ onStart, onLoadGame, onLoadAutosave, autosaveTimestamp, onLoadFromSlot, dbSaveSlots }: StartScreenProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isAdultConfirmOpen, setIsAdultConfirmOpen] = useState(false);
  const [isNonMagicConfirmOpen, setIsNonMagicConfirmOpen] = useState(false);
  const [advancedBudget, setAdvancedBudget] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const { language, setLanguage, t } = useLocalization();

  const { universe, race, charClass, isCustomRace, customAttributes, attributePoints, isCustomModel, aiProvider, isCustomClass, customClassAttributes, customClassAttributePoints, selectedEra } = formData;
  
  useEffect(() => {
    // This effect updates the default preset rule descriptions when the language changes,
    // but ONLY if the user hasn't edited the text themselves.
    setFormData(prev => {
        const newDescriptions: Partial<typeof prev> = {};
        
        const isCultivationUnchanged = prev.cultivationSystemDescription === cultivationSystemDescEn || prev.cultivationSystemDescription === cultivationSystemDescRu;
        if (isCultivationUnchanged) {
            newDescriptions.cultivationSystemDescription = language === 'ru' ? cultivationSystemDescRu : cultivationSystemDescEn;
        }

        const isMagicUnchanged = prev.magicSystemDescription === magicSystemDescEn || prev.magicSystemDescription === magicSystemDescRu;
        if (isMagicUnchanged) {
            newDescriptions.magicSystemDescription = language === 'ru' ? magicSystemDescRu : magicSystemDescEn;
        }

        const isPriesthoodUnchanged = prev.priesthoodSystemDescription === priesthoodSystemDescEn || prev.priesthoodSystemDescription === priesthoodSystemDescRu;
        if (isPriesthoodUnchanged) {
            newDescriptions.priesthoodSystemDescription = language === 'ru' ? priesthoodSystemDescRu : priesthoodSystemDescEn;
        }

        const isHungerUnchanged = prev.hungerSystemDescription === hungerSystemDescEn || prev.hungerSystemDescription === hungerSystemDescRu;
        if (isHungerUnchanged) {
            newDescriptions.hungerSystemDescription = language === 'ru' ? hungerSystemDescRu : hungerSystemDescEn;
        }

        const isThirstUnchanged = prev.thirstSystemDescription === thirstSystemDescEn || prev.thirstSystemDescription === thirstSystemDescRu;
        if (isThirstUnchanged) {
            newDescriptions.thirstSystemDescription = language === 'ru' ? thirstSystemDescRu : thirstSystemDescEn;
        }

        const isRadiationUnchanged = prev.radiationSystemDescription === radiationSystemDescEn || prev.radiationSystemDescription === radiationSystemDescRu;
        if (isRadiationUnchanged) {
            newDescriptions.radiationSystemDescription = language === 'ru' ? radiationSystemDescRu : radiationSystemDescEn;
        }

        const isPsionicUnchanged = prev.psionicSystemDescription === psionicSystemDescEn || prev.psionicSystemDescription === psionicSystemDescRu;
        if (isPsionicUnchanged) {
            newDescriptions.psionicSystemDescription = language === 'ru' ? psionicSystemDescRu : psionicSystemDescEn;
        }
        
        const isPsionicSciFiUnchanged = prev.psionicSystemDescriptionSciFi === psionicSystemDescSciFiEn || prev.psionicSystemDescriptionSciFi === psionicSystemDescSciFiRu;
        if (isPsionicSciFiUnchanged) {
            newDescriptions.psionicSystemDescriptionSciFi = language === 'ru' ? psionicSystemDescSciFiRu : psionicSystemDescSciFiEn;
        }
        
        const isUrbanMagicUnchanged = prev.urbanMagicSystemDescription === urbanMagicSystemDescEn || prev.urbanMagicSystemDescription === urbanMagicSystemDescRu;
        if (isUrbanMagicUnchanged) {
            newDescriptions.urbanMagicSystemDescription = language === 'ru' ? urbanMagicSystemDescRu : urbanMagicSystemDescEn;
        }

        const isFameUnchanged = prev.fameSystemDescription === fameSystemDescEn || prev.fameSystemDescription === fameSystemDescRu;
        if (isFameUnchanged) {
            newDescriptions.fameSystemDescription = language === 'ru' ? fameSystemDescRu : fameSystemDescEn;
        }

        const isOldMagicUnchanged = prev.oldMagicDescription === oldMagicDescEn || prev.oldMagicDescription === oldMagicDescRu;
        if (isOldMagicUnchanged) {
            newDescriptions.oldMagicDescription = language === 'ru' ? oldMagicDescRu : oldMagicDescEn;
        }
        
        const isDivineFavorUnchanged = prev.divineFavorDescription === divineFavorDescEn || prev.divineFavorDescription === divineFavorDescRu;
        if (isDivineFavorUnchanged) {
            newDescriptions.divineFavorDescription = language === 'ru' ? divineFavorDescRu : divineFavorDescEn;
        }

        return Object.keys(newDescriptions).length > 0 ? { ...prev, ...newDescriptions } : prev;
    });
  }, [language]);


  const zeroCount = useMemo(() => Object.values(customAttributes).filter(v => v === 0).length, [customAttributes]);

  const weatherOptions = [
    'Random', 
    'Blizzard', 
    'Clear', 
    'Cloudy', 
    'Downpour', 
    'Drizzle', 
    'Foggy', 
    'Frigid Air', 
    'Heavy Rain', 
    'Heavy Snow', 
    'Humid', 
    'Light Rain', 
    'Light Snow', 
    'Misty', 
    'Overcast', 
    'Rain', 
    'Sandstorm', 
    'Scorching Sun', 
    'Snow', 
    'Storm', 
    'Windy'
  ];

  const handleLanguageToggle = () => {
    const newLang = language === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
  };

  const handleSaveConfiguration = () => {
    saveConfigurationToFile(formData, t);
  };

  const handleLoadConfiguration = async () => {
    const loadedData = await loadConfigurationFromFile(t);
    if (loadedData) {
      // Merge with initial data to ensure all keys are present for forward compatibility
      const newFormData = { ...initialFormData, ...loadedData };
      setFormData(newFormData);
    }
  };
  
  const handleBudgetToggle = () => {
    setAdvancedBudget(prev => {
        const isSwitchingToSimple = prev;
        if (isSwitchingToSimple && formData.geminiThinkingBudget > 1000) {
            setFormData(f => ({ ...f, geminiThinkingBudget: 1000 }));
        }
        return !prev;
    });
  };

  const currentWorld = useMemo(() => {
    if ((universe === 'history' || universe === 'myths') && selectedEra === 'CUSTOM') {
        return { name: 'Custom', description: '', currencyName: '', races: {}, classes: {}, currencyOptions: [] };
    }
    if (universe === 'history') {
        return gameData.history[selectedEra as keyof typeof gameData.history];
    }
    if (universe === 'myths') {
        return gameData.myths[selectedEra as keyof typeof gameData.myths];
    }
    return gameData[universe as keyof Omit<typeof gameData, 'history' | 'myths'>];
  }, [universe, selectedEra]);


  const raceOptions = useMemo(() => Object.keys(currentWorld.races), [currentWorld]);

  const availableClassesForRace = useMemo(() => {
    if (!(universe === 'fantasy' || universe === 'urban_myth' || universe === 'history' || universe === 'myths' || universe === 'sci_fi' || universe === 'post_apocalypse') || isCustomRace) {
      return null;
    }
    const selectedRaceData = (currentWorld as any).races[race];
    return selectedRaceData?.availableClasses || null;
  }, [universe, race, isCustomRace, currentWorld]);

  const classOptions = useMemo(() => {
    const allClasses = Object.keys(currentWorld.classes);
    if (availableClassesForRace) {
      return allClasses.filter(c => availableClassesForRace.includes(c));
    }
    return allClasses;
  }, [currentWorld.classes, availableClassesForRace]);

  useEffect(() => {
    if ((universe === 'fantasy' || universe === 'urban_myth' || universe === 'history' || universe === 'myths' || universe === 'sci_fi' || universe === 'post_apocalypse') && availableClassesForRace && !availableClassesForRace.includes(charClass)) {
      const firstAvailableClass = classOptions[0];
      if (firstAvailableClass) {
        setFormData(prev => ({
          ...prev,
          charClass: firstAvailableClass,
          isCustomClass: false,
        }));
      }
    }
  }, [race, universe, charClass, availableClassesForRace, classOptions]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const finalValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    // Specific logic for notification sound preview
    if (name === 'notificationSound' && finalValue === true) {
        initializeAndPreviewSound();
    }

    setFormData(prev => {
      let newState: typeof initialFormData = { ...prev, [name]: finalValue as any };
      
      const resetCommonFields = () => {
          newState.isCustomRace = false;
          newState.isCustomClass = false;
          newState.customClassAttributes = CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 0 }), {});
          newState.customClassAttributePoints = 3;
          newState.customCurrencyValue = '';
      };

      if (name === 'universe') {
          resetCommonFields();
          if (value === 'history') {
              const firstEraKey = Object.keys(gameData.history)[0];
              const firstEra = gameData.history[firstEraKey as keyof typeof gameData.history];
              newState.selectedEra = firstEraKey;
              newState.race = Object.keys(firstEra.races)[0];
              const firstRaceData = firstEra.races[newState.race];
              newState.charClass = firstRaceData.availableClasses ? firstRaceData.availableClasses[0] : Object.keys(firstEra.classes)[0];
              newState.currencyName = firstRaceData.currencyName;
              newState.nonMagicMode = true;
          } else if (value === 'myths') {
              const firstSettingKey = Object.keys(gameData.myths)[0];
              const firstSetting = gameData.myths[firstSettingKey as keyof typeof gameData.myths];
              newState.selectedEra = firstSettingKey;
              newState.race = Object.keys(firstSetting.races)[0];
              const firstRaceData = firstSetting.races[newState.race];
              newState.charClass = firstRaceData.availableClasses ? firstRaceData.availableClasses[0] : Object.keys(firstSetting.classes)[0];
              newState.currencyName = firstRaceData.currencyName;
              newState.nonMagicMode = false;
          } else {
              const world = gameData[value as keyof typeof gameData] as any;
              newState.race = Object.keys(world.races)[0];
              const raceData = world.races[newState.race];
              const availableClasses = raceData.availableClasses || Object.keys(world.classes);
              newState.charClass = availableClasses[0];
              newState.nonMagicMode = false;
              if (world.currencyOptions && world.currencyOptions.length > 0) {
                  newState.currencyName = world.currencyOptions[0];
              } else {
                  newState.currencyName = world.currencyName || 'Gold';
              }
          }
      }

      if (name === 'selectedEra') {
          if (value === 'CUSTOM') {
              newState.customEraName = '';
              newState.customSettingName = '';
          } else if (newState.universe === 'history') {
              const newEraData = gameData.history[value as keyof typeof gameData.history];
              newState.race = Object.keys(newEraData.races)[0];
              const firstRaceData = newEraData.races[newState.race];
              newState.charClass = firstRaceData.availableClasses ? firstRaceData.availableClasses[0] : Object.keys(newEraData.classes)[0];
              newState.currencyName = firstRaceData.currencyName;
          } else if (newState.universe === 'myths') {
              const newSettingData = gameData.myths[value as keyof typeof gameData.myths];
              newState.race = Object.keys(newSettingData.races)[0];
              const firstRaceData = newSettingData.races[newState.race];
              newState.charClass = firstRaceData.availableClasses ? firstRaceData.availableClasses[0] : Object.keys(newSettingData.classes)[0];
              newState.currencyName = firstRaceData.currencyName;
          }
      }
      
      if (name === 'race' && !newState.isCustomRace && (newState.universe === 'history' || newState.universe === 'myths')) {
        const currentSubWorld = newState.universe === 'history' ? gameData.history[newState.selectedEra as keyof typeof gameData.history] : gameData.myths[newState.selectedEra as keyof typeof gameData.myths];
        const newRaceData = (currentSubWorld.races as any)[value];
        if (newRaceData && newRaceData.currencyName) {
            newState.currencyName = newRaceData.currencyName;
        }
      }

      if (name === 'race' && value === 'CUSTOM') {
          newState.isCustomRace = true;
      } else if (name === 'race') {
          newState.isCustomRace = false;
      }
      
      if (name === 'charClass' && value === 'CUSTOM') {
          newState.isCustomClass = true;
      } else if (name === 'charClass') {
          newState.isCustomClass = false;
          newState.customClassAttributes = CHARACTERISTICS_LIST.reduce((acc, char) => ({ ...acc, [char]: 0 }), {});
          newState.customClassAttributePoints = 3;
      }

      if (name === 'customModelName' && newState.isCustomModel) {
        newState.modelName = value;
      }

      if (name === 'openRouterModelName' && newState.aiProvider === 'openrouter') {
        newState.modelName = value;
      }

      return newState;
    });
  };

  const handleProviderChange = (provider: 'gemini' | 'openrouter') => {
    setFormData(prev => ({
        ...prev,
        aiProvider: provider,
        modelName: provider === 'gemini' ? 'gemini-2.5-pro' : prev.openRouterModelName,
        isCustomModel: provider === 'gemini' ? prev.isCustomModel : false,
    }));
  };

  const handleModelChange = (modelValue: string) => {
    setFormData(prev => {
        if (modelValue === 'CUSTOM') {
            return {
                ...prev,
                isCustomModel: true,
                modelName: prev.customModelName
            };
        }
        return {
            ...prev,
            isCustomModel: false,
            modelName: modelValue
        };
    });
  };
  
  const handleAttributeChange = (attr: string, delta: number) => {
    setFormData(prev => {
        const currentVal = prev.customAttributes[attr as keyof typeof prev.customAttributes];
        const remainingPoints = prev.attributePoints;
        const currentZeroCount = Object.values(prev.customAttributes).filter(v => v === 0).length;

        // Increasing a stat
        if (delta > 0) {
            const cost = 1;
            if (remainingPoints < cost) return prev; // Not enough points

            return {
                ...prev,
                attributePoints: remainingPoints - cost,
                customAttributes: {
                    ...prev.customAttributes,
                    [attr]: currentVal + 1,
                },
            };
        }

        // Decreasing a stat
        if (delta < 0) {
            if (currentVal <= 0) return prev;
            
            // Prevent creating a third zero if we are about to set this stat to 0
            if (currentVal === 1 && currentZeroCount >= 2) return prev;

            return {
                ...prev,
                attributePoints: remainingPoints + 1,
                customAttributes: {
                    ...prev.customAttributes,
                    [attr]: currentVal - 1,
                },
            };
        }

        return prev;
    });
  };

  const handleCustomClassAttributeChange = (attr: string, delta: number) => {
    setFormData(prev => {
        const currentPoints = prev.customClassAttributes[attr as keyof typeof prev.customClassAttributes];
        const remainingPoints = prev.customClassAttributePoints;

        if (delta > 0 && remainingPoints <= 0) return prev;
        if (delta < 0 && currentPoints <= 0) return prev;
        
        const newPoints = currentPoints + delta;
        const newRemaining = remainingPoints - delta;

        return {
            ...prev,
            customClassAttributePoints: newRemaining,
            customClassAttributes: {
                ...prev.customClassAttributes,
                [attr]: newPoints
            }
        };
    });
  };

  const handleAdultModeClick = () => {
    if (formData.adultMode) {
      setFormData(prev => ({ ...prev, adultMode: false }));
    } else {
      setIsAdultConfirmOpen(true);
    }
  };

  const confirmAdultMode = () => {
    setFormData(prev => ({ ...prev, adultMode: true }));
    setIsAdultConfirmOpen(false);
  };

  const handleNonMagicModeClick = () => {
    if (formData.universe === 'history' || formData.universe === 'myths' || formData.universe === 'fantasy') return;
    if (formData.nonMagicMode) {
      setFormData(prev => ({ ...prev, nonMagicMode: false }));
    } else {
      setIsNonMagicConfirmOpen(true);
    }
  };

  const confirmNonMagicMode = () => {
    setFormData(prev => ({ ...prev, nonMagicMode: true }));
    setIsNonMagicConfirmOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.playerName && formData.characterDescription && formData.initialPrompt) {
        let finalData = { ...formData };
        
        const isCustomWorld = (formData.universe === 'history' || formData.universe === 'myths') && formData.selectedEra === 'CUSTOM';

        if (isCustomRace || isCustomWorld) {
            if (!formData.customRaceName || attributePoints > 0) {
                alert(t("Please enter a custom race name and allocate all attribute points."));
                return;
            }
        }
        if (isCustomClass || isCustomWorld) {
            if (!formData.customClassName.trim() || customClassAttributePoints > 0) {
                alert(t("Please enter a custom class name and allocate all 3 bonus points."));
                return;
            }
        }

        if (isCustomWorld) {
            const customName = formData.universe === 'history' ? formData.customEraName : formData.customSettingName;
            if (!customName.trim()) {
                alert(t("Please enter a name for your custom era/setting."));
                return;
            }
            finalData.selectedEra = customName;
            finalData.isCustomRace = true;
            finalData.isCustomClass = true;
        }

        if (finalData.currencyName === 'CUSTOM') {
          if (!finalData.customCurrencyValue.trim()) {
              alert(t("Enter currency name..."));
              return;
          }
          finalData.currencyName = finalData.customCurrencyValue.trim();
        }
        delete (finalData as any).customCurrencyValue;

        if (finalData.aiProvider === 'gemini') {
            if (finalData.isCustomModel && !finalData.customModelName.trim()) {
                alert(t("Please enter a custom model name."));
                return;
            }
            if (finalData.isCustomModel) {
                finalData.modelName = finalData.customModelName;
            }
        } else if (finalData.aiProvider === 'openrouter') {
            if (!finalData.openRouterModelName.trim()) {
                alert(t("Please enter an OpenRouter model name."));
                return;
            }
            finalData.modelName = finalData.openRouterModelName;
        }
        
        let prependedInstructions = '';
        if (finalData.useCultivationSystem && finalData.universe === 'fantasy') {
            prependedInstructions += `\n${finalData.cultivationSystemDescription}\n`;
        }
        if (finalData.useMagicSystem && finalData.universe === 'fantasy') {
            prependedInstructions += `\n${finalData.magicSystemDescription}\n`;
        }
        if (finalData.usePriesthoodSystem && finalData.universe === 'fantasy') {
            prependedInstructions += `\n${finalData.priesthoodSystemDescription}\n`;
        }
        if (finalData.useHungerSystem && finalData.universe === 'post_apocalypse') {
            prependedInstructions += `\n${finalData.hungerSystemDescription}\n`;
        }
        if (finalData.useThirstSystem && finalData.universe === 'post_apocalypse') {
            prependedInstructions += `\n${finalData.thirstSystemDescription}\n`;
        }
        if (finalData.useRadiationSystem && finalData.universe === 'post_apocalypse') {
            prependedInstructions += `\n${finalData.radiationSystemDescription}\n`;
        }
        if (finalData.usePsionicSystem && finalData.universe === 'post_apocalypse') {
            prependedInstructions += `\n${finalData.psionicSystemDescription}\n`;
        }
        if (finalData.usePsionicSystemSciFi && finalData.universe === 'sci_fi') {
            prependedInstructions += `\n${finalData.psionicSystemDescriptionSciFi}\n`;
        }
        if (finalData.useUrbanMagicSystem && finalData.universe === 'urban_myth') {
            prependedInstructions += `\n${finalData.urbanMagicSystemDescription}\n`;
        }
        if (finalData.useFameSystem && finalData.universe === 'history') {
            prependedInstructions += `\n${finalData.fameSystemDescription}\n`;
        }
        if (finalData.useOldMagicSystem && finalData.universe === 'myths') {
            prependedInstructions += `\n${finalData.oldMagicDescription}\n`;
        }
        if (finalData.useDivineFavorSystem && finalData.universe === 'myths') {
            prependedInstructions += `\n${finalData.divineFavorDescription}\n`;
        }

        finalData.superInstructions = prependedInstructions + finalData.superInstructions;

        // Set world information name correctly for myths
        if (finalData.universe === 'myths' && !isCustomWorld) {
            finalData.worldInformation = `Setting: ${gameData.myths[finalData.selectedEra as keyof typeof gameData.myths].name}\n\n${finalData.worldInformation}`;
        }

        onStart(finalData);
    }
  };
  
  const selectedRaceInfo = !isCustomRace && currentWorld.races[race];
  const selectedClassInfo = !isCustomClass && currentWorld.classes[charClass];

  const nonMagicDisabled = formData.universe === 'history' || formData.universe === 'myths' || formData.universe === 'fantasy';
  const nonMagicChecked = formData.universe === 'history' ? true : (formData.universe === 'fantasy' || formData.universe === 'myths' ? false : formData.nonMagicMode);
  
  const isCustomWorld = (formData.universe === 'history' || formData.universe === 'myths') && formData.selectedEra === 'CUSTOM';
  const showCustomRaceUI = formData.isCustomRace || isCustomWorld;
  const showCustomClassUI = formData.isCustomClass || isCustomWorld;

  return (
    <div className="min-h-screen bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-gray-800/80 p-8 rounded-lg shadow-2xl border border-cyan-500/20 ring-1 ring-cyan-500/20">
        <div className="absolute top-4 right-4">
            <button
                onClick={handleLanguageToggle}
                className="p-2 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-1.5"
                title={t("Switch Language")}
                aria-label={t("Switch Language")}
            >
                <GlobeAltIcon className="w-5 h-5" />
                <span className="font-bold text-xs">{language.toUpperCase()}</span>
            </button>
        </div>
        <h1 className="text-5xl font-bold text-cyan-400 mb-2 text-center narrative-text drop-shadow-[0_2px_2px_rgba(0,255,255,0.2)]">{t("The Book of Eternity")}</h1>
        <p className="text-gray-400 mb-8 text-center text-lg narrative-text italic">{t("Chronicle of the Unwritten")}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t("Choose Your Universe")}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(universeDisplayNames).map(key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'universe', value: key } } as any)}
                  className={`p-3 rounded-md transition-all border flex items-center justify-center whitespace-normal min-h-[4rem] ${formData.universe === key ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                >
                  {t(universeDisplayNames[key])}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">{t(currentWorld.description)}</p>
          </div>

          {formData.universe === 'history' && (
            <div>
              <label htmlFor="selectedEra" className="block text-sm font-medium text-gray-300 mb-2">{t("Choose Your Era")}</label>
              <select id="selectedEra" name="selectedEra" onChange={handleInputChange} value={formData.selectedEra} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition">
                {Object.keys(gameData.history).map(eraKey => (
                  <option key={eraKey} value={eraKey}>{t(gameData.history[eraKey as keyof typeof gameData.history].name)}</option>
                ))}
                 <option value="CUSTOM">{t("Custom...")}</option>
              </select>
               {formData.selectedEra === 'CUSTOM' && (
                    <div className="mt-4">
                        <label htmlFor="customEraName" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Era")}</label>
                        <input id="customEraName" name="customEraName" type="text" onChange={handleInputChange} value={formData.customEraName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Enter era name...")} required />
                    </div>
                )}
            </div>
          )}

          {formData.universe === 'myths' && (
            <div>
              <label htmlFor="selectedEra" className="block text-sm font-medium text-gray-300 mb-2">{t("Setting")}</label>
              <select id="selectedEra" name="selectedEra" onChange={handleInputChange} value={formData.selectedEra} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition">
                {Object.keys(gameData.myths).map(settingKey => (
                  <option key={settingKey} value={settingKey}>{t(gameData.myths[settingKey as keyof typeof gameData.myths].name)}</option>
                ))}
                 <option value="CUSTOM">{t("Custom...")}</option>
              </select>
               {formData.selectedEra === 'CUSTOM' && (
                    <div className="mt-4">
                        <label htmlFor="customSettingName" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Setting")}</label>
                        <input id="customSettingName" name="customSettingName" type="text" onChange={handleInputChange} value={formData.customSettingName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Enter setting name...")} required />
                    </div>
                )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">{t("Character Name")}</label>
              <input id="playerName" name="playerName" type="text" onChange={handleInputChange} value={formData.playerName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" required />
            </div>
             <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">{t("Age")}</label>
              <input id="age" name="age" type="number" onChange={handleInputChange} value={formData.age} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" required min="1" />
            </div>
          </div>
          
           <div>
              <label htmlFor="currencyName" className="block text-sm font-medium text-gray-300 mb-2">{t("Currency Name")}</label>
              <div className="flex gap-2">
                <select 
                  id="currencyName" 
                  name="currencyName" 
                  onChange={handleInputChange} 
                  value={formData.currencyName}
                  className="bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition flex-grow"
                >
                  {formData.universe === 'history' || formData.universe === 'myths' ? (
                    <option value={formData.currencyName}>{t(formData.currencyName as any)}</option>
                  ) : (currentWorld as any).currencyOptions && (currentWorld as any).currencyOptions.length > 0 ? (
                    (currentWorld as any).currencyOptions.map((currency: string) => (
                      <option key={currency} value={currency}>{t(currency)}</option>
                    ))
                  ) : (
                    <option value={(currentWorld as any).currencyName || 'Gold'}>{t((currentWorld as any).currencyName || 'Gold')}</option>
                  )}
                  <option value="CUSTOM">{t("Custom...")}</option>
                </select>
                {formData.currencyName === 'CUSTOM' && (
                  <input 
                    id="customCurrencyValue" 
                    name="customCurrencyValue" 
                    type="text" 
                    onChange={handleInputChange} 
                    value={formData.customCurrencyValue}
                    className="bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition flex-grow"
                    placeholder={t("Enter currency name...")}
                    required 
                    autoFocus
                  />
                )}
              </div>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="race" className="block text-sm font-medium text-gray-300">{formData.universe === 'history' || formData.universe === 'myths' ? t("People") : t("Race")}</label>
                     {!isCustomWorld && (
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-medium text-gray-400">{t("Create Custom Race")}</span>
                            <label htmlFor="isCustomRace" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="isCustomRace" name="isCustomRace" onChange={handleInputChange} checked={formData.isCustomRace} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                    )}
                </div>
                {!showCustomRaceUI && (
                  <>
                    <select id="race" name="race" onChange={handleInputChange} value={race} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition">
                      {raceOptions.map(r => <option key={r} value={r}>{t(r)}</option>)}
                    </select>
                    {selectedRaceInfo && <p className="text-xs text-cyan-300/80 mt-2">{t(selectedRaceInfo.description)}</p>}
                  </>
                )}
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="charClass" className="block text-sm font-medium text-gray-300">{t("Class")}</label>
                   {!isCustomWorld && (
                      <div className="flex items-center gap-4">
                           <span className="text-xs font-medium text-gray-400">{t("Create Custom Class")}</span>
                          <label htmlFor="isCustomClass" className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" id="isCustomClass" name="isCustomClass" onChange={handleInputChange} checked={formData.isCustomClass} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                          </label>
                      </div>
                  )}
                </div>
                {!showCustomClassUI && (
                  <>
                    <select id="charClass" name="charClass" onChange={handleInputChange} value={charClass} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition">
                      {classOptions.map(c => <option key={c} value={c}>{t(c)}</option>)}
                    </select>
                    {selectedClassInfo && <p className="text-xs text-cyan-300/80 mt-2">{t(selectedClassInfo.description)}</p>}
                  </>
                )}
            </div>
          </div>
         
          {showCustomRaceUI && (
            <div className="p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-3">
              <h3 className="text-lg font-semibold text-cyan-400">{t("Create Custom Race")}</h3>
              <div>
                <label htmlFor="customRaceName" className="block text-sm font-medium text-gray-300 mb-2">{t("Race Name")}</label>
                <input id="customRaceName" name="customRaceName" type="text" onChange={handleInputChange} value={formData.customRaceName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., Star-kin")} required />
              </div>
              <div>
                <label htmlFor="customRaceDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Race Description")}</label>
                <textarea id="customRaceDescription" name="customRaceDescription" onChange={handleInputChange} value={formData.customRaceDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Describe the unique traits and history of your race...")} rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t("Distribute Attribute Points (Remaining: {points})", { points: attributePoints })}</label>
                <p className="text-xs text-yellow-400/80 mb-3">{t('custom_race_zero_attribute_warning')}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {CHARACTERISTICS_LIST.map(attr => (
                        <div key={attr} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                            <span className="capitalize text-sm">{t(attr)}</span>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => handleAttributeChange(attr, -1)} disabled={customAttributes[attr as keyof typeof customAttributes] <= 0 || (customAttributes[attr as keyof typeof customAttributes] === 1 && zeroCount >= 2)} className="p-1 rounded-full bg-red-600/50 hover:bg-red-500 disabled:bg-gray-600 text-white"><MinusIcon className="w-4 h-4" /></button>
                                <span>{customAttributes[attr as keyof typeof customAttributes]}</span>
                                <button type="button" onClick={() => handleAttributeChange(attr, 1)} disabled={attributePoints <= 0} className="p-1 rounded-full bg-green-600/50 hover:bg-green-500 disabled:bg-gray-600 text-white"><PlusIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          
          {showCustomClassUI && (
             <div className="p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20 space-y-3">
              <h3 className="text-lg font-semibold text-cyan-400">{t("Create Custom Class")}</h3>
              <div>
                <label htmlFor="customClassName" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Class Name")}</label>
                <input id="customClassName" name="customClassName" type="text" onChange={handleInputChange} value={formData.customClassName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., Chronomancer")} required />
              </div>
              <div>
                <label htmlFor="customClassDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Class Description")}</label>
                <textarea id="customClassDescription" name="customClassDescription" onChange={handleInputChange} value={formData.customClassDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Describe the core tenets and abilities of your class...")} rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t("Distribute Bonus Points (Remaining: {points})", { points: customClassAttributePoints })}</label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {CHARACTERISTICS_LIST.map(attr => (
                        <div key={attr} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
                            <span className="capitalize text-sm">{t(attr)}</span>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => handleCustomClassAttributeChange(attr, -1)} disabled={customClassAttributes[attr as keyof typeof customClassAttributes] <= 0} className="p-1 rounded-full bg-red-600/50 hover:bg-red-500 disabled:bg-gray-600 text-white"><MinusIcon className="w-4 h-4" /></button>
                                <span>{customClassAttributes[attr as keyof typeof customClassAttributes]}</span>
                                <button type="button" onClick={() => handleCustomClassAttributeChange(attr, 1)} disabled={customClassAttributePoints <= 0} className="p-1 rounded-full bg-green-600/50 hover:bg-green-500 disabled:bg-gray-600 text-white"><PlusIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="characterDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Character Description")}</label>
            <textarea id="characterDescription" name="characterDescription" onChange={handleInputChange} value={formData.characterDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., A grizzled warrior with a scarred face...")} rows={3} required />
          </div>
          <div>
            <label htmlFor="initialPrompt" className="block text-sm font-medium text-gray-300 mb-2">{t("Your First Action")}</label>
            <textarea id="initialPrompt" name="initialPrompt" onChange={handleInputChange} value={formData.initialPrompt} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("e.g., I wake up in a dimly lit tavern...")} rows={3} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">{t("Starting Time")}</label>
              <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" />
            </div>
            <div>
              <label htmlFor="weather" className="block text-sm font-medium text-gray-300 mb-2">{t("Starting Weather")}</label>
              <select id="weather" name="weather" value={formData.weather} onChange={handleInputChange} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition">
                {weatherOptions.map(w => <option key={w} value={w}>{t(w)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="worldInformation" className="block text-sm font-medium text-gray-300 mb-2">{t("World Information")}</label>
            <textarea id="worldInformation" name="worldInformation" onChange={handleInputChange} value={formData.worldInformation} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Briefly describe your world's key features or history. This is optional.")} rows={3} />
          </div>
          <div>
            <label htmlFor="superInstructions" className="block text-sm font-medium text-gray-300 mb-2">{t("Your own rules")}</label>
            <textarea id="superInstructions" name="superInstructions" onChange={handleInputChange} value={formData.superInstructions} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Add any special rules or 'super-instructions' for the Game Master to follow. This is optional.")} rows={3} />
          </div>
            
          <div className="p-4 bg-gray-900/40 rounded-lg border border-cyan-500/20 space-y-4">
               <h3 className="text-lg font-semibold text-cyan-400">{t("Preset Rules")}</h3>
              {formData.universe === 'fantasy' && (
                  <div className="space-y-4">
                      {/* Cultivation System */}
                      <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                          <div className="flex items-center justify-between">
                              <label className="font-medium text-gray-300">{t("Activate Cultivation System")}</label>
                              <label htmlFor="useCultivationSystem" className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="useCultivationSystem" name="useCultivationSystem" className="sr-only peer" checked={formData.useCultivationSystem} onChange={handleInputChange} />
                                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                              </label>
                          </div>
                          {formData.useCultivationSystem && (
                              <div>
                                  <label htmlFor="cultivationSystemDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Cultivation System Description for GM")}</label>
                                  <textarea id="cultivationSystemDescription" name="cultivationSystemDescription" onChange={handleInputChange} value={formData.cultivationSystemDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                              </div>
                          )}
                      </div>
                      {/* Magic System */}
                      <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                          <div className="flex items-center justify-between">
                              <label className="font-medium text-gray-300">{t("Activate Magic Development System")}</label>
                              <label htmlFor="useMagicSystem" className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="useMagicSystem" name="useMagicSystem" className="sr-only peer" checked={formData.useMagicSystem} onChange={handleInputChange} />
                                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                              </label>
                          </div>
                          {formData.useMagicSystem && (
                              <div>
                                  <label htmlFor="magicSystemDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Magic Development System Description for GM")}</label>
                                  <textarea id="magicSystemDescription" name="magicSystemDescription" onChange={handleInputChange} value={formData.magicSystemDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                              </div>
                          )}
                      </div>
                      {/* Priesthood System */}
                      <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                          <div className="flex items-center justify-between">
                              <label className="font-medium text-gray-300">{t("Activate Priesthood & Divine Favor System")}</label>
                              <label htmlFor="usePriesthoodSystem" className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="usePriesthoodSystem" name="usePriesthoodSystem" className="sr-only peer" checked={formData.usePriesthoodSystem} onChange={handleInputChange} />
                                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                              </label>
                          </div>
                          {formData.usePriesthoodSystem && (
                              <div>
                                  <label htmlFor="priesthoodSystemDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Priesthood & Divine Favor System Description for GM")}</label>
                                  <textarea id="priesthoodSystemDescription" name="priesthoodSystemDescription" onChange={handleInputChange} value={formData.priesthoodSystemDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                              </div>
                          )}
                      </div>
                  </div>
              )}
              {formData.universe === 'post_apocalypse' && (
                  <div className="space-y-4">
                      {/* Hunger System */}
                      <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                          <div className="flex items-center justify-between">
                              <label className="font-medium text-gray-300">{t("Activate Hunger System")}</label>
                              <label htmlFor="useHungerSystem" className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="useHungerSystem" name="useHungerSystem" className="sr-only peer" checked={formData.useHungerSystem} onChange={handleInputChange} />
                                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                              </label>
                          </div>
                          {formData.useHungerSystem && (
                              <div>
                                  <label htmlFor="hungerSystemDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Hunger System Description for GM")}</label>
                                  <textarea id="hungerSystemDescription" name="hungerSystemDescription" onChange={handleInputChange} value={formData.hungerSystemDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                              </div>
                          )}
                      </div>
                      {/* Thirst System */}
                      <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                          <div className="flex items-center justify-between">
                              <label className="font-medium text-gray-300">{t("Activate Thirst System")}</label>
                              <label htmlFor="useThirstSystem" className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="useThirstSystem" name="useThirstSystem" className="sr-only peer" checked={formData.useThirstSystem} onChange={handleInputChange} />
                                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                              </label>
                          </div>
                          {formData.useThirstSystem && (
                              <div>
                                  <label htmlFor="thirstSystemDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Thirst System Description for GM")}</label>
                                  <textarea id="thirstSystemDescription" name="thirstSystemDescription" onChange={handleInputChange} value={formData.thirstSystemDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                              </div>
                          )}
                      </div>
                       {/* Radiation System */}
                      <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                          <div className="flex items-center justify-between">
                              <label className="font-medium text-gray-300">{t("Activate Radiation & Mutation System")}</label>
                              <label htmlFor="useRadiationSystem" className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="useRadiationSystem" name="useRadiationSystem" className="sr-only peer" checked={formData.useRadiationSystem} onChange={handleInputChange} />
                                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                              </label>
                          </div>
                          {formData.useRadiationSystem && (
                              <div>
                                  <label htmlFor="radiationSystemDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Radiation & Mutation System Description for GM")}</label>
                                  <textarea id="radiationSystemDescription" name="radiationSystemDescription" onChange={handleInputChange} value={formData.radiationSystemDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                              </div>
                          )}
                      </div>
                       {/* Psionic System */}
                      <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                          <div className="flex items-center justify-between">
                              <label className="font-medium text-gray-300">{t("Activate Psionic Power System")}</label>
                              <label htmlFor="usePsionicSystem" className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" id="usePsionicSystem" name="usePsionicSystem" className="sr-only peer" checked={formData.usePsionicSystem} onChange={handleInputChange} />
                                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                              </label>
                          </div>
                          {formData.usePsionicSystem && (
                              <div>
                                  <label htmlFor="psionicSystemDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Psionic Power System Description for GM")}</label>
                                  <textarea id="psionicSystemDescription" name="psionicSystemDescription" onChange={handleInputChange} value={formData.psionicSystemDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                              </div>
                          )}
                      </div>
                  </div>
              )}
               {formData.universe === 'sci_fi' && (
                <div className="space-y-4">
                     {/* Psionic System */}
                    <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-300">{t("Activate Psionic Power System")}</label>
                            <label htmlFor="usePsionicSystemSciFi" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="usePsionicSystemSciFi" name="usePsionicSystemSciFi" className="sr-only peer" checked={formData.usePsionicSystemSciFi} onChange={handleInputChange} />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                        {formData.usePsionicSystemSciFi && (
                            <div>
                                <label htmlFor="psionicSystemDescriptionSciFi" className="block text-sm font-medium text-gray-300 mb-2">{t("Psionic Power System Description for GM")}</label>
                                <textarea id="psionicSystemDescriptionSciFi" name="psionicSystemDescriptionSciFi" onChange={handleInputChange} value={formData.psionicSystemDescriptionSciFi} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                            </div>
                        )}
                    </div>
                </div>
               )}
               {formData.universe === 'urban_myth' && (
                <div className="space-y-4">
                     {/* Urban Magic System */}
                    <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-300">{t("Activate Urban Magic System")}</label>
                            <label htmlFor="useUrbanMagicSystem" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="useUrbanMagicSystem" name="useUrbanMagicSystem" className="sr-only peer" checked={formData.useUrbanMagicSystem} onChange={handleInputChange} />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                        {formData.useUrbanMagicSystem && (
                            <div>
                                <label htmlFor="urbanMagicSystemDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Urban Magic System Description for GM")}</label>
                                <textarea id="urbanMagicSystemDescription" name="urbanMagicSystemDescription" onChange={handleInputChange} value={formData.urbanMagicSystemDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                            </div>
                        )}
                    </div>
                </div>
               )}
               {formData.universe === 'history' && (
                    <div className="space-y-4">
                         {/* Fame System */}
                        <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                            <div className="flex items-center justify-between">
                                <label className="font-medium text-gray-300">{t("Activate Fame System")}</label>
                                <label htmlFor="useFameSystem" className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="useFameSystem" name="useFameSystem" className="sr-only peer" checked={formData.useFameSystem} onChange={handleInputChange} />
                                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                </label>
                            </div>
                            {formData.useFameSystem && (
                                <div>
                                    <label htmlFor="fameSystemDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Fame System Description for GM")}</label>
                                    <textarea id="fameSystemDescription" name="fameSystemDescription" onChange={handleInputChange} value={formData.fameSystemDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                                </div>
                            )}
                        </div>
                    </div>
               )}
               {formData.universe === 'myths' && (
                <div className="space-y-4">
                     {/* Old Magic System */}
                    <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-300">{t("Activate Old Magic of Albion System")}</label>
                            <label htmlFor="useOldMagicSystem" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="useOldMagicSystem" name="useOldMagicSystem" className="sr-only peer" checked={formData.useOldMagicSystem} onChange={handleInputChange} />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                        {formData.useOldMagicSystem && (
                            <div>
                                <label htmlFor="oldMagicDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Old Magic System Description for GM")}</label>
                                <textarea id="oldMagicDescription" name="oldMagicDescription" onChange={handleInputChange} value={formData.oldMagicDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                            </div>
                        )}
                    </div>
                    {/* Divine Favor System */}
                    <div className="space-y-3 p-3 bg-gray-800/30 rounded-md">
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-300">{t("Activate Favor of the Old Gods & the New System")}</label>
                            <label htmlFor="useDivineFavorSystem" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="useDivineFavorSystem" name="useDivineFavorSystem" className="sr-only peer" checked={formData.useDivineFavorSystem} onChange={handleInputChange} />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                        {formData.useDivineFavorSystem && (
                            <div>
                                <label htmlFor="divineFavorDescription" className="block text-sm font-medium text-gray-300 mb-2">{t("Divine Favor System Description for GM")}</label>
                                <textarea id="divineFavorDescription" name="divineFavorDescription" onChange={handleInputChange} value={formData.divineFavorDescription} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition min-h-[200px]" />
                            </div>
                        )}
                    </div>
                </div>
               )}
          </div>
          
            <div className="p-4 bg-gray-900/40 rounded-lg border border-cyan-500/20 space-y-4">
               <h3 className="text-lg font-semibold text-cyan-400">{t("Game Rules")}</h3>
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                  <div>
                    <label className="font-medium text-gray-300">{t("Hard Mode")}</label>
                    <p className="text-xs text-gray-400">{t("Increases enemy health and action difficulty for a greater challenge and enhanced rewards.")}</p>
                  </div>
                   <label htmlFor="hardMode" className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="hardMode"
                      name="hardMode"
                      className="sr-only peer"
                      checked={formData.hardMode}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
                 <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                    <div>
                        <label className="font-medium text-gray-300">{t("Notification Sound")}</label>
                        <p className="text-xs text-gray-400">{t("Play a sound when the GM's response is ready.")}</p>
                    </div>
                     <label htmlFor="notificationSound" className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="notificationSound"
                            name="notificationSound"
                            className="sr-only peer"
                            checked={formData.notificationSound}
                            onChange={handleInputChange}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20">
                  <div>
                    <label className="font-medium text-gray-300">{t("Allow History Manipulation")}</label>
                    <p className="text-xs text-gray-400">{t("allowHistoryManipulationDescription")}</p>
                  </div>
                   <label htmlFor="allowHistoryManipulation" className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="allowHistoryManipulation"
                      name="allowHistoryManipulation"
                      className="sr-only peer"
                      checked={formData.allowHistoryManipulation}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
               <div
                  onClick={handleNonMagicModeClick}
                  className={`flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-cyan-500/20 ${nonMagicDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  <div>
                    <label className="font-medium text-gray-300">{t("Non-Magic Mode")}</label>
                    <p className="text-xs text-gray-400">{t("Disables all magical elements for a realistic playthrough.")}</p>
                  </div>
                  <div className={`relative inline-flex items-center ${nonMagicDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      id="nonMagicMode"
                      name="nonMagicMode"
                      className="sr-only peer"
                      checked={nonMagicChecked}
                      readOnly
                      disabled={nonMagicDisabled}
                      tabIndex={-1}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 peer-disabled:opacity-50"></div>
                  </div>
                </div>
            </div>
          
            <div className="p-4 bg-gray-900/40 rounded-lg border border-cyan-500/20 space-y-4">
               <h3 className="text-lg font-semibold text-cyan-400">{t("AI Settings")}</h3>
                <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-yellow-500/20">
                    <div>
                        <label htmlFor="adultMode" className="font-medium text-yellow-300">{t("Adult Mode (21+)")}</label>
                        <p className="text-xs text-gray-400">{t("Enables less restrictive, player-driven narrative content.")}</p>
                    </div>
                    <div onClick={handleAdultModeClick} className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="adultMode"
                            name="adultMode"
                            className="sr-only peer"
                            checked={formData.adultMode}
                            readOnly
                            tabIndex={-1}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-yellow-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </div>
                </div>
               <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t("AI Provider")}</label>
                  <div className="grid grid-cols-2 gap-2">
                      <button
                          type="button"
                          onClick={() => handleProviderChange('gemini')}
                          className={`p-3 rounded-md text-center transition-all border ${aiProvider === 'gemini' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                      >
                          {t('Google Gemini')}
                      </button>
                      <button
                          type="button"
                          onClick={() => handleProviderChange('openrouter')}
                          className={`p-3 rounded-md text-center transition-all border ${aiProvider === 'openrouter' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                      >
                          {t('OpenRouter')}
                      </button>
                  </div>
                </div>
                
                {aiProvider === 'gemini' && (
                  <>
                    <div>
                      <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-300 mb-2">{t("Google Gemini API Key (Optional)")}</label>
                      <input id="geminiApiKey" name="geminiApiKey" type="password" onChange={handleInputChange} value={formData.geminiApiKey} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Leave blank to use pre-configured key")} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 mt-4">{t("AI Model")}</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button
                          key="flash"
                          type="button"
                          onClick={() => handleModelChange('gemini-2.5-flash')}
                          className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && formData.modelName === 'gemini-2.5-flash' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Flash")}</span>
                          <span className="block text-xs text-gray-400">{t("High Quality")}</span>
                        </button>
                         <button
                          key="pro"
                          type="button"
                          onClick={() => handleModelChange('gemini-2.5-pro')}
                          className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && formData.modelName === 'gemini-2.5-pro' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Pro")}</span>
                          <span className="block text-xs text-gray-400">{t("Superior Quality")}</span>
                        </button>
                        <button
                          key="hybrid"
                          type="button"
                          onClick={() => handleModelChange('gemini-hybrid-pro-flash')}
                          className={`p-3 rounded-md text-center transition-all border ${!isCustomModel && formData.modelName === 'gemini-hybrid-pro-flash' ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Hybrid (Pro/Flash)")}</span>
                          <span className="block text-xs text-gray-400">{t("Best Speed/Quality")}</span>
                        </button>
                        <button
                          key="custom"
                          type="button"
                          onClick={() => handleModelChange('CUSTOM')}
                          className={`p-3 rounded-md text-center transition-all border ${isCustomModel ? 'bg-cyan-500/30 border-cyan-400 text-white' : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'}`}
                        >
                          <span className="font-semibold">{t("Custom...")}</span>
                          <span className="block text-xs text-gray-400">{t("Specify model")}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                {aiProvider === 'gemini' && isCustomModel && (
                  <div className="p-2 bg-gray-900/30 rounded-lg">
                    <label htmlFor="customModelName" className="block text-sm font-medium text-gray-300 mb-2">{t("Custom Model Name")}</label>
                    <input id="customModelName" name="customModelName" type="text" onChange={handleInputChange} value={formData.customModelName} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder="e.g., gemini-2.5-flash" required />
                  </div>
                )}

                {aiProvider === 'gemini' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-900/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-gray-300">{t("Use dynamic thinking budget")}</label>
                                <p className="text-xs text-gray-400">{t("Lets the model decide how much thinking is needed.")}</p>
                            </div>
                            <label htmlFor="useDynamicThinkingBudget" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="useDynamicThinkingBudget" name="useDynamicThinkingBudget" className="sr-only peer" checked={formData.useDynamicThinkingBudget} onChange={handleInputChange} />
                                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                            </label>
                        </div>
                    </div>
                    <div className={`p-3 bg-gray-900/30 rounded-lg transition-opacity ${formData.useDynamicThinkingBudget ? 'opacity-50' : ''}`}>
                      <fieldset disabled={formData.useDynamicThinkingBudget}>
                        <div className="flex justify-between items-center">
                            <label htmlFor={advancedBudget ? "geminiThinkingBudgetAdvanced" : "geminiThinkingBudget"} className="font-medium text-gray-300 flex items-center gap-2">
                              {t("Gemini Thinking Budget")}
                              <button type="button" onClick={handleBudgetToggle} className="px-2 py-0.5 text-xs bg-gray-700/60 text-cyan-400 rounded-full hover:bg-gray-700 transition-colors" title={advancedBudget ? t("Switch to simple slider") : t("Switch to advanced input")}>
                                  {advancedBudget ? t("Simple") : t("Advanced")}
                              </button>
                            </label>
                            <span className="font-mono text-cyan-300">{formData.geminiThinkingBudget}</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{t("Controls AI's 'thinking' token budget. Higher is better quality, lower is faster. 0 disables it.")}</p>
                          
                          {!advancedBudget ? (
                            <input
                                type="range"
                                id="geminiThinkingBudget"
                                name="geminiThinkingBudget"
                                min="128"
                                max="1000"
                                step="1"
                                value={formData.geminiThinkingBudget}
                                onChange={(e) => setFormData(prev => ({ ...prev, geminiThinkingBudget: parseInt(e.target.value, 10) }))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                          ) : (
                            <input
                                type="number"
                                id="geminiThinkingBudgetAdvanced"
                                name="geminiThinkingBudget"
                                min="128"
                                max="32768"
                                step="1"
                                value={formData.geminiThinkingBudget}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (isNaN(value)) {
                                      setFormData(prev => ({ ...prev, geminiThinkingBudget: 128 }));
                                      return;
                                    }
                                    if (value > 32768) return;
                                    setFormData(prev => ({ ...prev, geminiThinkingBudget: value }));
                                }}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition font-mono"
                            />
                          )}
                      </fieldset>
                    </div>
                  </div>
                )}

                {aiProvider === 'openrouter' && (
                   <>
                    <div>
                        <label htmlFor="openRouterApiKey" className="block text-sm font-medium text-gray-300 mb-2">{t("OpenRouter API Key (Optional)")}</label>
                        <input id="openRouterApiKey" name="openRouterApiKey" type="password" onChange={handleInputChange} value={formData.openRouterApiKey} className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" placeholder={t("Leave blank to use pre-configured key")} />
                    </div>
                    <div className="p-2 bg-gray-900/30 rounded-lg mt-4">
                      <label htmlFor="openRouterModelName" className="block text-sm font-medium text-gray-300 mb-2">{t("OpenRouter Model")}</label>
                      <input 
                          id="openRouterModelName" 
                          name="openRouterModelName" 
                          type="text" 
                          onChange={handleInputChange} 
                          value={formData.openRouterModelName} 
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" 
                          placeholder={t("e.g., google/gemini-flash-1.5")} 
                          required 
                      />
                    </div>
                   </>
                )}
                {aiProvider === 'gemini' ? (
                    <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
                         <div>
                            <label className="font-medium text-gray-300 flex items-center gap-2">
                                {t("Use Flash for Corrections")}
                                <span className="text-gray-400 hover:text-white cursor-pointer" title={t("Use Flash for Corrections Tooltip")}>
                                    <InformationCircleIcon className="w-4 h-4" />
                                </span>
                            </label>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.correctionModelName === 'gemini-2.5-flash'}
                                onChange={(e) => {
                                    const value = e.target.checked ? 'gemini-2.5-flash' : '';
                                    setFormData(prev => ({...prev, correctionModelName: value }));
                                }}
                            />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus-within:ring-2 peer-focus-within:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>
                ) : (
                    <div className="p-3 bg-gray-900/30 rounded-lg mt-2">
                        <label htmlFor="correctionModelName" className="font-medium text-gray-300 flex items-center gap-2">
                            {t("Correction Model (Optional)")}
                            <span className="text-gray-400 hover:text-white cursor-pointer" title={t("Correction Model Tooltip")}>
                                <InformationCircleIcon className="w-4 h-4" />
                            </span>
                        </label>
                        <p className="text-xs text-gray-400 mb-2">{t("Model to use for correcting JSON errors. Leave blank to use the primary model.")}</p>
                        <input 
                            id="correctionModelName" 
                            name="correctionModelName" 
                            type="text" 
                            onChange={handleInputChange} 
                            value={formData.correctionModelName} 
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition" 
                            placeholder={t("e.g., google/gemini-pro-1.5")}
                        />
                    </div>
                )}
            </div>
          
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500">
            {t("Begin Your Adventure")}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-700/50 pt-6">
          <p className="text-gray-400 text-sm mb-4">{t("Or continue your journey")}</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onLoadGame}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-3 px-4 rounded-md transition-all border border-gray-600"
            >
              {t("Load from File")}
            </button>
            <button
              type="button"
              onClick={onLoadAutosave}
              disabled={!autosaveTimestamp}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-3 px-4 rounded-md transition-all border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("Load Autosave")}
              {autosaveTimestamp && <span className="block text-xs text-cyan-400/80 font-normal mt-1">{formatTimestamp(autosaveTimestamp)}</span>}
            </button>
            <button
              type="button"
              onClick={handleSaveConfiguration}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-3 px-4 rounded-md transition-all border border-gray-600"
            >
              {t("Save Configuration")}
            </button>
            <button
              type="button"
              onClick={handleLoadConfiguration}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-200 font-bold py-3 px-4 rounded-md transition-all border border-gray-600"
            >
              {t("Load Configuration")}
            </button>
          </div>
        </div>

        {dbSaveSlots.length > 0 && (
          <div className="mt-8 border-t border-gray-700/50 pt-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 text-center">{t("Load from Database")}</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {dbSaveSlots.map(slot => (
                    <button
                        key={slot.slotId}
                        onClick={() => onLoadFromSlot(slot.slotId)}
                        className="w-full text-left bg-gray-700/50 hover:bg-gray-700 p-3 rounded-md transition-colors"
                    >
                        <p className="font-semibold text-white">{slot.playerName} - {t("Lvl {level}", { level: slot.playerLevel })}</p>
                        <p className="text-xs text-gray-400">{slot.locationName} - {t("Turn")} {slot.turnNumber}</p>
                        <p className="text-xs text-gray-500">{new Date(slot.timestamp).toLocaleString()}</p>
                    </button>
                ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-700/50 pt-6">
            <AboutContent />
        </div>
      </div>
       <ConfirmationModal isOpen={isAdultConfirmOpen} onClose={() => setIsAdultConfirmOpen(false)} onConfirm={confirmAdultMode} title={t("Adult Mode (21+)")}>
            <p>{t("adult_mode_warning_p1")}</p>
            <p>{t("adult_mode_warning_p2")}</p>
            <p>{t("adult_mode_warning_p3")}</p>
            <p className="font-bold">{t("adult_mode_warning_p4")}</p>
        </ConfirmationModal>
        <ConfirmationModal isOpen={isNonMagicConfirmOpen} onClose={() => setIsNonMagicConfirmOpen(false)} onConfirm={confirmNonMagicMode} title={t("non_magic_mode_title")}>
            <p>{t("non_magic_mode_warning_p1")}</p>
            <p>{t("non_magic_mode_warning_p2")}</p>
            <p>{t("non_magic_mode_warning_p3")}</p>
            <p className="font-bold">{t("non_magic_mode_warning_p4")}</p>
        </ConfirmationModal>
    </div>
  );
}
