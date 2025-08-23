import React, { useState, useMemo, useRef, useCallback } from 'react';
import { 
    PaperAirplaneIcon, 
    ArrowPathIcon, 
    QuestionMarkCircleIcon, 
    XCircleIcon,
    ListBulletIcon,
    CodeBracketIcon,
    ChatBubbleLeftEllipsisIcon,
    EyeIcon,
    EyeSlashIcon,
    MusicalNoteIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '@heroicons/react/24/solid';
import { ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { ChatMessage, GameSettings, PlayerCharacter } from '../types';
import { useLocalization } from '../context/LocalizationContext';
import MarkdownRenderer from './MarkdownRenderer';
import LoadingSpinner from './LoadingSpinner';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  onAskQuestion: (question: string) => void;
  onCancelRequest: () => void;
  onClearHalfHistory: () => void;
  isLoading: boolean;
  history: ChatMessage[];
  suggestedActions: string[];
  playerCharacter: PlayerCharacter | null;
  gameSettings: GameSettings | null;
  onGetMusicSuggestion: () => void;
  isMusicLoading: boolean;
  isMusicPlayerVisible: boolean;
}

const ToolbarButton: React.FC<{
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ onClick, title, children }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="p-2 rounded-md transition-colors disabled:opacity-50 bg-gray-700/60 text-gray-300 hover:bg-gray-700 w-8 h-8 flex items-center justify-center"
    >
        {children}
    </button>
);

const MarkdownToolbar: React.FC<{
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    onInsert: (text: string) => void;
}> = ({ textareaRef, onInsert }) => {
    const { t } = useLocalization();
    
    const applyFormat = (syntaxStart: string, syntaxEnd: string = syntaxStart) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let newText;
        let cursorOffset;

        if (selectedText) {
            newText = `${syntaxStart}${selectedText}${syntaxEnd}`;
            cursorOffset = start + newText.length;
        } else {
            newText = `${syntaxStart}${syntaxEnd}`;
            cursorOffset = start + syntaxStart.length;
        }
        
        insertText(newText, start, end, cursorOffset);
    };
    
    const applyLinePrefix = (prefix: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const currentLineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
        const newText = prefix;

        insertText(newText, currentLineStart, currentLineStart, prefix.length);
    };

    const insertText = (textToInsert: string, selectionStart: number, selectionEnd: number, newCursorPos: number) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const before = textarea.value.substring(0, selectionStart);
        const after = textarea.value.substring(selectionEnd);
        const newFullText = `${before}${textToInsert}${after}`;
        
        onInsert(newFullText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };


    return (
        <div className="flex items-center gap-1 p-1 bg-slate-700 rounded-t-lg border-2 border-slate-600 border-b-0">
            <ToolbarButton onClick={() => applyFormat('**')} title={t('Bold')}>
                <span className="font-bold text-sm">B</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('*')} title={t('Italic')}>
                <span className="italic text-sm">I</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('~~')} title={t('Strikethrough')}>
                <span className="line-through text-sm">S</span>
            </ToolbarButton>
            <div className="w-px h-5 bg-slate-600 mx-1"></div>
            <ToolbarButton onClick={() => applyLinePrefix('* ')} title={t('Bulleted List')}>
                <ListBulletIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => applyLinePrefix('> ')} title={t('Blockquote')}>
                <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('```\n', '\n```')} title={t('Code Block')}>
                <CodeBracketIcon className="w-4 h-4" />
            </ToolbarButton>
        </div>
    );
}

