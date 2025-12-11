import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";

export default function CameraPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<string>('未接続');
    const [messages, setMessages] = useState<string[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // カメラアクセス
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access error:", err);
            }
        };
        startCamera();

        // WebSocket接続
        const ws = new WebSocket('ws://localhost:8000/pose');
        socketRef.current = ws;

        ws.onopen = () => {
            setStatus('接続済み');
            ws.send('Hello from React!');
        };

        ws.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };

        ws.onclose = () => {
            setStatus('未接続');
        };

        return () => {
            ws.close();
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6 text-blue-600">カメラテスト</h1>

            <div className="bg-white p-4 rounded-xl shadow-lg mb-6 w-full max-w-2xl">
                <h2 className="text-xl font-semibold mb-2">ステータス: <span className={status === '接続済み' ? 'text-green-500' : 'text-red-500'}>{status}</span></h2>

                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]" // ミラーリング
                    />
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-2xl">
                <h3 className="font-semibold mb-2">サーバーからのメッセージ:</h3>
                <div className="h-32 overflow-y-auto border border-gray-200 p-2 rounded bg-gray-50 text-sm">
                    {messages.map((msg, i) => (
                        <div key={i}>{msg}</div>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <Button onClick={() => window.location.href = '/home'}>ホームに戻る</Button>
            </div>
        </div>
    );
}
