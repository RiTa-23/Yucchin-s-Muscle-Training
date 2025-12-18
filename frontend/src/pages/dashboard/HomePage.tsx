import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import mukiyuchiImg from "@/assets/mukiyuchiBK.png";
import { Settings, History, Trophy, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as React from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [yucchinHidden, setYucchinHidden] = React.useState<boolean>(() => {
    try {
      const v = localStorage.getItem("settings_yucchinHidden");
      return v === "true";
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    const checkHiddenStatus = () => {
      try {
        const v = localStorage.getItem("settings_yucchinHidden");
        setYucchinHidden(v === "true");
      } catch {
        // ignore
      }
    };
    window.addEventListener("storage", checkHiddenStatus);
    const interval = setInterval(checkHiddenStatus, 500);
    return () => {
      window.removeEventListener("storage", checkHiddenStatus);
      clearInterval(interval);
    };
  }, []);

  const handleSettings = () => {
    // TODO: Navigate to settings page
    navigate("/settings");
  };

  const handleHistory = () => {
    // TODO: Navigate to history page (mapped to existing route)
    navigate("/record");
  };

  const handleCollection = () => {
    // TODO: Navigate to collection page
    navigate("/collection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 relative overflow-hidden">
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

      {/* 左側の画像 */}
      {!yucchinHidden && (
        <img
          src={mukiyuchiImg}
          alt="mukiyuchi left"
          className="fixed left-0 bottom-0 w-[30vw] min-w-[250px] max-w-[600px] h-auto z-0 opacity-80 -translate-x-1/4 drop-shadow-[0_0_30px_rgba(251,146,60,0.8)]"
        />
      )}

      {/* 右側の画像 */}
      {!yucchinHidden && (
        <img
          src={mukiyuchiImg}
          alt="mukiyuchi right"
          className="fixed right-0 bottom-0 w-[30vw] min-w-[250px] max-w-[600px] h-auto z-0 opacity-80 transform scale-x-[-1] translate-x-1/4 drop-shadow-[0_0_30px_rgba(251,146,60,0.8)]"
        />
      )}
      <div className="max-w-none mx-auto space-y-8 relative z-10">
        <div className="flex justify-between items-center border-4 border-orange-500/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-4 gap-4 shadow-[0_0_40px_rgba(251,146,60,0.6)]">
          <Button
            variant="outline"
            onClick={handleSettings}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 text-white font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105"
          >
            <Settings className="w-4 h-4 mr-2" />
            設定
          </Button>
          <Button
            variant="outline"
            onClick={handleHistory}
            className="w-[400px] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 text-white font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105"
          >
            <History className="w-4 h-4 mr-2" />
            頑張りの歴史
          </Button>
          <Button
            variant="outline"
            onClick={handleCollection}
            className="w-[400px] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 text-white font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105"
          >
            <Trophy className="w-4 h-4 mr-2" />
            集めたゆっちん
          </Button>
          <div className="w-[100px] flex flex-col items-end justify-center gap-2">
            {user && (
              <span className="text-white font-bold text-sm drop-shadow-[0_0_5px_rgba(251,146,60,0.8)] whitespace-nowrap">
                {user.username} さん
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => logout()}
              size="sm"
              className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-2 border-red-500/50 text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.4)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all duration-300 hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="border-4 border-orange-500/50 hover:border-yellow-400 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-none p-4 w-full max-w-4xl h-[30rem] flex flex-col shadow-[0_0_40px_rgba(251,146,60,0.8)] hover:shadow-[0_0_60px_rgba(251,146,60,1)] transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col justify-center items-center border-4 border-yellow-400/50 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 p-4 mx-auto max-w-xl rounded-lg shadow-[0_0_30px_rgba(251,146,60,0.8)]">
                <h2
                  className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                  style={{
                    fontFamily:
                      '"RocknRoll One", ui-sans-serif, system-ui, sans-serif',
                  }}
                >
                  💪 どれにするぅ？ 💪
                </h2>
              </div>
            </CardHeader>
            <CardContent className="py-[60px]">
              <div className="grid grid-cols-3 gap-4 w-full">
                {/* スクワット */}
                {/* TODO: /training/squat ページを実装後、遷移先を変更 */}
                <Button
                  variant="outline"
                  onClick={() => navigate("/training/plank")}
                  className="hover:bg-accent hover:text-accent-foreground border-4 border-orange-500/50 hover:border-yellow-400 p-4 bg-gradient-to-br from-gray-700/90 to-gray-800/90 backdrop-blur-xl flex items-center justify-center text-white aspect-video h-auto shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_40px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-110 hover:-translate-y-2"
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    スクワット
                  </span>
                </Button>
                {/* プランク */}
                <Button
                  variant="outline"
                  onClick={() => navigate("/training/plank")}
                  className="hover:bg-accent hover:text-accent-foreground border-4 border-orange-500/50 hover:border-yellow-400 p-4 bg-gradient-to-br from-gray-700/90 to-gray-800/90 backdrop-blur-xl flex items-center justify-center text-white aspect-video h-auto shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_40px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-110 hover:-translate-y-2"
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    プランク
                  </span>
                </Button>
                {/* 腕立て */}
                {/* TODO: /training/pushup ページを実装後、遷移先を変更 */}
                <Button
                  variant="outline"
                  onClick={() => navigate("/training/plank")}
                  className="hover:bg-accent hover:text-accent-foreground border-4 border-orange-500/50 hover:border-yellow-400 p-4 bg-gradient-to-br from-gray-700/90 to-gray-800/90 backdrop-blur-xl flex items-center justify-center text-white aspect-video h-auto shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_40px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-110 hover:-translate-y-2"
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    腕立て
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* アニメーション用のスタイル */}
      <style>{`
        /* アクセシビリティ：モーション感度への配慮 */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
