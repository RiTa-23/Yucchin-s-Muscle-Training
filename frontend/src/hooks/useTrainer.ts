import { useCallback, useRef, useEffect, useState } from "react";

// Note: Using dynamic imports or URL handling might be needed depending on Vite config,
// but direct import usually works for assets if configured.
// If direct import fails on Japanese chars, we might need to use URL constructor.
// Let's try URL constructor for safety with special chars/paths.

// Import audio files directly
// Compliments
import soundTensai from "@/assets/sounds/compliment/tensai_T01.wav";
import soundKagayaiteru from "@/assets/sounds/compliment/shining_T01.wav";
import soundKagayaiteruIi from "@/assets/sounds/compliment/shining-nice_T01.wav";
import soundIi from "@/assets/sounds/compliment/nice_T01.wav";
import soundBeautiful from "@/assets/sounds/compliment/beautiful.wav";

// Plank Starts
import soundPlankStart from "@/assets/sounds/plank/plank-start_T01.wav";
import soundPlankPosture from "@/assets/sounds/plank/plank-posture_T01.wav";

// Camera Alerts
import soundCamera1 from "@/assets/sounds/camera1_T01.wav";
import soundCamera2 from "@/assets/sounds/camera2_T01.wav";
import soundShrink from "@/assets/sounds/shrink_T01.wav";

// Finish Sounds
import soundFinish1 from "@/assets/sounds/finish1_T01.wav";
import soundFinish2 from "@/assets/sounds/finish2.wav";

// Action Sounds
import soundHipsHigh from "@/assets/sounds/plank/hips-down_T01.wav";
import soundHipsLow from "@/assets/sounds/plank/hips-up.wav";
import soundElbows from "@/assets/sounds/plank/elbows-floor_T01.wav";
import soundKneesStraight from "@/assets/sounds/plank/knee-straight.wav";

// Squat Sounds
import soundSquatDown from "@/assets/sounds/squat/squat-down_T01.wav";
import soundSquatUp from "@/assets/sounds/squat/squat-up_T01.wav";
import soundSquatDeep from "@/assets/sounds/squat/squat-deep_T01.wav";
import soundNiceSquat from "@/assets/sounds/squat/squat-nice_T01.wav";

// Pushup Sounds
import soundPushupDown from '@/assets/sounds/pushup/pushup_down.wav';
import soundNicePushup from '@/assets/sounds/pushup/nice_pushup.wav';

const COMPLIMENTS = [
    { src: soundTensai, text: "天才！" },
    { src: soundKagayaiteru, text: "輝いてるよ" },
    { src: soundKagayaiteruIi, text: "輝いてるよ！ イイヨォ！！" },
    { src: soundIi, text: "イイヨォ！！" },
    { src: soundBeautiful, text: "びゅーてぃふぉー！" },
];

const PLANK_POSTURE_PROMPTS = [
    { src: soundPlankStart, text: "プランク！" },
    { src: soundPlankPosture, text: "プﾙﾙｧンクのｼｾｲ！" },
];

const CAMERA_ALERTS = [
    { src: soundCamera1, text: "体をカメラにおさめてね" },
    { src: soundCamera2, text: "体をカメラにおさめてね！" },
    { src: soundShrink, text: "縮めェ！！" },
];

const FINISH_SOUNDS = [
    { src: soundFinish1, text: "これであなたも！ムキムキよ！" },
    { src: soundFinish2, text: "これであなたもぉ〜ムキムキ！" },
];

const SOUNDS = {
    // Compliments (handled specially)
    good: { src: '', text: '' }, // Placeholder type

    // Plank
    plankPosture: { src: soundPlankPosture, text: "プランクの姿勢をとって！" }, // Placeholder type
    hipsHigh: { src: soundHipsHigh, text: "お尻を下げてください" },
    hipsLow: { src: soundHipsLow, text: "腰を上げろぉお" },
    elbowsOnFloor: { src: soundElbows, text: "肘を床につけて" },
    kneesStraight: { src: soundKneesStraight, text: "膝を伸ばして！" },

    // Squat
    squatDown: { src: soundSquatDown, text: "しゃがめ！！" },
    squatUp: { src: soundSquatUp, text: "立ち上がぁれぇ" },
    squatDeep: { src: soundSquatDeep, text: "マリアナ海溝のように深く" },
    niceSquat: { src: soundNiceSquat, text: "ナイススクワット！！" },

    // Pushup
    pushupDown: { src: soundPushupDown, text: "お沈みあそばせ" },
    nicePushup: { src: soundNicePushup, text: "ナイスプッシュアップ！！" },

    // Camera
    camera: { src: '', text: "体をカメラにおさめてね" }, // Logic handles src selection

    // Finish
    finish: { src: soundFinish1, text: "お疲れ様でした！" },
} as const;

