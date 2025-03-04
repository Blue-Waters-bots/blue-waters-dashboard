
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HealthRisks from "@/components/HealthRisks";
import { waterSources } from "@/data/waterQualityData";
import WaterSourceSelector from "@/components/WaterSourceSelector";

const HealthRiskAssessment = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

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
            
            <HealthRisks diseases={selectedSource.diseases} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRiskAssessment;
