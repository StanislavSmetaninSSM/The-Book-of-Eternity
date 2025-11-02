import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../context/LocalizationContext';
import { GoogleGenAI, Modality } from "@google/genai";
import { GameSettings } from '../types';

interface ImageRendererProps {
    prompt: string | null | undefined;
    originalTextPrompt?: string;
    className?: string;
    alt?: string;
    showRegenerateButton?: boolean;
    width?: number;
    height?: number;
    imageCache: Record<string, string>;
    onImageGenerated: (prompt: string, base64: string) => void;
    onUploadCustom?: (base64: string | null) => void;
    model?: 'flux' | 'turbo' | 'gptimage';
    uploadButtonPosition?: 'overlay' | 'below';
    onClearCustom?: () => void;
    onClick?: () => void;
    gameSettings: GameSettings | null;
}

// Module-level set to track which prompts are currently being converted to base64
const conversionInProgress = new Set<string>();

interface UploadButtonProps {
    isOverlay: boolean;
    onUploadCustom?: (base64: string | null) => void;
    isLoading: boolean;
    isGenerating: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = React.memo(({ isOverlay, onUploadCustom, isLoading, isGenerating }) => {
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
                disabled={isLoading || isGenerating}
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
}

const RegenerateButton: React.FC<RegenerateButtonProps> = React.memo(({ onClick, isLoading, isGenerating, t }) => {
    const isDisabled = isLoading || isGenerating;

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
        model = 'flux',
        imageCache,
        onImageGenerated,
        onUploadCustom,
        uploadButtonPosition = 'overlay',
        onClearCustom,
        onClick,
        gameSettings
    } = props;

    const { t } = useLocalization();
    const [isGenerating, setIsGenerating] = useState(false);

    const generateWithGemini = useCallback(async (p: string) => {
        if (!process.env.API_KEY) {
            console.error("Gemini API Key not found for image generation.");
            throw new Error("Gemini API Key not found.");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: p }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                onImageGenerated(p, imageUrl);
                return; // Success
            }
        }
        throw new Error("No image data in Gemini response");
    }, [onImageGenerated]);

    const generateWithPollinations = useCallback(async (p: string) => {
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
                        onImageGenerated(p, base64data);
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
    }, [width, height, model, onImageGenerated]);

    const generateImage = useCallback(async (p: string, settings: GameSettings | null, forceRegenerate: boolean = false) => {
        if (!p) return;

        // При регенерации игнорируем проверку на дублирование
        if (!forceRegenerate && conversionInProgress.has(p)) return;

        setIsGenerating(true);
        conversionInProgress.add(p);

        const primaryIsGemini = settings?.useNanoBananaPrimary;

        try {
            if (primaryIsGemini) {
                try {
                    await generateWithGemini(p);
                } catch (geminiError) {
                    console.error("Gemini (primary) failed, falling back to Pollinations.ai", geminiError);
                    await generateWithPollinations(p); // Fallback
                }
            } else { // Pollinations is primary
                try {
                    await generateWithPollinations(p);
                } catch (pollinationsError) {
                    console.error("Pollinations.ai (primary) failed", pollinationsError);
                    if (settings?.useNanoBananaFallback) {
                        console.log("Attempting fallback to Gemini...");
                        await generateWithGemini(p); // Fallback
                    } else {
                        throw pollinationsError; // Re-throw if no fallback
                    }
                }
            }
        } catch (finalError) {
            console.error('Image generation failed completely for prompt:', p, finalError);
        } finally {
            conversionInProgress.delete(p);
            setIsGenerating(false);
        }
    }, [generateWithGemini, generateWithPollinations]);

    const isDirectBase64 = prompt?.startsWith('data:image');
    const isUrl = prompt?.startsWith('https');
    const cachedImage = prompt ? imageCache[prompt] : null;
    const imageUrlToDisplay = isDirectBase64 ? prompt : (isUrl ? prompt : cachedImage);

    const isLoading = !imageUrlToDisplay && !!prompt && !isDirectBase64 && !isUrl;

    useEffect(() => {
        if (prompt && !isDirectBase64 && !isUrl && !cachedImage) {
            generateImage(prompt, gameSettings, false);
        }
    }, [prompt, isDirectBase64, isUrl, cachedImage, generateImage, gameSettings]);

    const handleRegenerateClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();

        if (isLoading || isGenerating) return;

        // Всегда используем originalTextPrompt для регенерации
        // Если его нет, значит это не подходящий компонент для регенерации
        if (originalTextPrompt) {
            generateImage(originalTextPrompt, gameSettings, true);
        }
    }, [isLoading, isGenerating, originalTextPrompt, generateImage, gameSettings]);

    const imageContainer = (
        <div className={`relative group bg-gray-800 ${className} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
            {imageUrlToDisplay ? (
                <img src={imageUrlToDisplay} alt={alt || t('Generated image')} className="object-cover w-full h-full" />
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

            <div className="absolute top-2 right-2 flex gap-2 z-20">
                {uploadButtonPosition === 'overlay' && (
                    <UploadButton
                        isOverlay={true}
                        onUploadCustom={onUploadCustom}
                        isLoading={isLoading}
                        isGenerating={isGenerating}
                    />
                )}
                {showRegenerateButton && originalTextPrompt && (
                    <RegenerateButton
                        onClick={handleRegenerateClick}
                        isLoading={isLoading}
                        isGenerating={isGenerating}
                        t={t}
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
                    <div className="mt-2">
                        <UploadButton
                            isOverlay={false}
                            onUploadCustom={onUploadCustom}
                            isLoading={isLoading}
                            isGenerating={isGenerating}
                        />
                    </div>
                </div>
            ) : imageContainer}
        </>
    );
};

export default ImageRenderer;