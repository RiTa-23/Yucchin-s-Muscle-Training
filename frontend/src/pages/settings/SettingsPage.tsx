import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import client from "@/api/client";

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
                setYucchinSound(data.yucchin_sound);
                setYucchinHidden(data.yucchin_hidden);
                setBgmVolume(data.bgm_volume);
                setFps(data.fps);
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

    return (
        <div className="min-h-screen bg-yellow-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">設定</h1>
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        戻る
                    </Button>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>【アプリ設定】</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">ユーザーネーム</div>
                                    <div className="text-sm text-muted-foreground">
                                        表示名の設定
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-48">
                                        <Input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="ユーザーネーム"
                                        />
                                    </div>
                                    <Button size="sm" onClick={handleUsernameChange}>変更</Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">音量</div>
                                    <div className="text-sm text-muted-foreground">
                                        アプリの音量設定
                                    </div>
                                </div>
                                <div className="w-40">
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={bgmVolume}
                                        onChange={(e) => setBgmVolume(Number(e.target.value))}
                                        onMouseUp={() => updateSettings({ bgm_volume: bgmVolume })}
                                        onTouchEnd={() => updateSettings({ bgm_volume: bgmVolume })}
                                        className="w-full accent-black"
                                    />
                                    <div className="text-xs text-right text-muted-foreground mt-1">
                                        {bgmVolume}%
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">ログアウト</div>
                                    <div className="text-sm text-muted-foreground">
                                        アカウントからログアウトします
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        className="text-red-600 border-gray-700 hover:bg-red-50 hover:text-red-700"
                                        onClick={handleLogout}
                                    >
                                        ログアウト
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>【ゆっちん設定】</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">ゆっちんの音</div>
                                    <div className="text-sm text-muted-foreground">
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
                                        className={`w-11 h-6 rounded-full transition-colors ${yucchinSound ? "bg-black" : "bg-gray-200"
                                            }`}
                                    />
                                    <div
                                        className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${yucchinSound ? "translate-x-5" : "translate-x-0"
                                            }`}
                                    />
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">ゆっちんを非表示</div>
                                    <div className="text-sm text-muted-foreground">
                                        ゆっちんの画像を非表示にします
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={yucchinHidden}
                                        onChange={(e) => handleYucchinHiddenChange(e.target.checked)}
                                        aria-label="ゆっちん非表示トグル"
                                    />
                                    <div
                                        className={`w-11 h-6 rounded-full transition-colors ${yucchinHidden ? "bg-black" : "bg-gray-200"
                                            }`}
                                    />
                                    <div
                                        className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${yucchinHidden ? "translate-x-5" : "translate-x-0"
                                            }`}
                                    />
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">ゆっちんを変更</div>
                                    <div className="text-sm text-muted-foreground">
                                        別のゆっちんに変更します
                                    </div>
                                </div>
                                <Button size="sm">変更</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>【カメラ設定】</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">パフォーマンス (FPS)</div>
                                <div className="text-sm text-muted-foreground">
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
                                        onClick={() => handleFpsChange(option.value)}
                                        className={fps === option.value ? "bg-blue-600 hover:bg-blue-700" : ""}
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
