
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import QualityMetrics from "@/components/QualityMetrics";
import HealthRisks from "@/components/HealthRisks";
import { waterSources } from "@/data/waterQualityData";
import { FileText, Droplet } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
    
    toast({
      title: "Report Downloaded",
      description: `Report for ${selectedSource.name} has been downloaded successfully.`,
      duration: 3000,
    });
  };

  // Calculate overall water quality status
  const getOverallStatus = () => {
    const metrics = selectedSource.metrics || [];
    const dangerCount = metrics.filter(m => m.status === "danger").length;
    const warningCount = metrics.filter(m => m.status === "warning").length;
    const safeCount = metrics.filter(m => m.status === "safe").length;
    
    if (dangerCount > 0) return { status: "Critical", color: "text-water-danger" };
    if (warningCount > 0) return { status: "Warning", color: "text-water-warning" };
    return { status: "Good", color: "text-water-safe" };
  };

  const { status, color } = getOverallStatus();

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header Section with Stats */}
            <div className="glass-panel rounded-xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-800 mb-2">Water Quality Dashboard</h1>
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
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
                      <Droplet className={color} />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Overall Quality</p>
                      <p className={`text-lg font-semibold ${color}`}>{status}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full text-water-blue bg-water-blue/10">
                      <Droplet className="text-water-blue" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Source Type</p>
                      <p className="text-lg font-semibold">{selectedSource.type}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full text-water-blue bg-water-blue/10">
                      <Droplet className="text-water-blue" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Location</p>
                      <p className="text-lg font-semibold">{selectedSource.location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full text-water-blue bg-water-blue/10">
                      <Droplet className="text-water-blue" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Metrics Tracked</p>
                      <p className="text-lg font-semibold">{selectedSource.metrics.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <WaterSourceSelector 
              sources={waterSources}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
            />
            
            <QualityMetrics metrics={selectedSource.metrics} />
            
            <HealthRisks diseases={selectedSource.diseases} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
