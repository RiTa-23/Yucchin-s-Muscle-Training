import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import bgImage from "@/assets/img/doubleyuttin.png";
import bgImageSmall from "@/assets/img/kiriyuttin.png";
import soundFile from "@/assets/sounds/hehe_T01.wav";
import backSoundFile from "@/assets/sounds/he-sound_T01.wav";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { playSound } from "@/utils/audio";
import { LogIn, UserPlus, Volume2, VolumeX } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/home");
    }
  }, [user, loading, navigate]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("settings_yucchinSound");
      return v === null ? true : v === "true";
    } catch {
      return true;
    }
  });

  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkSoundStatus = () => {
      try {
        const v = localStorage.getItem("settings_yucchinSound");
        setSoundEnabled(v === null ? true : v === "true");
      } catch {
        // ignore
      }
    };
    // 別タブでの変更を検知
    window.addEventListener("storage", checkSoundStatus);
    // 同一タブ内での変更を検知（カスタムイベント）
    window.addEventListener("soundSettingChanged", checkSoundStatus);
    return () => {
      window.removeEventListener("storage", checkSoundStatus);
      window.removeEventListener("soundSettingChanged", checkSoundStatus);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(orientation: portrait)"); // 縦長（縦幅>横幅）

    const handleMatch = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsPortrait(e.matches);
    };

    // Initial check
    handleMatch(mediaQuery);

    // Listener (modern browsers)
    mediaQuery.addEventListener("change", handleMatch);
    return () => mediaQuery.removeEventListener("change", handleMatch);
  }, []);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    try {
      localStorage.setItem("settings_yucchinSound", String(newValue));
      // 同一タブ内の他のコンポーネントに通知
      window.dispatchEvent(new Event("soundSettingChanged"));
    } catch {
      // ignore
    }
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  // Error and loading states
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  type ApiErrorDetail = { msg?: string };
  type ApiErrorResponse = {
    response?: { data?: { detail?: string | ApiErrorDetail[] } };
  };

  const isApiErrorResponse = (error: unknown): error is ApiErrorResponse => {
    return typeof error === "object" && error !== null && "response" in error;
  };

  // Helper to process errors
  const getErrorMessage = (error: unknown, defaultMessage: string) => {
    const detail = isApiErrorResponse(error)
      ? error.response?.data?.detail
      : undefined;

    if (!detail) {
      return error instanceof Error ? error.message : defaultMessage;
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      // Pydantic validation errors
      const messages = detail
        .map((d) => {
          const msg = typeof d?.msg === "string" ? d.msg : "";
          if (msg.includes("valid email"))
            return "有効なメールアドレスを入力してください。";
          if (msg.includes("at least"))
            return "パスワードの文字数が足りません（8文字以上）。";
          if (msg.includes("Field required")) return "入力は必須です。";
          return msg;
        })
        .filter(Boolean);

      return messages.length > 0 ? messages.join("\n") : defaultMessage;
    }

    return defaultMessage;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    setIsLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
      // navigation is handled by useEffect when user state changes
    } catch (error: unknown) {
      console.error("Login failed:", error);
      setLoginError(getErrorMessage(error, "ログインに失敗しました。"));
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError("");
    setIsSignupLoading(true);

    try {
      await signup(signupUsername, signupEmail, signupPassword);
      // navigation is handled by useEffect when user state changes
    } catch (error: unknown) {
      console.error("Signup failed:", error);
      setSignupError(getErrorMessage(error, "新規登録に失敗しました。"));
    } finally {
      setIsSignupLoading(false);
    }
  };

  const backgroundImage = isPortrait ? bgImageSmall : bgImage;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-900 via-yellow-900 to-orange-800 flex items-center justify-center p-4 sm:p-6">
      {/* 背景の装飾 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-6 w-52 h-52 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-orange-600 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-6 w-64 h-64 sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px] bg-red-600 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* グリッド背景 */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,165,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,165,0,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>

      {/* 背景画像の強力な発光エフェクト */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-transparent rounded-full blur-[100px] animate-pulse"></div>
        <div
          className="absolute inset-0 bg-gradient-to-l from-red-600 via-orange-500 to-transparent rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
        ></div>
      </div>

      {/* 背景画像 */}
      <div
        className="absolute inset-0 pointer-events-none bg-no-repeat opacity-99"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: isPortrait ? "contain" : "cover",
          backgroundPosition: isPortrait ? "-30px calc(100% + 30px)" : "center",
        }}
      ></div>

      <Tabs
        defaultValue="login"
        className="w-full max-w-md px-1 sm:px-0 relative z-10"
      >
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-orange-900/50 to-red-900/50 border-2 border-orange-500/50">
          <TabsTrigger
            value="login"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white"
          >
            <LogIn className="w-4 h-4 mr-2" />
            ログイン
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            新規登録
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card className="border-2 border-orange-500/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl shadow-[0_0_60px_rgba(251,146,60,0.4)]">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent text-2xl font-black">
                🔓 ログイン
              </CardTitle>
              <CardDescription className="text-orange-200 font-semibold">
                おかえり♡今日もゆっちんと頑張るわよぉん
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-2">
                {loginError && (
                  <div className="bg-red-900/30 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm whitespace-pre-wrap font-semibold">
                    ⚠️ {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-orange-200 font-bold">
                    メールアドレス
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yucchin@example.com"
                    value={loginEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLoginEmail(e.target.value)
                    }
                    className="bg-gray-700/50 border-2 border-orange-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-orange-200 font-bold"
                  >
                    パスワード
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLoginPassword(e.target.value)
                    }
                    className="bg-gray-700/50 border-2 border-orange-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-500/50"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full text-lg font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 shadow-[0_0_30px_rgba(251,146,60,0.5)] hover:shadow-[0_0_50px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105 border-2 border-yellow-300/50 py-6"
                  disabled={isLoginLoading}
                  onClick={() => playSound(soundFile)}
                >
                  {isLoginLoading ? "ログイン中..." : "🚀 ログイン"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card className="border-2 border-orange-500/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl shadow-[0_0_60px_rgba(251,146,60,0.4)]">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent text-2xl font-black">
                ✨ 新規登録
              </CardTitle>
              <CardDescription className="text-orange-200 font-semibold">
                初めまして♡今日からあなたもムキムキよぉん
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-3">
                {signupError && (
                  <div className="bg-red-900/30 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm whitespace-pre-wrap font-semibold">
                    ⚠️ {signupError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-orange-200 font-bold"
                  >
                    ユーザーネーム
                  </Label>
                  <Input
                    id="username"
                    value={signupUsername}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSignupUsername(e.target.value)
                    }
                    className="bg-gray-700/50 border-2 border-orange-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-email"
                    className="text-orange-200 font-bold"
                  >
                    メールアドレス
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSignupEmail(e.target.value)
                    }
                    className="bg-gray-700/50 border-2 border-orange-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-orange-200 font-bold"
                  >
                    パスワード
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSignupPassword(e.target.value)
                    }
                    className="bg-gray-700/50 border-2 border-orange-500/50 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-500/50"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full text-lg font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 shadow-[0_0_30px_rgba(251,146,60,0.5)] hover:shadow-[0_0_50px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105 border-2 border-yellow-300/50 py-6"
                  disabled={isSignupLoading}
                  onClick={() => playSound(soundFile)}
                >
                  {isSignupLoading ? "作成中..." : "💪 アカウント作成"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <p className="text-sm text-yellow-300 font-bold flex items-center gap-1">
              <span className="text-yellow-300">※</span>
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
          <div className="text-center">
            <Link
              to="/"
              className="text-purple-300 hover:text-purple-200 hover:underline text-base font-bold transition-colors duration-300 inline-block hover:scale-110"
              onClick={() => playSound(backSoundFile)}
            >
              ⬅️ スタート画面に戻る
            </Link>
          </div>
        </div>
      </Tabs>

      {/* スタイル定義 */}
      <style>{`
        /* アクセシビリティ：モーション感度への配慮 */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse {
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
