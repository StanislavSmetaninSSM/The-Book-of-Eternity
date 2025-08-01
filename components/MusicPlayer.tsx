
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { XMarkIcon, MusicalNoteIcon, ArrowPathIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../context/LocalizationContext';

interface MusicPlayerProps {
  videoIds: string[];
  onClear: () => void;
  onRegenerate: () => void;
}

const MIN_WIDTH = 280;
const MIN_HEIGHT = 200;

const MusicPlayer: React.FC<MusicPlayerProps> = ({ videoIds, onClear, onRegenerate }) => {
  const { t } = useLocalization();
  const playerRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const [position, setPosition] = useState({ 
    x: window.innerWidth - 300 - 16, // 300 width + 16px right margin
    y: window.innerHeight - 220 - 16, // 220 height + 16px bottom margin
  });
  const [size, setSize] = useState({ w: 300, h: 220 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, initialW: 0, initialH: 0 });

  const firstVideoId = videoIds[0];
  const playlistString = videoIds.join(',');
  const embedUrl = `https://www.youtube.com/embed/${firstVideoId}?autoplay=1&controls=1&loop=1&playlist=${playlistString}`;

  const onDragMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  }, [position]);

  const onResizeMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialW: size.w,
      initialH: size.h,
    };
  }, [size]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      });
    }
    if (isResizing) {
      const dw = e.clientX - resizeStartRef.current.x;
      const dh = e.clientY - resizeStartRef.current.y;
      setSize({
        w: Math.max(MIN_WIDTH, resizeStartRef.current.initialW + dw),
        h: Math.max(MIN_HEIGHT, resizeStartRef.current.initialH + dh),
      });
    }
  }, [isDragging, isResizing]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isResizing, onMouseMove, onMouseUp]);


  return (
    <div 
      ref={playerRef}
      className="music-player"
      style={{
        width: isMinimized ? `${MIN_WIDTH}px` : `${size.w}px`,
        height: isMinimized ? 'auto' : `${size.h}px`,
        minHeight: isMinimized ? 'auto' : `${MIN_HEIGHT}px`,
        top: '0px',
        left: '0px',
        transform: `translate(${position.x}px, ${position.y}px)`,
        opacity: 1
      }}
    >
      <div className="music-player-header" onMouseDown={onDragMouseDown}>
        <div className="flex items-center gap-2">
            <MusicalNoteIcon className="w-4 h-4 text-cyan-400" />
            <span className="music-player-title">{t('Music Player')}</span>
        </div>
        <div className="flex items-center gap-1">
            <button onClick={onRegenerate} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white" title={t("Regenerate")}>
                <ArrowPathIcon className="w-4 h-4" />
            </button>
            {isMinimized ? (
                <button onClick={() => setIsMinimized(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white" title={t("Expand")}>
                    <PlusIcon className="w-4 h-4" />
                </button>
            ) : (
                <button onClick={() => setIsMinimized(true)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white" title={t("Minimize")}>
                    <MinusIcon className="w-4 h-4" />
                </button>
            )}
            <button onClick={onClear} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white" title={t("Close")}>
              <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
      <div className="music-player-content" style={{ display: isMinimized ? 'none' : 'block' }}>
        <iframe
            src={embedUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
      </div>
      <div 
        className="music-player-resizer"
        onMouseDown={onResizeMouseDown}
        style={{ display: isMinimized ? 'none' : 'block' }}
      />
    </div>
  );
};

export default MusicPlayer;