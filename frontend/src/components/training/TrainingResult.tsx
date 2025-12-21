import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, RefreshCcw, Home } from "lucide-react";

interface TrainingResultProps {
  title?: string;
  subTitle?: string;
  score?: string | number;
  scoreLabel?: string;
  onRetry?: () => void;
  unlockedYucchinTypes?: number[];
}

export const TrainingResult = ({
  title = "トレーニング完了！",
  subTitle = "素晴らしいフォームでした。昨日の自分を超えましたね！",
  score,
  scoreLabel,
  onRetry,
  unlockedYucchinTypes,
}: TrainingResultProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 animate-in fade-in duration-500 overflow-hidden">
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

      <div className="max-w-md w-full text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <div className="bg-gradient-to-br from-yellow-400/30 to-orange-500/30 backdrop-blur-sm p-6 rounded-full border-2 border-yellow-400/50 shadow-[0_0_30px_rgba(251,146,60,0.6)]">
            <Trophy className="h-16 w-16 text-yellow-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-orange-200 mb-8">{subTitle}</p>

        {unlockedYucchinTypes && unlockedYucchinTypes.length > 0 && (
          <div className="mb-6 animate-bounce">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full font-bold shadow-[0_0_20px_rgba(251,146,60,0.8)] text-lg border-2 border-yellow-400/50">
              🎉 新しいゆっちんを発見！
            </span>
          </div>
        )}

        {score !== undefined && score !== null && (
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-orange-500/50 backdrop-blur-xl p-6 rounded-2xl mb-8 shadow-[0_0_20px_rgba(251,146,60,0.6)]">
            <p className="text-sm font-bold text-yellow-300 uppercase tracking-wider mb-1">
              {scoreLabel}
            </p>
            <p className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              {score}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {!(unlockedYucchinTypes && unlockedYucchinTypes.length > 0) && (
            <Button
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 text-white font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/home")}
            >
              <Home className="h-4 w-4" />
              ホームに戻る
            </Button>
          )}

          {onRetry &&
            !(unlockedYucchinTypes && unlockedYucchinTypes.length > 0) && (
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-orange-500/50 hover:border-yellow-400 text-yellow-300 hover:text-yellow-200 font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105 backdrop-blur-xl"
                onClick={onRetry}
              >
                <RefreshCcw className="h-4 w-4" />
                もう一度する
              </Button>
            )}

          {unlockedYucchinTypes && unlockedYucchinTypes.length > 0 && (
            <Button
              size="lg"
              variant="secondary"
              className="w-full gap-2 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white border-2 border-yellow-400/50 font-bold shadow-[0_0_20px_rgba(251,146,60,0.8)] hover:shadow-[0_0_30px_rgba(251,146,60,1)] animate-pulse mt-4"
              onClick={() =>
                navigate(`/get?types=${unlockedYucchinTypes.join(",")}`)
              }
            >
              <Trophy className="h-5 w-5" />
              新しいゆっちんをゲットする！
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
