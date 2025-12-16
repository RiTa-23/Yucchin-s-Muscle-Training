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
    const [timeLeft, setTimeLeft] = useState<number>(30); // 30 seconds plank

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

        // Use left side (11, 23, 27)
        const leftShoulder = landmarks[11];
        const leftHip = landmarks[23];
        const leftAnkle = landmarks[27];

        // Visibility Check
        if ((leftShoulder.visibility || 0) < 0.5 || (leftHip.visibility || 0) < 0.5 || (leftAnkle.visibility || 0) < 0.5) {
            setMessage("体がカメラに収まっていません");
            setIsGood(false);
            return;
        }

        const hipAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);

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


    // --- Renders ---

    if (gameState === "GUIDE") {
        return (
            <TrainingGuide
                title="プランクチャレンジ"
                description={
                    <>
                        <p>カメラに向かって<strong>横向き</strong>になり、頭から足先までを一直線に保ちましょう。</p>
                        <p>正しい姿勢を計<strong>30秒</strong>キープできればクリアです！</p>
                    </>
                }
                onStart={() => setGameState("ACTIVE")}
                illustration={
                    <div className="text-gray-400">
                        {/* Replace with actual SVG or Image */}
                        (プランクのイラスト)
                    </div>
                }
            />
        );
    }

    if (gameState === "FINISHED") {
        return (
            <TrainingResult
                score="30秒"
                scoreLabel="記録"
                onRetry={() => {
                    setTimeLeft(30);
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
