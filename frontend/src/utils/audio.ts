/**
 * 音声ファイルを再生する関数
 * ブラウザの自動再生ポリシーに対応したエラーハンドリング付き
 * @param audioFile - 再生する音声ファイルのパス
 */
export const playSound = async (audioFile: string): Promise<void> => {
  try {
    const audio = new Audio(audioFile);
    await audio.play();
  } catch (error) {
    // ブラウザの自動再生ポリシーによりブロックされた場合
    console.warn("Audio playback failed:", error);
  }
};
