import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  model?: 'flux' | 'kontext' | 'turbo';
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ prompt, className = '', alt, showRegenerateButton = false, width = 512, height = 512, imageCache, onImageGenerated, model = 'flux' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const { t } = useLocalization();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const imageUrl = prompt ? imageCache[prompt] : undefined;

  const fetchAndCacheImage = useCallback(async (currentPrompt: string, isRegeneration: boolean) => {
    // Only show loading state if we don't have an image to display,
    // or if it's an explicit regeneration request.
    if (!imageUrl || isRegeneration) {
        setIsLoading(true);
    }
    setError(false);
    
    try {
      const encodedPrompt = encodeURIComponent(currentPrompt);
      const seed = Date.now() + Math.random();
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Image fetch failed');
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // The parent updates its state, which will cause a re-render of this component
        // with the new imageCache prop. The useEffect below will then handle turning off loading.
        onImageGenerated(currentPrompt, base64data);
      };
      reader.readAsDataURL(blob);

    } catch (err) {
      console.error("Image fetch error:", err);
      setError(true);
      setIsLoading(false);
    }
  }, [width, height, onImageGenerated, imageUrl, model]); // imageUrl is a dependency now

  useEffect(() => {
    if (!prompt) {
      setIsLoading(false);
      setError(true);
      return;
    }

    // This effect is now purely reactive to the props from the parent.
    // Its main job is to determine if we need to fetch an image, or if the
    // data we have is sufficient.
    if (imageUrl) {
      // If we have an image URL from the cache, we are done loading and there's no error.
      // This handles both initial load completion and regeneration completion.
      setIsLoading(false);
      setError(false);
    } else {
      // If there's no image in the cache for this prompt, we need to fetch it.
      fetchAndCacheImage(prompt, false);
    }
  }, [prompt, imageUrl, fetchAndCacheImage]); // Depend on imageUrl which comes from imageCache prop

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prompt) {
      // Directly trigger the fetch, marking it as a regeneration.
      fetchAndCacheImage(prompt, true);
    }
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
              onImageGenerated(prompt, base64data); // Update central cache
          };
          reader.readAsDataURL(file);
      }
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  return (
    <div className={`relative group bg-gray-800 ${className}`}>
      {/* Base Layer: Either the current image or a placeholder */}
      {imageUrl && !error ? (
        <img src={imageUrl} alt={alt || t('Generated image')} className="object-cover w-full h-full" />
      ) : !isLoading && !error && (
        <div className="flex items-center justify-center h-full w-full">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Overlays for loading and error states */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center h-full w-full bg-gray-800/70 z-10">
          <svg className="w-8 h-8 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {!isLoading && error && (
        <div className="absolute inset-0 flex items-center justify-center h-full w-full bg-gray-800/80 text-gray-500 z-10">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
      
      {/* Control Buttons */}
      {showRegenerateButton && (
        <div className="absolute top-2 right-2 flex gap-2 z-20">
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