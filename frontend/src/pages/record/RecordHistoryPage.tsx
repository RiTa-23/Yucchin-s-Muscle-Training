import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trainingApi, type TrainingLogResponse } from "@/api/training";
import { playSound } from "@/utils/audio";
import backSound from "@/assets/sounds/ﾍｪッ！！_T01.wav";
import { Button } from "@/components/ui/button";

export default function RecordHistoryPage() {
  const navigate = useNavigate();
  const [allLogs, setAllLogs] = useState<TrainingLogResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const logsData = await trainingApi.getLogs();
        setAllLogs(logsData);
      } catch (err) {
        console.error("Failed to fetch record data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logs based on selected date
  const filteredLogs = useMemo(() => {
    const targetDateStr = selectedDate.toDateString();
    return allLogs.filter(
      (log) => new Date(log.performed_at).toDateString() === targetDateStr
    );
  }, [allLogs, selectedDate]);

  // Handle date navigation
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Check if next day is in the future
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const handleNextDay = () => {
    if (isToday) return; // Prevent going to future
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Format date display (e.g., 2023/12/17)
  const formattedDate = selectedDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

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

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Sort logs by time (ascending) just in case
  const sortedLogs = [...filteredLogs].sort(
    (a, b) =>
      new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime()
  );

  const dailyItems =
    sortedLogs.length > 0
      ? sortedLogs.map((log) => ({
          time: formatTime(log.performed_at),
          exercise: getExerciseLabel(log.exercise_name),
          value: log.count ? `${log.count}回` : formatDuration(log.duration),
        }))
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 flex flex-col items-center pt-20 relative overflow-hidden">
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

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            過去の記録
          </h1>
          <Button
            variant="outline"
            onClick={async () => {
              await playSound(backSound);
              navigate("/record");
            }}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 text-white font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105"
            aria-label="戻る"
          >
            戻る
          </Button>
        </div>

        {/* Daily Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded-full hover:bg-orange-500/50 transition-colors"
              aria-label="前日"
            >
              <ChevronLeft className="w-8 h-8 text-yellow-400" />
            </button>
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              {formattedDate}
            </h2>
            <button
              onClick={handleNextDay}
              className={`p-1 rounded-full transition-colors ${
                isToday
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-orange-500/50"
              }`}
              disabled={isToday}
              aria-label="翌日"
            >
              <ChevronRight className="w-8 h-8 text-yellow-400" />
            </button>
          </div>

          {dailyItems.length > 0 ? (
            dailyItems.map((item, index) => (
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
              <p className="text-lg font-semibold text-orange-300">記録なし</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
