import React, { useState, useMemo } from 'react';
import { PlayerCharacter, Recipe, Item, PassiveSkill } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import { BeakerIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CraftingScreenProps {
  playerCharacter: PlayerCharacter;
  craftItem: (recipeName: string) => void;
}

const RecipeDetails: React.FC<{ 
    recipe: Recipe;
    playerCharacter: PlayerCharacter;
    onCraft: () => void;
}> = ({ recipe, playerCharacter, onCraft }) => {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);

    const checkRequirements = useMemo(() => {
        const inventoryMap = new Map<string, number>();
        playerCharacter.inventory.forEach(item => {
            inventoryMap.set(item.name, (inventoryMap.get(item.name) || 0) + item.count);
        });

        const hasSkill = !recipe.requiredKnowledgeSkill || playerCharacter.passiveSkills.some(skill => 
            skill.skillName === recipe.requiredKnowledgeSkill!.skillName &&
            skill.masteryLevel >= recipe.requiredKnowledgeSkill!.requiredMasteryLevel
        );

        const materials = recipe.requiredMaterials.map(mat => {
            const hasCount = (inventoryMap.get(mat.materialName) || 0);
            return {
                ...mat,
                has: hasCount >= mat.quantity,
                hasCount: hasCount
            };
        });

        const tools = recipe.requiredTools.map(tool => ({
            name: tool,
            has: playerCharacter.inventory.some(item => item.name === tool)
        }));

        const canCraft = hasSkill && materials.every(m => m.has) && tools.every(t => t.has);

        return { hasSkill, materials, tools, canCraft };
    }, [recipe, playerCharacter]);

    return (
        <div className="bg-gray-900/40 rounded-lg border border-gray-700/50">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 text-left">
                <span className="font-semibold text-cyan-400">{recipe.recipeName} -{'>'} {recipe.craftedItemName} x{recipe.outputQuantity}</span>
                {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
            </button>
            {isOpen && (
                <div className="p-3 border-t border-gray-700/50 space-y-3">
                    <p className="text-sm italic text-gray-400">{recipe.description}</p>
                    
                    <div>
                        <h4 className="font-semibold text-gray-300 text-sm mb-1">{t('Requirements')}</h4>
                        <ul className="text-xs space-y-1">
                            {recipe.requiredKnowledgeSkill && (
                                <li className={`flex items-center gap-2 ${checkRequirements.hasSkill ? 'text-green-400' : 'text-red-400'}`}>
                                    {checkRequirements.hasSkill ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                                    <span>{recipe.requiredKnowledgeSkill.skillName} ({t('Mastery Level')} {recipe.requiredKnowledgeSkill.requiredMasteryLevel})</span>
                                </li>
                            )}
                            {checkRequirements.materials.map((mat, i) => (
                                <li key={i} className={`flex items-center gap-2 ${mat.has ? 'text-green-400' : 'text-red-400'}`}>
                                    {mat.has ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                                    <span>{mat.materialName} ({mat.hasCount}/{mat.quantity})</span>
                                </li>
                            ))}
                            {checkRequirements.tools.map((tool, i) => (
                                <li key={i} className={`flex items-center gap-2 ${tool.has ? 'text-green-400' : 'text-red-400'}`}>
                                    {tool.has ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                                    <span>{t('Tool')}: {tool.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <button 
                        onClick={onCraft}
                        disabled={!checkRequirements.canCraft}
                        className="w-full mt-2 px-4 py-2 text-sm font-bold text-white rounded-md transition-colors bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {t('Craft')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default function CraftingScreen({ playerCharacter, craftItem }: CraftingScreenProps) {
    const { t } = useLocalization();

    const knownRecipes = playerCharacter.knownRecipes;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text flex items-center gap-2">
                <BeakerIcon className="w-6 h-6" />
                {t('Crafting')}
            </h3>
            
            {knownRecipes && knownRecipes.length > 0 ? (
                <div className="space-y-2">
                    {knownRecipes.map(recipe => (
                        <RecipeDetails 
                            key={recipe.recipeName} 
                            recipe={recipe} 
                            playerCharacter={playerCharacter} 
                            onCraft={() => craftItem(recipe.recipeName)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 p-6 bg-gray-900/20 rounded-lg">
                    <p>{t('You do not know any recipes yet. You might learn them from books, trainers, or through practice with Knowledge-Based skills.')}</p>
                </div>
            )}
        </div>
    );
}