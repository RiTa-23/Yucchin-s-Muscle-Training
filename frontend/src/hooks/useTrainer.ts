import { useCallback, useRef, useEffect } from 'react';

// Import audio files
// Note: Using dynamic imports or URL handling might be needed depending on Vite config, 
// but direct import usually works for assets if configured. 
// If direct import fails on Japanese chars, we might need to use URL constructor.
// Let's try URL constructor for safety with special chars/paths.

const ASSETS_BASE = '/src/assets/sounds';

const SOUNDS = {
    start: `${ASSETS_BASE}/へへっ_T01.wav`,
    finish: `${ASSETS_BASE}/これであなたも！ムキムキよ！_T01.wav`,
    hipsHigh: `${ASSETS_BASE}/plank/お尻を下げてください。_T01.wav`,
    hipsLow: `${ASSETS_BASE}/縮めｪ！！_T01.wav`, // Using "Contract!!" for hips low (raise them)
    warning: `${ASSETS_BASE}/ﾍｪッ！！_T01.wav`, // Generic warning if needed
    good: `${ASSETS_BASE}/compliment/輝いてるよ！ｲｲﾖｫ！！.wav`,
    genius: `${ASSETS_BASE}/compliment/天才！.wav`,
} as const;

type SoundType = keyof typeof SOUNDS;

export const useTrainer = () => {
    const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map());
    const lastPlayedRef = useRef<Map<SoundType, number>>(new Map());

    // Cooldowns in ms
    const COOLDOWNS: Partial<Record<SoundType, number>> = {
        hipsHigh: 5000,
        hipsLow: 5000,
        warning: 5000,
        good: 10000, // Compliment less frequently
    };

    useEffect(() => {
        // Preload sounds
        Object.entries(SOUNDS).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.load();
            audioRefs.current.set(key as SoundType, audio);
        });

        return () => {
            // Cleanup if needed (pause all)
            audioRefs.current.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        };
    }, []);

    const play = useCallback((type: SoundType) => {
        const audio = audioRefs.current.get(type);
        if (!audio) return;

        const now = Date.now();
        const lastPlayed = lastPlayedRef.current.get(type) || 0;
        const cooldown = COOLDOWNS[type] || 0;

        if (now - lastPlayed < cooldown) {
            return; // Skip if within cooldown
        }

        // Play
        // Clone node or reset current time to allow overlapping of DIFFERENT sounds,
        // but for same sound we usually want to restart or let it finish.
        // Let's just reset time since these are short voice clips.
        // Actually, if we want to avoid overlapping the trainer talking over themselves excessively,
        // we might want a global "isSpeaking" flag, but for now simple fire-and-forget is okay.

        // Reset and play
        audio.currentTime = 0;
        audio.play().catch(e => console.error(`Failed to play sound ${type}:`, e));

        lastPlayedRef.current.set(type, now);
    }, []);

    return { play };
};
