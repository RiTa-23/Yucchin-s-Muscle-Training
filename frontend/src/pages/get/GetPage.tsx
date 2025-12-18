import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { YUCCHIN_MASTER, type YucchinMaster } from '../../data/yucchinMaster';

// レアリティごとのスタイル定義
const RARITY_THEMES = {
  NORMAL: {
    bgColor: 'bg-[#fef08a]', // イエロー
    sunburst: 'white',
    badgeGlow: 'from-yellow-300 via-amber-200 to-yellow-300',
    badgeBorder: 'border-amber-600',
    textColor: 'text-gray-900',
    particleColor: '#ffffff',
    confettiColors: ['#fef08a', '#ffffff', '#fbbf24'],
  },
  RARE: {
    bgColor: 'bg-blue-100', // 薄い青
    sunburst: '#60a5fa', // blue-400 (鮮やかに変更)
    badgeGlow: 'from-blue-400 via-cyan-300 to-blue-400',
    badgeBorder: 'border-blue-600',
    textColor: 'text-blue-950',
    particleColor: '#60a5fa',
    confettiColors: ['#93c5fd', '#ffffff', '#2563eb', '#22d3ee'],
  },
  SR: {
    bgColor: 'bg-orange-100', // オレンジ
    sunburst: '#fbbf24', // amber-400
    badgeGlow: 'from-orange-400 via-yellow-300 to-orange-400',
    badgeBorder: 'border-orange-600',
    textColor: 'text-orange-950',
    particleColor: '#f59e0b',
    confettiColors: ['#fbbf24', '#ffffff', '#ea580c', '#fde68a'],
  },
  UR: {
    bgColor: 'bg-purple-100', // パープル系
    sunburst: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
    badgeGlow: 'from-purple-500 via-pink-400 via-blue-400 to-purple-500',
    badgeBorder: 'border-purple-700',
    textColor: 'text-purple-950',
    particleColor: '#a855f7',
    confettiColors: ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'],
  },
};

// 浮遊パーティクルコンポーネント
const FloatingParticles: React.FC<{ color: string; count: number }> = ({ color, count }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-60 animate-[float_10s_ease-in-out_infinite]"
          style={{
            backgroundColor: color,
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 5 + 7}s`,
          }}
        />
      ))}
    </div>
  );
};

// 瞬く星のエフェクトコンポーネント
const TwinkleStars: React.FC<{ count: number }> = ({ count }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full animate-[twinkle_2s_ease-in-out_infinite]"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 1 + 1}s`,
            boxShadow: '0 0 10px 2px rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </div>
  );
};

// 紙吹雪コンポーネント
const Confetti: React.FC<{ colors: string[]; count: number }> = ({ colors, count }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 animate-[confettiFall_4s_linear_infinite]"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            opacity: Math.random(),
            transform: `rotate(${Math.random() * 360}deg)`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
};

const GetPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [yucchin, setYucchin] = useState<YucchinMaster | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const stateYucchin = location.state?.yucchin as YucchinMaster | undefined;
    const typeParam = searchParams.get('type');
    const paramYucchin = typeParam 
      ? YUCCHIN_MASTER.find(y => y.type === parseInt(typeParam))
      : undefined;
    const randomYucchin = YUCCHIN_MASTER[Math.floor(Math.random() * YUCCHIN_MASTER.length)];

    setYucchin(stateYucchin || paramYucchin || randomYucchin);

    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [location.state, searchParams]);

  const theme = useMemo(() => {
    if (!yucchin) return RARITY_THEMES.NORMAL;
    return RARITY_THEMES[yucchin.rarity as keyof typeof RARITY_THEMES] || RARITY_THEMES.NORMAL;
  }, [yucchin]);

  if (!yucchin) {
    return <div className="w-full h-screen bg-[#fef08a] flex items-center justify-center">
      <p className="text-2xl font-bold">読み込み中...</p>
    </div>;
  }

  return (
    <div className={`w-full h-screen ${theme.bgColor} flex items-center justify-center overflow-hidden relative transition-colors duration-1000 uppercase`}>
      
      {/* Background Layer 1: Sunburst (Standard) */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-30 z-0 overflow-hidden">
        <div 
          className="w-[300vmax] h-[300vmax] rounded-full animate-[spin_30s_linear_infinite] flex-shrink-0"
          style={{
            background: yucchin.rarity === 'UR' 
              ? theme.sunburst 
              : `conic-gradient(from 0deg, ${theme.sunburst} 0deg, transparent 20deg, ${theme.sunburst} 40deg, transparent 60deg, ${theme.sunburst} 80deg, transparent 100deg, ${theme.sunburst} 120deg, transparent 140deg, ${theme.sunburst} 160deg, transparent 180deg, ${theme.sunburst} 200deg, transparent 220deg, ${theme.sunburst} 240deg, transparent 260deg, ${theme.sunburst} 280deg, transparent 300deg, ${theme.sunburst} 320deg, transparent 340deg, ${theme.sunburst} 360deg)`
          }}
        />
      </div>

      {/* Background Layer 2: Reverse Sunburst (Subtle) */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0 overflow-hidden">
        <div 
          className="w-[300vmax] h-[300vmax] rounded-full animate-[spin_60s_linear_infinite_reverse] flex-shrink-0"
          style={{
            background: `conic-gradient(from 10deg, rgba(255,255,255,0.8) 0deg, transparent 15deg, rgba(255,255,255,0.8) 30deg, transparent 45deg)`
          }}
        />
      </div>

      {/* Floating Particles & Twinkle Stars */}
      {isRevealed && (
        <>
          <FloatingParticles color={theme.particleColor} count={yucchin.rarity === 'UR' ? 40 : 20} />
          <TwinkleStars count={yucchin.rarity === 'UR' ? 30 : 15} />
        </>
      )}

      {/* Confetti */}
      {(yucchin.rarity === 'UR' || yucchin.rarity === 'SR' || yucchin.rarity === 'RARE') && isRevealed && (
        <Confetti colors={theme.confettiColors} count={yucchin.rarity === 'RARE' ? 40 : 80} />
      )}

      {/* Screen Flash Overlay */}
      <div 
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000 ${isRevealed ? 'opacity-0' : 'opacity-100'} ${yucchin.rarity === 'UR' ? 'bg-gradient-to-br from-purple-400 via-white to-pink-400' : 'bg-white'}`}
      />

      <Card className={`w-full h-full border-none bg-transparent shadow-none rounded-none overflow-hidden relative z-10 ${yucchin.rarity === 'UR' && isRevealed ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <CardContent className="h-full relative flex flex-col items-center py-12 justify-between">
        
          {/* Name Badge */}
          <div className={`relative z-20 transition-all duration-1000 transform ${isRevealed ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 -translate-y-12'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${theme.badgeGlow} rounded-full blur-[60px] opacity-80 animate-pulse`}></div>
            <div className={`relative bg-gradient-to-br ${theme.badgeGlow} opacity-95 border-4 ${theme.badgeBorder} rounded-full p-1 shadow-[0_0_50px_rgba(255,255,255,0.6),10px_10px_0px_0px_rgba(0,0,0,1)]`}>
              <div className="bg-white rounded-full px-16 py-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl animate-bounce">{yucchin.rarity === 'UR' ? '👑' : yucchin.rarity === 'SR' ? '💎' : yucchin.rarity === 'RARE' ? '🌟' : '✨'}</span>
                  <span className={`text-3xl font-black ${theme.textColor} tracking-widest`} style={{ fontFamily: '"Inter", "Helvetica Neue", sans-serif' }}>
                    {yucchin.name}
                  </span>
                  <span className="text-4xl animate-bounce">{yucchin.rarity === 'UR' ? '👑' : yucchin.rarity === 'SR' ? '💎' : yucchin.rarity === 'RARE' ? '🌟' : '✨'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Character Image Area */}
          <div className="flex-1 flex items-center justify-center w-full relative mt-4">
              {/* Massive Multi-layer Aura */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1500 ${isRevealed ? 'scale-125 opacity-70' : 'scale-0 opacity-0'}`}>
                 <div className={`absolute w-[30rem] h-[30rem] ${
                   yucchin.rarity === 'UR' ? 'bg-gradient-to-r from-red-300 via-green-300 to-blue-300' : 
                   yucchin.rarity === 'RARE' ? 'bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-300' :
                   'bg-white'
                 } rounded-full blur-[100px] animate-pulse`}></div>
                 <div className="absolute w-[15rem] h-[15rem] bg-white rounded-full blur-[60px] opacity-60"></div>
              </div>

              <div 
                className={`relative transition-all duration-1000 cubic-bezier(0.175, 0.885, 0.32, 1.275) transform ${isRevealed ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-12'}`}
                style={{
                  animation: isRevealed ? 'subtleBounce 3s ease-in-out infinite' : 'none'
                }}
              >
                  <img 
                      src={yucchin.imageUrl} 
                      alt={yucchin.name}
                      className={`w-72 h-72 object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] ${yucchin.rarity === 'UR' ? 'animate-pulse' : ''}`}
                  />
                  
                  {/* UR Glow Ring */}
                  {yucchin.rarity === 'UR' && isRevealed && (
                    <div className="absolute inset-0 border-[10px] border-white/20 rounded-full animate-ping scale-110 pointer-events-none" />
                  )}
              </div>
          </div>

          {/* GET Text with Enhanced Shine Effect */}
          <div className={`mt-4 mb-12 transition-all duration-1000 delay-500 transform ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
            <div className="relative group overflow-hidden text-center">
              <h1 
                className={`text-8xl font-black tracking-tighter inline-block ${yucchin.rarity === 'UR' ? 'bg-gradient-to-r from-red-600 via-yellow-500 via-green-500 via-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700'} bg-clip-text text-transparent drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)] relative z-10`}
                style={{ 
                    fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                    textShadow: '8px 8px 0px rgba(255,255,255,1), 16px 16px 0px rgba(0,0,0,0.4)'
                }}
              >
                GET!!
                {/* Intensified Shine Animation Layer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] animate-[shine_2s_infinite] pointer-events-none z-20" />
              </h1>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes subtleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          5%, 15%, 25%, 35%, 45%, 55%, 65%, 75%, 85%, 95% { transform: translateX(-10px); }
          10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% { transform: translateX(10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(20px); }
          50% { transform: translateY(-60px) translateX(-20px); }
          75% { transform: translateY(-30px) translateX(20px); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes shine {
          0% { left: -100%; top: -100%; }
          100% { left: 200%; top: 200%; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default GetPage;
