export const stripMarkdown = (text: string | null | undefined): string => {
  if (typeof text !== 'string') return '';
  // This is a simplified stripper. It removes links, images, bold, italics, headers, and code ticks.
  return text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // links
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '')   // images
    .replace(/(\*\*|__)(.*?)\1/g, '$2')    // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')       // italics
    .replace(/#{1,6}\s/g, '')              // headers
    .replace(/`/g, '');                    // code
};

export const stripModerationSymbols = (text: string | null | undefined): string => {
  if (typeof text !== 'string') return '';
  // Removes ~~w<!--o-->rd~~ -> word and ~~word~~ -> word
  return text.replace(/<!--(.*?)-->/g, '$1').replace(/~~/g, '');
};

export function deepStripModerationSymbols<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepStripModerationSymbols(item)) as any;
    }

    if (typeof obj === 'object') {
        const newObj: { [key: string]: any } = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = deepStripModerationSymbols((obj as any)[key]);
            }
        }
        return newObj as T;
    }

    if (typeof obj === 'string') {
        return stripModerationSymbols(obj) as any;
    }

    return obj;
}
