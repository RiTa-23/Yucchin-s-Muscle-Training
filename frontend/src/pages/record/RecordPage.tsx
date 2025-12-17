
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { trainingApi, type TrainingLogResponse, type TrainingStatsResponse } from "@/api/training";

export default function RecordPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<TrainingStatsResponse | null>(null);
  const [todayLogs, setTodayLogs] = useState<TrainingLogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // ... (existing useEffect and helpers)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          trainingApi.getStats(),
          trainingApi.getLogs()
        ]);

        setStats(statsData);

        // Filter logs for today
        const today = new Date().toDateString();
        const todays = logsData.filter(log => new Date(log.performed_at).toDateString() === today);
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
      case "plank": return "プランク";
      case "pushup": return "腕立て伏せ";
      case "squat": return "スクワット";
      default: return name;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-200 p-8 flex items-center justify-center">
        <p className="text-xl font-bold text-gray-700">読み込み中...</p>
      </div>
    );
  }

  // Helper to find stat by name
  const findStat = (name: string) => stats?.total_stats.find(s => s.exercise_name === name);

  // Group 1: Total & Streak
  const totalItems = [
    { label: "筋トレ継続日数", value: `${stats?.streak_days || 0}日` },
    { label: "プランク総計", value: formatDuration(findStat("plank")?.total_duration || 0) },
    { label: "スクワット総計", value: `${findStat("squat")?.total_count || 0}回` },
    { label: "腕立て伏せ総計", value: `${findStat("pushup")?.total_count || 0}回` },
  ];

  // Group 2: Today's Logs (Aggregated)
  const todayAggregated = todayLogs.reduce((acc, log) => {
    if (!acc[log.exercise_name]) {
      acc[log.exercise_name] = { count: 0, duration: 0, name: log.exercise_name };
    }
    acc[log.exercise_name].count += (log.count || 0);
    acc[log.exercise_name].duration += (log.duration || 0);
    return acc;
  }, {} as Record<string, { count: number, duration: number, name: string }>);

  const todayItems = Object.keys(todayAggregated).length > 0
    ? Object.values(todayAggregated).map(stat => ({
      label: `${getExerciseLabel(stat.name)}合計`,
      value: stat.count > 0 ? `${stat.count}回` : formatDuration(stat.duration)
    }))
    : [{ label: "今日の記録", value: "まだありません" }];

  return (
    <div className="min-h-screen bg-yellow-200 p-8 flex items-center justify-center relative">
      <button
        onClick={() => navigate('/home')}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        aria-label="ホームに戻る"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>

      <div className="w-full max-w-md space-y-8 mt-12">

        {/* Total Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">Total</h2>
          {totalItems.map((item, index) => (
            <div key={index} className="bg-white border-2 border-black rounded-lg p-6 text-center shadow-lg">
              <p className="text-lg font-semibold">{item.label}：{item.value}</p>
            </div>
          ))}
        </div>

        {/* Today Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">Today</h2>
          {todayItems.map((item, index) => (
            <div key={index} className="bg-white border-2 border-black rounded-lg p-6 text-center shadow-lg">
              <p className="text-lg font-semibold">{item.label}：{item.value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

