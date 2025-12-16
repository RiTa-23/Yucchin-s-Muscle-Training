import yucchin1 from '../assets/img/yucchins/type_1.jpg';
import yucchin101 from '../assets/img/yucchins/type_101.png';
import yucchin102 from '../assets/img/yucchins/type_102.png';
// Import downloaded placeholders
import yucchin2 from '../assets/img/yucchins/type_2.png';
import yucchin3 from '../assets/img/yucchins/type_3.png';
import yucchin4 from '../assets/img/yucchins/type_4.png';
import yucchin5 from '../assets/img/yucchins/type_5.png';
import yucchin6 from '../assets/img/yucchins/type_6.png';
import yucchin103 from '../assets/img/yucchins/type_103.png';
import yucchin104 from '../assets/img/yucchins/type_104.png';
import yucchin105 from '../assets/img/yucchins/type_105.png';

export interface YucchinMaster {
    type: number;
    name: string;
    rarity: 'NORMAL' | 'RARE';
    imageUrl: string; // Path to image (e.g., '/assets/yucchins/type_1.png')
}

// Temporary placeholder data based on the design intuition
// In a real app, this might come from an API or a static config
export const YUCCHIN_MASTER: YucchinMaster[] = [
    // NORMAL
    { type: 1, name: "ノーマルゆっちん1", rarity: 'NORMAL', imageUrl: yucchin1 },
    { type: 2, name: "ノーマルゆっちん2", rarity: 'NORMAL', imageUrl: yucchin2 },
    { type: 3, name: "ノーマルゆっちん3", rarity: 'NORMAL', imageUrl: yucchin3 },
    { type: 4, name: "ノーマルゆっちん4", rarity: 'NORMAL', imageUrl: yucchin4 },
    { type: 5, name: "ノーマルゆっちん5", rarity: 'NORMAL', imageUrl: yucchin5 },
    { type: 6, name: "ノーマルゆっちん6", rarity: 'NORMAL', imageUrl: yucchin6 },
    // RARE
    { type: 101, name: "レアゆっちん1", rarity: 'RARE', imageUrl: yucchin101 },
    { type: 102, name: "レアゆっちん2", rarity: 'RARE', imageUrl: yucchin102 },
    { type: 103, name: "レアゆっちん3", rarity: 'RARE', imageUrl: yucchin103 },
    { type: 104, name: "レアゆっちん4", rarity: 'RARE', imageUrl: yucchin104 },
    { type: 105, name: "レアゆっちん5", rarity: 'RARE', imageUrl: yucchin105 },
];
