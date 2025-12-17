import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { trainingApi, type TrainingLogResponse, type TrainingStatsResponse } from "@/api/training";

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
    { label: "継続日数", value: `${stats?.streak_days || 0}日` },
    { label: "プランク", value: formatDuration(findStat("plank")?.total_duration || 0) },
    { label: "スクワット", value: `${findStat("squat")?.total_count || 0}回` },
    { label: "腕立て伏せ", value: `${findStat("pushup")?.total_count || 0}回` },
  ];

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  // Group 2: Today's Logs (Chronological)
  // Sort logs by time (ascending) just in case
  const sortedTodayLogs = [...todayLogs].sort((a, b) =>
    new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime()
  );

  const todayItems = sortedTodayLogs.length > 0
    ? sortedTodayLogs.map(log => ({
      time: formatTime(log.performed_at),
      exercise: getExerciseLabel(log.exercise_name),
      value: log.count ? `${log.count}回` : formatDuration(log.duration)
    }))
    : [];

  return (
    <div className="min-h-screen bg-yellow-200 p-8 flex items-center justify-center relative">
      <button
        onClick={() => navigate('/home')}
        className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        aria-label="ホームに戻る"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700" />
      </button>

      <div className="w-full max-w-md space-y-8 mt-12 pb-20">

        {/* Total Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">Total</h2>
          {totalItems.map((item, index) => (
            <div key={index} className="bg-white border-2 border-black rounded-lg p-4 shadow-lg flex items-center justify-center">
              <span className="text-lg font-bold text-gray-700 w-32 text-left">{item.label}</span>
              <span className="text-xl font-extrabold text-blue-600 w-32 text-right">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Today Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">Today</h2>
          {todayItems.length > 0 ? (
            todayItems.map((item, index) => (
              <div key={index} className="bg-white border-2 border-black rounded-lg p-4 shadow-lg flex items-center justify-between">
                <div className="text-lg font-bold text-gray-500 w-16 text-center border-r-2 border-gray-200 mr-4">
                  {item.time}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <p className="text-lg font-bold">{item.exercise}</p>
                  <p className="text-xl font-bold text-blue-600">{item.value}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border-2 border-black rounded-lg p-6 text-center shadow-lg">
              <p className="text-lg font-semibold">記録なし</p>
            </div>
          )}
        </div>

        {/* History Link */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/record/history')}
            className="flex items-center gap-2 bg-white border-2 border-black rounded-full px-6 py-3 shadow-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span className="font-bold">過去の記録を見る</span>
          </button>
        </div>

      </div>
    </div>
  );
}
