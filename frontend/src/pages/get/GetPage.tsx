import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { YUCCHIN_MASTER, type YucchinMaster } from '../../data/yucchinMaster';

const GetPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [yucchin, setYucchin] = useState<YucchinMaster | null>(null);

  useEffect(() => {
    // 1. location.state から取得（推奨）
    const stateYucchin = location.state?.yucchin as YucchinMaster | undefined;
    
    // 2. URLパラメータから取得
    const typeParam = searchParams.get('type');
    const paramYucchin = typeParam 
      ? YUCCHIN_MASTER.find(y => y.type === parseInt(typeParam))
      : undefined;

    // 3. デフォルト: ランダムに選択（デモ用）
    const randomYucchin = YUCCHIN_MASTER[Math.floor(Math.random() * YUCCHIN_MASTER.length)];

    setYucchin(stateYucchin || paramYucchin || randomYucchin);
  }, [location.state, searchParams]);

  if (!yucchin) {
    return <div className="w-full h-screen bg-[#fef08a] flex items-center justify-center">
      <p className="text-2xl font-bold">読み込み中...</p>
    </div>;
  }

  return (
    <div className="w-full h-screen bg-[#fef08a] flex items-center justify-center overflow-hidden relative">
      {/* Background Sunburst Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
        <div 
          className="w-[200vmax] h-[200vmax] bg-[conic-gradient(from_0deg,white_0deg,transparent_20deg,white_40deg,transparent_60deg,white_80deg,transparent_100deg,white_120deg,transparent_140deg,white_160deg,transparent_180deg,white_200deg,transparent_220deg,white_240deg,transparent_260deg,white_280deg,transparent_300deg,white_320deg,transparent_340deg,white_360deg)] animate-[spin_20s_linear_infinite]"
        />
      </div>

      <Card className="w-full h-full border-none bg-transparent shadow-none rounded-none overflow-hidden relative z-10">
        <CardContent className="h-full relative flex flex-col items-center py-12 justify-between">
        
          {/* Name Badge - Enhanced design with better contrast */}
          <div className="relative z-20">
            {/* Outer glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 rounded-full blur-md opacity-75 animate-pulse"></div>
            {/* Outer golden border */}
            <div className="relative bg-gradient-to-br from-yellow-200 via-amber-100 to-yellow-200 border-4 border-amber-600 rounded-full p-1 shadow-[0_0_20px_rgba(251,191,36,0.6),4px_4px_0px_0px_rgba(0,0,0,1)]">
              {/* Inner white background for contrast */}
              <div className="bg-white rounded-full px-14 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  <span className="text-2xl font-black text-gray-900 tracking-wide" style={{ fontFamily: '"Inter", "Helvetica Neue", sans-serif' }}>
                    {yucchin.name}
                  </span>
                  <span className="text-3xl">✨</span>
                </div>
              </div>
            </div>
          </div>

          {/* Character Image Area */}
          <div className="flex-1 flex items-center justify-center w-full relative mt-8">
              {/* Sparkles / Aura */}
              <div className="absolute inset-0 flex items-center justify-center animate-pulse opacity-50">
                 <div className="w-80 h-80 bg-white rounded-full blur-3xl"></div>
              </div>

              <div 
                className="relative"
                style={{
                  animation: 'subtleBounce 3s ease-in-out infinite'
                }}
              >
                  <img 
                      src={yucchin.imageUrl} 
                      alt={yucchin.name}
                      className="w-64 h-64 object-contain drop-shadow-2xl"
                  />
              </div>
          </div>

          {/* GET Text - Modern gradient style */}
          <div className="mt-8 mb-4">
            <h1 
              className="text-8xl font-black tracking-tight bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 bg-clip-text text-transparent drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] animate-[pulse_2s_ease-in-out_infinite]"
              style={{ 
                  fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                  textShadow: '4px 4px 0px rgba(255,255,255,0.8), 8px 8px 0px rgba(0,0,0,0.2)'
              }}
            >
              GET!!
            </h1>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes subtleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default GetPage;
