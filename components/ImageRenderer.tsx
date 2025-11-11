import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { useLocalization } from '../context/LocalizationContext';
import { GoogleGenAI, Modality } from "@google/genai";
import { GameSettings, ImageCacheEntry } from '../types';

interface ImageRendererProps {
    prompt: string | null | undefined;
    originalTextPrompt?: string;
    className?: string;
    alt?: string;
    showRegenerateButton?: boolean;
    width?: number;
    height?: number;
    imageCache: Record<string, ImageCacheEntry | string>;
    onImageGenerated: (prompt: string, src: string, sourceProvider: ImageCacheEntry['sourceProvider'], sourceModel?: string) => void;
    onUploadCustom?: (base64: string | null) => void;
    uploadButtonPosition?: 'overlay' | 'below';
    fitMode?: 'cover' | 'natural';
    onClearCustom?: () => void;
    onClick?: () => void;
    gameSettings: GameSettings | null;
    gameIsLoading?: boolean;
    model?: 'flux' | 'turbo' | 'gptimage' | 'kontext';
    showSourceInfo?: boolean;
}

// Module-level set to track which prompts are currently being converted to base64
const conversionInProgress = new Set<string>();

interface UploadButtonProps {
    isOverlay: boolean;
    onUploadCustom?: (base64: string | null) => void;
    isLoading: boolean;
    isGenerating: boolean;
    gameIsLoading?: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = React.memo(({ isOverlay, onUploadCustom, isLoading, isGenerating, gameIsLoading }) => {
    const { t } = useLocalization();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert(t("Please select an image file."));
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64dataUrl = reader.result as string;
                if (onUploadCustom) {
                    onUploadCustom(base64dataUrl);
                }
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [onUploadCustom, t]);

    if (!onUploadCustom) return null;

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <button
                onClick={handleUploadClick}
                disabled={isLoading || isGenerating || gameIsLoading}
                className={isOverlay
                    ? "bg-gray-900/60 text-white p-2 rounded-full hover:bg-black/80 transition-all opacity-50 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    : "w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-600/20 rounded-md hover:bg-cyan-600/40 transition-colors"
                }
                title={t("Upload Image")}
            >
                <ArrowUpTrayIcon className="w-5 h-5" />
                {!isOverlay && <span>{t('Upload Custom Portrait')}</span>}
            </button>
        </>
    );
});

interface RegenerateButtonProps {
    onClick: (e: React.MouseEvent) => void;
    isLoading: boolean;
    isGenerating: boolean;
    t: (key: string) => string;
    gameIsLoading?: boolean;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = React.memo(({ onClick, isLoading, isGenerating, t, gameIsLoading }) => {
    const isDisabled = isLoading || isGenerating || gameIsLoading;

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className="bg-gray-900/60 text-white p-2 rounded-full hover:bg-black/80 transition-all opacity-50 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("Regenerate Image")}
        >
            <ArrowPathIcon className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
        </button>
    );
});


