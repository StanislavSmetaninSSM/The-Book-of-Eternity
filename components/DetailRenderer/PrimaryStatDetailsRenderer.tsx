import React from 'react';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';

interface PrimaryStatDetailsProps {
    data: { name: string, description: string };
}

const PrimaryStatDetailsRenderer: React.FC<PrimaryStatDetailsProps> = ({ data }) => {
    const { t } = useLocalization();
    return (
     <div className="space-y-4">
        <h3 className="text-3xl font-bold text-cyan-300 capitalize">{t(data.name)}</h3>
        <div className="text-gray-400 text-lg italic"><MarkdownRenderer content={data.description} /></div>
    </div>
    );
};

export default PrimaryStatDetailsRenderer;