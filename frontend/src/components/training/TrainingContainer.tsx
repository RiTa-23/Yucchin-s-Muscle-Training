import { Button } from "@/components/ui/button";
import { type Results } from "@mediapipe/pose";
import { TrainingGuide, type GoalConfig } from "./TrainingGuide";
import { TrainingResult } from "./TrainingResult";
import { PoseDetector } from "@/components/camera/PoseDetector";
import { PoseOverlay } from "@/components/camera/PoseOverlay";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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

    // Navigation (Quit)
    onQuit: () => void;
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
    onQuit
}: TrainingContainerProps) => {
    const { user } = useAuth();

    const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);

    // Default FPS logic if not provided
    const fps = useMemo(() => user?.settings?.fps || 20, [user?.settings?.fps]);
    const effectiveInterval = useMemo(() => interval || Math.floor(1000 / fps), [interval, fps]);

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
        <div className="relative w-full h-screen bg-black overflow-hidden">
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

            {/* Quit Button */}
            <Button
                variant="outline"
                className="absolute top-4 left-4 z-20 bg-white/80 hover:bg-white"
                onClick={() => setIsQuitModalOpen(true)}
            >
                やめる
            </Button>

            {/* Quit Confirmation Modal */}
            {isQuitModalOpen && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl p-6 max-w-xs w-full shadow-2xl scale-in-95 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-center mb-6 text-gray-900">
                            やめちゃうの？
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
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => setIsQuitModalOpen(false)}
                            >
                                やめない
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
