import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
type PushupState = "UP" | "DOWN";

export default function PushupPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fps = useMemo(() => user?.settings?.fps || 20, [user?.settings?.fps]);
    const interval = useMemo(() => Math.floor(1000 / fps), [fps]);

    const [error, setError] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState>("GUIDE");
    const [lastResults, setLastResults] = useState<Results | null>(null);
    const [message, setMessage] = useState<string>("");
    const [isGood, setIsGood] = useState<boolean>(false);

    // Push-up specific states
    const [count, setCount] = useState<number>(0);
    const [pushupState, setPushupState] = useState<PushupState>("UP");
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
        // Using shoulder visibility seems appropriate for general side checking
        const leftVisibility = (landmarks[11].visibility || 0) + (landmarks[13].visibility || 0) + (landmarks[15].visibility || 0);
        const rightVisibility = (landmarks[12].visibility || 0) + (landmarks[14].visibility || 0) + (landmarks[16].visibility || 0);
        const isLeft = leftVisibility > rightVisibility;

        const shoulder = isLeft ? landmarks[11] : landmarks[12];
        const elbow = isLeft ? landmarks[13] : landmarks[14];
        const wrist = isLeft ? landmarks[15] : landmarks[16];

        // Basic visibility check
        if ((shoulder.visibility || 0) < 0.5 || (elbow.visibility || 0) < 0.5 || (wrist.visibility || 0) < 0.5) {
            safeSetMessage("上半身（肩・肘・手首）がはっきり映るようにしてください");
            setIsGood(false);
            return;
        }

        const elbowAngle = calculateAngle(shoulder, elbow, wrist);

        // Push-up Logic
        // UP: Arms straight, elbow angle > 160
        // DOWN: Arms bent, elbow angle < 90

        const UP_THRESHOLD = 150;
        const DOWN_THRESHOLD = 90;

        if (pushupState === "UP") {
            if (elbowAngle < DOWN_THRESHOLD) {
                setPushupState("DOWN");
                safeSetMessage("Good! そのまま体を押し上げて！");
                setIsGood(true);
            } else if (elbowAngle < 140) {
                safeSetMessage("もっと深く曲げて！");
                setIsGood(true); // Encouraging
            } else {
                safeSetMessage("スタート！体を沈めてください");
                setIsGood(true);
            }
        } else if (pushupState === "DOWN") {
            if (elbowAngle > UP_THRESHOLD) {
                setPushupState("UP");
                setCount(prev => prev + 1);
                safeSetMessage("ナイスプッシュアップ！");
                setIsGood(true);
            } else {
                safeSetMessage("体を押し上げて！");
                setIsGood(true);
            }
        }

    }, [calculateAngle, pushupState, safeSetMessage]);

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
        setPushupState("UP");
        setGameState("ACTIVE");
    };

    // Save result when game finishes
    useEffect(() => {
        if (gameState === "FINISHED") {
            const saveResult = async () => {
                try {
                    await trainingApi.createLog({
                        performed_at: new Date().toISOString(),
                        exercise_name: "push_up", // Using snake_case for consistency with backend enum if it exists, or string. Plank uses "plank", Squat uses "squat". "push_up" or "pushup"? Let's assume "push_up" or just string.
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
    }, [gameState, count]); // Included count as dependency

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
                title="腕立て伏せ"
                description={
                    <>
                        肩幅より少し広く手をつき、頭から足まで一直線にします。<br />
                        肘を曲げて体を深く沈め、力強く押し上げましょう！
                    </>
                }
                onStart={handleStart}
                illustration={
                    <div className="text-6xl">💪</div>
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
                    setPushupState("UP");
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
