
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
    <div className="min-h-screen w-full max-w-6xl mx-auto px-4 pb-16">
      <Header />
      
      <WaterSourceSelector 
        sources={waterSources}
        selectedSource={selectedSource}
        onSelectSource={setSelectedSource}
      />
      
      <QualityMetrics metrics={selectedSource.metrics} />
      
      <QualityPredictor prediction={qualityPredictions[selectedSource.id]} />
      
      <HealthRisks diseases={selectedSource.diseases} />
      
      <HistoricalData 
        historicalData={historicalData}
        metrics={selectedSource.metrics}
      />
    </div>
  );
};

export default Index;
