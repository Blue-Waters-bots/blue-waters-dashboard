
import { DiseasePrediction } from "@/types/waterQuality";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface HealthRisksProps {
  diseases: DiseasePrediction[];
}

const HealthRisks = ({ diseases }: HealthRisksProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-water-safe bg-water-safe/10 border-water-safe/20";
      case "medium":
        return "text-water-warning bg-water-warning/10 border-water-warning/20";
      case "high":
        return "text-water-danger bg-water-danger/10 border-water-danger/20";
      default:
        return "text-water-blue bg-water-blue/10 border-water-blue/20";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low":
        return "Low Risk";
      case "medium":
        return "Medium Risk";
      case "high":
        return "High Risk";
      default:
        return "Unknown Risk";
    }
  };

  if (!diseases.length) {
    return (
      <div className="w-full mb-8">
        <h2 className="text-lg font-medium mb-4">Health Risk Assessment</h2>
        <div className="glass-panel rounded-lg p-6 text-center">
          <p className="text-muted-foreground">No health risks detected for this water source.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-lg font-medium mb-4">Health Risk Assessment</h2>
      <div className="grid grid-cols-1 gap-4">
        {diseases.map((disease) => (
          <div
            key={disease.id}
            className="glass-panel rounded-lg p-4 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-lg">{disease.name}</h3>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium border",
                getRiskColor(disease.riskLevel)
              )}>
                {getRiskLabel(disease.riskLevel)}
              </span>
            </div>
            
            <p className="text-muted-foreground mb-4">{disease.description}</p>
            
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Caused by:</p>
                <div className="flex flex-wrap gap-2">
                  {disease.causedBy.map((cause, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-secondary rounded-full font-medium"
                    >
                      {cause}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthRisks;
