import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export const TrainingGuide = ({ title, description, onStart, illustration, goalConfig }: TrainingGuideProps) => {
    const navigate = useNavigate();
    const [currentGoal, setCurrentGoal] = useState<number>(goalConfig?.default || 0);

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b flex items-center relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4"
                        onClick={() => navigate('/home')}
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold text-center w-full">{title}</h1>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto flex flex-col items-center text-center">

                    {illustration && (
                        <div className="w-full max-w-sm aspect-video bg-gray-100 rounded-lg mb-8 flex items-center justify-center overflow-hidden">
                            {illustration}
                        </div>
                    )}

                    <div className="text-gray-600 text-lg leading-relaxed mb-8 space-y-4">
                        {description}
                    </div>

                    {/* Goal Setting */}
                    {goalConfig && (
                        <div className="w-full max-w-sm mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <label className="block text-center font-bold text-gray-700 mb-4">
                                目標設定
                            </label>
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <span className="text-4xl font-bold text-blue-600">
                                    {currentGoal}
                                </span>
                                <span className="text-xl text-gray-500 pt-2">
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
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-2">
                                <span>{goalConfig.min}{goalConfig.unit}</span>
                                <span>{goalConfig.max}{goalConfig.unit}</span>
                            </div>
                        </div>
                    )}

                    <Button
                        size="lg"
                        className="w-full max-w-xs text-xl py-8 rounded-full shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => onStart(goalConfig ? currentGoal : undefined)}
                    >
                        スタート！
                    </Button>
                </div>
            </div>
        </div>
    );
};
