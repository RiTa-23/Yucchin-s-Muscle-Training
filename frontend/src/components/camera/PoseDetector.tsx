import { useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Pose, type Results } from "@mediapipe/pose";

interface PoseDetectorProps {
    onPoseDetected: (results: Results) => void;
    onError?: (error: any) => void; // Add onError prop
    interval?: number;
}

export const PoseDetector = ({ onPoseDetected, onError, interval = 100 }: PoseDetectorProps) => {
    const webcamRef = useRef<Webcam>(null);
    const poseRef = useRef<Pose | null>(null);
    const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const onPoseDetectedRef = useRef(onPoseDetected);

    useEffect(() => {
        onPoseDetectedRef.current = onPoseDetected;
    }, [onPoseDetected]);

    // Initialize MediaPipe Pose
    useEffect(() => {
        let mounted = true;

        const initializePose = async () => {
            try {
                const pose = new Pose({
                    locateFile: (file) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                    },
                });

                await pose.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    enableSegmentation: false,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                pose.onResults((results) => {
                    if (mounted && onPoseDetectedRef.current) {
                        onPoseDetectedRef.current(results);
                    }
                });

                if (mounted) {
                    poseRef.current = pose;
                }
            } catch (err) {
                console.error("Failed to initialize MediaPipe Pose:", err);
                if (mounted && onError) {
                    onError(err);
                }
            }
        };

        initializePose();

        return () => {
            mounted = false;
            if (poseRef.current) {
                poseRef.current.close();
            }
        };
    }, [onError]);

    const isProcessingRef = useRef(false);

    // Detection Loop
    const detect = useCallback(async () => {
        if (
            webcamRef.current &&
            webcamRef.current.video &&
            webcamRef.current.video.readyState === 4 &&
            poseRef.current &&
            !isProcessingRef.current
        ) {
            isProcessingRef.current = true;
            try {
                const video = webcamRef.current.video;
                await poseRef.current.send({ image: video });
            } catch (err) {
                console.error("MediaPipe Error:", err);
                if (onError) onError(err);
            } finally {
                isProcessingRef.current = false;
            }
        }
    }, [onError]);

    useEffect(() => {
        intervalIdRef.current = setInterval(detect, interval);
        return () => {
            if (intervalIdRef.current) clearInterval(intervalIdRef.current);
        };
    }, [detect, interval]);

    return (
        <div className="relative w-full h-full">
            <Webcam
                ref={webcamRef}
                className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]" // Mirror
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                    facingMode: "user",
                    width: 1280,
                    height: 720,
                }}
                onUserMediaError={onError} // Pass to Webcam
            />
        </div>
    );
};
