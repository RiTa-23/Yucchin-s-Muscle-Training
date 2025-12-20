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
    const lastCompletionTime = useRef<number>(0);
    const shallowSquatStartTime = useRef<number>(0);

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

    const [cameraAngle, setCameraAngle] = useState<'front' | 'side'>('front');

    const checkForm = useCallback((results: Results) => {
        if (!results.poseLandmarks) return;
        const landmarks = results.poseLandmarks;

        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const leftKnee = landmarks[25];
        const rightKnee = landmarks[26];
        const leftAnkle = landmarks[27];
        const rightAnkle = landmarks[28];

        let kneeAngle = 0;

        if (cameraAngle === 'front') {
            // === FRONT MODE (Strict Dual Leg) ===
            const leftLegVisible = (leftHip.visibility || 0) >= 0.6 && (leftKnee.visibility || 0) >= 0.6 && (leftAnkle.visibility || 0) >= 0.3;
            const rightLegVisible = (rightHip.visibility || 0) >= 0.6 && (rightKnee.visibility || 0) >= 0.6 && (rightAnkle.visibility || 0) >= 0.3;

            if (!leftLegVisible || !rightLegVisible) {
                safeSetMessage("両足が映るようにしてください");
                play('camera');
                setIsGood(false);
                return;
            }

            const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
            const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

            // Conservative logic for counting
            kneeAngle = squatState === "UP"
                ? Math.max(leftKneeAngle, rightKneeAngle) // For DOWN check (require bent)
                : Math.min(leftKneeAngle, rightKneeAngle); // For UP check (require straight)

        } else {
            // === SIDE MODE (Single Leg Priority) ===
            // Determine side based on visibility sum
            const leftScore = (leftHip.visibility || 0) + (leftKnee.visibility || 0) + (leftAnkle.visibility || 0);
            const rightScore = (rightHip.visibility || 0) + (rightKnee.visibility || 0) + (rightAnkle.visibility || 0);
            const isLeft = leftScore > rightScore;

            const hip = isLeft ? leftHip : rightHip;
            const knee = isLeft ? leftKnee : rightKnee;
            const ankle = isLeft ? leftAnkle : rightAnkle;

            // More lenient visibility for side view (occlusion is expected)
            if ((hip.visibility || 0) < 0.4 || (knee.visibility || 0) < 0.4 || (ankle.visibility || 0) < 0.3) {
                safeSetMessage("下半身が映るようにしてください");
                play('camera');
                setIsGood(false);
                return;
            }
            kneeAngle = calculateAngle(hip, knee, ankle);
        }

        const UP_THRESHOLD = 130;
        const DOWN_THRESHOLD = 100;

        if (squatState === "UP") {
            if (kneeAngle < DOWN_THRESHOLD) {
                setSquatState("DOWN");
                safeSetMessage("Good! そのまま立ち上がって！");
                play('squatUp');
                setIsGood(true);
                shallowSquatStartTime.current = 0; // Reset
            } else if (kneeAngle < 140) {
                // "More deep" if not deep enough yet
                if (shallowSquatStartTime.current === 0) {
                    shallowSquatStartTime.current = Date.now();
                }

                safeSetMessage("もっと深く！");

                if (Date.now() - shallowSquatStartTime.current > 1500) {
                    play('squatDeep');
                }
                setIsGood(true); // Encouraging
            } else if (kneeAngle > 150) {
                shallowSquatStartTime.current = 0; // Reset
                safeSetMessage("しゃがんでください");
                // Only play "squat down" if some time has passed since they stood up
                if (Date.now() - lastCompletionTime.current > 3000) {
                    play('squatDown');
                }
                setIsGood(true);
            } else {
                shallowSquatStartTime.current = 0; // Reset
                safeSetMessage("しゃがんでください");
                play('squatDown');
                setIsGood(true);
            }
        } else if (squatState === "DOWN") {
            if (kneeAngle > UP_THRESHOLD) {
                setSquatState("UP");
                setCount(prev => prev + 1);
                lastCompletionTime.current = Date.now(); // Record completion time
                safeSetMessage("ナイススクワット！");
                if (Math.random() < 0.5) {
                    play('niceSquat');
                } else {
                    play('good');
                }
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

            // Camera Toggle
            cameraAngle={cameraAngle}
            onCameraAngleChange={setCameraAngle}
        />
    );
}
