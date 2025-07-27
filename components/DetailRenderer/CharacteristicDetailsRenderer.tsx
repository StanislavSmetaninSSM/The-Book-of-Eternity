import React from 'react';
import MarkdownRenderer from '../MarkdownRenderer';
import { useLocalization } from '../../context/LocalizationContext';

interface CharacteristicDetailsProps {
    data: { name: string, value: number };
}

const CharacteristicDetailsRenderer: React.FC<CharacteristicDetailsProps> = ({ data }) => {
    const { t } = useLocalization();
    const descriptionKey = `characteristic_description_${data.name.toLowerCase()}`;
    const translatedDesc = t(descriptionKey);
    const description = translatedDesc === descriptionKey ? t('no_description_available') : translatedDesc;

    return (
        <div className="space-y-4">
            <div className="flex items-baseline gap-4">
                <h3 className="text-3xl font-bold text-cyan-300 capitalize">{t(data.name as any)}</h3>
                <p className="text-3xl font-mono text-white">{data.value}</p>
            </div>
            <div className="text-gray-400 text-lg italic"><MarkdownRenderer content={description} /></div>
        </div>
    );
};

export default CharacteristicDetailsRenderer;