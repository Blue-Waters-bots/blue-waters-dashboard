
import { QualityPrediction } from "@/types/waterQuality";
import { cn } from "@/lib/utils";

interface QualityPredictorProps {
  prediction: QualityPrediction;
}

const QualityPredictor = ({ prediction }: QualityPredictorProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-water-safe";
    if (score >= 60) return "text-water-blue";
    if (score >= 40) return "text-water-warning";
    return "text-water-danger";
  };

  const getRingColor = (score: number) => {
    if (score >= 80) return "from-water-safe to-water-safe/50";
    if (score >= 60) return "from-water-blue to-water-blue/50";
    if (score >= 40) return "from-water-warning to-water-warning/50";
    return "from-water-danger to-water-danger/50";
  };

  return (
    <div className="w-full mb-8">
      <h2 className="text-lg font-medium mb-4">Water Quality Prediction</h2>
      <div className="glass-panel rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 relative w-48 h-48">
            {/* Score display with rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-40 h-40 rounded-full bg-gradient-to-br",
                getRingColor(prediction.score)
              )} style={{ opacity: 0.15 }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-32 h-32 rounded-full bg-gradient-to-br",
                getRingColor(prediction.score)
              )} style={{ opacity: 0.25 }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-24 h-24 rounded-full bg-gradient-to-br",
                getRingColor(prediction.score)
              )} style={{ opacity: 0.4 }}></div>
            </div>
            {/* Central score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={cn("text-5xl font-light", getScoreColor(prediction.score))}>
                {prediction.score}
              </span>
              <span className={cn("text-sm font-medium", getScoreColor(prediction.score))}>
                {prediction.status}
              </span>
            </div>
            
            {/* Water ripple animation effect */}
            <div className="absolute inset-0">
              <div className="water-ripple w-full h-full"></div>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium mb-2">Analysis</h3>
            <p className="text-muted-foreground mb-4">{prediction.description}</p>
            
            <h4 className="font-medium mb-2">Recommended Improvements</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {prediction.improvementSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityPredictor;
