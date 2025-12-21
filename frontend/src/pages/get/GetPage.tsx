import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Home } from 'lucide-react';
import { YUCCHIN_MASTER, type YucchinMaster } from '../../data/yucchinMaster';
import pepeSound from '../../assets/sounds/pepe.wav';
import yucchinVoice from '../../assets/sounds/yucchin_T01.wav';
import startSound from '../../assets/sounds/he-sound_T01.wav';
import client from '../../api/client';

interface UserYucchinResponse {
  id: number;
  yucchin_type: number;
  yucchin_name: string;
  obtained_at: string;
}


// レアリティごとのスタイル定義（ダークテーマベースのアクセント）
const RARITY_THEMES = {
  NORMAL: {
    accentColor: 'from-yellow-400 to-orange-500',
    glowColor: 'rgba(251, 191, 36, 0.3)', 
    sunburst: '#fbbf24',
    particleColor: '#fbbf24',
    confettiColors: ['#fef08a', '#ffffff', '#fbbf24'],
  },
  RARE: {
    accentColor: 'from-blue-400 to-cyan-500',
    glowColor: 'rgba(96, 165, 250, 0.7)', 
    sunburst: '#60a5fa',
    particleColor: '#60a5fa',
    confettiColors: ['#93c5fd', '#ffffff', '#2563eb', '#22d3ee'],
  },
  SR: {
    accentColor: 'from-orange-500 to-red-600',
    glowColor: 'rgba(255, 120, 0, 0.8)', 
    sunburst: '#ea580c',
    particleColor: '#f97316',
    confettiColors: ['#fbbf24', '#ffffff', '#ea580c', '#fde68a'],
  },
  UR: {
    accentColor: 'from-purple-500 via-pink-500 to-red-500',
    glowColor: 'rgba(255, 50, 255, 0.9)', 
    sunburst: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
    particleColor: '#ffffff',
    confettiColors: ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'],
  },
  SECRET: {
    accentColor: 'from-purple-600 via-pink-600 via-yellow-500 to-purple-600',
    glowColor: 'rgba(255, 215, 0, 1)', 
    sunburst: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
    particleColor: '#ffff00',
    confettiColors: ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffffff', '#ffd700'],
  },
};

// 浮遊パーティクルコンポーネント (強化版)
const FloatingParticles: React.FC<{ color: string; count: number; rarity: string }> = ({ color, count, rarity }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(count)].map((_, i) => {
        const isCrystal = rarity === 'UR' && i % 4 === 0;
        return (
          <div
            key={i}
            className={`absolute ${isCrystal ? 'w-4 h-4 bg-white/40 blur-[1px]' : 'rounded-full'} opacity-60 animate-[float_10s_ease-in-out_infinite]`}
            style={{
              backgroundColor: isCrystal ? 'transparent' : color,
              clipPath: isCrystal ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' : 'none',
              width: isCrystal ? '12px' : `${Math.random() * 8 + 4}px`,
              height: isCrystal ? '16px' : `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 5 + 7}s`,
              boxShadow: isCrystal ? '0 0 20px rgba(255,255,255,0.8)' : 'none',
            }}
          />
        );
      })}
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

