import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import { YUCCHIN_MASTER, type YucchinMaster } from '../../data/yucchinMaster';
import { useNavigate } from 'react-router-dom';

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
    // Pagination state (for future use as requested)
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20; // Example limit

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user's obtained yucchins
                const res = await client.get<UserYucchinResponse[]>('/yucchins');
                const obtainedMap = new Map(res.data.map(item => [item.yucchin_type, item]));

                // Merge with Master Data
                const merged: DisplayYucchin[] = YUCCHIN_MASTER.map(master => ({
                    ...master,
                    isObtained: obtainedMap.has(master.type),
                    obtainedAt: obtainedMap.get(master.type)?.obtained_at
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

    // Pagination Logic
    // 1. Separate all items by rarity first
    const allNormals = displayList.filter(i => i.rarity === 'NORMAL');
    const allRares = displayList.filter(i => i.rarity === 'RARE');
    
    // 2. Combine them to ensure specific order (Normal -> Rare)
    const allSortedItems = [...allNormals, ...allRares];

    // 3. Paginate the sorted list
    const totalPages = Math.ceil(allSortedItems.length / ITEMS_PER_PAGE) || 1;
    const currentItems = allSortedItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // 4. Split current page items for rendering
    const normalItems = currentItems.filter(i => i.rarity === 'NORMAL');
    const rareItems = currentItems.filter(i => i.rarity === 'RARE');

    const renderGrid = (items: DisplayYucchin[]) => (
        <div className="grid grid-cols-6 gap-4">
            {items.map((item) => (
                <div key={item.type} className="flex flex-col items-center">
                    <div className="w-24 h-32 border-2 border-black flex items-center justify-center bg-white p-1">
                        {item.isObtained ? (
                            <img src={item.imageUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <span className="text-4xl text-gray-400">?</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Title */}
            <div className="p-4 border-b">
                <h1 className="text-2xl font-bold text-gray-800">集めたゆっちん</h1>
            </div>

            {/* Main Content */}
            <div className="p-4 pb-24 max-w-5xl mx-auto">
                <div className="border-4 border-black p-6 rounded-xl shadow-lg bg-white relative min-h-[600px]">
                    {/* Top Decor (Circle and History Button) */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-8 h-8 rounded-full border-2 border-black"></div>
                    </div>

                    {/* Book Content */}
                    <div className="space-y-6">
                        {normalItems.length > 0 && (
                            <section>
                                <h2 className="font-bold text-lg mb-2">●ノーマル</h2>
                                {renderGrid(normalItems)}
                            </section>
                        )}

                        {rareItems.length > 0 && (
                            <section>
                                <h2 className="font-bold text-lg mb-2">★レア</h2>
                                {renderGrid(rareItems)}
                            </section>
                        )}
                    </div>
                </div>

                {/* Pagination (Mock UI) */}
                <div className="flex justify-center items-center mt-6 space-x-4">
                     <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                     >
                        &lt;
                     </button>
                     <span className="font-bold">Page {currentPage} / {totalPages}</span>
                     <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                     >
                        &gt;
                     </button>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <button 
                    onClick={() => navigate('/home')}
                    className="pointer-events-auto bg-white border-2 border-black rounded-full px-12 py-3 font-bold text-lg shadow-md hover:bg-gray-50 transition-colors"
                >
                    お家画面
                </button>
            </div>
        </div>
    );
};

export default CollectionPage;
