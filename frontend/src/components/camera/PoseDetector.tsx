import { useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Pose, type Results } from "@mediapipe/pose";

interface PoseDetectorProps {
    onPoseDetected: (results: Results) => void;
    interval?: number; // Detection interval in ms (default 100ms = 10fps)
}

export const PoseDetector = ({ onPoseDetected, interval = 100 }: PoseDetectorProps) => {
    const webcamRef = useRef<Webcam>(null);
    const poseRef = useRef<Pose | null>(null);
    const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const onPoseDetectedRef = useRef(onPoseDetected);

    useEffect(() => {
        onPoseDetectedRef.current = onPoseDetected;
    }, [onPoseDetected]);

    // Initialize MediaPipe Pose
    useEffect(() => {
        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
            if (onPoseDetectedRef.current) {
                onPoseDetectedRef.current(results);
            }
        });
        poseRef.current = pose;

        return () => {
            pose.close();
        };
    }, []); // Run only once

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
            } finally {
                isProcessingRef.current = false;
            }
        }
    }, []);

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
            />
        </div>
    );
};
