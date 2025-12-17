import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { trainingApi, type TrainingLogResponse } from "@/api/training";

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
        return allLogs.filter(log => new Date(log.performed_at).toDateString() === targetDateStr);
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

    // Group 2: Daily Logs (Aggregated based on selectedDate)
    const dailyAggregated = filteredLogs.reduce((acc, log) => {
        if (!acc[log.exercise_name]) {
            acc[log.exercise_name] = { count: 0, duration: 0, name: log.exercise_name };
        }
        acc[log.exercise_name].count += (log.count || 0);
        acc[log.exercise_name].duration += (log.duration || 0);
        return acc;
    }, {} as Record<string, { count: number, duration: number, name: string }>);

    const dailyItems = Object.keys(dailyAggregated).length > 0
        ? Object.values(dailyAggregated).map(stat => ({
            label: `${getExerciseLabel(stat.name)}合計`,
            value: stat.count > 0 ? `${stat.count}回` : formatDuration(stat.duration)
        }))
        : [{ label: `${formattedDate}の記録`, value: "記録なし" }];

    return (
        <div className="min-h-screen bg-yellow-200 p-8 flex flex-col items-center pt-20 relative">
            <button
                onClick={() => navigate('/record')}
                className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label="戻る"
            >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>

            <div className="w-full max-w-md space-y-8">
                <h1 className="text-3xl font-bold text-center mb-8">過去の記録</h1>

                {/* Daily Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <button
                            onClick={handlePrevDay}
                            className="p-1 rounded-full hover:bg-white/50 transition-colors"
                            aria-label="前日"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <h2 className="text-2xl font-bold text-center">{formattedDate}</h2>
                        <button
                            onClick={handleNextDay}
                            className={`p-1 rounded-full transition-colors ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/50'}`}
                            disabled={isToday}
                            aria-label="翌日"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </div>

                    {dailyItems.map((item, index) => (
                        <div key={index} className="bg-white border-2 border-black rounded-lg p-6 text-center shadow-lg">
                            <p className="text-lg font-semibold">{item.label}：{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
