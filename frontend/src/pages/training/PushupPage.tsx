import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { type Results, type NormalizedLandmark } from "@mediapipe/pose";
import { trainingApi } from "@/api/training";
import {
  TrainingContainer,
  type GameState,
} from "@/components/training/TrainingContainer";
import { useTrainer } from "@/hooks/useTrainer";
import { useOrientation } from "@/hooks/useOrientation";
import PortraitOverlay from "@/components/training/PortraitOverlay";
import pushupIllustration from "@/assets/img/udetate.png";

type PushupState = "UP" | "DOWN";

export default function PushupPage() {
  const navigate = useNavigate();

  // Use Trainer Hook
  const { play, isSpeaking, trainerMessage } = useTrainer();

  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>("GUIDE");
  const [lastResults, setLastResults] = useState<Results | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isGood, setIsGood] = useState<boolean>(false);
  const [unlockedYucchinTypes, setUnlockedYucchinTypes] = useState<number[]>(
    []
  );

  // Push-up specific states
  const [count, setCount] = useState<number>(0);
  const [pushupState, setPushupState] = useState<PushupState>("UP");
  const [targetCount, setTargetCount] = useState<number>(10);

  // Refs for stable state access in callbacks
  const lastMessageRef = useRef<string>("");

  const safeSetMessage = useCallback((msg: string) => {
    if (lastMessageRef.current !== msg) {
      setMessage(msg);
      lastMessageRef.current = msg;
    }
  }, []);

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

  const [cameraAngle, setCameraAngle] = useState<"front" | "side">("front");

  const checkForm = useCallback(
    (results: Results) => {
      if (!results.poseLandmarks) return;
      const landmarks = results.poseLandmarks;

      const leftVisibility =
        (landmarks[11].visibility || 0) +
        (landmarks[13].visibility || 0) +
        (landmarks[15].visibility || 0);
      const rightVisibility =
        (landmarks[12].visibility || 0) +
        (landmarks[14].visibility || 0) +
        (landmarks[16].visibility || 0);
      const isLeft = leftVisibility > rightVisibility;

      const shoulder = isLeft ? landmarks[11] : landmarks[12];
      const elbow = isLeft ? landmarks[13] : landmarks[14];
      const wrist = isLeft ? landmarks[15] : landmarks[16];
      const hip = isLeft ? landmarks[23] : landmarks[24];

      // Body alignment check
      const bodyDx = Math.abs(shoulder.x - hip.x);
      const bodyDy = Math.abs(shoulder.y - hip.y);

      let isStanding = false;

      if (cameraAngle === "front") {
        // === FRONT MODE ===
        if (bodyDy > 0.3) {
          isStanding = true;
        }
      } else {
        // === SIDE MODE ===
        if (bodyDy > bodyDx) {
          isStanding = true;
        }
      }

      if (isStanding) {
        safeSetMessage("腕立て伏せの姿勢になってください");
        setIsGood(false);
        return;
      }

      if (
        (shoulder.visibility || 0) < 0.5 ||
        (elbow.visibility || 0) < 0.5 ||
        (wrist.visibility || 0) < 0.5
      ) {
        safeSetMessage(
          "上半身（肩・肘・手首）がはっきり映るようにしてください"
        );
        setIsGood(false);
        return;
      }

      const elbowAngle = calculateAngle(shoulder, elbow, wrist);

      const UP_THRESHOLD = 150;
      const DOWN_THRESHOLD = 90;

      if (pushupState === "UP") {
        if (elbowAngle < DOWN_THRESHOLD) {
          setPushupState("DOWN");
          safeSetMessage("Good! そのまま体を押し上げて！");
          setIsGood(true);
        } else if (elbowAngle < 130) {
          safeSetMessage("もっと深く曲げて！");
          setIsGood(true); // Encouraging
        } else {
          safeSetMessage("スタート！体を沈めてください");
          play("pushupDown");
          setIsGood(true);
        }
      } else if (pushupState === "DOWN") {
        if (elbowAngle > UP_THRESHOLD) {
          setPushupState("UP");
          setCount((prev) => prev + 1);
          safeSetMessage("ナイスプッシュアップ！");
          if (Math.random() < 0.5) {
            play("nicePushup");
          } else {
            play("good");
          }
          setIsGood(true);
        } else {
          safeSetMessage("体を押し上げて！");
          setIsGood(true);
        }
      }
    },
    [calculateAngle, pushupState, safeSetMessage, cameraAngle, play]
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

  // Check for finish condition
  useEffect(() => {
    if (gameState === "ACTIVE" && count >= targetCount) {
      setGameState("FINISHED");
      play("finish", "お疲れ様！ナイスプッシュアップ！");
    }
  }, [count, targetCount, gameState, play]);

  const handleStart = (target?: number) => {
    if (target) {
      setTargetCount(target);
    }
    setCount(0);
    setPushupState("UP");
    setGameState("ACTIVE");
  };

  // Save result when game finishes
  useEffect(() => {
    if (gameState === "FINISHED") {
      const saveResult = async () => {
        try {
          const response = await trainingApi.createLog({
            performed_at: new Date().toISOString(),
            exercise_name: "pushup",
            duration: 0,
            count: count,
          });
          if (
            response.unlocked_yucchin_types &&
            response.unlocked_yucchin_types.length > 0
          ) {
            setUnlockedYucchinTypes(response.unlocked_yucchin_types);
          }
          console.log("Training log saved!");
        } catch (err) {
          console.error("Failed to save training log:", err);
        }
      };
      saveResult();
    }
  }, [gameState, count]);

  const handleError = useCallback((err: any) => {
    setError(
      typeof err === "string" ? err : err.message || "Unknown Camera Error"
    );
  }, []);

  const handleRetry = () => {
    setCount(0);
    setPushupState("UP");
    setGameState("ACTIVE");
  };

  const handleQuit = () => {
    if (count > 0) {
      setGameState("FINISHED");
    } else {
      navigate("/home");
    }
  };

  // Orientation detection (portrait vs landscape)
  const isPortrait = useOrientation();

  return (
    <>
      {isPortrait && <PortraitOverlay />}
      <TrainingContainer
        gameState={gameState}
        // Guide
        title="腕立て伏せ"
        description={
          <>
            肩幅より少し広く手をつき、頭から足まで一直線にします。
            <br />
            肘を曲げて体を深く沈め、力強く押し上げましょう！
          </>
        }
        descriptionPlacement="bottom"
        illustration={
          <img
            src={pushupIllustration}
            alt="Pushup illustration"
            className="w-full h-full max-h-[400px] object-contain"
          />
        }
        goalConfig={{
          type: "count",
          min: 5,
          max: 50,
          default: 10,
          step: 5,
          unit: "回",
        }}
        onStart={handleStart}
        // Active
        onPoseDetected={onPoseDetected}
        overlayResults={lastResults}
        feedbackMessage={message}
        isGoodPose={isGood}
        stats={{
          label: "回数",
          value: count,
          target: targetCount,
          unit: "回",
        }}
        cameraError={error}
        onError={handleError}
        // Result
        score={`${count}回`}
        onRetry={handleRetry}
        unlockedYucchinTypes={unlockedYucchinTypes}
        // Navigation
        onQuit={handleQuit}
        // Camera Toggle
        cameraAngle={cameraAngle}
        onCameraAngleChange={setCameraAngle}
        // Trainer
        isSpeaking={isSpeaking}
        trainerMessage={trainerMessage}
      />
    </>
  );
}
