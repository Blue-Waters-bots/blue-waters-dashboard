
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HealthRisks from "@/components/HealthRisks";
import { waterSources } from "@/data/waterQualityData";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, Shield, AlertTriangle } from "lucide-react";

const HealthRiskAssessment = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

  const getOverallRiskLevel = () => {
    if (!selectedSource.diseases.length) return "safe";
    
    if (selectedSource.diseases.some(d => d.riskLevel === "high")) {
      return "high";
    } else if (selectedSource.diseases.some(d => d.riskLevel === "medium")) {
      return "medium";
    } else {
      return "low";
    }
  };

  const getRiskSummary = () => {
    const riskLevel = getOverallRiskLevel();
    
    switch (riskLevel) {
      case "high":
        return {
          title: "High Risk Detected",
          description: "This water source shows significant health risks. Immediate treatment or alternative water sources recommended.",
          icon: <AlertTriangle className="h-5 w-5 text-water-danger" />
        };
      case "medium":
        return {
          title: "Moderate Risk Detected",
          description: "This water source has some concerning parameters. Additional treatment recommended before consumption.",
          icon: <AlertTriangle className="h-5 w-5 text-water-warning" />
        };
      case "low":
        return {
          title: "Low Risk Detected",
          description: "This water source has minimal health risks. Safe for most uses with routine monitoring.",
          icon: <Shield className="h-5 w-5 text-water-safe" />
        };
      default:
        return {
          title: "No Risk Detected",
          description: "This water source is currently safe based on all measured parameters.",
          icon: <Shield className="h-5 w-5 text-water-safe" />
        };
    }
  };

  const summary = getRiskSummary();

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Health Risk Assessment</h1>
              <p className="text-muted-foreground max-w-3xl">
                Comprehensive analysis of potential health risks associated with current water conditions. 
                Identify and mitigate disease risks before they affect public health.
              </p>
            </div>
            
            <WaterSourceSelector 
              sources={waterSources}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
            />
            
            <Alert className="mb-6">
              {summary.icon}
              <AlertTitle className="text-base">{summary.title}</AlertTitle>
              <AlertDescription>
                {summary.description}
              </AlertDescription>
            </Alert>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Water Source Information</h2>
              </div>
              <div className="glass-panel rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Source Name</p>
                    <p className="font-medium">{selectedSource.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-medium">{selectedSource.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                    <p className="font-medium">{selectedSource.type}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-2">Health Risk Summary</p>
                  <div className="text-sm">
                    {selectedSource.diseases.length > 0 ? (
                      <ul className="list-disc ml-5">
                        {selectedSource.diseases.map(disease => (
                          <li key={disease.id} className="mb-1">
                            <span className="font-medium">{disease.name}</span>: {disease.description.substring(0, 100)}...
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No significant health risks detected for this water source.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <HealthRisks diseases={selectedSource.diseases} />
            
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">About Health Risk Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    This assessment is based on current water quality parameters and known health risks associated with detected contaminants.
                    Regular water testing is recommended to ensure ongoing safety. Contact your local water authority for more information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRiskAssessment;
