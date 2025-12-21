export default function PortraitOverlay() {
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center border-4 border-orange-500/50 rounded-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl shadow-[0_0_40px_rgba(251,146,60,0.8)] p-6">
        <p className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mb-2">
          画面を横にしてください
        </p>
        <p className="text-orange-200">横向きにすると最適な表示になります。</p>
      </div>
    </div>
  );
}
