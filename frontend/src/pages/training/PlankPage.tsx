import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { type Results, type NormalizedLandmark } from "@mediapipe/pose";
import { useAuth } from "@/context/AuthContext";
import { trainingApi } from "@/api/training";
import {
  TrainingContainer,
  type GameState,
} from "@/components/training/TrainingContainer";
import { useTrainer } from "@/hooks/useTrainer";
import { useOrientation } from "@/hooks/useOrientation";
import PortraitOverlay from "@/components/training/PortraitOverlay";
import plankIllustration from "@/assets/img/41.png";

// Helper to calculate angle between three points

export default function PlankPage() {
  const navigate = useNavigate();
  useAuth();
  const { play, isSpeaking, trainerMessage } = useTrainer();

  // State
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>("GUIDE");
  const [lastResults, setLastResults] = useState<Results | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isGood, setIsGood] = useState<boolean>(false);
  const [unlockedYucchinTypes, setUnlockedYucchinTypes] = useState<number[]>(
    []
  );

  // Plank specific state
  const [targetDuration, setTargetDuration] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs for stable access in quit handler
  const timeLeftRef = useRef<number>(30);
  const targetDurationRef = useRef<number>(30);

  // Sync refs with state
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    targetDurationRef.current = targetDuration;
  }, [targetDuration]);

  // --- Logic ---
  const calculateAngle = useCallback(
    (a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) => {
      const radians =
        Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
      let angle = Math.abs((radians * 180.0) / Math.PI);
      if (angle > 180.0) angle = 360 - angle;
      return angle;
    },
    []
  );

  const checkForm = useCallback(
    (results: Results) => {
      if (!results.poseLandmarks) return;
      const landmarks = results.poseLandmarks;

      const leftVisibility =
        (landmarks[11].visibility || 0) +
        (landmarks[23].visibility || 0) +
        (landmarks[27].visibility || 0);
      const rightVisibility =
        (landmarks[12].visibility || 0) +
        (landmarks[24].visibility || 0) +
        (landmarks[28].visibility || 0);

      const isLeft = leftVisibility > rightVisibility;

      const shoulder = isLeft ? landmarks[11] : landmarks[12];
      const elbow = isLeft ? landmarks[13] : landmarks[14];
      const wrist = isLeft ? landmarks[15] : landmarks[16];
      const hip = isLeft ? landmarks[23] : landmarks[24];
      const knee = isLeft ? landmarks[25] : landmarks[26];
      const ankle = isLeft ? landmarks[27] : landmarks[28];

      if (
        (shoulder.visibility || 0) < 0.5 ||
        (hip.visibility || 0) < 0.5 ||
        (ankle.visibility || 0) < 0.5
      ) {
        setMessage("体がカメラに収まっていません");
        play("camera", "体がカメラに収まってないよ！");
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
        play("plankPosture");
        setIsGood(false);
        return;
      }

      if ((elbow.visibility || 0) > 0.5 && (wrist.visibility || 0) > 0.5) {
        const elbowAngle = calculateAngle(shoulder, elbow, wrist);
        if (elbowAngle > 135) {
          setMessage("肘を床につけてください！");
          play("elbowsOnFloor");
          setIsGood(false);
          return;
        }
      }

      if ((knee.visibility || 0) > 0.5) {
        const kneeAngle = calculateAngle(hip, knee, ankle);
        const THRESHOLD_KNEE_STRAIGHT = 150;

        if (kneeAngle < THRESHOLD_KNEE_STRAIGHT) {
          setMessage("膝を伸ばしてください！");
          play("kneesStraight");
          setIsGood(false);
          return;
        }
      }

      const hipAngle = calculateAngle(shoulder, hip, ankle);
      const THRESHOLD_GOOD_MIN = 165;

      if (hipAngle >= THRESHOLD_GOOD_MIN) {
        setMessage("いいね！その調子！");
        setIsGood(true);
        play("good", "いいね！その調子！");
      } else {
        const deltaX = ankle.x - shoulder.x;
        if (Math.abs(deltaX) < 0.01) {
          setMessage("体がカメラに対して垂直すぎます");
          setIsGood(false);
          return;
        }

        const expectedHipY =
          shoulder.y + ((hip.x - shoulder.x) * (ankle.y - shoulder.y)) / deltaX;
        if (hip.y < expectedHipY) {
          setMessage("お尻が上がっています！下げて！");
          play("hipsHigh");
        } else {
          setMessage("腰が下がっています！上げて！");
          play("hipsLow");
        }
        setIsGood(false);
      }
    },
    [calculateAngle, play]
  );

  const onPoseDetected = useCallback(
    (results: Results) => {
      setLastResults(results);
      if (gameState === "ACTIVE") {
        checkForm(results);
      }
    },
    [gameState, checkForm]
  );

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

  // Save Logic
  useEffect(() => {
    if (gameState === "FINISHED") {
      play("finish", "お疲れ様！ナイスファイト！");
      const performedDuration = targetDurationRef.current - timeLeftRef.current;
      const saveResult = async () => {
        try {
          const response = await trainingApi.createLog({
            performed_at: new Date().toISOString(),
            exercise_name: "plank",
            duration: performedDuration,
            count: 0,
          });
          if (
            response.unlocked_yucchin_types &&
            response.unlocked_yucchin_types.length > 0
          ) {
            setUnlockedYucchinTypes(response.unlocked_yucchin_types);
          }
          console.log("Training log saved!", performedDuration);
        } catch (err) {
          console.error("Failed to save training log:", err);
        }
      };
      saveResult();
    }
  }, [gameState, play]);

  const handleError = useCallback((err: any) => {
    setError(
      typeof err === "string" ? err : err.message || "Unknown Camera Error"
    );
  }, []);

  const handleRetry = () => {
    setTimeLeft(targetDuration);
    setGameState("ACTIVE");
  };

  const handleQuit = useCallback(() => {
    const currentTarget = targetDurationRef.current;
    const currentTime = timeLeftRef.current;
    const performedDuration = currentTarget - currentTime;

    console.log("Quit Check:", {
      currentTarget,
      currentTime,
      performedDuration,
    });

    if (performedDuration > 0) {
      setGameState("FINISHED");
    } else {
      navigate("/home");
    }
  }, [navigate]);

  // Orientation detection (portrait vs landscape)
  const isPortrait = useOrientation();

  return (
    <>
      {isPortrait && <PortraitOverlay />}
      <TrainingContainer
        gameState={gameState}
        title="プランク"
        description={
          <>
            両肘とつま先を床につき、体を一直線に保ちます。
            <br />
            お尻が上がったり下がったりしないように注意しましょう！
          </>
        }
        descriptionPlacement="bottom"
        illustration={
          <img
            src={plankIllustration}
            alt="Plank illustration"
            className="w-full h-full max-h-[400px] object-contain"
          />
        }
        goalConfig={{
          type: "time",
          min: 10,
          max: 120,
          default: 30,
          step: 10,
          unit: "秒",
        }}
        onStart={handleStart}
        onPoseDetected={onPoseDetected}
        overlayResults={lastResults}
        feedbackMessage={message}
        isGoodPose={isGood}
        stats={{
          label: "残り時間",
          value: timeLeft,
          unit: "秒",
        }}
        cameraError={error}
        onError={handleError}
        score={`${targetDuration - timeLeft}秒`}
        onRetry={handleRetry}
        unlockedYucchinTypes={unlockedYucchinTypes}
        onQuit={handleQuit}
        isSpeaking={isSpeaking}
        trainerMessage={trainerMessage}
      />
    </>
  );
}
