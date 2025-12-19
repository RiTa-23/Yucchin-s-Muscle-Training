import { useCallback, useRef, useEffect } from 'react';

// Import audio files
// Note: Using dynamic imports or URL handling might be needed depending on Vite config, 
// but direct import usually works for assets if configured. 
// If direct import fails on Japanese chars, we might need to use URL constructor.
// Let's try URL constructor for safety with special chars/paths.

const ASSETS_BASE = '/src/assets/sounds';

const COMPLIMENTS = [
    `${ASSETS_BASE}/compliment/天才！.wav`,
    `${ASSETS_BASE}/compliment/輝いてるよ.wav`,
    `${ASSETS_BASE}/compliment/輝いてるよ！ｲｲﾖｫ！！.wav`,
    `${ASSETS_BASE}/compliment/ｲｲﾖｫ！！.wav`,
    `${ASSETS_BASE}/compliment/びゅーてぃふぉ.wav`,
];

const PLANK_STARTS = [
    `${ASSETS_BASE}/plank/プランク1_T01.wav`,
    `${ASSETS_BASE}/plank/プﾙﾙｧンクのｼｾｲ_T01.wav`,
];

const SOUNDS = {
    finish: `${ASSETS_BASE}/これであなたも！ムキムキよ！_T01.wav`,
    hipsHigh: `${ASSETS_BASE}/plank/お尻を下げてください。_T01.wav`,
    hipsLow: `${ASSETS_BASE}/プリけつ_T01.wav`,
    elbowsOnFloor: `${ASSETS_BASE}/plank/肘を床に付ける2_T01.wav`,
    camera: `${ASSETS_BASE}/体をカメラにおさめてね1_T01.wav`,
    warning: `${ASSETS_BASE}/ﾍｪッ！！_T01.wav`,
} as const;

type SoundType = keyof typeof SOUNDS | 'good' | 'start';

export const useTrainer = () => {
    const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
    const lastPlayedRef = useRef<Map<string, number>>(new Map());

    // Cooldowns in ms
    const COOLDOWNS: Partial<Record<SoundType, number>> = {
        hipsHigh: 5000,
        hipsLow: 5000,
        elbowsOnFloor: 5000,
        camera: 10000, // Longer cooldown for system-like message
        warning: 5000,
        good: 3000,
        start: 0,
    };

    useEffect(() => {
        // Preload standard sounds
        Object.entries(SOUNDS).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.load();
            audioRefs.current.set(key, audio);
        });

        // Preload compliments
        COMPLIMENTS.forEach((src, index) => {
            const audio = new Audio(src);
            audio.load();
            audioRefs.current.set(`good_${index}`, audio);
        });

        // Preload starts
        PLANK_STARTS.forEach((src, index) => {
            const audio = new Audio(src);
            audio.load();
            audioRefs.current.set(`start_${index}`, audio);
        });

        return () => {
            audioRefs.current.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        };
    }, []);

    const play = useCallback((type: SoundType) => {
        let audioKey = type as string;

        if (type === 'good') {
            const randomIndex = Math.floor(Math.random() * COMPLIMENTS.length);
            audioKey = `good_${randomIndex}`;
        } else if (type === 'start') {
            const randomIndex = Math.floor(Math.random() * PLANK_STARTS.length);
            audioKey = `start_${randomIndex}`;
        }

        const audio = audioRefs.current.get(audioKey);
        if (!audio) return;

        const now = Date.now();
        // Check cooldown by usage type (e.g. 'good'), not specific file key
        const lastPlayed = lastPlayedRef.current.get(type) || 0;
        const cooldown = COOLDOWNS[type] || 0;

        if (now - lastPlayed < cooldown) {
            return;
        }

        // Reset and play
        audio.currentTime = 0;
        audio.play().catch(e => console.error(`Failed to play sound ${type}:`, e));

        lastPlayedRef.current.set(type, now);
    }, []);

    return { play };
};
