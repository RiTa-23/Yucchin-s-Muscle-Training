import { Button } from "@/components/ui/button";
import { type Results } from "@mediapipe/pose";
import { TrainingGuide, type GoalConfig } from "./TrainingGuide";
import { TrainingResult } from "./TrainingResult";
import { PoseDetector } from "@/components/camera/PoseDetector";
import { PoseOverlay } from "@/components/camera/PoseOverlay";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import trainerImage from "@/assets/mukiyuchiBK.png";
import client from "@/api/client";
import yamerunoImage from "@/assets/img/yameruno.png";

export type GameState = "GUIDE" | "ACTIVE" | "FINISHED";

interface TrainingContainerProps {
    // Current state
    gameState: GameState;

    // Guide Props
    title: string;
    description: React.ReactNode;
    illustration?: React.ReactNode;
    goalConfig?: GoalConfig;
    onStart: (goalValue?: number) => void;

    // Active Props (Pose Detection & Overlay)
    interval?: number; // Optional, defaults to user settings or 20fps
    onPoseDetected: (results: Results) => void;
    overlayResults: Results | null;
    feedbackMessage: string;
    isGoodPose: boolean;
    stats: {
        label: string;
        value: string | number;
        target?: number;
        unit: string;
    };
    cameraError: string | null;
    onError: (error: any) => void;

    // Result Props
    score: string | number;
    scoreLabel?: string;
    resultTitle?: string;
    resultSubTitle?: string;
    onRetry: () => void;

    // Trainer
    isSpeaking?: boolean;
    trainerMessage?: string | null;

    // Navigation (Quit)
    onQuit: () => void;

    // Camera Angle Toggle
    cameraAngle?: 'front' | 'side';
    onCameraAngleChange?: (angle: 'front' | 'side') => void;
}

