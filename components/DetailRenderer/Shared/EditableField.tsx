
import React, { useState } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../../context/LocalizationContext';
import MarkdownRenderer from '../../MarkdownRenderer';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  isEditable: boolean;
  as?: 'textarea' | 'input';
  className?: string;
  id?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  isEditable,
  as = 'textarea',
  className = '',
  id,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const { t } = useLocalization();

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  if (!isEditable) {
    return <MarkdownRenderer content={value || `*${t('empty')}*`} className={className} />;
  }

  if (isEditing) {
    const InputComponent = as === 'textarea' ? 'textarea' : 'input';
    return (
      <div className="bg-gray-900/50 p-2 rounded-md border border-cyan-500 animate-pulse-glow">
        <style>{`.animate-pulse-glow { animation: pulse-glow 1.5s infinite alternate; } @keyframes pulse-glow { from { box-shadow: 0 0 2px 0px #06b6d4; } to { box-shadow: 0 0 6px 2px #06b6d4; } }`}</style>
        <label htmlFor={id} className="block text-xs font-medium text-cyan-400 mb-1">{label}</label>
        <InputComponent
          id={id}
          value={currentValue}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setCurrentValue(e.target.value)}
          className="w-full bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 transition"
          rows={as === 'textarea' ? 5 : undefined}
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={handleCancel} className="px-3 py-1 text-xs rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition">{t('Cancel')}</button>
          <button onClick={handleSave} className="px-3 py-1 text-xs rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition">{t('Save')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)} title={t('Edit')}>
      <MarkdownRenderer content={value || `*${t('empty')}*`} className={`${className} group-hover:bg-gray-700/50 p-1 rounded-md transition-colors`} />
      <PencilSquareIcon className="absolute top-1 right-1 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default EditableField;