// 神々しい光の柱（God Rays）
const GodRays: React.FC<{ color: string; rotate?: boolean }> = ({ color, rotate }) => {
  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden ${rotate ? 'animate-[spin_60s_linear_infinite]' : ''}`}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 md:w-4 h-[200vh] opacity-20"
          style={{
            background: `linear-gradient(to top, transparent, ${color}, transparent)`,
            transform: `rotate(${i * 30}deg)`,
            filter: 'blur(20px)',
          }}
        />
      ))}
    </div>
  );
};

// レアリティバッジコンポーネント (豪華版)
const RarityBadge: React.FC<{ rarity: YucchinMaster['rarity'] | 'SECRET' }> = ({ rarity }) => {
  const badgeLabel = rarity === 'NORMAL' ? 'N' : rarity === 'RARE' ? 'R' : rarity === 'SECRET' ? 'SECRET' : rarity;
  
  return (
    <div className={`relative flex items-center justify-center scale-90 md:scale-110`}>

      {/* Main Badge Text (Blocky Metallic Style) */}
      <div className={`
        relative px-6 py-2 font-black text-6xl leading-none
        ${rarity === 'SECRET' ? 'rarity-secret' : rarity === 'UR' ? 'rarity-ur' : rarity === 'SR' ? 'rarity-sr' : rarity === 'RARE' ? 'rarity-rare' : 'rarity-normal'}
      `} style={{ 
          fontFamily: '"Bebas Neue", "Impact", "Arial Black", sans-serif',
          fontWeight: 900,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          transform: 'scaleX(1.1)',
          transformOrigin: 'center',
          // 3Dメタリック効果のテキストシャドウ
          textShadow: rarity === 'SECRET' ? `
            3px 3px 0px rgba(255,255,255,1),
            -2px -2px 0px rgba(0,0,0,0.9),
            0px 0px 20px rgba(255,215,0,0.8),
            0px 0px 40px rgba(255,215,0,0.6)
          ` : rarity === 'UR' ? `
            2px 2px 0px rgba(255,255,255,0.9),
            -1px -1px 0px rgba(0,0,0,0.8),
            0px 0px 10px rgba(255,255,255,0.5)
          ` : rarity === 'SR' ? `
            2px 2px 0px rgba(255,255,255,0.8),
            -1px -1px 0px rgba(0,0,0,0.6),
            0px 0px 8px rgba(135,206,235,0.6)
          ` : rarity === 'RARE' ? `
            1px 1px 0px rgba(255,255,255,0.6),
            -1px -1px 0px rgba(0,0,0,0.5)
          ` : `
            1px 1px 0px rgba(255,255,255,0.5),
            -1px -1px 0px rgba(0,0,0,0.4)
          `
      }}>
        <span className="relative z-10">{badgeLabel}</span>
        
        {/* Metallic highlight layers */}
        {rarity !== 'NORMAL' && (
          <span 
            className="absolute inset-0 bg-clip-text text-transparent pointer-events-none px-6 py-2 select-none z-20"
            style={{
              WebkitBackgroundClip: 'text',
              backgroundImage: rarity === 'SECRET'
                ? 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,215,0,0.95) 15%, rgba(255,255,255,0.9) 30%, rgba(255,215,0,0.9) 45%, rgba(255,255,255,0.95) 50%, rgba(255,215,0,0.9) 55%, rgba(255,255,255,0.9) 70%, rgba(255,215,0,0.95) 85%, rgba(255,255,255,1) 100%)'
                : rarity === 'UR' 
                ? 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.3) 100%)'
                : rarity === 'SR'
                ? 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.2) 100%)'
                : 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.2) 100%)',
              WebkitTextStroke: '0',
              animation: rarity === 'SECRET' ? 'metallicShineText 2s infinite' : 'none'
            }}
          >
            {badgeLabel}
          </span>
        )}
      </div>
    </div>
  );
};

const GetPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 複数対応のステート
  const types = useMemo(() => {
    const typesStr = searchParams.get('types') || searchParams.get('type');
    if (!typesStr) return [];
    const parsed = typesStr.split(',').map(Number).filter(n => !isNaN(n));
    console.log("GetPage: Parsed yucchin types:", parsed);
    return parsed;
  }, [searchParams]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  // 現在のゆっちんデータを同期的(memo)に取得
  const yucchin = useMemo(() => {
    if (!isValid || currentIndex >= types.length) return null;
    const targetId = types[currentIndex];
    return YUCCHIN_MASTER.find(y => y.type === targetId) || null;
  }, [isValid, currentIndex, types]);

  useEffect(() => {
    if (yucchin) {
      console.log("GetPage: Showing yucchin:", yucchin.name, "(index:", currentIndex, "/", types.length, ")");
    }
  }, [yucchin, currentIndex, types.length]);
  
  // 演出フェーズのステート
  const [revealStart, setRevealStart] = useState(false); // フラッシュ除去・背景開始
  const [revealBadge, setRevealBadge] = useState(false); // 名前バッジ
  const [revealQuote, setRevealQuote] = useState(false); // セリフ
  const [quoteFadeOut, setQuoteFadeOut] = useState(false); // セリフのフェードアウト
  const [revealImage, setRevealImage] = useState(false); // キャラクター画像
  const [revealText, setRevealText] = useState(false);   // GET!!テキスト
  const [isStarted, setIsStarted] = useState(false);     // ユーザーが開始をタップしたか
  const audioRef = useRef<HTMLAudioElement | null>(null);          // セリフ音声用
  const startAudioRef = useRef<HTMLAudioElement | null>(null);     // 開始音用
  const pepeAudioRef = useRef<HTMLAudioElement | null>(null);      // 登場音用
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);     // ボイス用
  const timeoutIdsRef = useRef<number[]>([]);
  const settingsRef = useRef({ isSoundEnabled: true, volume: 0.7 });

  // 演出リセット用の関数
  const resetReveal = useCallback(() => {
    setRevealStart(false);
    setRevealBadge(false);
    setRevealQuote(false);
    setQuoteFadeOut(false);
    setRevealImage(false);
    setRevealText(false);
    setIsStarted(false);
    
    // タイマー消去
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  }, []);

  // バリデーション: 全てのIDが所持済みかチェック
  useEffect(() => {
    let active = true;
    const validate = async () => {
      if (types.length === 0) {
        if (active) navigate('/home');
        return;
      }

      try {
        const res = await client.get<UserYucchinResponse[]>("/yucchins");
        if (!active) return;
        
        const ownedIds = new Set(res.data.map(y => y.yucchin_type));
        
        const allOwned = types.every(id => ownedIds.has(id));
        if (!allOwned) {
          console.error("Access denied: One or more yucchins not in collection.");
          navigate('/home');
          return;
        }
        
        setIsValid(true);
        setIsValidating(false);
      } catch (err) {
        if (!active) return;
        console.error("Validation failed", err);
        navigate('/home');
      }
    };
    validate();
    return () => { active = false; };
  }, [types, navigate]);

  // 音声の事前読み込みと設定の反映
  useEffect(() => {
    if (!yucchin) return;

    let isSoundEnabled = true;
    let volume = 0.7;

    try {
      const enabled = localStorage.getItem("settings_yucchinSound");
      if (enabled === "false") isSoundEnabled = false;

      const rawVolume = localStorage.getItem("settings_bgmVolume");
      if (rawVolume) {
        volume = Number(rawVolume) / 100;
      }
    } catch (e) {
      console.warn("Settings load failed", e);
    }
    const currentVolume = Math.max(0, Math.min(1, volume));
    settingsRef.current = { isSoundEnabled, volume: currentVolume };

    if (isSoundEnabled) {
      const createPreloadedAudio = (src: string) => {
        const a = new Audio(src);
        a.volume = currentVolume;
        a.preload = 'auto';
        a.load();
        return a;
      };

      startAudioRef.current = createPreloadedAudio(startSound);
      pepeAudioRef.current = createPreloadedAudio(pepeSound);
      voiceAudioRef.current = createPreloadedAudio(yucchinVoice);

      if (yucchin.audioUrl) {
        const audio = new Audio(yucchin.audioUrl);
        audio.volume = currentVolume;
        audio.preload = 'auto';
        audio.load();
        audioRef.current = audio;
      }
    }

    return () => {
      const cleanupAudio = (ref: React.RefObject<HTMLAudioElement | null>) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = "";
          ref.current.onended = null;
          ref.current.onerror = null;
          ref.current = null;
        }
      };

      cleanupAudio(startAudioRef);
      cleanupAudio(pepeAudioRef);
      cleanupAudio(voiceAudioRef);
      cleanupAudio(audioRef);

      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    };
  }, [yucchin]);

  // 安全に setTimeout を実行し、管理対象に追加するヘルパー
  const safeSetTimeout = useCallback((handler: () => void, delay?: number) => {
    const id = window.setTimeout(handler, delay);
    timeoutIdsRef.current.push(id);
    return id;
  }, []);

  // 事前ロード済み音声を再生するヘルパー (useCallback でメモ化)
  const playPreloaded = useCallback((ref: React.RefObject<HTMLAudioElement | null>) => {
    if (!settingsRef.current.isSoundEnabled || !ref.current) return;
    const audio = ref.current;
    audio.currentTime = 0; // 頭出し
    audio.play().catch(e => console.warn("Preloaded playback failed", e));
  }, []);

  // 次へボタンの処理
  const handleNext = () => {
    if (currentIndex < types.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetReveal();
    } else {
      navigate('/home');
    }
  };

  // 演出開始時の処理
  const handleStart = () => {
    if (isStarted || !yucchin) return;
    setIsStarted(true);
    playPreloaded(startAudioRef);

    const isHighRarity = yucchin.rarity === 'SR' || yucchin.rarity === 'UR';
    const isSecret = yucchin.rarity === 'SECRET';
    
    // 1. 最初のアクション: フラッシュ除去 (500ms) - シークレットの場合は少し長め
    safeSetTimeout(() => setRevealStart(true), isSecret ? 800 : 500);

    if ((isHighRarity || isSecret) && yucchin.quote) {
      // SR/UR/SECRET の場合: セリフあり演出
      // 2. セリフ表示 (1500ms) - シークレットの場合は少し長め
      safeSetTimeout(() => setRevealQuote(true), isSecret ? 2000 : 1500);
    } else {
      // NORMAL/RARE の場合: 従来通りのテンポ
      // 2. 画像 ＆ 名前バッジ 表示 (1500ms)
      safeSetTimeout(() => {
        setRevealImage(true);
        setRevealBadge(true);
        playPreloaded(pepeAudioRef);
        safeSetTimeout(() => {
          playPreloaded(voiceAudioRef);
          setRevealText(true);
        }, 1500); // ユーザー調整済みのタイミング
      }, 1500);
    }
  };

  // セリフ表示時に音声を再生し、音声終了後にフェードアウト→次の画面へ
  useEffect(() => {
    if (revealQuote && !quoteFadeOut) {
      const displayStartTime = Date.now();
      const MIN_DISPLAY_TIME = 2500; // 最小表示時間 (2.5秒)

      const proceedToNext = () => {
        const elapsedTime = Date.now() - displayStartTime;
        const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);

        safeSetTimeout(() => {
          setQuoteFadeOut(true);
          safeSetTimeout(() => {
            setRevealImage(true);
            setRevealBadge(true);
            playPreloaded(pepeAudioRef);
            safeSetTimeout(() => {
              playPreloaded(voiceAudioRef);
              setRevealText(true);
            }, 1500); // ユーザー調整済みのタイミング
          }, 500);
        }, remainingTime);
      };

      const audio = audioRef.current;
      if (audio) {
        audio.onended = () => {
          proceedToNext();
        };
        
        audio.onerror = () => {
          console.error('音声の再生中にエラーが発生しました');
          proceedToNext();
        };

        // 再生を確実に開始する
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('音声の再生に失敗しました（自動再生制限など）:', error);
            proceedToNext();
          });
        }
        
        return () => {
          audio.onended = null;
          audio.onerror = null;
        };
      } else {
        // 音声がない場合、またはまだロードされていない場合
        proceedToNext();
      }
    }
  }, [revealQuote, quoteFadeOut, playPreloaded, safeSetTimeout, audioRef, pepeAudioRef, voiceAudioRef]);

  const theme = useMemo(() => {
    if (!yucchin) return RARITY_THEMES.NORMAL;
    return RARITY_THEMES[yucchin.rarity as keyof typeof RARITY_THEMES] || RARITY_THEMES.NORMAL;
  }, [yucchin]);

  if (isValidating || !yucchin) {
    return <div className="w-full h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-2xl font-bold text-white tracking-widest">VALIDATING...</p>
    </div>;
  }

  return (
    <div className={`w-full h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden relative transition-colors duration-1000 uppercase`}>
      
      {/* Start Interaction Overlay */}
      {!isStarted && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500"
          role="dialog"
          aria-modal="true"
        >
          <button 
            onClick={handleStart}
            autoFocus
            aria-label="演出を開始してゆっちんをゲットする"
            className="group relative flex flex-col items-center gap-8 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/50 rounded-3xl p-8"
          >
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-[60px] opacity-40 group-hover:opacity-70 animate-pulse"></div>
            <div className="relative text-8xl md:text-9xl font-black text-white italic tracking-tighter drop-shadow-[0_0_30px_rgba(251,146,60,1)]" style={{ fontFamily: '"Bungee", cursive' }}>
              REVEAL!!
            </div>
            <div className="relative text-2xl font-bold text-orange-400 tracking-[0.3em] animate-bounce">
              CLICK TO GET YOUR YUCCHIN
            </div>
          </button>
        </div>
      )}

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
          <FloatingParticles 
            color={theme.particleColor} 
            count={yucchin.rarity === 'SECRET' ? 80 : yucchin.rarity === 'UR' ? 60 : yucchin.rarity === 'NORMAL' ? 12 : 30} 
            rarity={yucchin.rarity} 
          />
          <TwinkleStars 
            count={yucchin.rarity === 'SECRET' ? 60 : yucchin.rarity === 'UR' ? 40 : yucchin.rarity === 'NORMAL' ? 6 : 20} 
          />
        </>
      )}

      {/* Confetti */}
      {(yucchin.rarity === 'SECRET' || yucchin.rarity === 'UR' || yucchin.rarity === 'SR' || yucchin.rarity === 'RARE') && revealImage && (
        <Confetti colors={theme.confettiColors} count={yucchin.rarity === 'SECRET' ? 100 : yucchin.rarity === 'RARE' ? 40 : 80} />
      )}

      {/* Screen Flash Overlay */}
      <div 
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000 ${revealStart ? 'opacity-0' : 'opacity-100'} ${yucchin.rarity === 'SECRET' ? 'bg-gradient-to-br from-yellow-400 via-white to-orange-400' : yucchin.rarity === 'UR' ? 'bg-gradient-to-br from-purple-400 via-white to-pink-400' : 'bg-white'}`}
      />

      {/* Main Container */}
      <Card className={`w-full h-full border-none bg-transparent shadow-none rounded-none overflow-visible relative z-10 transition-all duration-1000 ${revealStart ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${(yucchin.rarity === 'UR' || yucchin.rarity === 'SECRET') && revealStart ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <CardContent className="h-full relative flex flex-col items-center py-6 md:py-12 justify-around">
        
          {/* Unified Muscle Name Badge */}
          <div className={`relative z-20 mb-4 transition-all duration-1000 transform ${revealBadge ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className={`absolute inset-0 bg-orange-500 rounded-full blur-[40px] opacity-60 ${yucchin.rarity === 'UR' ? '' : 'animate-pulse'}`}></div>
            <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-2 border-orange-300 rounded-full px-8 md:px-12 py-3 md:py-4 shadow-[0_0_40px_rgba(251,146,60,1)] overflow-hidden">
              <div className="flex items-center gap-4 md:gap-6">
                <span className="text-2xl md:text-3xl filter drop-shadow-md">💪</span>
                <span className="text-2xl md:text-4xl font-black text-white tracking-widest drop-shadow-lg" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                  {yucchin.name}
                </span>
                <span className="text-2xl md:text-3xl filter drop-shadow-md">💪</span>
              </div>
            </div>
          </div>

          {/* Character Image Area */}
          <div className="flex-1 flex items-center justify-center w-full relative mt-4">
              {/* Quote Reveal (SR/UR Only) */}
              {revealQuote && !revealImage && yucchin.quote && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-30 px-4">
                  <div className={`max-w-[90vw] transition-opacity duration-500 ${quoteFadeOut ? 'opacity-0' : 'opacity-100 animate-[fadeIn_0.5s_ease-out]'}`}>
                    <p className="text-4xl sm:text-5xl font-black text-white italic drop-shadow-[0_4px_12px_rgba(251,146,60,0.8)] text-center leading-none whitespace-nowrap" style={{ fontFamily: '"Inter", sans-serif' }}>
                      「{yucchin.quote}」
                    </p>
                  </div>
                </div>
              )}

               {/* Rarity Aura & God Rays */}
               <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1500 ${revealImage ? 'scale-125 opacity-100' : 'scale-0 opacity-0'}`}>
                  {(yucchin.rarity === 'SECRET' || yucchin.rarity === 'UR' || yucchin.rarity === 'SR') && <GodRays color={theme.glowColor} rotate={yucchin.rarity === 'UR' || yucchin.rarity === 'SECRET'} />}
                  
                  {/* Multi-layered Aura Pulse */}
                  <div className={`absolute w-[35rem] h-[35rem] rounded-full blur-[120px] ${(yucchin.rarity === 'UR' || yucchin.rarity === 'SECRET') ? '' : 'animate-pulse'} opacity-60`}
                       style={{ backgroundColor: theme.glowColor }}></div>
                  {(yucchin.rarity === 'UR' || yucchin.rarity === 'SECRET') && (
                    <div className={`absolute w-[45rem] h-[45rem] rounded-full blur-[100px] opacity-30`}
                         style={{ backgroundColor: theme.glowColor }}></div>
                  )}
                  {yucchin.rarity === 'SECRET' && (
                    <div className={`absolute w-[55rem] h-[55rem] rounded-full blur-[80px] opacity-20`}
                         style={{ backgroundColor: theme.glowColor }}></div>
                  )}

                  <div className="absolute w-[20rem] h-[20rem] bg-white rounded-full blur-[80px] opacity-60"></div>
                  
                  {/* UR/SECRET Unique Inner Spark - Multi-layered */}
                  {(yucchin.rarity === 'UR' || yucchin.rarity === 'SECRET') && (
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-[12rem] h-[12rem] bg-white rounded-full blur-[20px] animate-ping opacity-30"></div>
                       <div className="w-[8rem] h-[8rem] bg-white rounded-full blur-[15px] animate-ping opacity-40 delay-500"></div>
                       {yucchin.rarity === 'SECRET' && (
                         <div className="w-[6rem] h-[6rem] bg-yellow-300 rounded-full blur-[10px] animate-ping opacity-50 delay-1000"></div>
                       )}
                     </div>
                  )}
               </div>

              <div className={`relative transition-all duration-1000 cubic-bezier(0.175, 0.885, 0.32, 1.275) transform ${revealImage ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                  {/* Luxury Ripple Waves (No Gaps) - Shared for SR, UR and SECRET - Moved to background of image */}
                  {(yucchin.rarity === 'SECRET' || yucchin.rarity === 'UR' || yucchin.rarity === 'SR') && revealImage && (
                    <div className="absolute inset-0 pointer-events-none z-0">
                      {/* Rainbow Rotating Ring - Only for UR and SECRET */}
                      {(yucchin.rarity === 'UR' || yucchin.rarity === 'SECRET') && (
                        <div className={`absolute inset-[-20%] rounded-full border-4 border-transparent ${yucchin.rarity === 'SECRET' ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600' : 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500'} animate-[spin_5s_linear_infinite] opacity-20 blur-[2px]`} style={{ maskImage: 'linear-gradient(white, white), linear-gradient(white, white)', maskClip: 'padding-box, border-box', maskComposite: 'exclude' }}></div>
                      )}
                      
                      {/* Continuous Ripple Waves */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_0%,transparent_100%)] rounded-full animate-ping scale-110 blur-[2px]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.3)_0%,transparent_100%)] rounded-full animate-ping scale-130 delay-500 blur-[4px]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_100%)] rounded-full animate-ping scale-150 delay-1000 blur-[8px]" />
                    </div>
                  )}

                  <img 
                      src={yucchin.imageUrl} 
                      alt={yucchin.name}
                      className="w-72 h-72 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                      style={{
                        animation: revealImage ? 'subtleBounce 3s ease-in-out infinite' : 'none'
                      }}
                  />

                  {/* Rarity Badge at Bottom Right of Image */}
                  <div className="absolute -right-4 -bottom-4 z-30">
                    <RarityBadge rarity={yucchin.rarity} />
                  </div>
                  
              </div>
          </div>

          {/* GET Text with Unified Muscle Style */}
          <div className={`mt-2 mb-8 md:mb-12 transition-all duration-1000 delay-500 transform ${revealText ? 'opacity-100 scale-100' : 'opacity-0 scale-125'}`}>
            <div className="relative text-center">
              {/* Outer Glow for GET!! */}
              <div className={`absolute inset-0 bg-orange-600 blur-[40px] opacity-40 animate-pulse`}></div>
              <h1 
                className={`text-6xl md:text-9xl font-black tracking-tighter inline-block relative z-10`}
                style={{ 
                  fontFamily: '"Bungee", cursive',
                  filter: 'drop-shadow(0 0 30px rgba(251,146,60,1)) drop-shadow(0 10px 10px rgba(0,0,0,0.5))',
                  WebkitTextStroke: '1px rgba(255,255,255,0.4)',
                }}
              >
                <span className="relative inline-block bg-clip-text text-transparent bg-gradient-to-b from-yellow-200 via-orange-500 to-red-800">
                  GET!!
                  {/* Metallic Shine Sweep - Clipped to text */}
                  {yucchin.rarity !== 'NORMAL' && (
                    <span 
                      className="absolute inset-0 bg-clip-text text-transparent pointer-events-none"
                      style={{
                        WebkitBackgroundClip: 'text',
                        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'metallicShineText 3s infinite'
                      }}
                    >
                      GET!!
                    </span>
                  )}
                </span>
              </h1>
            </div>
          </div>
          
        </CardContent>
      </Card>

      {/* Navigation Button (Appears 2s after revealText starts, so after GET!! animation ends) */}
      <div className={`fixed bottom-8 left-8 z-[100] transition-all duration-1000 delay-[2000ms] transform ${revealText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
         <button
            onClick={handleNext}
            className="px-8 py-3 bg-orange-500/80 hover:bg-orange-600 backdrop-blur-md border-2 border-orange-300 rounded-2xl text-white font-bold text-lg md:text-xl tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(251,146,60,0.4)]"
         >
            <div className="flex items-center gap-3">
               <Home className="w-6 h-6" />
               <span>ホームに戻る</span>
            </div>
         </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@900&family=Montserrat:wght@900&family=Bungee&family=Bebas+Neue&display=swap');

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
        @keyframes metallicShine {
          0% { transform: translateX(-150%) skewX(-20deg); }
          20%, 100% { transform: translateX(250%) skewX(-20deg); }
        }
        @keyframes metallicShineText {
          0% { background-position: -200% 0; }
          20%, 100% { background-position: 200% 0; }
        }
        @keyframes shineSweep {
          0% { background-position: -200% -200%; }
          50% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }

        .rarity-normal {
          background: linear-gradient(to bottom, 
            #e8e8e8 0%, #d0d0d0 20%, #b8b8b8 40%, #a0a0a0 50%, #888888 60%, #707070 70%, #585858 80%, #404040 90%, #282828 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 1.5px #d0d0d0;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
        }
        .rarity-rare {
          background: linear-gradient(to bottom, 
            #cd7f32 0%, #b87333 15%, #a0662f 30%, #8b5a2b 45%, #764d27 50%, #614023 55%, #4d331f 70%, #392615 85%, #251a0d 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 2.5px #d4a574;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
        }
        .rarity-sr {
          background: linear-gradient(to bottom, 
            #b0e0e6 0%, #87ceeb 15%, #7ec8e3 30%, #6bb6ff 45%, #5ba3f5 50%, #4a90e2 55%, #3a7dd0 70%, #2a6abd 85%, #1a58aa 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 3px #87ceeb;
          filter: 
            drop-shadow(0 0 8px rgba(135, 206, 235, 0.8))
            drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
        }
        .rarity-ur {
          background: linear-gradient(to right, 
            #ff0000 0%, #ff4500 12.5%, #ffa500 25%, #ffd700 37.5%, #ffff00 50%, #90ee90 62.5%, #00bfff 75%, #0000ff 87.5%, #8b00ff 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 3px rgba(173, 216, 230, 0.8);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
          font-weight: 900;
        }
        .rarity-secret {
          background: linear-gradient(to right, 
            #ffd700 0%, #ffed4e 12.5%, #fff700 25%, #ffd700 37.5%, #ffed4e 50%, #fff700 62.5%, #ffd700 75%, #ffed4e 87.5%, #ffd700 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 4px #ffffff;
          filter: 
            drop-shadow(0 0 20px rgba(255, 215, 0, 0.9))
            drop-shadow(0 0 40px rgba(255, 215, 0, 0.7))
            drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
          font-weight: 900;
          background-size: 200% 100%;
          animation: secretShimmer 1.5s ease-in-out infinite;
        }
        
        @keyframes secretShimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GetPage;
