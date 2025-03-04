
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import QualityPredictor from "@/components/QualityPredictor";
import { qualityPredictions, waterSources } from "@/data/waterQualityData";
import WaterSourceSelector from "@/components/WaterSourceSelector";

const WaterQualityPrediction = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Water Quality Prediction</h1>
              <p className="text-muted-foreground max-w-3xl">
                Advanced AI-powered prediction of water quality parameters, helping you anticipate changes 
                and take proactive measures to maintain safe water conditions.
              </p>
            </div>
            
            <WaterSourceSelector 
              sources={waterSources}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
            />
            
            <QualityPredictor prediction={qualityPredictions[selectedSource.id]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityPrediction;
