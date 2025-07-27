
import React, { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../context/LocalizationContext';

// Module-level cache to store loaded image URLs against their prompts.
const imageCache = new Map<string, string>();

interface ImageRendererProps {
  prompt: string;
  className?: string;
  alt?: string;
  showRegenerateButton?: boolean;
  width?: number;
  height?: number;
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ prompt, className = '', alt, showRegenerateButton = false, width = 512, height = 512 }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const { t } = useLocalization();

  useEffect(() => {
    if (!prompt) {
      setIsLoading(false);
      setError(true);
      return;
    }
    
    setIsLoading(true);
    setError(false);

    // Use width/height in cache key to avoid serving low-res images for high-res requests
    const cacheKey = `${prompt}_${width}x${height}`;
    const cachedUrl = imageCache.get(cacheKey);
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      setIsLoading(false);
      setError(false);
      return;
    }

    // Use a variable to track the prompt for this specific effect run.
    // This prevents race conditions if the prompt prop changes while an image is loading.
    const currentPrompt = prompt;
    const encodedPrompt = encodeURIComponent(prompt);
    // Add regenerationCount to the seed to ensure a new image is fetched.
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${Math.random() + regenerationCount}`;
    
    const img = new Image();
    img.src = url;

    const handleLoad = () => {
      // Only update state if the loaded image corresponds to the current prompt.
      if (currentPrompt === prompt) {
        setImageUrl(url);
        setIsLoading(false);
        setError(false);
        imageCache.set(cacheKey, url); // Cache the new URL with resolution key.
      }
    };

    const handleError = () => {
      if (currentPrompt === prompt) {
        setIsLoading(false);
        setError(true);
      }
    };
    
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [prompt, regenerationCount, width, height]); // Re-run effect if prompt or regenerationCount changes.

  const handleRegenerate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from closing if the image is inside a clickable area.
    const cacheKey = `${prompt}_${width}x${height}`;
    imageCache.delete(cacheKey); // Clear the old image from the cache.
    setRegenerationCount(count => count + 1); // Trigger the useEffect to re-fetch.
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
      {showRegenerateButton && !isLoading && (
        <button
          onClick={handleRegenerate}
          className="absolute top-2 right-2 bg-gray-900/60 text-white p-2 rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title={t("Regenerate Image")}
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default ImageRenderer;