export type SoundType = keyof typeof SOUNDS;

export const useTrainer = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [trainerMessage, setTrainerMessage] = useState<string | null>(null);
    const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
    const lastPlayedRef = useRef<Map<string, number>>(new Map());
    const playingKeysRef = useRef<Set<string>>(new Set());

    // Cooldowns in ms
    const COOLDOWNS: Partial<Record<SoundType, number>> = {
        plankPosture: 5000,
        hipsHigh: 5000,
        hipsLow: 5000,
        elbowsOnFloor: 5000,
        kneesStraight: 5000,
        camera: 10000,
        good: 3000,
        finish: 0,

        // Squat
        squatDown: 4000,
        squatUp: 4000,
        squatDeep: 5000,
        niceSquat: 3000,

        // Pushup
        pushupDown: 3000,
        nicePushup: 3000,
    };

    useEffect(() => {
        const cleanupFns: (() => void)[] = [];

        // Helper to load and attach listeners
        const loadAudio = (src: string, key: string) => {
            const audio = new Audio(src);
            audio.load();

            // Listeners for speaking state
            const onPlay = () => {
                playingKeysRef.current.add(key);
                setIsSpeaking(true);
            };

            const onStop = () => {
                playingKeysRef.current.delete(key);
                if (playingKeysRef.current.size === 0) {
                    setIsSpeaking(false);
                    setTrainerMessage(null);
                }
            };

            audio.addEventListener('play', onPlay);
            audio.addEventListener('pause', onStop);
            audio.addEventListener('ended', onStop);

            cleanupFns.push(() => {
                audio.removeEventListener('play', onPlay);
                audio.removeEventListener('pause', onStop);
                audio.removeEventListener('ended', onStop);
            });

            audioRefs.current.set(key, audio);
        };

        // Preload standard sounds
        Object.entries(SOUNDS).forEach(([key, item]) => loadAudio(item.src, key));

        // Preload compliments
        COMPLIMENTS.forEach((item, index) => loadAudio(item.src, `good_${index}`));

        // Preload plank posture prompts
        PLANK_POSTURE_PROMPTS.forEach((item, index) => loadAudio(item.src, `plankPosture_${index}`));

        // Preload camera alerts
        CAMERA_ALERTS.forEach((item, index) => loadAudio(item.src, `camera_${index}`));

        // Preload finish sounds
        FINISH_SOUNDS.forEach((item, index) => loadAudio(item.src, `finish_${index}`));

        return () => {
            playingKeysRef.current.clear();
            cleanupFns.forEach(fn => fn());
            audioRefs.current.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        };
    }, []);

    const play = useCallback((type: SoundType, message?: string) => {
        let audioKey = type as string;
        let specificText: string | null = null;

        if (type === 'good') {
            const randomIndex = Math.floor(Math.random() * COMPLIMENTS.length);
            audioKey = `good_${randomIndex}`;
            specificText = COMPLIMENTS[randomIndex].text;
        } else if (type === 'plankPosture') {
            const randomIndex = Math.floor(Math.random() * PLANK_POSTURE_PROMPTS.length);
            audioKey = `plankPosture_${randomIndex}`;
            specificText = PLANK_POSTURE_PROMPTS[randomIndex].text;
        } else if (type === 'camera') {
            const randomIndex = Math.floor(Math.random() * CAMERA_ALERTS.length);
            audioKey = `camera_${randomIndex}`;
            specificText = CAMERA_ALERTS[randomIndex].text;
        } else if (type === 'finish') {
            const randomIndex = Math.floor(Math.random() * FINISH_SOUNDS.length);
            audioKey = `finish_${randomIndex}`;
            specificText = FINISH_SOUNDS[randomIndex].text;
        } else if (type in SOUNDS) {
            // Handle standard named sounds
            const key = type as keyof typeof SOUNDS;
            specificText = SOUNDS[key].text;
            audioKey = key;
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

        // Use specific text if available, otherwise fallback to provided message
        const displayMessage = specificText || message;
        if (displayMessage) {
            setTrainerMessage(displayMessage);
        }

        // Reset and play
        audio.currentTime = 0;
        audio.play().catch(e => console.error(`Failed to play sound ${type}:`, e));

        lastPlayedRef.current.set(type, now);
    }, []);

    return { play, isSpeaking, trainerMessage };
};
