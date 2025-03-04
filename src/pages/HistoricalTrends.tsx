
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HistoricalData from "@/components/HistoricalData";
import { waterSources, historicalData } from "@/data/waterQualityData";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import { FileText } from "lucide-react";

const HistoricalTrends = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

  const handleDownloadReport = () => {
    // Create report content
    const reportTitle = `Water Quality Report: ${selectedSource.name}`;
    const dateGenerated = new Date().toLocaleString();
    
    let reportContent = `${reportTitle}\n`;
    reportContent += `Generated: ${dateGenerated}\n\n`;
    reportContent += `Location: ${selectedSource.location}\n`;
    reportContent += `Type: ${selectedSource.type}\n\n`;
    
    reportContent += "CURRENT METRICS:\n";
    selectedSource.metrics.forEach(metric => {
      reportContent += `${metric.name}: ${metric.value} ${metric.unit} (Safe Range: ${metric.safeRange[0]}-${metric.safeRange[1]} ${metric.unit})\n`;
      reportContent += `Status: ${metric.status.toUpperCase()}\n\n`;
    });
    
    reportContent += "HISTORICAL DATA:\n";
    historicalData.forEach(history => {
      const metric = selectedSource.metrics.find(m => m.id === history.metricId);
      if (metric) {
        reportContent += `\n${history.metricName}:\n`;
        history.data.forEach(point => {
          reportContent += `${point.date}: ${point.value} ${metric.unit}\n`;
        });
      }
    });
    
    // Create a blob and download
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSource.name.replace(/\s+/g, '_')}_water_quality_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">Historical Trends</h1>
                <p className="text-muted-foreground max-w-3xl">
                  Analyze historical water quality data to identify trends, patterns, and seasonal variations.
                  Download detailed reports for compliance and record-keeping.
                </p>
              </div>
              
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 bg-water-blue hover:bg-water-blue/90 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
              >
                <FileText size={16} />
                <span>Download Report</span>
              </button>
            </div>
            
            <WaterSourceSelector 
              sources={waterSources}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
            />
            
            <HistoricalData 
              historicalData={historicalData}
              metrics={selectedSource.metrics}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrends;
