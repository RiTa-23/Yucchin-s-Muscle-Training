import { useEffect, useRef } from "react";
import { type Results, POSE_CONNECTIONS } from "@mediapipe/pose";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface PoseOverlayProps {
    results: Results | null;
    feedback?: string;
    isGoodPose?: boolean;
    stats?: {
        label: string;
        value: string | number;
        unit?: string;
    };
}

export const PoseOverlay = ({ results, feedback, isGoodPose = false, stats }: PoseOverlayProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !results || !results.poseLandmarks) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize canvas to match image
        canvas.width = results.image.width;
        canvas.height = results.image.height;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mirror effect logic (Video is mirrored, so canvas should match)
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);

        // Draw Skeleton
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 4,
        });
        drawLandmarks(ctx, results.poseLandmarks, {
            color: "#FF0000",
            lineWidth: 2,
        });

        ctx.restore();
    }, [results]);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <canvas ref={canvasRef} className="w-full h-full object-cover" />

            {/* Feedback Message (Center Top) */}
            {feedback && (
                <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-full text-white text-2xl font-bold transition-colors duration-300 shadow-lg ${isGoodPose ? 'bg-green-500/90' : 'bg-red-500/90'
                    }`}>
                    {feedback}
                </div>
            )}

            {/* Stats Panel (Top Right) */}
            {stats && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="bg-white/90 px-6 py-4 rounded-xl shadow-lg border-2 border-blue-500 text-center min-w-[140px]">
                        <p className="text-sm text-gray-500 font-bold mb-1">{stats.label}</p>
                        <p className="text-4xl font-black text-blue-600 font-mono">
                            {stats.value}
                            {stats.unit && <span className="text-lg ml-1">{stats.unit}</span>}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
