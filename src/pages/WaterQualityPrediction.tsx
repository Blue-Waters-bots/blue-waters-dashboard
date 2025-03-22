
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import QualityPredictor from "@/components/QualityPredictor";
import { qualityPredictions, waterSources } from "@/data/waterQualityData";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import { AlertTriangle, FileText, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const WaterQualityPrediction = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: `Forecast report for ${selectedSource.name} has been generated.`,
      duration: 3000,
    });
    
    // This would be where you'd actually generate a PDF in a real application
    setTimeout(() => {
      const reportTitle = `Water Quality Forecast: ${selectedSource.name}`;
      const dateGenerated = new Date().toLocaleString();
      
      let reportContent = `${reportTitle}\n`;
      reportContent += `Generated: ${dateGenerated}\n\n`;
      reportContent += `Location: ${selectedSource.location}\n`;
      reportContent += `Type: ${selectedSource.type}\n\n`;
      reportContent += `Current Quality Score: ${qualityPredictions[selectedSource.id].score}\n`;
      reportContent += `Status: ${qualityPredictions[selectedSource.id].status}\n\n`;
      reportContent += `7-DAY FORECAST:\n`;
      reportContent += `Day 1: ${qualityPredictions[selectedSource.id].score}\n`;
      // In a real app you would include all the forecast data
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSource.name.replace(/\s+/g, '_')}_forecast_report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[150%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="glass-panel rounded-xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-800 mb-2">Water Quality Prediction</h1>
                  <p className="text-muted-foreground max-w-3xl">
                    Advanced AI-powered prediction of water quality parameters, helping you anticipate changes 
                    and take proactive measures to maintain safe water conditions.
                  </p>
                </div>
                
                <button
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2 bg-water-blue hover:bg-water-blue/90 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
                >
                  <FileText size={16} />
                  <span>Generate Forecast Report</span>
                </button>
              </div>
              
              {/* Info Alert */}
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Forecast Information</p>
                    <p className="text-sm text-blue-600">
                      Predictions are based on historical data, current conditions, and environmental factors.
                      Accuracy may vary based on unexpected environmental changes.
                    </p>
                  </div>
                </div>
              </div>
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
