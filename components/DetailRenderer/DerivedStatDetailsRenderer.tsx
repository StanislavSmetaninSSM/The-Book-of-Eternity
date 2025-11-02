import React from 'react';
import Section from './Shared/Section';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

interface DerivedStatDetailsProps {
    data: { name: string, value: string, breakdown: { label: string, value: string }[], description: string };
}

const DerivedStatDetailsRenderer: React.FC<DerivedStatDetailsProps> = ({ data }) => {
    const { t } = useLocalization();
    return (
    <div className="space-y-4">
        <div className="flex items-baseline gap-4">
            <h3 className="text-3xl font-bold text-cyan-300 capitalize">{data.name}</h3>
            <p className="text-3xl font-mono text-white">{data.value}</p>
        </div>
        <div className="text-gray-400 text-lg italic"><MarkdownRenderer content={data.description} /></div>
        <Section title={t("Calculation Breakdown")} icon={AcademicCapIcon}>
            {data.breakdown.map((item, i) => {
                if (item.label === '---') {
                    return <div key={i} className="pt-2 mt-2 border-t border-gray-700/50" />;
                }
                return (
                    <div key={i} className="flex justify-between items-start py-2 border-b border-gray-700/50">
                        <span className="font-semibold text-gray-400 flex items-center gap-2">{item.label}</span>
                        <span className="text-right font-mono">{item.value}</span>
                    </div>
                )
            })}
        </Section>
    </div>
    );
};

export default DerivedStatDetailsRenderer;