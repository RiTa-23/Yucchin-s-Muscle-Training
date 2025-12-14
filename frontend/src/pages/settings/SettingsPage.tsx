import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as React from "react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [notify, setNotify] = React.useState<boolean>(true);
  const [yucchinSound, setYucchinSound] = React.useState<boolean>(true);
  const [yucchinHidden, setYucchinHidden] = React.useState<boolean>(false);
  const [bgmVolume, setBgmVolume] = React.useState<number>(50);
  const handleLogout = () => {
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
                  <div className="font-medium">通知</div>
                  <div className="text-sm text-muted-foreground">
                    トレーニング通知の受信
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                    aria-label="通知トグル"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      notify ? "bg-black" : "bg-gray-200"
                    }`}
                  />
                  <div
                    className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                      notify ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">アカウント</div>
                  <div className="text-sm text-muted-foreground">
                    プロフィールとログイン情報
                  </div>
                </div>
                <Button size="sm">編集</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">BGM</div>
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
                    className="text-red-600 border-black-700 hover:bg-red-50 hover:text-red-700"
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
                    onChange={(e) => setYucchinSound(e.target.checked)}
                    aria-label="ゆっちんの音トグル"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      yucchinSound ? "bg-black" : "bg-gray-200"
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
                    onChange={(e) => setYucchinHidden(e.target.checked)}
                    aria-label="ゆっちん非表示トグル"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors ${
                      yucchinHidden ? "bg-black" : "bg-gray-200"
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
      </div>
    </div>
  );
}
