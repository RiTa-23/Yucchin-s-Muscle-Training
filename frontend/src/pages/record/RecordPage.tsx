import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import {
  trainingApi,
  type TrainingLogResponse,
  type TrainingStatsResponse,
} from "@/api/training";
import { playSound } from "@/utils/audio";
import clickSound from "@/assets/sounds/hehe_T01.wav";
import backSound from "@/assets/sounds/he-sound_T01.wav";
import { Button } from "@/components/ui/button";

export default function RecordPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TrainingStatsResponse | null>(null);
  const [todayLogs, setTodayLogs] = useState<TrainingLogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          trainingApi.getStats(),
          trainingApi.getLogs(),
        ]);

        setStats(statsData);

        // Filter logs for today
        const today = new Date().toDateString();
        const todays = logsData.filter(
          (log) => new Date(log.performed_at).toDateString() === today
        );
        setTodayLogs(todays);
      } catch (err) {
        console.error("Failed to fetch record data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0秒";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}分${s}秒` : `${s}秒`;
  };

  const getExerciseLabel = (name: string) => {
    switch (name) {
      case "plank":
        return "プランク";
      case "pushup":
        return "腕立て伏せ";
      case "squat":
        return "スクワット";
      default:
        return name;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 flex items-center justify-center relative overflow-hidden">
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
        <p className="text-xl font-bold text-yellow-400 relative z-10">
          読み込み中...
        </p>
      </div>
    );
  }

  // Helper to find stat by name
  const findStat = (name: string) =>
    stats?.total_stats.find((s) => s.exercise_name === name);

  // Group 1: Total & Streak
  const totalItems = [
    { label: "継続日数", value: `${stats?.streak_days || 0}日` },
    {
      label: "プランク",
      value: formatDuration(findStat("plank")?.total_duration || 0),
    },
    { label: "スクワット", value: `${findStat("squat")?.total_count || 0}回` },
    { label: "腕立て伏せ", value: `${findStat("pushup")?.total_count || 0}回` },
  ];

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group 2: Today's Logs (Chronological)
  // Sort logs by time (ascending) just in case
  const sortedTodayLogs = [...todayLogs].sort(
    (a, b) =>
      new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime()
  );

  const todayItems =
    sortedTodayLogs.length > 0
      ? sortedTodayLogs.map((log) => ({
          time: formatTime(log.performed_at),
          exercise: getExerciseLabel(log.exercise_name),
          value: log.count ? `${log.count}回` : formatDuration(log.duration),
        }))
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 flex items-center justify-center relative overflow-hidden">
      {/* 背景の装飾（発光の円） */}
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

      <div className="max-w-md mx-auto space-y-8 relative z-10 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            頑張りの歴史
          </h1>
          <Button
            variant="outline"
            onClick={async () => {
              await playSound(backSound);
              navigate("/home");
            }}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 text-white font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105"
            aria-label="ホームに戻る"
          >
            戻る
          </Button>
        </div>
        <div className="space-y-8 pb-20">
          {/* Total Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Total
            </h2>
            {totalItems.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-orange-500/50 hover:border-yellow-400 rounded-lg p-4 shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 flex items-center justify-center backdrop-blur-xl"
              >
                <span className="text-lg font-bold text-yellow-300 w-32 text-left">
                  {item.label}
                </span>
                <span className="text-xl font-extrabold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent w-32 text-right">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Today Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Today
            </h2>
            {todayItems.length > 0 ? (
              todayItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-orange-500/50 hover:border-yellow-400 rounded-lg p-4 shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 flex items-center justify-between backdrop-blur-xl"
                >
                  <div className="text-lg font-bold text-orange-400 w-16 text-center border-r-2 border-orange-500/50 mr-4">
                    {item.time}
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <p className="text-lg font-bold text-yellow-300">
                      {item.exercise}
                    </p>
                    <p className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-orange-500/50 rounded-lg p-6 text-center shadow-[0_0_20px_rgba(251,146,60,0.6)] backdrop-blur-xl">
                <p className="text-lg font-semibold text-orange-300">
                  記録なし
                </p>
              </div>
            )}
          </div>

          {/* History Link */}
          <div className="flex justify-center mt-8">
            <button
              onClick={async () => {
                await playSound(clickSound);
                navigate("/record/history");
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 rounded-full px-6 py-3 shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105"
            >
              <Calendar className="w-5 h-5 text-white" />
              <span className="font-bold text-white">過去の記録を見る</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
