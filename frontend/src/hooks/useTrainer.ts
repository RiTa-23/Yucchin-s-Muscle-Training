import { useCallback, useRef, useEffect, useState } from 'react';

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

const CAMERA_ALERTS = [
    `${ASSETS_BASE}/体をカメラにおさめてね1_T01.wav`,
    `${ASSETS_BASE}/体をカメラにおさめてね2_T01.wav`,
    `${ASSETS_BASE}/縮めｪ！！_T01.wav`,
];

const FINISH_SOUNDS = [
    `${ASSETS_BASE}/これであなたも！ムキムキよ！_T01.wav`,
    `${ASSETS_BASE}/ｺﾚﾃﾞｱﾅﾀﾓｫ〜ムキムキ.wav`,
];

const SOUNDS = {
    hipsHigh: `${ASSETS_BASE}/plank/お尻を下げてください。_T01.wav`,
    hipsLow: `${ASSETS_BASE}/プリけつ_T01.wav`,
    elbowsOnFloor: `${ASSETS_BASE}/plank/肘を床に付ける2_T01.wav`,
    warning: `${ASSETS_BASE}/ﾍｪッ！！_T01.wav`,
} as const;

type SoundType = keyof typeof SOUNDS | 'good' | 'start' | 'camera' | 'finish';

export const useTrainer = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [trainerMessage, setTrainerMessage] = useState<string | null>(null);
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
        finish: 0,
    };

    useEffect(() => {
        // Helper to load and attach listeners
        const loadAudio = (src: string, key: string) => {
            const audio = new Audio(src);
            audio.load();

            // Listeners for speaking state
            audio.addEventListener('play', () => {
                setIsSpeaking(true);
            });
            audio.addEventListener('pause', () => {
                setIsSpeaking(false);
                setTrainerMessage(null);
            });
            audio.addEventListener('ended', () => {
                setIsSpeaking(false);
                setTrainerMessage(null);
            });

            audioRefs.current.set(key, audio);
        };

        // Preload standard sounds
        Object.entries(SOUNDS).forEach(([key, src]) => loadAudio(src, key));

        // Preload compliments
        COMPLIMENTS.forEach((src, index) => loadAudio(src, `good_${index}`));

        // Preload starts
        PLANK_STARTS.forEach((src, index) => loadAudio(src, `start_${index}`));

        // Preload camera alerts
        CAMERA_ALERTS.forEach((src, index) => loadAudio(src, `camera_${index}`));

        // Preload finish sounds
        FINISH_SOUNDS.forEach((src, index) => loadAudio(src, `finish_${index}`));

        return () => {
            audioRefs.current.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        };
    }, []);

    const play = useCallback((type: SoundType, message?: string) => {
        let audioKey = type as string;

        if (type === 'good') {
            const randomIndex = Math.floor(Math.random() * COMPLIMENTS.length);
            audioKey = `good_${randomIndex}`;
        } else if (type === 'start') {
            const randomIndex = Math.floor(Math.random() * PLANK_STARTS.length);
            audioKey = `start_${randomIndex}`;
        } else if (type === 'camera') {
            const randomIndex = Math.floor(Math.random() * CAMERA_ALERTS.length);
            audioKey = `camera_${randomIndex}`;
        } else if (type === 'finish') {
            const randomIndex = Math.floor(Math.random() * FINISH_SOUNDS.length);
            audioKey = `finish_${randomIndex}`;
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

        if (message) {
            setTrainerMessage(message);
        }

        // Reset and play
        audio.currentTime = 0;
        audio.play().catch(e => console.error(`Failed to play sound ${type}:`, e));

        lastPlayedRef.current.set(type, now);
    }, []);

    return { play, isSpeaking, trainerMessage };
};
