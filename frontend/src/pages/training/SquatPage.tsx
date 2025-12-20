import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type Results, type NormalizedLandmark } from "@mediapipe/pose";
import { useAuth } from "@/context/AuthContext";
import { trainingApi } from "@/api/training";
import { TrainingContainer, type GameState } from "@/components/training/TrainingContainer";
import { useTrainer } from "@/hooks/useTrainer";

type SquatState = "UP" | "DOWN";

export default function SquatPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { play, isSpeaking, trainerMessage } = useTrainer();

    const [error, setError] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState>("GUIDE");
    const [lastResults, setLastResults] = useState<Results | null>(null);
    const [message, setMessage] = useState<string>("");
    const [isGood, setIsGood] = useState<boolean>(false);

    // Squat specific states
    const [count, setCount] = useState<number>(0);
    const [squatState, setSquatState] = useState<SquatState>("UP");
    const [targetCount, setTargetCount] = useState<number>(10);

    // Refs for stable state access in callbacks
    const lastMessageRef = useRef<string>("");

    const safeSetMessage = useCallback((msg: string) => {
        if (lastMessageRef.current !== msg) {
            setMessage(msg);
            lastMessageRef.current = msg;
        }
    }, []);

    const calculateAngle = useCallback((a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    }, []);

    const checkForm = useCallback((results: Results) => {
        if (!results.poseLandmarks) return;
        const landmarks = results.poseLandmarks;

        // Use visibility to determine which side is facing the camera
        const leftVisibility = (landmarks[23].visibility || 0) + (landmarks[25].visibility || 0) + (landmarks[27].visibility || 0);
        const rightVisibility = (landmarks[24].visibility || 0) + (landmarks[26].visibility || 0) + (landmarks[28].visibility || 0);
        const isLeft = leftVisibility > rightVisibility;

        const hip = isLeft ? landmarks[23] : landmarks[24];
        const knee = isLeft ? landmarks[25] : landmarks[26];
        const ankle = isLeft ? landmarks[27] : landmarks[28];
        // const shoulder = isLeft ? landmarks[11] : landmarks[12];

        // Basic visibility check
        if ((hip.visibility || 0) < 0.3 || (knee.visibility || 0) < 0.3 || (ankle.visibility || 0) < 0.3) {
            safeSetMessage("下半身が映るようにしてください");
            setIsGood(false);
            return;
        }

        const kneeAngle = calculateAngle(hip, knee, ankle);

        // Squat Logic
        // UP: Standing straight, knee angle > 160
        // DOWN: Squatting, knee angle < 100

        const UP_THRESHOLD = 130;
        const DOWN_THRESHOLD = 100;

        if (squatState === "UP") {
            if (kneeAngle < DOWN_THRESHOLD) {
                setSquatState("DOWN");
                safeSetMessage("Good! そのまま立ち上がって！");
                play('good', "Good! そのまま立ち上がって！");
                setIsGood(true);
            } else if (kneeAngle < 140) {
                safeSetMessage("もっと深く！");
                setIsGood(true); // Encouraging
            } else {
                safeSetMessage("しゃがんでください");
                setIsGood(true);
            }
        } else if (squatState === "DOWN") {
            if (kneeAngle > UP_THRESHOLD) {
                setSquatState("UP");
                setCount(prev => prev + 1);
                safeSetMessage("ナイススクワット！");
                play('good', "ナイススクワット！");
                setIsGood(true);
            } else {
                safeSetMessage("立ち上がって！");
                setIsGood(true);
            }
        }

    }, [calculateAngle, squatState, safeSetMessage]);

    const onPoseDetected = useCallback((results: Results) => {
        setLastResults(results);
        if (gameState === "ACTIVE") {
            checkForm(results);
        }
    }, [gameState, checkForm]);

    // Check for finish condition
    useEffect(() => {
        if (gameState === "ACTIVE" && count >= targetCount) {
            setGameState("FINISHED");
        }
    }, [count, targetCount, gameState]);

    const handleStart = (target?: number) => {
        if (target) {
            setTargetCount(target);
        }
        setCount(0);
        setSquatState("UP");
        setGameState("ACTIVE");
        play('start', "さあ、始めるよ！");
    };

    // Save result when game finishes
    useEffect(() => {
        if (gameState === "FINISHED") {
            const saveResult = async () => {
                try {
                    await trainingApi.createLog({
                        performed_at: new Date().toISOString(),
                        exercise_name: "squat",
                        duration: 0,
                        count: count
                    });
                    console.log("Training log saved!");
                } catch (err) {
                    console.error("Failed to save training log:", err);
                }
            };
            saveResult();
            play('finish', "お疲れ様！ナイスファイト！");
        }
    }, [gameState, targetCount, count]);

    const handleError = useCallback((err: any) => {
        setError(typeof err === 'string' ? err : err.message || "Unknown Camera Error");
    }, []);

    const handleRetry = () => {
        setCount(0);
        setSquatState("UP");
        setGameState("ACTIVE");
    };

    const handleQuit = () => {
        if (count > 0) {
            setGameState("FINISHED");
        } else {
            navigate('/home');
        }
    };

    return (
        <TrainingContainer
            gameState={gameState}

            // Guide
            title="スクワット"
            description={
                <>
                    足を肩幅に開き、背筋を伸ばして立ちます。<br />
                    お尻を後ろに引くように深くしゃがみ込みましょう！
                </>
            }
            illustration={<div className="text-6xl">🦵</div>}
            goalConfig={{
                type: "count",
                min: 5,
                max: 50,
                default: 10,
                step: 5,
                unit: "回"
            }}
            onStart={handleStart}

            // Active
            onPoseDetected={onPoseDetected}
            overlayResults={lastResults}
            feedbackMessage={message}
            isGoodPose={isGood}
            stats={{
                label: "回数",
                value: count,
                unit: "回"
            }}
            cameraError={error}
            onError={handleError}

            // Result
            score={`${count}回`}
            onRetry={handleRetry}

            // Navigation
            onQuit={handleQuit}

            // Trainer
            isSpeaking={isSpeaking}
            trainerMessage={trainerMessage}
        />
    );
}
