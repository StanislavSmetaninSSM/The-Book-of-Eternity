
import React from 'react';
import Modal from './Modal';
import { useLocalization } from '../context/LocalizationContext';
import { ExclamationTriangleIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onClose, title, children }) => {
  const { t } = useLocalization();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
        <div className="mt-3 text-center sm:mt-5">
          <div className="mt-2">
            <div className="text-sm text-gray-300 space-y-3">
                {children}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          onClick={onConfirm}
        >
          <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          {t('Yes')}
        </button>
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          onClick={onClose}
        >
          <XMarkIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          {t('No')}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
