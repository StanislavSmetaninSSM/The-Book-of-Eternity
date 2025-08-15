
import React, { useState } from 'react';
import { useLocalization } from '../../../context/LocalizationContext';
import ConfirmationModal from '../../ConfirmationModal';
import { ArrowPathIcon, KeyIcon } from '@heroicons/react/24/outline';

interface IdDisplayProps {
  id: string | null | undefined;
  name: string;
  onRegenerate: () => void;
}

const IdDisplay: React.FC<IdDisplayProps> = ({ id, name, onRegenerate }) => {
    const { t } = useLocalization();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleRegenerateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsConfirmOpen(true);
    };

    const handleConfirm = () => {
        onRegenerate();
        setIsConfirmOpen(false);
    };

    return (
        <>
            <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="font-semibold text-gray-400 flex items-center gap-2">
                    <KeyIcon className="w-4 h-4" />
                    {t('System ID')}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-right font-mono text-xs text-gray-500 max-w-[150px] truncate" title={id || t('ID Missing')}>
                        {id || <span className="text-yellow-400 italic">{t('ID Missing')}</span>}
                    </span>
                    <button
                        onClick={handleRegenerateClick}
                        title={t('Regenerate ID')}
                        className="p-1 rounded-full text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirm}
                title={t('Regenerate ID')}
            >
                <p>{t('Are you sure you want to regenerate the ID for "{name}"?', { name })}</p>
                <p className="mt-2 text-sm text-gray-400">{t('This can fix issues with uneditable objects but might have unintended side effects. This action cannot be undone.')}</p>
            </ConfirmationModal>
        </>
    );
};

export default IdDisplay;
