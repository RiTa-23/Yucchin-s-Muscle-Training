import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // TODO: Implement actual logout
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-muted/20 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">ホーム</h1>
                    <Button variant="outline" onClick={handleLogout}>ログアウト</Button>
                </div>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Card className="hover:shadow-md transition-shadow border-primary/20 w-full max-w-2xl transform hover:scale-[1.01] transition-all">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">トレーニングを開始</CardTitle>
                            <CardDescription className="text-center text-lg">AIによるリアルタイムフォーム矯正</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                                <span className="text-lg">カメラプレビュー</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full text-lg py-6" onClick={() => navigate("/training/plank")}>カメラを起動</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