const ImageRenderer: React.FC<ImageRendererProps> = (props) => {
    const {
        prompt,
        originalTextPrompt,
        className = '',
        alt,
        showRegenerateButton = false,
        width = 512,
        height = 512,
        imageCache,
        onImageGenerated,
        onUploadCustom,
        uploadButtonPosition = 'overlay',
        fitMode = 'cover',
        onClearCustom,
        onClick,
        gameSettings,
        gameIsLoading,
        showSourceInfo = false
    } = props;

    const { t } = useLocalization();
    const [isGenerating, setIsGenerating] = useState(false);

    const generateWithNanoBanana = useCallback(async (p: string) => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: p }] },
            config: { responseModalities: [Modality.IMAGE] },
        });
        
        for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                onImageGenerated(p, imageUrl, 'Nano Banana', 'gemini-2.5-flash-image');
                return;
            }
        }
        throw new Error("Nano Banana (Gemini) response did not contain image data.");
    }, [onImageGenerated]);
    
    const generateWithImagen = useCallback(async (p: string) => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: p,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
            },
        });
    
        if (response.generatedImages && response.generatedImages[0].image.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            onImageGenerated(p, imageUrl, 'Imagen', 'imagen-4.0-generate-001');
        } else {
            throw new Error("Imagen response did not contain image data.");
        }
    }, [onImageGenerated]);


    const generateWithPollinations = useCallback(async (p: string, model: 'flux' | 'turbo' | 'gptimage' = 'flux') => {
        return new Promise<void>((resolve, reject) => {
            const newSeed = Date.now() + Math.random();
            const params = new URLSearchParams({
                width: String(width),
                height: String(height),
                seed: String(newSeed),
                model: model,
                nologo: 'true'
            });
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?${params}`;

            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    try {
                        ctx.drawImage(img, 0, 0);
                        const base64data = canvas.toDataURL('image/png');
                        onImageGenerated(p, base64data, 'Pollinations.ai', model);
                        resolve();
                    } catch (e) {
                        console.error("Canvas toDataURL failed.", e);
                        reject(e);
                    }
                } else {
                    reject(new Error("Could not get canvas context."));
                }
            };
            img.onerror = (error) => {
                console.error(`Pollinations.ai image load failed for prompt: "${p}"`);
                reject(error);
            };
            img.src = imageUrl;
        });
    }, [width, height, onImageGenerated]);

    const generateImage = useCallback(async (p: string, settings: GameSettings | null, forceRegenerate: boolean = false) => {
        if (!p || (!forceRegenerate && conversionInProgress.has(p))) return;

        setIsGenerating(true);
        conversionInProgress.add(p);

        const pipeline = settings?.imageGenerationModelPipeline || [
            { provider: 'pollinations', model: 'flux' },
            { provider: 'nanobanana' },
            { provider: 'imagen' }
        ];

        for (const source of pipeline) {
            try {
                console.log(`Attempting image generation for prompt "${p.substring(0, 50)}..." with provider: ${source.provider}`);
                if (source.provider === 'pollinations') {
                    await generateWithPollinations(p, source.model);
                } else if (source.provider === 'nanobanana') {
                    await generateWithNanoBanana(p);
                } else if (source.provider === 'imagen') {
                    await generateWithImagen(p);
                }
                console.log(`Successfully generated image with ${source.provider}`);
                setIsGenerating(false);
                conversionInProgress.delete(p);
                return; // Success, exit the loop
            } catch (error) {
                console.error(`Image generation with ${source.provider} failed for prompt "${p.substring(0, 50)}...":`, error);
                // Continue to the next provider in the pipeline
            }
        }
        
        console.error(`All image generation providers failed for prompt: "${p.substring(0, 50)}..."`);
        // Optionally set an error state here to show to the user
        conversionInProgress.delete(p);
        setIsGenerating(false);
    }, [generateWithPollinations, generateWithNanoBanana, generateWithImagen, onImageGenerated]);

    const isDirectBase64 = prompt?.startsWith('data:image');
    const isUrl = prompt?.startsWith('https');
    
    const cachedImageEntry = prompt ? imageCache[prompt] : null;

    const imageUrlToDisplay = isDirectBase64
      ? prompt
      : isUrl
      ? prompt
      : typeof cachedImageEntry === 'string' // Legacy support
      ? cachedImageEntry
      : cachedImageEntry?.src;

    const sourceProvider = isDirectBase64
      ? 'Custom Upload'
      : typeof cachedImageEntry === 'string'
      ? 'Pollinations.ai' // Best guess for legacy
      : cachedImageEntry?.sourceProvider;

    const sourceModel = isDirectBase64
      ? undefined
      : typeof cachedImageEntry === 'string'
      ? 'flux' // Best guess for legacy
      : cachedImageEntry?.sourceModel;

    const displaySourceText = useMemo(() => {
        if (!sourceProvider) return null;
        if (sourceProvider === 'Custom Upload') return t('Custom Upload');
        if (sourceProvider === 'Pollinations.ai') return t('image_source_pollinations', { model: sourceModel || 'flux' });
        if (sourceProvider === 'Nano Banana') return t('image_source_nanobanana');
        if (sourceProvider === 'Imagen') return t('image_source_imagen');
        return sourceProvider; // Fallback for unknown
    }, [sourceProvider, sourceModel, t]);

    const isLoading = !imageUrlToDisplay && !!prompt && !isDirectBase64 && !isUrl;
    
    useEffect(() => {
        if (prompt && !isDirectBase64 && !isUrl && !cachedImageEntry && !isGenerating) {
            generateImage(prompt, gameSettings);
        }
    }, [prompt, isDirectBase64, isUrl, cachedImageEntry, isGenerating, generateImage, gameSettings]);

    const handleRegenerateClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading || isGenerating) return;
        if (originalTextPrompt) {
            generateImage(originalTextPrompt, gameSettings, true);
        }
    }, [isLoading, isGenerating, originalTextPrompt, generateImage, gameSettings]);

    const imgClasses = fitMode === 'cover'
        ? "object-cover w-full h-full"
        : "max-w-full max-h-[80vh] h-auto w-auto";

    const imageContainer = (
        <div className={`relative group bg-gray-800 ${className} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
            {imageUrlToDisplay ? (
                <img src={imageUrlToDisplay} alt={alt || t('Generated image')} className={imgClasses} />
            ) : (
                <div className="flex items-center justify-center h-full w-full">
                    <svg className="w-8 h-8 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {isGenerating && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <svg className="w-10 h-10 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {onClick && imageUrlToDisplay && !isGenerating && (
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <p className="text-white font-bold text-lg">{t('Enlarge')}</p>
                </div>
            )}
            
            {showSourceInfo && gameSettings?.showImageSourceInfo && displaySourceText && !isGenerating && imageUrlToDisplay && (
                <div 
                    className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10 pointer-events-none"
                    title={`${t('Generated by')}: ${displaySourceText}`}
                >
                    {displaySourceText}
                </div>
            )}

            <div className="absolute top-2 right-2 flex gap-2 z-20">
                {uploadButtonPosition === 'overlay' && (
                    <UploadButton
                        isOverlay={true}
                        onUploadCustom={onUploadCustom}
                        isLoading={isLoading}
                        isGenerating={isGenerating}
                        gameIsLoading={gameIsLoading}
                    />
                )}
                {showRegenerateButton && originalTextPrompt && (
                    <RegenerateButton
                        onClick={handleRegenerateClick}
                        isLoading={isLoading}
                        isGenerating={isGenerating}
                        t={t}
                        gameIsLoading={gameIsLoading}
                    />
                )}
            </div>
        </div>
    );

    return (
        <>
            {uploadButtonPosition === 'below' ? (
                <div>
                    {imageContainer}
                    <div className="mt-2 flex gap-2">
                         <UploadButton
                            isOverlay={false}
                            onUploadCustom={onUploadCustom}
                            isLoading={isLoading}
                            isGenerating={isGenerating}
                            gameIsLoading={gameIsLoading}
                        />
                        {onClearCustom && (
                             <button
                                onClick={(e) => { e.stopPropagation(); onClearCustom(); }}
                                disabled={isLoading || isGenerating || gameIsLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-yellow-300 bg-yellow-600/20 rounded-md hover:bg-yellow-600/40 transition-colors disabled:opacity-50"
                                title={t("revert_to_generated")}
                            >
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                                <span>{t('Revert')}</span>
                            </button>
                        )}
                    </div>
                </div>
            ) : imageContainer}
        </>
    );
};

export default ImageRenderer;