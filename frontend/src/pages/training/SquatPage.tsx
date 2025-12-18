import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PoseDetector } from "@/components/camera/PoseDetector";
import { PoseOverlay } from "@/components/camera/PoseOverlay";
import { TrainingGuide } from "@/components/training/TrainingGuide";
import { TrainingResult } from "@/components/training/TrainingResult";
import { type Results, type NormalizedLandmark } from "@mediapipe/pose";
import { useAuth } from "@/context/AuthContext";
import { trainingApi } from "@/api/training";

type GameState = "GUIDE" | "ACTIVE" | "FINISHED";
type SquatState = "UP" | "DOWN";

export default function SquatPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fps = useMemo(() => user?.settings?.fps || 20, [user?.settings?.fps]);
    const interval = useMemo(() => Math.floor(1000 / fps), [fps]);

    const [error, setError] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState>("GUIDE");
    const [lastResults, setLastResults] = useState<Results | null>(null);
    const [message, setMessage] = useState<string>("");
    const [isGood, setIsGood] = useState<boolean>(false);

    // Squat specific states
    const [count, setCount] = useState<number>(0);
    const [squatState, setSquatState] = useState<SquatState>("UP");
    const [targetCount, setTargetCount] = useState<number>(10);

    // Refs for stable state access in callbacks if needed
    // However, react state is usually fine if dependencies are correct.

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
            setMessage("下半身が映るようにしてください");
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
                setMessage("Good! そのまま立ち上がって！");
                setIsGood(true);
            } else if (kneeAngle < 140) {
                setMessage("もっと深く！");
                setIsGood(true); // Encouraging
            } else {
                setMessage("しゃがんでください");
                setIsGood(true);
            }
        } else if (squatState === "DOWN") {
            if (kneeAngle > UP_THRESHOLD) {
                setSquatState("UP");
                setCount(prev => prev + 1);
                setMessage("ナイススクワット！");
                setIsGood(true);
            } else {
                setMessage("立ち上がって！");
                setIsGood(true);
            }
        }

    }, [calculateAngle, squatState]);

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
        }
    }, [gameState, targetCount, count]);

    const handleError = useCallback((err: any) => {
        setError(typeof err === 'string' ? err : err.message || "Unknown Camera Error");
    }, []);

    if (error) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                <div className="bg-white p-8 rounded-lg max-w-md text-center">
                    <p className="text-red-600 mb-4 font-bold">カメラエラーが発生しました</p>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <Button onClick={() => navigate('/home')}>ホームに戻る</Button>
                </div>
            </div>
        );
    }

    if (gameState === "GUIDE") {
        return (
            <TrainingGuide
                title="スクワット"
                description={
                    <>
                        足を肩幅に開き、背筋を伸ばして立ちます。<br />
                        お尻を後ろに引くように深くしゃがみ込みましょう！
                    </>
                }
                onStart={handleStart}
                illustration={
                    <div className="text-6xl">🦵</div>
                }
                goalConfig={{
                    type: "count",
                    min: 5,
                    max: 50,
                    default: 10,
                    step: 5,
                    unit: "回"
                }}
            />
        );
    }

    if (gameState === "FINISHED") {
        return (
            <TrainingResult
                score={`${count}回`}
                scoreLabel="記録"
                onRetry={() => {
                    setCount(0);
                    setSquatState("UP");
                    setGameState("ACTIVE");
                }}
            />
        );
    }

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Camera Layer */}
            <PoseDetector
                onPoseDetected={onPoseDetected}
                interval={interval}
                onError={handleError}
            />

            {/* Overlay Layer */}
            <PoseOverlay
                results={lastResults}
                feedback={message}
                isGoodPose={isGood}
                stats={{
                    label: "回数",
                    value: count,
                    unit: "回"
                }}
            />

            {/* Back Button (In-game) */}
            <Button
                variant="outline"
                className="absolute top-4 left-4 z-20 bg-white/80 hover:bg-white"
                onClick={() => navigate('/home')}
            >
                終了
            </Button>
        </div>
    );
}
