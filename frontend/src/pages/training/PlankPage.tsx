import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

export default function PlankPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fps = useMemo(() => user?.settings?.fps || 20, [user?.settings?.fps]);
    const interval = useMemo(() => Math.floor(1000 / fps), [fps]);

    const [error, setError] = useState<string | null>(null);
    const [gameState, setGameState] = useState<GameState>("GUIDE");
    const [lastResults, setLastResults] = useState<Results | null>(null);
    const [message, setMessage] = useState<string>("");
    const [isGood, setIsGood] = useState<boolean>(false);
    const [targetDuration, setTargetDuration] = useState<number>(30);
    const [timeLeft, setTimeLeft] = useState<number>(30);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Logic ---

    // Calculate angle at B (A-B-C) - static logic, can be inside or outside. 
    // If inside, wrap in useCallback to make it stable for checkForm dependency.
    const calculateAngle = useCallback((a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    }, []);

    const checkForm = useCallback((results: Results) => {
        if (!results.poseLandmarks) return;
        const landmarks = results.poseLandmarks;

        const leftVisibility = (landmarks[11].visibility || 0) + (landmarks[23].visibility || 0) + (landmarks[27].visibility || 0);
        const rightVisibility = (landmarks[12].visibility || 0) + (landmarks[24].visibility || 0) + (landmarks[28].visibility || 0);

        const isLeft = leftVisibility > rightVisibility;

        const shoulder = isLeft ? landmarks[11] : landmarks[12];
        const elbow = isLeft ? landmarks[13] : landmarks[14];
        const wrist = isLeft ? landmarks[15] : landmarks[16];
        const hip = isLeft ? landmarks[23] : landmarks[24];
        const knee = isLeft ? landmarks[25] : landmarks[26];
        const ankle = isLeft ? landmarks[27] : landmarks[28];

        if ((shoulder.visibility || 0) < 0.5 || (hip.visibility || 0) < 0.5 || (ankle.visibility || 0) < 0.5) {
            setMessage("体がカメラに収まっていません");
            setIsGood(false);
            return;
        }

        const dy = ankle.y - shoulder.y;
        const dx = ankle.x - shoulder.x;
        const bodyAngleDegrees = Math.atan2(dy, dx) * (180 / Math.PI);
        const bodyInclination = Math.abs(bodyAngleDegrees);

        const isHorizontal = bodyInclination < 30 || bodyInclination > 150;

        if (!isHorizontal) {
            setMessage("プランクの姿勢をとってください");
            setIsGood(false);
            return;
        }

        if ((elbow.visibility || 0) > 0.5 && (wrist.visibility || 0) > 0.5) {
            const elbowAngle = calculateAngle(shoulder, elbow, wrist);
            if (elbowAngle > 135) {
                setMessage("肘を床につけてください！");
                setIsGood(false);
                return;
            }
        }

        if ((knee.visibility || 0) > 0.5) {
            const kneeAngle = calculateAngle(hip, knee, ankle);
            const THRESHOLD_KNEE_STRAIGHT = 150;

            if (kneeAngle < THRESHOLD_KNEE_STRAIGHT) {
                setMessage("膝を伸ばしてください！");
                setIsGood(false);
                return;
            }
        }

        const hipAngle = calculateAngle(shoulder, hip, ankle);
        const THRESHOLD_GOOD_MIN = 165;

        if (hipAngle >= THRESHOLD_GOOD_MIN) {
            setMessage("いいね！その調子！");
            setIsGood(true);
        } else {
            const deltaX = ankle.x - shoulder.x;
            if (Math.abs(deltaX) < 0.01) {
                setMessage("体がカメラに対して垂直すぎます");
                setIsGood(false);
                return;
            }

            const expectedHipY = shoulder.y + (hip.x - shoulder.x) * (ankle.y - shoulder.y) / deltaX;
            if (hip.y < expectedHipY) {
                setMessage("お尻が上がっています！下げて！");
            } else {
                setMessage("腰が下がっています！上げて！");
            }
            setIsGood(false);
        }
    }, [calculateAngle, setMessage, setIsGood]);

    const onPoseDetected = useCallback((results: Results) => {
        setLastResults(results);
        if (gameState === "ACTIVE") {
            checkForm(results);
        }
    }, [gameState, checkForm]);

    useEffect(() => {
        if (gameState === "ACTIVE" && isGood && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setGameState("FINISHED");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameState, isGood, timeLeft]);

    const handleStart = (duration?: number) => {
        if (duration) {
            setTargetDuration(duration);
            setTimeLeft(duration);
        }
        setGameState("ACTIVE");
    };

    // Save result when game finishes
    useEffect(() => {
        if (gameState === "FINISHED") {
            // targetDuration is captured at the time of finishing
            const duration = targetDuration;
            const saveResult = async () => {
                try {
                    await trainingApi.createLog({
                        performed_at: new Date().toISOString(),
                        exercise_name: "plank",
                        duration: duration,
                        count: 0
                    });
                    console.log("Training log saved!");
                } catch (err) {
                    console.error("Failed to save training log:", err);
                    // Optionally show error toast here
                }
            };
            saveResult();
        }
    }, [gameState]);

    const handleError = useCallback((err: any) => {
        setError(typeof err === 'string' ? err : err.message || "Unknown Camera Error");
    }, []);

    // --- Renders ---

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
                title="プランク"
                description={
                    <>
                        両肘とつま先を床につき、体を一直線に保ちます。<br />
                        お尻が上がったり下がったりしないように注意しましょう！
                    </>
                }
                onStart={handleStart}
                illustration={
                    <div className="text-6xl">🧘</div>
                }
                goalConfig={{
                    type: "time",
                    min: 10,
                    max: 120,
                    default: 30,
                    step: 10,
                    unit: "秒"
                }}
            />
        );
    }

    if (gameState === "FINISHED") {
        return (
            <TrainingResult
                score={`${targetDuration}秒`}
                scoreLabel="記録"
                onRetry={() => {
                    setTimeLeft(targetDuration);
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
                    label: "残り時間",
                    value: timeLeft,
                    unit: "秒"
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
