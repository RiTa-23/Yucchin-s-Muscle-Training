import React, { useEffect, useState } from "react";
import client from "../../api/client";
import { YUCCHIN_MASTER, type YucchinMaster } from "../../data/yucchinMaster";
import { useNavigate } from "react-router-dom";
import { playSound } from "@/utils/audio";
import backSound from "@/assets/sounds/he-sound_T01.wav";
import { Button } from "@/components/ui/button";

interface UserYucchinResponse {
  id: number;
  yucchin_type: number;
  yucchin_name: string;
  obtained_at: string;
}

interface DisplayYucchin extends YucchinMaster {
  isObtained: boolean;
  obtainedAt?: string;
}

export const CollectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [displayList, setDisplayList] = useState<DisplayYucchin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's obtained yucchins
        const res = await client.get<UserYucchinResponse[]>("/yucchins");
        const obtainedMap = new Map(
          res.data.map((item) => [item.yucchin_type, item])
        );

        // Merge with Master Data
        const merged: DisplayYucchin[] = YUCCHIN_MASTER.map((master) => ({
          ...master,
          isObtained: obtainedMap.has(master.type),
          obtainedAt: obtainedMap.get(master.type)?.obtained_at,
        }));

        setDisplayList(merged);
      } catch (error) {
        console.error("Failed to fetch yucchins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Rarity buckets (ordered as in master data)
  const normalItems = displayList.filter((i) => i.rarity === "NORMAL");
  const rareItems = displayList.filter((i) => i.rarity === "RARE");
  const srItems = displayList.filter((i) => i.rarity === "SR");
  const urItems = displayList.filter((i) => i.rarity === "UR");
  const secretItems = displayList.filter((i) => i.rarity === "SECRET");

  const renderGrid = (items: DisplayYucchin[]) => (
    <div className="grid grid-cols-6 gap-4">
      {items.map((item) => (
        <div key={item.type} className="flex flex-col items-center">
          {/* 写真フレーム：サイズは維持 (w-24 h-32) */}
          <div className="w-24 h-32 border-2 border-orange-500/50 rounded-md flex items-center justify-center bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-1 shadow-[0_0_20px_rgba(251,146,60,0.6)] relative overflow-hidden">
            {/* フレーム内グリッド装飾 */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,165,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,165,0,0.3) 1px, transparent 1px)",
                backgroundSize: "12px 12px",
              }}
            ></div>
            {item.isObtained ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="max-w-full max-h-full object-contain drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]"
              />
            ) : (
              <span className="text-4xl font-extrabold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]">
                ?
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
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
      {/* Header / Title */}
      <div className="max-w-5xl mx-auto pt-8 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            集めたゆっちん
          </h1>
          <Button
            variant="outline"
            onClick={async () => {
              await playSound(backSound);
              navigate("/home");
            }}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-yellow-300 hover:via-orange-400 hover:to-red-500 border-2 border-yellow-300/50 text-white font-bold shadow-[0_0_20px_rgba(251,146,60,0.6)] hover:shadow-[0_0_30px_rgba(251,146,60,0.8)] transition-all duration-300 hover:scale-105"
          >
            戻る
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-24 max-w-5xl mx-auto relative z-10">
        <div className="border-4 border-orange-500/50 hover:border-yellow-400 p-6 rounded-xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl shadow-[0_0_40px_rgba(251,146,60,0.6)] relative min-h-[600px] transition-all duration-300">
          {/* Book Content */}
          <div className="space-y-6">
            {normalItems.length > 0 && (
              <section>
                <h2 className="font-bold text-lg mb-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  ●N
                </h2>
                {renderGrid(normalItems)}
              </section>
            )}

            {rareItems.length > 0 && (
              <section>
                <h2 className="font-bold text-lg mb-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  ★R
                </h2>
                {renderGrid(rareItems)}
              </section>
            )}
            {srItems.length > 0 && (
              <section>
                <h2 className="font-bold text-lg mb-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  ★★SR
                </h2>
                {renderGrid(srItems)}
              </section>
            )}

            {urItems.length > 0 && (
              <section>
                <h2 className="font-bold text-lg mb-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  ★★★UR
                </h2>
                {renderGrid(urItems)}
              </section>
            )}

            {secretItems.length > 0 && (
              <section>
                <h2 className="font-bold text-lg mb-2 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  🔥Secret
                </h2>
                {renderGrid(secretItems)}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
