import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { YUCCHIN_MASTER, type YucchinMaster } from '../../data/yucchinMaster';


// レアリティごとのスタイル定義（ダークテーマベースのアクセント）
const RARITY_THEMES = {
  NORMAL: {
    accentColor: 'from-yellow-400 to-orange-500',
    glowColor: 'rgba(251, 191, 36, 0.4)', 
    sunburst: '#fbbf24',
    particleColor: '#fbbf24',
    confettiColors: ['#fef08a', '#ffffff', '#fbbf24'],
  },
  RARE: {
    accentColor: 'from-blue-400 to-cyan-500',
    glowColor: 'rgba(96, 165, 250, 0.4)', 
    sunburst: '#60a5fa',
    particleColor: '#60a5fa',
    confettiColors: ['#93c5fd', '#ffffff', '#2563eb', '#22d3ee'],
  },
  SR: {
    accentColor: 'from-orange-500 to-red-600',
    glowColor: 'rgba(234, 88, 12, 0.4)', 
    sunburst: '#ea580c',
    particleColor: '#f97316',
    confettiColors: ['#fbbf24', '#ffffff', '#ea580c', '#fde68a'],
  },
  UR: {
    accentColor: 'from-purple-500 via-pink-500 to-red-500',
    glowColor: 'rgba(168, 85, 247, 0.4)', 
    sunburst: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
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
  
  // 演出フェーズのステート
  const [revealStart, setRevealStart] = useState(false); // フラッシュ除去・背景開始
  const [revealBadge, setRevealBadge] = useState(false); // 名前バッジ
  const [revealQuote, setRevealQuote] = useState(false); // セリフ
  const [revealImage, setRevealImage] = useState(false); // キャラクター画像
  const [revealText, setRevealText] = useState(false);   // GET!!テキスト

  useEffect(() => {
    const stateYucchin = (location as any).state?.yucchin as YucchinMaster | undefined;
    const typeParam = searchParams.get('type');
    const paramYucchin = typeParam 
      ? YUCCHIN_MASTER.find(y => y.type === parseInt(typeParam))
      : undefined;
    const randomYucchin = YUCCHIN_MASTER[Math.floor(Math.random() * YUCCHIN_MASTER.length)];
    const targetYucchin = stateYucchin || paramYucchin || randomYucchin;

    setYucchin(targetYucchin);

    // 演出タイマーの設定
    if (targetYucchin) {
      const isHighRarity = targetYucchin.rarity === 'SR' || targetYucchin.rarity === 'UR';
      
      // 1. 最初のアクション: フラッシュ除去 (500ms)
      setTimeout(() => setRevealStart(true), 500);

      if (isHighRarity && targetYucchin.quote) {
        // SR/UR の場合: セリフあり演出
        // 2. セリフ表示 (1500ms)
        setTimeout(() => setRevealQuote(true), 1500);
        // 3. 画像 ＆ 名前バッジ 表示 (3500ms) - セリフを2秒見せる
        setTimeout(() => {
          setRevealImage(true);
          setRevealBadge(true);
        }, 3500);
        // 4. テキスト表示 (4500ms)
        setTimeout(() => setRevealText(true), 4500);
      } else {
        // NORMAL/RARE の場合: 従来通りのテンポ
        // 2. 画像 ＆ 名前バッジ 表示 (1500ms)
        setTimeout(() => {
          setRevealImage(true);
          setRevealBadge(true);
        }, 1500);
        // 3. テキスト表示 (2500ms)
        setTimeout(() => setRevealText(true), 2500);
      }
    }
  }, [location, searchParams]);

  const theme = useMemo(() => {
    if (!yucchin) return RARITY_THEMES.NORMAL;
    return RARITY_THEMES[yucchin.rarity as keyof typeof RARITY_THEMES] || RARITY_THEMES.NORMAL;
  }, [yucchin]);

  if (!yucchin) {
    return <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-2xl font-bold text-white">読み込み中...</p>
    </div>;
  }

  return (
    <div className={`w-full h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative transition-colors duration-1000 uppercase`}>
      
      {/* Subtle Background Inner Glow to match screenshots */}
      <div className="fixed inset-0 bg-gradient-to-t from-orange-900/10 via-transparent to-transparent pointer-events-none z-1 overflow-hidden" />

      {/* Rarity-specific Sunburst (Subtle Glow) */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-20 z-0 overflow-hidden">
        <div 
          className="w-[300vmax] h-[300vmax] rounded-full animate-[spin_40s_linear_infinite] flex-shrink-0"
          style={{
            background: yucchin.rarity === 'UR' 
              ? theme.sunburst 
              : `conic-gradient(from 0deg, ${theme.sunburst} 0deg, transparent 20deg, ${theme.sunburst} 40deg, transparent 60deg, ${theme.sunburst} 80deg, transparent 100deg, ${theme.sunburst} 120deg, transparent 140deg, ${theme.sunburst} 160deg, transparent 180deg, ${theme.sunburst} 200deg, transparent 220deg, ${theme.sunburst} 240deg, transparent 260deg, ${theme.sunburst} 280deg, transparent 300deg, ${theme.sunburst} 320deg, transparent 340deg, ${theme.sunburst} 360deg)`
          }}
        />
      </div>

      {/* Floating Particles & Twinkle Stars */}
      {revealStart && (
        <>
          <FloatingParticles color={theme.particleColor} count={yucchin.rarity === 'UR' ? 40 : 20} />
          <TwinkleStars count={yucchin.rarity === 'UR' ? 30 : 15} />
        </>
      )}

      {/* Confetti */}
      {(yucchin.rarity === 'UR' || yucchin.rarity === 'SR' || yucchin.rarity === 'RARE') && revealImage && (
        <Confetti colors={theme.confettiColors} count={yucchin.rarity === 'RARE' ? 40 : 80} />
      )}

      {/* Screen Flash Overlay */}
      <div 
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000 ${revealStart ? 'opacity-0' : 'opacity-100'} ${yucchin.rarity === 'UR' ? 'bg-gradient-to-br from-purple-400 via-white to-pink-400' : 'bg-white'}`}
      />

      {/* Main Container - Removed square frame/border as requested */}
      <Card className={`w-full h-full border-none bg-transparent shadow-none rounded-none overflow-visible relative z-10 transition-all duration-1000 ${revealStart ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${yucchin.rarity === 'UR' && revealStart ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <CardContent className="h-full relative flex flex-col items-center py-12 justify-between">
        
          {/* Unified Muscle Name Badge */}
          <div className={`relative z-20 transition-all duration-1000 transform ${revealBadge ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className={`absolute inset-0 bg-orange-500 rounded-full blur-[40px] opacity-60 animate-pulse`}></div>
            <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-2 border-orange-300 rounded-full px-12 py-4 shadow-[0_0_30px_rgba(251,146,60,0.8)]">
              <div className="flex items-center gap-6">
                <span className="text-3xl filter drop-shadow-md">💪</span>
                <span className="text-3xl md:text-4xl font-black text-white tracking-widest drop-shadow-lg" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                  {yucchin.name}
                </span>
                <span className="text-3xl filter drop-shadow-md">💪</span>
              </div>
            </div>
          </div>

          {/* Character Image Area */}
          <div className="flex-1 flex items-center justify-center w-full relative mt-4">
              {/* Quote Reveal (SR/UR Only) */}
              {revealQuote && !revealImage && yucchin.quote && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-30 px-4">
                  <div className="max-w-[90vw] animate-[fadeIn_0.5s_ease-out]">
                    <p className="text-4xl sm:text-5xl font-black text-white italic drop-shadow-[0_4px_12px_rgba(251,146,60,0.8)] text-center leading-none whitespace-nowrap" style={{ fontFamily: '"Inter", sans-serif' }}>
                      「{yucchin.quote}」
                    </p>
                  </div>
                </div>
              )}

              {/* Rarity Aura */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1500 ${revealImage ? 'scale-125 opacity-70' : 'scale-0 opacity-0'}`}>
                 <div className={`absolute w-[30rem] h-[30rem] rounded-full blur-[100px] animate-pulse`}
                      style={{ backgroundColor: theme.glowColor }}></div>
                 <div className="absolute w-[15rem] h-[15rem] bg-white rounded-full blur-[60px] opacity-40"></div>
              </div>

              <div 
                className={`relative transition-all duration-1000 cubic-bezier(0.175, 0.885, 0.32, 1.275) transform ${revealImage ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
                style={{
                  animation: revealImage ? 'subtleBounce 3s ease-in-out infinite' : 'none'
                }}
              >
                  <img 
                      src={yucchin.imageUrl} 
                      alt={yucchin.name}
                      className={`w-72 h-72 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] ${yucchin.rarity === 'UR' ? 'animate-pulse' : ''}`}
                  />
                  
                  {/* UR Glow Ring */}
                  {yucchin.rarity === 'UR' && revealImage && (
                    <div className="absolute inset-0 border-[10px] border-white/20 rounded-full animate-ping scale-110 pointer-events-none" />
                  )}
              </div>
          </div>

          {/* GET Text with Unified Muscle Style */}
          <div className={`mt-4 mb-20 transition-all duration-1000 delay-500 transform ${revealText ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
            <div className="relative text-center">
              {/* Outer Glow for GET!! */}
              <div className={`absolute inset-0 bg-orange-600 blur-[40px] opacity-40 animate-pulse`}></div>
              <h1 
                className={`text-8xl md:text-9xl font-black tracking-tighter inline-block bg-clip-text text-transparent bg-gradient-to-b from-yellow-300 via-orange-500 to-red-700 relative z-10`}
                style={{ 
                    fontFamily: '"Montserrat", sans-serif',
                    filter: 'drop-shadow(0 0 20px rgba(251,146,60,0.8))',
                    WebkitTextStroke: '1px rgba(255,255,255,0.2)'
                }}
              >
                GET!!
              </h1>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
        @keyframes shineText {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
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
