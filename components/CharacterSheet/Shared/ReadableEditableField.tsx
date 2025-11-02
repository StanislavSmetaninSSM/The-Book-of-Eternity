import React from 'react';
import MarkdownRenderer from '../../MarkdownRenderer';
import EditableField from '../../DetailRenderer/Shared/EditableField';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { PlayerCharacter, NPC } from '../../../types';

type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

interface ReadableEditableFieldProps {
    label: string;
    value: string;
    isEditable: boolean;
    onSave: (value: any) => void;
    onRead: () => void;
    as?: 'input' | 'textarea';
    t: TFunction;
}

const ReadableEditableField: React.FC<ReadableEditableFieldProps> = ({ label, value, isEditable, onSave, onRead, as = 'textarea', t }) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold text-gray-400">{label}</h5>
            <button onClick={onRead} className="p-1 text-gray-400 rounded-full hover:bg-gray-700/50 hover:text-white transition-colors" title={t('Read')}>
                <BookOpenIcon className="w-4 h-4" />
            </button>
        </div>
        <div className="pl-2 border-l-2 border-gray-700/50">
            {isEditable ? (
                <EditableField label={label} value={value} isEditable={true} onSave={onSave} as={as} />
            ) : (
                <MarkdownRenderer content={value} className="text-sm text-gray-300" />
            )}
        </div>
    </div>
);

export default ReadableEditableField;
