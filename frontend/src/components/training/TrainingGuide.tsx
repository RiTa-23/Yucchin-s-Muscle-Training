import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import backSound from "@/assets/sounds/he-sound_T01.wav";
import { playSound } from "@/utils/audio";

export interface GoalConfig {
  type: "time" | "count";
  min: number;
  max: number;
  default: number;
  step?: number;
  unit: string;
}

interface TrainingGuideProps {
  title: string;
  description: React.ReactNode;
  onStart: (goalValue?: number) => void;
  illustration?: React.ReactNode;
  goalConfig?: GoalConfig;
}

export const TrainingGuide = ({
  title,
  description,
  onStart,
  illustration,
  goalConfig,
}: TrainingGuideProps) => {
  const navigate = useNavigate();
  const [currentGoal, setCurrentGoal] = useState<number>(
    goalConfig?.default || 0
  );

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 overflow-hidden">
      {/* 背景の装飾 */}
      <div className="absolute inset-0 opacity-20">
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
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,165,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,165,0,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="max-w-2xl w-full bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border-4 border-orange-500/50 rounded-2xl shadow-[0_0_40px_rgba(251,146,60,0.6)] overflow-hidden flex flex-col max-h-[90vh] relative z-10">
        {/* Header */}
        <div className="p-6 border-b-4 border-orange-500/50 flex items-center relative bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white rounded-full border-2 border-orange-400/80 bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 hover:from-orange-400 hover:via-orange-500 hover:to-red-500 transition-all shadow-[0_0_18px_rgba(251,146,60,0.7)]"
            onClick={async () => {
              await playSound(backSound);
              navigate("/home");
            }}
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={3.5} />
          </Button>
          <h1 className="text-2xl font-bold text-center w-full bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto flex flex-col items-center text-center">
          {illustration && (
            <div className="w-full max-w-sm aspect-video bg-gradient-to-br from-gray-700/50 to-gray-800/50 border-2 border-orange-500/30 rounded-lg mb-8 flex items-center justify-center overflow-hidden">
              {illustration}
            </div>
          )}

          <div className="text-gray-200 text-lg leading-relaxed mb-8 space-y-4">
            {description}
          </div>

          {/* Goal Setting */}
          {goalConfig && (
            <div className="w-full max-w-sm mb-8 bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-3 rounded-xl border-2 border-orange-500/30 shadow-[0_0_20px_rgba(251,146,60,0.4)]">
              <label className="block text-center font-bold text-yellow-300 mb-1">
                目標設定
              </label>
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  {currentGoal}
                </span>
                <span className="text-xl text-gray-300 pt-2">
                  {goalConfig.unit}
                </span>
              </div>

              <input
                type="range"
                min={goalConfig.min}
                max={goalConfig.max}
                step={goalConfig.step || 1}
                value={currentGoal}
                onChange={(e) => setCurrentGoal(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>
                  {goalConfig.min}
                  {goalConfig.unit}
                </span>
                <span>
                  {goalConfig.max}
                  {goalConfig.unit}
                </span>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full max-w-xs text-lg py-6 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 text-white font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] hover:scale-105"
            onClick={() => onStart(goalConfig ? currentGoal : undefined)}
          >
            スタート！
          </Button>
        </div>
      </div>
    </div>
  );
};
