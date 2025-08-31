
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../context/LocalizationContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showFontSizeControls?: boolean;
  size?: 'default' | 'fullscreen';
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24];
const FONT_SIZE_CLASSES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, showFontSizeControls = false, size = 'default' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 672, height: 'auto' as number | 'auto' }); // 672px is max-w-2xl
  const [isResizing, setIsResizing] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(2); // Corresponds to 16px
  const wasResizing = useRef(false);
  const { t } = useLocalization();

  // Keyboard close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Resizing logic
  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    if (isResizing) {
        wasResizing.current = true;
        setIsResizing(false);
    }
  }, [isResizing]);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing && modalRef.current) {
      const newWidth = mouseMoveEvent.clientX - modalRef.current.getBoundingClientRect().left;
      const newHeight = mouseMoveEvent.clientY - modalRef.current.getBoundingClientRect().top;
      
      setDimensions({
        width: Math.max(MIN_WIDTH, newWidth),
        height: Math.max(MIN_HEIGHT, newHeight),
      });
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleOverlayClick = () => {
    if (wasResizing.current) {
      wasResizing.current = false;
      return;
    }
    onClose();
  };

  const increaseFontSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSizeIndex(prev => Math.min(prev + 1, FONT_SIZES.length - 1));
  };

  const decreaseFontSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFontSizeIndex(prev => Math.max(prev - 1, 0));
  };

  if (!isOpen) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const childrenWithFontSize = showFontSizeControls
    ? React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              className: `${(child.props as any).className || ''} ${FONT_SIZE_CLASSES[fontSizeIndex]}`
            })
          : child
      )
    : children;
    
  const sizeClasses = {
    default: 'max-w-2xl max-h-[90vh] rounded-lg',
    fullscreen: 'w-screen h-screen max-w-full max-h-full rounded-none border-0'
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .resizer {
          position: absolute;
          width: 12px;
          height: 12px;
          bottom: 0;
          right: 0;
          cursor: se-resize;
          z-index: 10;
        }
        .resizer::after {
          content: '';
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 8px;
          height: 8px;
          border-bottom: 2px solid rgba(107, 114, 128, 0.7);
          border-right: 2px solid rgba(107, 114, 128, 0.7);
        }
      `}</style>
      <div
        ref={modalRef}
        className={`bg-gray-800/90 shadow-2xl flex flex-col border border-cyan-500/30 ring-1 ring-cyan-500/20 relative ${sizeClasses[size]}`}
        style={size === 'default' ? {
          width: `${dimensions.width}px`,
          height: dimensions.height === 'auto' ? 'auto' : `${dimensions.height}px`,
        } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700/60 sticky top-0 bg-gray-800/90 rounded-t-lg z-10 flex-shrink-0">
          <h2 className="text-xl font-bold text-cyan-400 narrative-text">{title}</h2>
          <div className="flex items-center gap-4">
            {showFontSizeControls && (
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSizeIndex === 0}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
                  aria-label={t("Decrease font size")}
                  title={t("Decrease font size")}
                >
                  <MinusIcon className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-400 font-mono w-6 text-center">{FONT_SIZES[fontSizeIndex]}px</span>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSizeIndex === FONT_SIZES.length - 1}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
                  aria-label={t("Increase font size")}
                  title={t("Increase font size")}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label={t("Close modal")}>
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main className={`p-6 overflow-y-auto ${size === 'fullscreen' ? 'flex-1 flex flex-col' : ''}`}>
          {childrenWithFontSize}
        </main>
        {size === 'default' && (
          <div
            className="resizer"
            onMouseDown={startResizing}
          />
        )}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;