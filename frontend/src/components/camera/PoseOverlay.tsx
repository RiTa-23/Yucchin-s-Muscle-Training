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
        target?: number;
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
                    <div className="bg-white/95 px-8 py-6 rounded-2xl shadow-xl border-4 border-blue-500 text-center min-w-[180px]">
                        <p className="text-lg text-gray-500 font-bold mb-2">{stats.label}</p>
                        <p
                            key={stats.value}
                            className="text-6xl font-black text-blue-600 font-mono animate-in zoom-in-50 duration-150"
                        >
                            {stats.value}
                            {stats.target && <span className="text-4xl text-gray-400 mx-2">/ {stats.target}</span>}
                            {stats.unit && <span className="text-2xl ml-2 text-gray-600">{stats.unit}</span>}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
