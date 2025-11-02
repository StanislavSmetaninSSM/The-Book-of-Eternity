
// Simple string hash function
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// HSL to HEX conversion function
const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};


/**
 * Generates a deterministic, visually distinct color in HEX format based on a string (like a faction ID or name).
 * @param idOrName The string to hash for color generation.
 * @returns A HEX color string (e.g., "#RRGGBB").
 */
export const generateFactionColor = (idOrName: string): string => {
    if (!idOrName) {
        return '#cccccc'; // Default color for safety
    }
    const hash = simpleHash(idOrName);
    
    // Hue: Full spectrum for variety
    const h = Math.abs(hash % 360); 
    
    // Saturation: Keep it vibrant but not overly neon
    const s = 70 + Math.abs((hash >> 8) % 15); // Saturation (70-85)
    
    // Lightness: Mid-range to avoid being too dark or too light on the map
    const l = 50 + Math.abs((hash >> 16) % 10); // Lightness (50-60)
    
    return hslToHex(h, s, l);
};
