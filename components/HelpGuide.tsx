import React from 'react';
import { BookOpenIcon, ShieldCheckIcon, BeakerIcon, FingerPrintIcon, CubeIcon, CpuChipIcon, QuestionMarkCircleIcon, AcademicCapIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';
import MarkdownRenderer from './MarkdownRenderer';

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/50 shadow-md">
        <h3 className="text-xl font-bold text-cyan-400 mb-3 narrative-text flex items-center gap-2">
            <Icon className="w-6 h-6" />
            {title}
        </h3>
        <div className="space-y-3 prose prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 text-gray-300">
            {children}
        </div>
    </div>
);

const FormulaBlock: React.FC<{ titleKey: string; descKey: string; contentKey: string; }> = ({ titleKey, descKey, contentKey }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-gray-800/50 p-3 rounded-md">
            <h4 className="font-semibold text-cyan-300">{t(titleKey)}</h4>
            <div className="text-xs text-gray-400 italic mb-2">
                <MarkdownRenderer content={t(descKey)} className="prose-p:my-0" />
            </div>
            <MarkdownRenderer content={t(contentKey)} />
        </div>
    );
};


export default function HelpGuide(): React.ReactNode {
    const { t } = useLocalization();
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-300 narrative-text">{t('HelpGuideTitle')}</h2>
            
            <Section title={t('GMMindTitle')} icon={CpuChipIcon}>
                <MarkdownRenderer content={t('GMMindFullDesc')} />
            </Section>

            <Section title={t('QuestionModeTitle')} icon={QuestionMarkCircleIcon}>
                <MarkdownRenderer content={t('QuestionModeFullDesc')} />
            </Section>

            <Section title={t('CharacteristicChecksTitle')} icon={BookOpenIcon}>
                <MarkdownRenderer content={t('CharacteristicChecksFullDesc')} />
                <div className="mt-4">
                    <FormulaBlock titleKey="CharacteristicChecksExampleTitle" descKey="CharacteristicChecksExampleScenario" contentKey="CharacteristicChecksExampleContent" />
                </div>
            </Section>

            <Section title={t('ProgressionTitle')} icon={AcademicCapIcon}>
                <MarkdownRenderer content={t('ProgressionFullDesc')} />
            </Section>

            <Section title={t('CombatTitle')} icon={ShieldCheckIcon}>
                <MarkdownRenderer content={t('CombatFullDesc')} />
            </Section>
            
            <Section title={t('LocationDifficultyTitle')} icon={ExclamationTriangleIcon}>
                <MarkdownRenderer content={t('LocationDifficultyFullDesc')} />
            </Section>

            <Section title={t('StealthAndDetectionTitle')} icon={FingerPrintIcon}>
                <MarkdownRenderer content={t('StealthAndDetectionFullDesc')} />
            </Section>
            
            <Section title={t('LootGenerationTitle')} icon={CubeIcon}>
                <MarkdownRenderer content={t('LootGenerationFullDesc')} />
                <div className="mt-4 space-y-3">
                    <h4 className="font-semibold text-cyan-300">{t('LootGenerationKeyFactorsTitle')}</h4>
                    <MarkdownRenderer content={t('LootGenerationKeyFactorsDesc')} />
                    <ul className="list-disc list-inside space-y-1">
                        <li><MarkdownRenderer content={t('LootGenerationKeyFactorsL1')} inline /></li>
                        <li><MarkdownRenderer content={t('LootGenerationKeyFactorsL2')} inline /></li>
                        <li><MarkdownRenderer content={t('LootGenerationKeyFactorsL3')} inline /></li>
                        <li><MarkdownRenderer content={t('LootGenerationKeyFactorsL4')} inline /></li>
                        <li><MarkdownRenderer content={t('LootGenerationKeyFactorsL5')} inline /></li>
                    </ul>
                    <h4 className="font-semibold text-cyan-300 pt-2">{t('LootGenerationPlayerInfluenceTitle')}</h4>
                    <MarkdownRenderer content={t('LootGenerationPlayerInfluenceDesc')} />
                    <ul className="list-disc list-inside space-y-1">
                         <li><MarkdownRenderer content={t('LootGenerationPlayerInfluenceL1')} inline /></li>
                         <li><MarkdownRenderer content={t('LootGenerationPlayerInfluenceL2')} inline /></li>
                    </ul>
                     <h4 className="font-semibold text-cyan-300 pt-2">{t('LootGenerationProcessTitle')}</h4>
                    <MarkdownRenderer content={t('LootGenerationProcessDesc')} />
                     <ul className="list-disc list-inside space-y-1">
                         <li><MarkdownRenderer content={t('LootGenerationProcessL1')} inline /></li>
                         <li><MarkdownRenderer content={t('LootGenerationProcessL2')} inline /></li>
                         <li><MarkdownRenderer content={t('LootGenerationProcessL3')} inline /></li>
                    </ul>
                     <h4 className="font-semibold text-cyan-300 pt-2">{t('LootGenerationFinalResultTitle')}</h4>
                    <MarkdownRenderer content={t('LootGenerationFinalResultDesc')} />
                </div>
            </Section>

            <Section title={t('KeyFormulasTitle')} icon={BeakerIcon}>
                <div className="space-y-3">
                    <MarkdownRenderer content={t('KeyFormulasDesc')} />
                    <FormulaBlock titleKey="KeyFormulasPrimaryStatsTitle" descKey="KeyFormulasPrimaryStatsDesc" contentKey="KeyFormulasPrimaryStatsContent" />
                    <FormulaBlock titleKey="KeyFormulasCombatStatsTitle" descKey="KeyFormulasCombatStatsDesc" contentKey="KeyFormulasCombatStatsContent" />
                    <FormulaBlock titleKey="KeyFormulasActionChecksTitle" descKey="KeyFormulasActionChecksDesc" contentKey="KeyFormulasActionChecksContent" />
                    <FormulaBlock titleKey="KeyFormulasSkillScalingTitle" descKey="KeyFormulasSkillScalingDesc" contentKey="KeyFormulasSkillScalingContent" />
                    <FormulaBlock titleKey="KeyFormulasXPTitle" descKey="KeyFormulasXPDesc" contentKey="KeyFormulasXPContent" />
                </div>
            </Section>
        </div>
    );
}