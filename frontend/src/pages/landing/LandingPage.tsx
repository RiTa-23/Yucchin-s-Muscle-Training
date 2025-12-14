import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import bgImage from "@/assets/img/kiriyuttin.png";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground bg-cover bg-center bg-no-repeat bg-yellow-200"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "110%",
      }}
    >
      <div className="w-full max-w-[900px] pr-12 text-right space-y-6 p-4">
        <div className="flex justify-end">
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tighter text-right relative translate-x-[6rem] md:translate-x-[16rem]"
            style={{
              textShadow:
                "2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white",
            }}
          >
            これであなたもムキムキよぉん
          </h1>
        </div>

        <p
          className="text-xl text-muted-foreground max-w-[600px] text-right relative translate-x-[10rem] md:translate-x-[22rem]"
          style={{
            textShadow:
              "2px 2px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 1px 1px 0 white, -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white",
          }}
        >
          フォームを分析し、あなたの成長を正確に記録します
        </p>
        <div className="flex justify-end gap-4 -translate-x-6 md:-translate-x-8">
          <Button asChild size="lg">
            <Link to="/auth">はじめる</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
