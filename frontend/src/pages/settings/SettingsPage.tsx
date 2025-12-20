import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import client from "@/api/client";
import { playSound } from "@/utils/audio";
import testSound from "@/assets/sounds/volume-check_T01.wav";
import clickSound from "@/assets/sounds/hehe_T01.wav";
import backSound from "@/assets/sounds/he-sound_T01.wav";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout, user, refreshUser } = useAuth();
  const [username, setUsername] = React.useState<string>(user?.username || "");

  // ...

  // State Definitions
  const [yucchinSound, setYucchinSound] = React.useState<boolean>(() => {
    try {
      const v = localStorage.getItem("settings_yucchinSound");
      return v === null ? true : v === "true";
    } catch {
      return true;
    }
  });

  const [yucchinHidden, setYucchinHidden] = React.useState<boolean>(() => {
    try {
      const v = localStorage.getItem("settings_yucchinHidden");
      return v === null ? false : v === "true";
    } catch {
      return false;
    }
  });

  const [bgmVolume, setBgmVolume] = React.useState<number>(() => {
    try {
      const v = localStorage.getItem("settings_bgmVolume");
      return v === null ? 50 : Number(v);
    } catch {
      return 50;
    }
  });

  const [fps, setFps] = React.useState<number>(() => {
    try {
      const v = localStorage.getItem("settings_fps");
      return v === null ? 20 : Number(v);
    } catch {
      return 20;
    }
  });

  const updateSettings = async (data: any) => {
    try {
      await client.put("/settings/me", data);
      await refreshUser(); // Update global user context via AuthContext
    } catch (e) {
      console.error("Failed to update settings", e);
    }
  };

  const handleUsernameChange = async () => {
    try {
      await client.put("/users/me", { username });
      alert(`ユーザーネームを「${username}」に変更しました`);
      await refreshUser();
    } catch (error) {
      console.error("Failed to update username", error);
      alert("ユーザーネームの変更に失敗しました");
    }
  };

  // Fetch settings from DB on mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await client.get("/settings/me");
        const data = res.data;

        // localStorageの値を優先（他のページで変更された可能性があるため）
        try {
          const localSound = localStorage.getItem("settings_yucchinSound");
          const localHidden = localStorage.getItem("settings_yucchinHidden");
          const localVolume = localStorage.getItem("settings_bgmVolume");
          const localFps = localStorage.getItem("settings_fps");

          setYucchinSound(
            localSound !== null ? localSound === "true" : data.yucchin_sound
          );
          setYucchinHidden(
            localHidden !== null ? localHidden === "true" : data.yucchin_hidden
          );
          setBgmVolume(
            localVolume !== null ? Number(localVolume) : data.bgm_volume
          );
          setFps(localFps !== null ? Number(localFps) : data.fps);

          // localStorageとサーバーの値が異なる場合、サーバーを更新
          const needsSync =
            (localSound !== null &&
              (localSound === "true") !== data.yucchin_sound) ||
            (localHidden !== null &&
              (localHidden === "true") !== data.yucchin_hidden) ||
            (localVolume !== null && Number(localVolume) !== data.bgm_volume) ||
            (localFps !== null && Number(localFps) !== data.fps);

          if (needsSync) {
            const updates: any = {};
            if (localSound !== null)
              updates.yucchin_sound = localSound === "true";
            if (localHidden !== null)
              updates.yucchin_hidden = localHidden === "true";
            if (localVolume !== null) updates.bgm_volume = Number(localVolume);
            if (localFps !== null) updates.fps = Number(localFps);

            if (Object.keys(updates).length > 0) {
              await client.put("/settings/me", updates);
            }
          }
        } catch {
          // localStorageが使えない場合はサーバーの値を使用
          setYucchinSound(data.yucchin_sound);
          setYucchinHidden(data.yucchin_hidden);
          setBgmVolume(data.bgm_volume);
          setFps(data.fps);
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    };
    fetchSettings();
  }, []);

  // Sync to LocalStorage (Cache)
  React.useEffect(() => {
    try {
      localStorage.setItem("settings_yucchinSound", String(yucchinSound));
      localStorage.setItem("settings_yucchinHidden", String(yucchinHidden));
      localStorage.setItem("settings_bgmVolume", String(bgmVolume));
      localStorage.setItem("settings_fps", String(fps));
      // 同一タブ内の他のコンポーネントに通知
      window.dispatchEvent(new Event("soundSettingChanged"));
    } catch {
      // ignore storage errors
    }
  }, [yucchinSound, yucchinHidden, bgmVolume, fps]);

  const handleYucchinSoundChange = (checked: boolean) => {
    setYucchinSound(checked);
    updateSettings({ yucchin_sound: checked });
  };

  const handleYucchinHiddenChange = (checked: boolean) => {
    setYucchinHidden(checked);
    updateSettings({ yucchin_hidden: checked });
  };

  const handleFpsChange = (value: number) => {
    setFps(value);
    updateSettings({ fps: value });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handlePlayTestSound = async () => {
    // スライダーは0-100なので0-1に正規化
    const vol = Math.max(0, Math.min(1, bgmVolume / 100));
    await playSound(testSound, vol);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8 relative overflow-hidden">
      {/* 背景の装飾（発光の円） */}
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

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            設定
          </h1>
          <Button
            variant="outline"
            onClick={() => {
              playSound(backSound);
              navigate(-1);
            }}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 text-white font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105"
          >
            戻る
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-orange-500/50 hover:border-yellow-400 shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-yellow-300">【アプリ設定】</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-300">
                    ユーザーネーム
                  </div>
                  <div className="text-sm text-orange-200">表示名の設定</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-48">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ユーザーネーム"
                      maxLength={10}
                      className="bg-gray-700/50 border-orange-500/50 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      playSound(clickSound);
                      handleUsernameChange();
                    }}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-bold"
                  >
                    変更
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-300">音量</div>
                  <div className="text-sm text-orange-200">
                    アプリの音量設定
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-40">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={bgmVolume}
                      onChange={(e) => setBgmVolume(Number(e.target.value))}
                      onMouseUp={(e) =>
                        updateSettings({
                          bgm_volume: Number(
                            (e.currentTarget as HTMLInputElement).value
                          ),
                        })
                      }
                      onTouchEnd={(e) =>
                        updateSettings({
                          bgm_volume: Number(
                            (e.currentTarget as HTMLInputElement).value
                          ),
                        })
                      }
                      onKeyUp={(e) =>
                        updateSettings({
                          bgm_volume: Number(
                            (e.currentTarget as HTMLInputElement).value
                          ),
                        })
                      }
                      onBlur={(e) =>
                        updateSettings({
                          bgm_volume: Number(
                            (e.currentTarget as HTMLInputElement).value
                          ),
                        })
                      }
                      className="w-full accent-orange-500"
                    />
                    <div className="text-xs text-right text-orange-300 mt-1">
                      {bgmVolume}%
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handlePlayTestSound}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-bold"
                  >
                    テスト音声
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-300">ログアウト</div>
                  <div className="text-sm text-orange-200">
                    アカウントからログアウトします
                  </div>
                </div>
                <div className="pt-4 border-t border-orange-500/50">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-500/50 hover:bg-red-900/20 hover:text-red-500 hover:border-red-400 font-semibold"
                    onClick={async () => {
                      try {
                        await playSound(clickSound);
                      } finally {
                        handleLogout();
                      }
                    }}
                  >
                    ログアウト
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-orange-500/50 hover:border-yellow-400 shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-yellow-300">【ゆっちん設定】</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-300">
                    ゆっちんの音
                  </div>
                  <div className="text-sm text-orange-200">
                    ゆっちんの声のオン/オフ
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={yucchinSound}
                    onChange={(e) => handleYucchinSoundChange(e.target.checked)}
                    aria-label="ゆっちんの音トグル"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      yucchinSound
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                        : "bg-gray-600"
                    }`}
                  />
                  <div
                    className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                      yucchinSound ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-300">
                    ゆっちんを非表示
                  </div>
                  <div className="text-sm text-orange-200">
                    ゆっちんの画像を非表示にします
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={yucchinHidden}
                    onChange={(e) =>
                      handleYucchinHiddenChange(e.target.checked)
                    }
                    aria-label="ゆっちん非表示トグル"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      yucchinHidden
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                        : "bg-gray-600"
                    }`}
                  />
                  <div
                    className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                      yucchinHidden ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-yellow-300">
                    ゆっちんを変更
                  </div>
                  <div className="text-sm text-orange-200">
                    別のゆっちんに変更します（準備中）
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-gray-300 font-bold cursor-not-allowed opacity-60"
                >
                  準備中
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-orange-500/50 hover:border-yellow-400 shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-yellow-300">【カメラ設定】</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-yellow-300">
                  パフォーマンス (FPS)
                </div>
                <div className="text-sm text-orange-200">
                  解析の滑らかさを調整します
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  { label: "高 (30fps)", value: 30 },
                  { label: "中 (20fps)", value: 20 },
                  { label: "低 (10fps)", value: 10 },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={fps === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      playSound(clickSound);
                      handleFpsChange(option.value);
                    }}
                    className={
                      fps === option.value
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-bold"
                        : "border-orange-500/50 text-orange-700 hover:bg-orange-500/20 hover:text-orange-600 font-semibold"
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
