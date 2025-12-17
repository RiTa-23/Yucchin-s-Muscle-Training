
import { useEffect, useState } from "react";
import { trainingApi, type TrainingLogResponse, type TrainingStatsResponse } from "@/api/training";

export default function RecordPage() {
  const [stats, setStats] = useState<TrainingStatsResponse | null>(null);
  const [todayLogs, setTodayLogs] = useState<TrainingLogResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
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
    { label: "プランク合計", value: formatDuration(findStat("plank")?.total_duration || 0) },
    { label: "スクワット合計", value: `${findStat("squat")?.total_count || 0}回` },
    { label: "腕立て伏せ合計", value: `${findStat("pushup")?.total_count || 0}回` },
  ];

  // Group 2: Today's Logs
  const todayItems = todayLogs.length > 0
    ? todayLogs.map(log => ({
      label: `${formatTime(log.performed_at)} ${getExerciseLabel(log.exercise_name)}`,
      value: log.count ? `${log.count}回` : formatDuration(log.duration)
    }))
    : [{ label: "今日の記録", value: "まだありません" }];

  return (
    <div className="min-h-screen bg-yellow-200 p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">

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

