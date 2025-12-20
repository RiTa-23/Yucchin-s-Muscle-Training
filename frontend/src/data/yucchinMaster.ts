// N
import yucchin1 from "../assets/img/yucchins/neko.png";
import yucchin2 from "../assets/img/yucchins/kabuto.png";
import yucchin3 from "../assets/img/yucchins/teal.png";
import yucchin4 from "../assets/img/yucchins/hanataba_blue.png";
import yucchin5 from "../assets/img/yucchins/blue.png";
import yucchin6 from "../assets/img/yucchins/blue_corner.png";
import yucchin7 from "../assets/img/yucchins/purple.png";
import yucchin8 from "../assets/img/yucchins/purple_corner.png";
import yucchin9 from "../assets/img/yucchins/debiruman.png";

// R
import yucchin101 from "../assets/img/yucchins/sika.png";
import yucchin102 from "../assets/img/yucchins/torikera.png";
import yucchin103 from "../assets/img/yucchins/hanataba_rainbow.png";
import yucchin104 from "../assets/img/yucchins/hanabi.png";
import yucchin105 from "../assets/img/yucchins/dendousi.png";
// SR
import yucchin201 from "../assets/img/yucchins/risu.png";
import yucchin202 from "../assets/img/yucchins/egg.png";
import yucchin203 from "../assets/img/yucchins/sika_kakusei.png";
// UR
import yucchin301 from "../assets/img/yucchins/angel.png";
// SECRET
import yucchin401 from "../assets/img/yucchins/rentogen.png";

// Audio imports
import audio201 from "../assets/sounds/cant-do.wav";
import audio202 from "../assets/sounds/omelette.wav";
import audio203 from "../assets/sounds/nara.wav";
import audio301 from "../assets/sounds/holy-muscle_T01.wav";
import audio401 from "../assets/sounds/gure_T01.wav";

export interface YucchinMaster {
  type: number;
  name: string;
  rarity: "NORMAL" | "RARE" | "SR" | "UR" | "SECRET";
  imageUrl: string;
  quote?: string; // キャラクター登場時のセリフ
  audioUrl?: string; // セリフの音声ファイル
}

// Temporary placeholder data based on the design intuition
// In a real app, this might come from an API or a static config
export const YUCCHIN_MASTER: YucchinMaster[] = [
  // NORMAL
  { type: 1, name: "ねこゆっちん", rarity: "NORMAL", imageUrl: yucchin1 },
  { type: 2, name: "かぶとゆっちん", rarity: "NORMAL", imageUrl: yucchin2 },
  {
    type: 3,
    name: "ティールゆっちんブーケ",
    rarity: "NORMAL",
    imageUrl: yucchin3,
  },
  {
    type: 4,
    name: "ブルーゆっちんブーケ",
    rarity: "NORMAL",
    imageUrl: yucchin4,
  },
  { type: 5, name: "ブルーゆっちん", rarity: "NORMAL", imageUrl: yucchin5 },
  { type: 6, name: "青鬼ゆっちん", rarity: "NORMAL", imageUrl: yucchin6 },
  { type: 7, name: "パープルゆっちん", rarity: "NORMAL", imageUrl: yucchin7 },
  { type: 8, name: "紫鬼ゆっちん", rarity: "NORMAL", imageUrl: yucchin8 },
  { type: 9, name: "デビルマンゆっちん", rarity: "NORMAL", imageUrl: yucchin9 },
  // RARE
  { type: 101, name: "しかゆっちん", rarity: "RARE", imageUrl: yucchin101 },
  { type: 102, name: "トリケラトユチン", rarity: "RARE", imageUrl: yucchin102 },
  {
    type: 103,
    name: "カラフルゆっちんブーケ",
    rarity: "RARE",
    imageUrl: yucchin103,
  },
  { type: 104, name: "花火ゆっちん", rarity: "RARE", imageUrl: yucchin104 },
  {
    type: 105,
    name: "愛の伝道師ゆっちん",
    rarity: "RARE",
    imageUrl: yucchin105,
  },
  // SR
  {
    type: 201,
    name: "リスカゆっちん",
    rarity: "SR",
    imageUrl: yucchin201,
    quote: "もうマジ無理…リスカしよ。",
    audioUrl: audio201,
  },
  {
    type: 202,
    name: "たまごゆっちん",
    rarity: "SR",
    imageUrl: yucchin202,
    quote: "どうせならオムライスにしてほしいです。",
    audioUrl: audio202,
  },
  {
    type: 203,
    name: "しかゆっちん【神鹿】",
    rarity: "SR",
    imageUrl: yucchin203,
    quote: "もし行くなら…奈良に行きたいかな。",
    audioUrl: audio203,
  },
  // UR
  {
    type: 301,
    name: "エンジェルゆっちん",
    rarity: "UR",
    imageUrl: yucchin301,
    quote: "聖なる筋肉が、あなたを勝利へと導くでしょう。",
    audioUrl: audio301,
  },
  // SECRET
  {
    type: 401,
    name: "レントゲンゆっちん",
    rarity: "SECRET",
    imageUrl: yucchin401,
    quote: "ゴレ゛！ア゛ダジのｼﾝｿﾞｩ！！",
    audioUrl: audio401,
  },
];
