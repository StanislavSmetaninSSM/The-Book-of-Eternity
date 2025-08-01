
import React from 'react';
import { ChatMessage } from '../types';
import { BookOpenIcon, ArrowPathIcon, PencilSquareIcon, SpeakerWaveIcon, StopCircleIcon } from '@heroicons/react/24/solid';
import { XCircleIcon } from '@heroicons/react/24/outline';
import MarkdownRenderer from './MarkdownRenderer';
import { useLocalization } from '../context/LocalizationContext';
import { useSpeech } from '../context/SpeechContext';

interface ChatWindowProps {
  history: ChatMessage[];
  error: string | null;
  onDeleteMessage: (index: number) => void;
  onShowMessageModal: (content: string) => void;
  onResend?: () => void;
  onShowEditModal: (index: number, message: ChatMessage) => void;
  allowHistoryManipulation: boolean;
}

// Helper function to strip markdown for cleaner speech
const stripMarkdown = (text: string) => {
  // This is a simplified stripper. It removes links, images, bold, italics, headers, and code ticks.
  return text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')   // images
    .replace(/(\*\*|__)(.*?)\1/g, '$2')    // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')       // italics
    .replace(/#{1,6}\s/g, '')              // headers
    .replace(/`/g, '');                    // code
};


export default function ChatWindow({ history, error, onDeleteMessage, onShowMessageModal, onResend, onShowEditModal, allowHistoryManipulation }: ChatWindowProps): React.ReactNode {
  const { t } = useLocalization();
  const { speak, isSpeaking, currentlySpeakingText } = useSpeech();
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="space-y-6">
      {history.map((msg, index) => {
        const strippedContent = stripMarkdown(msg.content);
        const isThisMessageSpeaking = isSpeaking && currentlySpeakingText === strippedContent;
        
        return (
          <div key={index} className={`flex items-start group ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
            {/* For player messages, buttons are on the left */}
            {msg.sender === 'player' && allowHistoryManipulation && (
              <div className="flex items-center self-center opacity-40 group-hover:opacity-100 transition-opacity mr-2 flex-shrink-0 pointer-events-auto space-x-1">
                <button 
                  onClick={() => onShowEditModal(index, msg)} 
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                  aria-label={t("Edit")}
                  title={t("Edit")}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDeleteMessage(index)} 
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                  aria-label={t("Delete message")}
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* The message bubble itself */}
            <div className={`flex items-start max-w-full`}>
              {msg.sender === 'gm' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 flex-shrink-0 border border-gray-600">
                  <BookOpenIcon className="w-5 h-5 text-cyan-400" />
                </div>
              )}
              <div
                onClick={() => onShowMessageModal(msg.content)}
                className={`max-w-xl lg:max-w-3xl px-5 py-3 rounded-xl shadow-md cursor-pointer transition-all pointer-events-auto ${
                  msg.sender === 'player'
                    ? 'bg-cyan-600 text-white rounded-br-none hover:bg-cyan-500'
                    : 'bg-gray-800 text-gray-300 rounded-bl-none narrative-text hover:bg-gray-700'
                }`}
              >
                <MarkdownRenderer content={msg.content} />
              </div>
            </div>

            {/* For GM/System messages, buttons are on the right */}
            {msg.sender !== 'player' && (
              <div className="flex items-center self-center opacity-40 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0 pointer-events-auto space-x-1">
                <button
                  onClick={() => speak(strippedContent)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                  aria-label={isThisMessageSpeaking ? t("Stop speech") : t("Read aloud")}
                  title={isThisMessageSpeaking ? t("Stop speech") : t("Read aloud")}
                >
                  {isThisMessageSpeaking 
                    ? <StopCircleIcon className="w-5 h-5 text-cyan-400 animate-pulse" />
                    : <SpeakerWaveIcon className="w-5 h-5" />
                  }
                </button>
                {allowHistoryManipulation && (
                  <>
                    <button 
                      onClick={() => onShowEditModal(index, msg)} 
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                      aria-label={t("Edit")}
                      title={t("Edit")}
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDeleteMessage(index)} 
                      className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                      aria-label={t("Delete message")}
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
      {error && (
         <div className="flex justify-start pointer-events-auto">
            <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-red-300 font-bold">!</span>
            </div>
            <div className="max-w-xl lg:max-w-2xl px-5 py-3 rounded-xl bg-red-900/50 text-red-300 rounded-bl-none">
                <p className="font-semibold mb-1">{t("System Error")}</p>
                <MarkdownRenderer content={error} />
                {onResend && (
                  <button
                    onClick={onResend}
                    className="mt-2 flex items-center gap-2 px-3 py-1 text-xs font-semibold text-yellow-300 bg-yellow-600/20 rounded-md hover:bg-yellow-600/40 transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    {t("Repeat last action")}
                  </button>
                )}
            </div>
         </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}