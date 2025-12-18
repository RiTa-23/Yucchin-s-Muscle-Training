/**
 * 音声ファイルを再生する関数
 * ブラウザの自動再生ポリシーに対応したエラーハンドリング付き
 * @param audioFile - 再生する音声ファイルのパス
 */
export const playSound = async (
  audioFile: string,
  volume?: number
): Promise<void> => {
  try {
    try {
      const enabled = localStorage.getItem("settings_yucchinSound");
      if (enabled !== null && enabled === "false") {
        return;
      }
    } catch {
      // ignore storage errors
    }
    const audio = new Audio(audioFile);
    let v: number | undefined = volume;
    if (typeof v !== "number") {
      try {
        const raw = localStorage.getItem("settings_bgmVolume");
        const parsed = raw != null ? Number(raw) : NaN;
        if (!Number.isNaN(parsed)) {
          v = parsed / 100; // 0-100 を 0-1 に正規化
        }
      } catch {
        // localStorage が使えない場合は既定音量(ブラウザ既定)のまま
      }
    }
    if (typeof v === "number") {
      audio.volume = Math.max(0, Math.min(1, v));
    }
    await audio.play();
  } catch (error) {
    // ブラウザの自動再生ポリシーによりブロックされた場合
    console.warn("Audio playback failed:", error);
  }
};