export const TrainingContainer = ({
    gameState,
    title,
    description,
    illustration,
    goalConfig,
    onStart,
    interval,
    onPoseDetected,
    overlayResults,
    feedbackMessage,
    isGoodPose,
    stats,
    cameraError,
    onError,
    score,
    scoreLabel,
    resultTitle,
    resultSubTitle,
    onRetry,
    isSpeaking,
    trainerMessage,
    onQuit,
    cameraAngle,
    onCameraAngleChange
}: TrainingContainerProps) => {
    const { user, refreshUser } = useAuth();

    const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);

    // FPS Control
    const [localFps, setLocalFps] = useState<number>(user?.settings?.fps || 20);
    const effectiveInterval = useMemo(() => Math.floor(1000 / localFps), [localFps]);

    // Reset modal state when gameState changes (e.g. Retry)
    useEffect(() => {
        setIsQuitModalOpen(false);
    }, [gameState]);

    const handleFpsChange = async (rate: number) => {
        setLocalFps(rate);
        try {
            await client.put("/settings/me", { fps: rate });
            await refreshUser();
        } catch (error) {
            console.error("Failed to save FPS setting:", error);
        }
    };

    // Error View
    if (cameraError) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                <div className="bg-white p-8 rounded-lg max-w-md text-center">
                    <p className="text-red-600 mb-4 font-bold">カメラエラーが発生しました</p>
                    <p className="text-gray-700 mb-6">{cameraError}</p>
                    <Button onClick={onQuit}>ホームに戻る</Button>
                </div>
            </div>
        );
    }

    // Guide View
    if (gameState === "GUIDE") {
        return (
            <TrainingGuide
                title={title}
                description={description}
                onStart={onStart}
                illustration={illustration}
                goalConfig={goalConfig}
            />
        );
    }

    // Result View
    if (gameState === "FINISHED") {
        return (
            <TrainingResult
                title={resultTitle}
                subTitle={resultSubTitle}
                score={score}
                scoreLabel={scoreLabel || "記録"}
                onRetry={onRetry}
            />
        );
    }

    // Active (Camera) View
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* 背景の装飾 */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-orange-600 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-red-600 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1.5s" }}
                ></div>
            </div>

            {/* グリッド背景 */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,165,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,165,0,0.3) 1px, transparent 1px)",
                    backgroundSize: "50px 50px",
                }}
            ></div>

            {/* Quit Button (Top Left) */}
            <div className="absolute top-4 left-4 z-50">
                <Button
                    variant="outline"
                    className="bg-white/80 hover:bg-white border-2 border-orange-500/50 hover:border-orange-500 text-gray-900 font-bold shadow-[0_0_10px_rgba(251,146,60,0.4)] transition-all"
                    onClick={() => setIsQuitModalOpen(true)}
                >
                    やめる
                </Button>
            </div>

            {/* Top Right Controls Container */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 items-end">
                {/* FPS Toggle */}
                <div className="flex bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
                    {[10, 20, 30].map((rate) => (
                        <button
                            key={rate}
                            className={`px-3 py-1 text-sm rounded-md font-bold transition-all ${localFps === rate
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white'
                                }`}
                            onClick={() => handleFpsChange(rate)}
                        >
                            {rate}fps
                        </button>
                    ))}
                </div>

                {/* Camera Angle Toggle */}
                {onCameraAngleChange && cameraAngle && (
                    <div className="flex bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
                        <button
                            className={`px-4 py-2 rounded-md font-bold transition-all ${cameraAngle === 'front'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white'
                                }`}
                            onClick={() => onCameraAngleChange('front')}
                        >
                            正面
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md font-bold transition-all ${cameraAngle === 'side'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white'
                                }`}
                            onClick={() => onCameraAngleChange('side')}
                        >
                            横
                        </button>
                    </div>
                )}
            </div>

            {/* Camera FrameContainer */}
            <div className="relative w-full max-w-6xl aspect-video border-4 border-orange-500/50 rounded-xl shadow-[0_0_60px_rgba(251,146,60,0.6)] overflow-hidden bg-black z-10">
                {/* Camera Layer */}
                <PoseDetector
                    onPoseDetected={onPoseDetected}
                    interval={effectiveInterval}
                    onError={onError}
                />

                {/* Overlay Layer */}
                <PoseOverlay
                    results={overlayResults}
                    feedback={feedbackMessage}
                    isGoodPose={isGoodPose}
                    stats={stats}
                />
            </div>

            {/* Trainer Avatar */}
            {/* Trainer Avatar Area */}
            <div className="absolute bottom-0 right-4 z-40 w-48">

                {/* Speech Bubble (Static, Larger) */}
                {isSpeaking && trainerMessage && (
                    <div className="absolute -top-60 right-10 w-[800px] max-w-[90vw] bg-white p-10 rounded-3xl shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="relative">
                            <p className="text-gray-900 font-bold text-4xl text-center leading-relaxed">
                                {trainerMessage}
                            </p>
                        </div>
                        {/* Tailwind Triangle for Bubble Tail - Moved to parent relative context */}
                        <div className="absolute top-full right-24 w-0 h-0 border-l-[20px] border-l-transparent border-t-[30px] border-t-white border-r-[20px] border-r-transparent drop-shadow-sm"></div>
                    </div>
                )}

                {/* Character Image (Shaking) */}
                <div className={isSpeaking ? 'animate-talk-shake' : ''}>
                    <img
                        src={trainerImage}
                        alt="Trainer"
                        className="w-full h-auto drop-shadow-[0_0_15px_rgba(251,146,60,0.6)]"
                    />
                </div>
            </div>

            {/* Quit Confirmation Modal */}
            {isQuitModalOpen && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl scale-in-95 animate-in zoom-in-95 duration-200 border-4 border-orange-500 flex flex-col items-center">
                        <img
                            src={yamerunoImage}
                            alt="やめるんですか？"
                            className="w-full h-auto mb-6"
                        />
                        <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                            やめるんですか？
                        </h3>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-gray-300"
                                onClick={onQuit}
                            >
                                やめる
                            </Button>
                            <Button
                                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-none shadow-lg"
                                onClick={() => setIsQuitModalOpen(false)}
                            >
                                やめない
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* アニメーション用のスタイル */}

        </div>
    );
};
