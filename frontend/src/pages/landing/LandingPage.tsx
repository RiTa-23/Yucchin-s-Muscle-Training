import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bgImage from '@/assets/img/kiriyuttin.png';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-end justify-center  bg-background text-foreground bg-cover bg-center bg-no-repeat
 bg-yellow-200"style={{ backgroundImage: `url(${bgImage})` , backgroundSize: '110%' as React.CSSProperties['backgroundSize'] }} 

>
            <div className="text-center space-y-6 p-4 mr-18">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                    これであなたもムキムキよぉん      
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-[600px]">
                    フォームを分析し、あなたの成長を正確に記録します
                </p>
                <div className="flex justify-end gap-4 mr-70">
                    <Button asChild size="lg">
                        <Link to="/auth">はじめる</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
