import React from 'react';
import Modal from './Modal';
import MarkdownRenderer from './MarkdownRenderer';
import { useSpeech } from '../context/SpeechContext';
import { SpeakerWaveIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import { stripMarkdown } from '../utils/textUtils';
import { useLocalization } from '../context/LocalizationContext';

interface TextReaderModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

const TextReaderModal: React.FC<TextReaderModalProps> = ({ isOpen, onClose, title, content }) => {
    const { speak, cancel, isSpeaking, currentlySpeakingText } = useSpeech();
    const { t } = useLocalization();
    const strippedContent = React.useMemo(() => stripMarkdown(content), [content]);
    const isThisSpeaking = isSpeaking && currentlySpeakingText === strippedContent;

    const handleClose = () => {
        cancel();
        onClose();
    };

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation();
        speak(strippedContent);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title} showFontSizeControls={true}>
            <div className="relative">
                <div className="absolute -top-2 right-0">
                    <button
                        onClick={handleSpeak}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-opacity"
                        title={isThisSpeaking ? t("Stop speech") : t("Read aloud")}
                    >
                        {isThisSpeaking
                            ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
                            : <SpeakerWaveIcon className="w-5 h-5" />
                        }
                    </button>
                </div>
                <MarkdownRenderer content={content} />
            </div>
        </Modal>
    );
};

export default TextReaderModal;
