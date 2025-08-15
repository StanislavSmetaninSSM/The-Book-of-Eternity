
import React, { useState, useEffect, useRef } from 'react';
import { ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../context/LocalizationContext';

interface ImageRendererProps {
  prompt: string | null;
  className?: string;
  alt?: string;
  showRegenerateButton?: boolean;
  width?: number;
  height?: number;
  imageCache: Record<string, string>;
  onImageGenerated: (prompt: string, base64: string) => void;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ prompt, className = '', alt, showRegenerateButton = false, width = 512, height = 512, imageCache, onImageGenerated }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const { t } = useLocalization();
  const prevRegenCount = useRef(regenerationCount);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchAndCacheImage = async () => {
      const regenerationJustTriggered = regenerationCount > prevRegenCount.current;
      
      if (!prompt) {
        setIsLoading(false);
        setError(true);
        return;
      }
      
      const cacheKey = prompt;

      if (!regenerationJustTriggered && imageCache[cacheKey]) {
        setImageUrl(imageCache[cacheKey]);
        setIsLoading(false);
        setError(false); // Reset error state if a cached image is found
        return;
      }

      setIsLoading(true);
      setError(false);

      try {
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${Math.random() + regenerationCount}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Image fetch failed');
        }
        
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = () => {
            if (!isCancelled) {
                const base64data = reader.result as string;
                onImageGenerated(cacheKey, base64data);
            }
        };
        reader.readAsDataURL(blob);

      } catch (err) {
        if (!isCancelled) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    fetchAndCacheImage();
    
    prevRegenCount.current = regenerationCount;

    return () => {
      isCancelled = true;
    };
  }, [prompt, regenerationCount, width, height, imageCache, onImageGenerated]);

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRegenerationCount(count => count + 1);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && prompt) {
          if (!file.type.startsWith('image/')) {
              alert(t("Please select an image file."));
              return;
          }
          setIsLoading(true);
          setError(false);
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64data = reader.result as string;
              onImageGenerated(prompt, base64data);
          };
          reader.readAsDataURL(file);
      }
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };
  
  return (
    <div className={`relative group bg-gray-800 ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center h-full w-full animate-pulse">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      {!isLoading && error && (
        <div className="flex items-center justify-center h-full w-full text-gray-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      {!isLoading && !error && imageUrl && (
        <img src={imageUrl} alt={alt || t('Generated image')} className="object-cover w-full h-full" />
      )}
      {showRegenerateButton && (
        <div className="absolute top-2 right-2 flex gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
             <button
                onClick={handleUploadClick}
                disabled={isLoading}
                className="bg-gray-900/60 text-white p-2 rounded-full hover:bg-black/80 transition-all opacity-50 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("Upload Image")}
            >
                <ArrowUpTrayIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isLoading}
              className="bg-gray-900/60 text-white p-2 rounded-full hover:bg-black/80 transition-all opacity-50 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t("Regenerate Image")}
            >
                <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
        </div>
      )}
    </div>
  );
};

export default ImageRenderer;
