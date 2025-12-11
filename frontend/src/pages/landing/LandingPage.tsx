import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
            <div className="text-center space-y-6 p-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                    Yucchin's Muscle Training
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px]">
                    AI搭載の筋トレアシスタント。フォームを分析し、あなたの成長を正確に記録します。
                </p>
                <div className="flex justify-center gap-4">
                    <Button asChild size="lg">
                        <Link to="/auth">はじめる</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
