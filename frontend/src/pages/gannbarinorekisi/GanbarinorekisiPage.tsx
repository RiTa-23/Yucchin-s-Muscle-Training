export default function GanbarinorekisiPage() {
  return (
    <div className="min-h-screen bg-yellow-200 p-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        {/* 筋トレ総回数 */}
        <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
          <p className="text-lg font-semibold">筋トレ総回数：○回</p>
        </div>

        {/* 今日の筋トレ回数 */}
        <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
          <p className="text-lg font-semibold">今日の筋トレ回数：○回</p>
        </div>

        {/* スクワット回数 */}
        <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
          <p className="text-lg font-semibold">スクワット回数：○回</p>
        </div>
        {/* 腕立て回数 */}
        <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
          <p className="text-lg font-semibold">腕立て回数：○回</p>
        </div>
        {/* プランク時間 */}
        <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
          <p className="text-lg font-semibold">プランク時間：○秒</p>
        </div>

        {/* ログイン数 */}
        <div className="bg-white border-2 border-black rounded-lg p-6 text-center">
          <p className="text-lg font-semibold">ログイン数：○日</p>
        </div>
      </div>
    </div>
  );
}
