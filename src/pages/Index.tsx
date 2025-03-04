
import { useState } from "react";
import Header from "@/components/Header";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import QualityMetrics from "@/components/QualityMetrics";
import QualityPredictor from "@/components/QualityPredictor";
import HealthRisks from "@/components/HealthRisks";
import HistoricalData from "@/components/HistoricalData";
import { waterSources, historicalData, qualityPredictions } from "@/data/waterQualityData";

const Index = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Header />
        
        <div className="space-y-8">
          <WaterSourceSelector 
            sources={waterSources}
            selectedSource={selectedSource}
            onSelectSource={setSelectedSource}
          />
          
          <QualityMetrics metrics={selectedSource.metrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QualityPredictor prediction={qualityPredictions[selectedSource.id]} />
            <HealthRisks diseases={selectedSource.diseases} />
          </div>
          
          <HistoricalData 
            historicalData={historicalData}
            metrics={selectedSource.metrics}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
