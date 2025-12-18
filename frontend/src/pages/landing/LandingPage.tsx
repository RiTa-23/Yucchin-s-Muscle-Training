import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import bgImage from "@/assets/img/yucchins/mukimukiyuttin.jpg";
import soundFile from "@/assets/sounds/これであなたも！ムキムキよ！_T01.wav";
import {
  Dumbbell,
  TrendingUp,
  Trophy,
  Zap,
  Star,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { playSound } from "@/utils/audio";
import * as React from "react";

export default function LandingPage() {
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(() => {
    try {
      const v = localStorage.getItem("settings_yucchinSound");
      return v === null ? true : v === "true";
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    try {
      localStorage.setItem("settings_yucchinSound", String(newValue));
    } catch {
      // ignore
    }
  };

  const features = [
    {
      icon: Dumbbell,
      title: "AI フォーム分析",
      description: "カメラでフォームを自動チェック",
    },
    {
      icon: TrendingUp,
      title: "成長の記録",
      description: "あなたの頑張りを可視化",
    },
    {
      icon: Trophy,
      title: "ゆっちんコレクション",
      description: "トレーニングでゆっちんを集めよう",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
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

      {/* グリッド背景 */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,165,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,165,0,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* メインコンテンツ */}
      <div className="relative min-h-screen flex flex-col">
        {/* ヒーローセクション */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
          <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            {/* 左側：テキストとボタン */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="relative -translate-y-33">
                  <h1
                    className="text-4xl md:text-6xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,146,60,0.8)] leading-tight"
                    style={{
                      fontFamily:
                        '"RocknRoll One", ui-sans-serif, system-ui, sans-serif',
                      animation: "slideInLeft 0.8s ease-out, pulse 2s infinite",
                      textShadow: "0 0 40px rgba(251, 146, 60, 0.5)",
                    }}
                  >
                    これであなたも
                    <br />
                    <span className="inline-flex items-center gap-2 md:gap-3">
                      ムキムキよぉん
                      <span className="animate-bounce text-yellow-400 text-3xl md:text-5xl lg:text-6xl -translate-y-2">
                        💪
                      </span>
                    </span>
                  </h1>
                  {/* タイトル背景の光 */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 blur-3xl animate-pulse"></div>
                </div>
                <p
                  className="text-xl md:text-2xl text-orange-200 font-bold drop-shadow-lg"
                  style={{ animation: "slideInLeft 0.8s ease-out 0.2s both" }}
                >
                  ✨ AIがフォームを分析し、
                  <br />
                  あなたの成長を正確に記録します ✨
                </p>
              </div>

              <div
                className="space-y-4"
                style={{ animation: "slideInLeft 0.8s ease-out 0.4s both" }}
              >
                <div className="flex gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="text-2xl px-12 py-8 font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 shadow-[0_0_40px_rgba(251,146,60,0.8)] hover:shadow-[0_0_60px_rgba(251,146,60,1)] transition-all duration-300 hover:scale-110 border-4 border-yellow-300/50 relative overflow-hidden group"
                  >
                    <Link
                      to="/auth"
                      onClick={() => {
                        if (soundEnabled) {
                          playSound(soundFile);
                        }
                      }}
                      className="relative z-10 flex items-center gap-3"
                    >
                      <Zap className="w-8 h-8 animate-pulse" />
                      今すぐ始める
                      <Zap
                        className="w-8 h-8 animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      />
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-orange-300/80 font-semibold flex items-center gap-1">
                    <span className="text-yellow-400">※</span>
                    このサイトは音声が流れます
                  </p>
                  <button
                    onClick={toggleSound}
                    className="p-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-orange-500/50 hover:border-yellow-400 hover:bg-gradient-to-r hover:from-yellow-400/30 hover:to-orange-500/30 transition-all duration-300 hover:scale-110"
                    aria-label={
                      soundEnabled ? "音声をオフにする" : "音声をオンにする"
                    }
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-orange-300" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 右側：画像 */}
            <div
              className="relative"
              style={{
                animation:
                  "slideInRight 0.8s ease-out 0.3s both, float 3s ease-in-out infinite",
              }}
            >
              {/* 超強力発光エフェクト */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-3xl blur-[80px] opacity-80 animate-pulse"></div>
                <div
                  className="absolute inset-0 bg-gradient-to-br from-red-600 to-yellow-400 rounded-3xl blur-[60px] opacity-60 animate-pulse"
                  style={{ animationDelay: "0.5s", animationDuration: "2s" }}
                ></div>
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-pink-500 rounded-3xl blur-[40px] opacity-50 animate-pulse"
                  style={{ animationDelay: "1s", animationDuration: "1.5s" }}
                ></div>
              </div>

              {/* 複数の回転する光のリング */}
              <div className="absolute inset-0 -z-5">
                <div
                  className="absolute inset-0 rounded-3xl border-[12px] border-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-spin-slow"
                  style={{
                    backgroundOrigin: "border-box",
                    backgroundClip: "border-box",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                ></div>
                <div
                  className="absolute inset-4 rounded-3xl border-8 border-transparent bg-gradient-to-l from-red-500 via-yellow-400 to-orange-500 animate-spin-reverse"
                  style={{
                    backgroundOrigin: "border-box",
                    backgroundClip: "border-box",
                    WebkitMask:
                      "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                  }}
                ></div>
              </div>

              {/* 画像コンテナ */}
              <div className="relative rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(251,146,60,1)] border-[10px] border-gradient-to-r from-yellow-300 via-orange-400 to-red-500 hover:scale-[1.15] hover:rotate-3 transition-all duration-500 hover:shadow-[0_0_150px_rgba(251,146,60,1)] group">
                {/* 輝きのオーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-shimmer"></div>

                {/* メイン画像 */}
                <img
                  src={bgImage}
                  alt="ムキムキゆっちん"
                  className="w-full h-auto relative z-10 brightness-125 contrast-125 saturate-110 group-hover:brightness-150 group-hover:saturate-125 transition-all duration-500"
                />

                {/* 内側の光のフレーム */}
                <div className="absolute inset-0 border-4 border-yellow-300/50 rounded-2xl animate-pulse"></div>
              </div>

              {/* 超強力キラキラエフェクト */}
              <div className="absolute top-4 right-4 w-6 h-6 bg-yellow-300 rounded-full animate-ping shadow-[0_0_20px_rgba(253,224,71,1)]"></div>
              <div
                className="absolute top-12 right-8 w-5 h-5 bg-orange-400 rounded-full animate-ping shadow-[0_0_20px_rgba(251,146,60,1)]"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="absolute bottom-8 left-4 w-5 h-5 bg-red-500 rounded-full animate-ping shadow-[0_0_20px_rgba(239,68,68,1)]"
                style={{ animationDelay: "0.6s" }}
              ></div>
              <div
                className="absolute bottom-4 right-12 w-4 h-4 bg-yellow-200 rounded-full animate-ping shadow-[0_0_15px_rgba(254,240,138,1)]"
                style={{ animationDelay: "0.9s" }}
              ></div>
              <div
                className="absolute top-1/2 left-2 w-4 h-4 bg-pink-400 rounded-full animate-ping shadow-[0_0_15px_rgba(244,114,182,1)]"
                style={{ animationDelay: "1.2s" }}
              ></div>
              <div
                className="absolute top-1/4 right-2 w-3 h-3 bg-orange-300 rounded-full animate-ping shadow-[0_0_10px_rgba(253,186,116,1)]"
                style={{ animationDelay: "1.5s" }}
              ></div>

              {/* 光の粒子 */}
              <Star
                className="absolute top-8 left-8 w-8 h-8 text-yellow-300 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <Sparkles
                className="absolute bottom-16 right-16 w-10 h-10 text-orange-400 animate-pulse"
                style={{ animationDelay: "0.8s" }}
              />
              <Star
                className="absolute top-32 right-4 w-6 h-6 text-red-400 animate-pulse"
                style={{ animationDelay: "1.4s" }}
              />
            </div>
          </div>
        </div>

        {/* 特徴セクション */}
        <div className="pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-black text-center mb-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,146,60,0.6)]"
              style={{
                fontFamily:
                  '"RocknRoll One", ui-sans-serif, system-ui, sans-serif',
                animation: "fadeInUp 0.8s ease-out 0.5s both",
              }}
            >
              💎 3つの特徴 💎
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-4 border-orange-500/50 hover:border-yellow-400 hover:shadow-[0_0_40px_rgba(251,146,60,0.8)] transition-all duration-300 hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl"
                  style={{
                    animation: `fadeInUp 0.8s ease-out ${
                      0.6 + index * 0.1
                    }s both`,
                  }}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(251,146,60,0.6)] animate-pulse">
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                      {feature.title}
                    </h3>
                    <p className="text-orange-200 font-semibold">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* アニメーション用のスタイル */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }

        /* アクセシビリティ：モーション感度への配慮 */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-bounce,
          .animate-ping,
          .animate-spin-slow,
          .animate-spin-reverse,
          .animate-shimmer,
          .animate-fade-in {
            animation: none !important;
          }
          
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
