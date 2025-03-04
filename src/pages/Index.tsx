
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import QualityMetrics from "@/components/QualityMetrics";
import { waterSources } from "@/data/waterQualityData";
import { FileText } from "lucide-react";

const Index = () => {
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
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">Dashboard</h1>
                <p className="text-muted-foreground max-w-3xl">
                  Monitor your water quality metrics in real-time. View current conditions 
                  and take action to ensure water safety.
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
            
            <QualityMetrics metrics={selectedSource.metrics} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
