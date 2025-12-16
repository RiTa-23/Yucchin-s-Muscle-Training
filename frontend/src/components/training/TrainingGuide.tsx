import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrainingGuideProps {
    title: string;
    description: React.ReactNode;
    onStart: () => void;
    illustration?: React.ReactNode; // Can be an image URL or an SVG component
}

export const TrainingGuide = ({ title, description, onStart, illustration }: TrainingGuideProps) => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b flex items-center relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4"
                        onClick={() => navigate('/home')}
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold text-center w-full">{title}</h1>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto flex flex-col items-center text-center">

                    {illustration && (
                        <div className="w-full max-w-sm aspect-video bg-gray-100 rounded-lg mb-8 flex items-center justify-center overflow-hidden">
                            {illustration}
                        </div>
                    )}

                    <div className="text-gray-600 text-lg leading-relaxed mb-8 space-y-4">
                        {description}
                    </div>

                    <Button
                        size="lg"
                        className="w-full max-w-xs text-xl py-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                        onClick={onStart}
                    >
                        スタート！
                    </Button>
                </div>
            </div>
        </div>
    );
};
