
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

  // Build the list of items to display
  const displayItems = [
    // 1. Streak
    {
      label: "筋トレ継続日数",
      value: `${stats?.streak_days || 0}日`
    },

    // 2. Total Records (Explicitly listing known exercises or mapping all)
    // Let's list the main ones to ensure order
    {
      label: "プランク合計",
      value: formatDuration(findStat("plank")?.total_duration || 0)
    },
    {
      label: "スクワット合計",
      value: `${findStat("squat")?.total_count || 0}回`
    },
    {
      label: "腕立て伏せ合計",
      value: `${findStat("pushup")?.total_count || 0}回`
    },
  ];

  // 3. Today's Records
  // Append today's logs to the list
  if (todayLogs.length > 0) {
    // Add a separator or header-like item? 
    // The user asked to "output" them. Let's just add them as cards nicely labeled.
    todayLogs.forEach(log => {
      const time = formatTime(log.performed_at);
      const name = getExerciseLabel(log.exercise_name);
      const result = log.count ? `${log.count}回` : formatDuration(log.duration);

      displayItems.push({
        label: `今日 ${time} ${name}`,
        value: result
      });
    });
  } else {
    displayItems.push({
      label: "今日の記録",
      value: "まだありません"
    });
  }

  return (
    <div className="min-h-screen bg-yellow-200 p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="bg-white border-2 border-black rounded-lg p-6 text-center shadow-lg"
          >
            <p className="text-lg font-semibold">
              {item.label}：{item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

