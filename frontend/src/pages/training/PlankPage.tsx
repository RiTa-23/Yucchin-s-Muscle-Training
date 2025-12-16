import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PoseDetector } from "@/components/camera/PoseDetector";
import { PoseOverlay } from "@/components/camera/PoseOverlay";
import { TrainingGuide } from "@/components/training/TrainingGuide";
import { TrainingResult } from "@/components/training/TrainingResult";
import { type Results, type NormalizedLandmark } from "@mediapipe/pose";
import { useAuth } from "@/context/AuthContext";

type GameState = "GUIDE" | "ACTIVE" | "FINISHED";

export default function PlankPage() {
    const { user } = useAuth();
    const fps = user?.settings?.fps || 20;
    const interval = Math.floor(1000 / fps);

    const [gameState, setGameState] = useState<GameState>("GUIDE");
    const [lastResults, setLastResults] = useState<Results | null>(null);
    const [message, setMessage] = useState<string>("");
    const [isGood, setIsGood] = useState<boolean>(false);
    const [targetDuration, setTargetDuration] = useState<number>(30);
    const [timeLeft, setTimeLeft] = useState<number>(30); // Default 30s

    // Timer ref
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Logic ---

    // Calculate angle at B (A-B-C)
    const calculateAngle = (a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) => {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    };

    const checkForm = (results: Results) => {
        if (!results.poseLandmarks) return;
        const landmarks = results.poseLandmarks;

        // Define landmarks for both sides
        // Left: 11(Shoulder), 13(Elbow), 15(Wrist), 23(Hip), 25(Knee), 27(Ankle)
        // Right: 12(Shoulder), 14(Elbow), 16(Wrist), 24(Hip), 26(Knee), 28(Ankle)

        // Calculate average visibility to decide which side to use
        const leftVisibility = (landmarks[11].visibility || 0) + (landmarks[23].visibility || 0) + (landmarks[27].visibility || 0);
        const rightVisibility = (landmarks[12].visibility || 0) + (landmarks[24].visibility || 0) + (landmarks[28].visibility || 0);

        const isLeft = leftVisibility > rightVisibility;

        const shoulder = isLeft ? landmarks[11] : landmarks[12];
        const elbow = isLeft ? landmarks[13] : landmarks[14];
        const wrist = isLeft ? landmarks[15] : landmarks[16];
        const hip = isLeft ? landmarks[23] : landmarks[24];
        const knee = isLeft ? landmarks[25] : landmarks[26];
        const ankle = isLeft ? landmarks[27] : landmarks[28];

        // Visibility Check (Shoulder, Hip, Ankle)
        if ((shoulder.visibility || 0) < 0.5 || (hip.visibility || 0) < 0.5 || (ankle.visibility || 0) < 0.5) {
            setMessage("体がカメラに収まっていません");
            setIsGood(false);
            return;
        }

        // Horizontal Check: Calculate angle of the body (Shoulder to Ankle) relative to horizontal
        const dy = ankle.y - shoulder.y;
        const dx = ankle.x - shoulder.x;
        const bodyAngleBytes = Math.atan2(dy, dx) * (180 / Math.PI);
        const bodyInclination = Math.abs(bodyAngleBytes);

        // Accept if angle is within 0-30 degrees (Right facing) or 150-180 degrees (Left facing)
        const isHorizontal = bodyInclination < 30 || bodyInclination > 150;

        if (!isHorizontal) {
            setMessage("プランクの姿勢をとってください");
            setIsGood(false);
            return;
        }

        // Elbow Check: Ensure elbows are bent (on the ground)
        if ((elbow.visibility || 0) > 0.5 && (wrist.visibility || 0) > 0.5) {
            const elbowAngle = calculateAngle(shoulder, elbow, wrist);
            // If arm is too straight (> 135 degrees), user is likely doing a high plank (push-up pos)
            if (elbowAngle > 135) {
                setMessage("肘を床につけてください！");
                setIsGood(false);
                return;
            }
        }

        // Knee Check: Ensure knees are straight (not on ground/bent)
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

        // Plank Thresholds
        const THRESHOLD_GOOD_MIN = 165;

        if (hipAngle >= THRESHOLD_GOOD_MIN) {
            setMessage("いいね！その調子！");
            setIsGood(true);
        } else {
            setMessage("腰が曲がっています！まっすぐに！");
            setIsGood(false);
        }
    };

    const onPoseDetected = (results: Results) => {
        setLastResults(results);
        if (gameState === "ACTIVE") {
            checkForm(results);
        }
    };

    // Timer Logic
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


    // --- Renders ---

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
            <PoseDetector onPoseDetected={onPoseDetected} interval={interval} />

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
                onClick={() => window.location.href = '/home'}
            >
                終了
            </Button>
        </div>
    );
}
