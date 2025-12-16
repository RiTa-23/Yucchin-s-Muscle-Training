import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, RefreshCcw, Home } from "lucide-react";

interface TrainingResultProps {
    title?: string;
    subTitle?: string;
    score?: string | number;
    scoreLabel?: string;
    onRetry?: () => void;
}

export const TrainingResult = ({
    title = "トレーニング完了！",
    subTitle = "素晴らしいフォームでした。昨日の自分を超えましたね！",
    score,
    scoreLabel,
    onRetry
}: TrainingResultProps) => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="max-w-md w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="bg-yellow-100 p-6 rounded-full">
                        <Trophy className="h-16 w-16 text-yellow-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2 text-gray-900">{title}</h1>
                <p className="text-gray-600 mb-8">{subTitle}</p>

                {score && (
                    <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{scoreLabel}</p>
                        <p className="text-5xl font-black text-blue-600">{score}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        size="lg"
                        className="w-full gap-2"
                        onClick={() => navigate('/home')}
                    >
                        <Home className="h-4 w-4" />
                        ホームに戻る
                    </Button>

                    {onRetry && (
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full gap-2"
                            onClick={onRetry}
                        >
                            <RefreshCcw className="h-4 w-4" />
                            もう一度する
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
