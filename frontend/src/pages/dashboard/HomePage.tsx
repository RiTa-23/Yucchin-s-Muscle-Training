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
import mukiyuchiImg from '@/assets/mukiyuchiBK.png';
// import bgImage from '@/assets/img/kiriyuttin.png';

export default function HomePage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // TODO: Implement actual logout  消したの→transform hover:scale-[1.01] transition-all aspect-video
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-yellow-200 p-8 relative">
            {/* 左側の画像 */}
            <img 
                src={mukiyuchiImg} 
                alt="mukiyuchi left" 
                className="fixed left-0 bottom-0 w-[510px] h-auto z-50 opacity-100 -translate-x-1/4"
            />
            
            {/* 右側の画像 */}
            <img 
                src={mukiyuchiImg} 
                alt="mukiyuchi right" 
                className="fixed right-0 bottom-0 w-[510px] h-auto z-50 opacity-100 transform scale-x-[-1] translate-x-1/4"
            />
            <div className="max-none mx-auto space-y-8 relative z-10">
                <div className="flex justify-between items-center border-4 border-black p-4 gap-4">
                    <Button variant="outline" onClick={handleLogout}>設定</Button>
                    <Button variant="outline" onClick={handleLogout} className="w-[400px]"><h1 className="text-[#000000]">頑張りの歴史</h1></Button>
                    <Button variant="outline" onClick={handleLogout} className="w-[400px]"><h1 className="text-[#000000]">集めたゆっちん</h1></Button>
                    <div className="w-[100px]"></div>
                </div>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Card className="border-4 border-black rounded-none p-4 w-full max-w-4xl h-[30rem] flex flex-col ">
                        <CardHeader>
                            <div className="flex flex-col justify-center items-center border border-black p-4 mx-auto max-w-xl rounded-8">
                                どれにするぅ？
                            </div>
                        </CardHeader>
                        <CardContent className="py-[60px]">
                            <div className="grid grid-cols-3 gap-4 w-full">
                                {/* スクワット */}
                                <div onClick={() => navigate("/camera")} className="hover:bg-accent hover:text-accent-foreground border-4 border-black p-4 bg-white flex items-center justify-center text-black aspect-video">
                                    <span className="text-lg" >スクワット</span>
                                </div>
                                {/* プランク */}
                                <div onClick={() => navigate("/camera")} className="hover:bg-accent hover:text-accent-foreground border-4 border-black p-4 bg-white flex items-center justify-center text-black aspect-video">
                                    <span className="text-lg" >プランク</span>
                                </div>
                                {/* 腕立て */}
                                <div onClick={() => navigate("/camera")} className="hover:bg-accent hover:text-accent-foreground border-4 border-black p-4 bg-white flex items-center justify-center text-black aspect-video">
                                    <span className="text-lg" >腕立て</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}   
