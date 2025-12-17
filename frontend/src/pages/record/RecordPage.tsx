const stats = [
  { label: "筋トレ総回数", value: "○回" },
  { label: "今日の筋トレ回数", value: "○回" },
  { label: "スクワット回数", value: "○回" },
  { label: "腕立て回数", value: "○回" },
  { label: "プランク時間", value: "○秒" },
  { label: "ログイン数", value: "○日" },
];

export default function RecordPage() {
  return (
    <div className="min-h-screen bg-yellow-200 p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border-2 border-black rounded-lg p-6 text-center"
          >
            <p className="text-lg font-semibold">
              {stat.label}：{stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