export default function InputBar({ onSendMessage, onAskQuestion, onCancelRequest, onClearHalfHistory, isLoading, history, suggestedActions, playerCharacter, gameSettings, onGetMusicSuggestion, isMusicLoading, isMusicPlayerVisible }: InputBarProps): React.ReactNode {
  const [content, setContent] = useState('');
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [activeView, setActiveView] = useState<'write' | 'preview'>('write');
  const [isSuggestionsExpanded, setIsSuggestionsExpanded] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLocalization();

  const lastPlayerMessage = useMemo(() => 
    history.slice().reverse().find(m => m.sender === 'player'),
  [history]);
  
  const doSubmit = useCallback(() => {
    if (isLoading || content.trim() === '') return;
    
    if (isQuestionMode) {
        onAskQuestion(content);
        setIsQuestionMode(false);
    } else {
        onSendMessage(content);
    }
    
    setContent('');
    setActiveView('write');
    setTimeout(() => textareaRef.current?.focus(), 0);

  }, [isLoading, isQuestionMode, onAskQuestion, onSendMessage, content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          doSubmit();
      }
  };

  const handleRepeat = () => {
    if (lastPlayerMessage && !isLoading) {
      const isLastMessageAQuestion = lastPlayerMessage.content.startsWith('[Question]');
      
      if (isLastMessageAQuestion) {
        const originalQuestion = lastPlayerMessage.content.substring('[Question] '.length);
        onAskQuestion(originalQuestion);
      } else {
        onSendMessage(lastPlayerMessage.content);
      }
    }
  };

  const stealthState = playerCharacter?.stealthState;

  const handleToggleStealth = () => {
    if (isLoading) return;
    if (stealthState?.isActive) {
        onSendMessage(t("exitStealthAction"));
    } else {
        onSendMessage(t("enterStealthAction"));
    }
  };

  const getDetectionColor = (level: number) => {
    if (level >= 76) return 'bg-red-500';
    if (level >= 51) return 'bg-orange-500';
    if (level >= 26) return 'bg-yellow-500';
    return 'bg-cyan-500';
  };


  return (
    <form onSubmit={(e) => { e.preventDefault(); doSubmit(); }} className="mt-auto space-y-2 pointer-events-auto">
      {suggestedActions && suggestedActions.length > 0 && !isLoading && (
        <div className="pb-2">
          <div className="flex justify-center items-center mb-2">
            <button
              type="button"
              onClick={() => setIsSuggestionsExpanded(prev => !prev)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-1 px-3 rounded-full"
              aria-expanded={isSuggestionsExpanded}
              title={isSuggestionsExpanded ? t('Collapse Suggestions') : t('Expand Suggestions')}
            >
              <span>{t('Suggested Actions')}</span>
              {isSuggestionsExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
            </button>
          </div>
          {isSuggestionsExpanded && (
            <div className="flex flex-wrap gap-2 justify-center animate-fade-in-down-fast">
              {suggestedActions.map((action, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSendMessage(action)}
                  className="px-4 py-2 text-sm bg-gray-700/60 text-cyan-300 rounded-full hover:bg-cyan-600/60 hover:text-white transition-all shadow-md transform hover:-translate-y-0.5"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {stealthState?.isActive && (
        <div className="bg-gray-900/50 p-2 rounded-lg mb-2 border border-purple-500/30 text-sm">
            <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-purple-300">{t('Detection Level')}</span>
                <span className="font-mono text-white">{stealthState.detectionLevel}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${getDetectionColor(stealthState.detectionLevel)}`}
                    style={{ width: `${stealthState.detectionLevel}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-400 italic mt-1.5 text-center">{t(stealthState.description as any)}</p>
        </div>
      )}
      <div className={`relative transition-all bg-slate-800 rounded-lg border-2 border-slate-600 ${isLoading ? 'opacity-70' : ''}`}>
        <div className="flex border-b border-slate-600">
          <button
            type="button"
            onClick={() => setActiveView('write')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeView === 'write' ? 'bg-slate-700 text-cyan-300' : 'text-gray-400 hover:bg-slate-700/50'}`}
          >
            {t('Write')}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('preview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeView === 'preview' ? 'bg-slate-700 text-cyan-300' : 'text-gray-400 hover:bg-slate-700/50'}`}
          >
            {t('Preview')}
          </button>
        </div>
        
        {activeView === 'write' ? (
          <div>
            <MarkdownToolbar textareaRef={textareaRef} onInsert={setContent} />
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={isQuestionMode ? t("Ask the Game Master a question...") : t("What do you do next?")}
                className="w-full bg-slate-800 text-slate-300 p-3 rounded-b-lg border-t-0 focus:ring-0 focus:outline-none transition min-h-[120px] max-h-[300px] resize-none font-sans text-base ring-0"
            />
          </div>
        ) : (
          <div className="p-3 min-h-[158px] max-h-[338px] overflow-y-auto">
            {content.trim() ? (
              <MarkdownRenderer content={content} />
            ) : (
              <p className="text-slate-500 italic">{t('Nothing to preview yet.')}</p>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={handleToggleStealth}
                disabled={isLoading}
                aria-label={stealthState?.isActive ? t("Exit Stealth Mode") : t("Enter Stealth Mode")}
                className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${stealthState?.isActive ? 'bg-purple-600/30 text-purple-300 hover:bg-purple-600/50' : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'}`}
                title={stealthState?.isActive ? t("Exit Stealth Mode") : t("Enter Stealth Mode")}
            >
                {stealthState?.isActive ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
            <button
                type="button"
                onClick={() => setIsQuestionMode(prev => !prev)}
                disabled={isLoading}
                aria-label={isQuestionMode ? t("Switch to action mode") : t("Switch to question mode")}
                className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isQuestionMode ? 'bg-purple-600/30 text-purple-300 hover:bg-purple-600/50' : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700'}`}
                title={t("Ask a question (OOC)")}
            >
                <QuestionMarkCircleIcon className="h-5 w-5" />
            </button>
            <button
                type="button"
                onClick={handleRepeat}
                disabled={!lastPlayerMessage || isLoading}
                aria-label={t("Repeat last message")}
                className="p-2 rounded-md bg-gray-700/60 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("Repeat last message")}
            >
                <ArrowPathIcon className="h-5 w-5" />
            </button>
            {gameSettings?.youtubeApiKey && (
                <button
                    type="button"
                    onClick={onGetMusicSuggestion}
                    disabled={isLoading || isMusicLoading}
                    aria-label={isMusicPlayerVisible ? t("Show Music Player") : t("Get Music Suggestion")}
                    className="p-2 rounded-md bg-gray-700/60 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isMusicPlayerVisible ? t("Show Music Player") : t("Get Music Suggestion")}
                >
                    {isMusicLoading ? <LoadingSpinner /> : <MusicalNoteIcon className="h-5 w-5" />}
                </button>
            )}
             <button
                type="button"
                onClick={onClearHalfHistory}
                disabled={isLoading || history.length < 2}
                aria-label={t("Clear half of chat")}
                className="p-2 rounded-md bg-gray-700/60 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("Clear half of chat")}
            >
                <ArchiveBoxXMarkIcon className="h-5 w-5" />
            </button>
        </div>
        
        {isLoading ? (
            <button
                type="button"
                onClick={onCancelRequest}
                aria-label={t("Stop sending")}
                className="p-2 bg-red-600 rounded-md hover:bg-red-500 transition-colors flex items-center justify-center w-[76px] h-[40px]"
            >
                <XCircleIcon className="h-6 w-6 text-white" />
            </button>
        ) : (
            <button
                type="submit"
                disabled={isLoading || content.trim() === ''}
                aria-label={t("Send message")}
                className="p-2 bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 flex items-center justify-center w-[76px] h-[40px]"
            >
                <PaperAirplaneIcon className="h-6 w-6 text-white" />
            </button>
        )}

      </div>
    </form>
  );
}