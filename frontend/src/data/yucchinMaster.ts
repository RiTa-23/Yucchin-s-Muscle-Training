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
    { type: 1, name: "ノーマルゆっちん1", rarity: 'NORMAL', imageUrl: "https://cdn.discordapp.com/attachments/1449801217399197859/1450112736423055371/IMG_1989.jpg?ex=694202fa&is=6940b17a&hm=edaa2cbc8ac698ccdc6e80cc929ed984ce7e42c454c9943064ea4fe788dca432&" },
    { type: 2, name: "ノーマルゆっちん2", rarity: 'NORMAL', imageUrl: "https://placehold.co/100x100?text=Normal2" },
    { type: 3, name: "ノーマルゆっちん3", rarity: 'NORMAL', imageUrl: "https://placehold.co/100x100?text=Normal3" },
    { type: 4, name: "ノーマルゆっちん4", rarity: 'NORMAL', imageUrl: "https://placehold.co/100x100?text=Normal4" },
    { type: 5, name: "ノーマルゆっちん5", rarity: 'NORMAL', imageUrl: "https://placehold.co/100x100?text=Normal5" },
    { type: 6, name: "ノーマルゆっちん6", rarity: 'NORMAL', imageUrl: "https://placehold.co/100x100?text=Normal6" },
    // RARE
    { type: 101, name: "レアゆっちん1", rarity: 'RARE', imageUrl: "https://cdn.discordapp.com/attachments/1449801217399197859/1449905327205122202/243_20251007190611.png?ex=6941ea8f&is=6940990f&hm=b98d9be6c427505ea3e505b48ebbdcb21262348610ebc1ce38240bb29b47f603&" },
    { type: 102, name: "レアゆっちん2", rarity: 'RARE', imageUrl: "https://cdn.discordapp.com/attachments/1449801217399197859/1449905772220907715/221_20250707123103.png?ex=6941eafa&is=6940997a&hm=faf3923115558fa3f56c3f5c43e28445cbf4e5eafdf99d299c601837b9470f54&" },
    { type: 103, name: "レアゆっちん3", rarity: 'RARE', imageUrl: "https://placehold.co/100x100?text=Rare3" },
    { type: 104, name: "レアゆっちん4", rarity: 'RARE', imageUrl: "https://placehold.co/100x100?text=Rare4" },
    { type: 105, name: "レアゆっちん5", rarity: 'RARE', imageUrl: "https://placehold.co/100x100?text=Rare5" },
];
