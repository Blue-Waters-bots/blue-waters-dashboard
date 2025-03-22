import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import QualityMetrics from "@/components/QualityMetrics";
import HealthRisks from "@/components/HealthRisks";
import MapView from "@/components/MapView";
import { waterSources } from "@/data/waterQualityData";
import { FileText, Droplet, MapPin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PubSub {
  [key: string]: any;
}

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      events: PubSub;
      scaleFactor: number;
      pageSize: { 
        width: number; 
        getWidth: () => number; 
        height: number; 
        getHeight: () => number; 
      };
      pages: number[];
      getEncryptor(objectId: number): (data: string) => string;
      getNumberOfPages(): number;
    };
  }
}

const Index = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();
    
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Water Quality Summary Report", 105, 20, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(selectedSource.name, 14, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 60);
    doc.text(`Location: ${selectedSource.location}`, 14, 66);
    doc.text(`Type: ${selectedSource.type}`, 14, 72);
    
    const metrics = selectedSource.metrics || [];
    const dangerCount = metrics.filter(m => m.status === "danger").length;
    const warningCount = metrics.filter(m => m.status === "warning").length;
    let overallStatus = "Good";
    if (dangerCount > 0) overallStatus = "Critical";
    else if (warningCount > 0) overallStatus = "Warning";
    
    doc.setFontSize(12);
    doc.text(`Overall Quality Status: `, 14, 104);
    
    if (overallStatus === "Good") {
      doc.setTextColor(46, 204, 113);
    } else if (overallStatus === "Warning") {
      doc.setTextColor(241, 196, 15);
    } else {
      doc.setTextColor(231, 76, 60);
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(overallStatus, 64, 104);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    const metricsBody = selectedSource.metrics.map(metric => [
      metric.name,
      `${metric.value} ${metric.unit}`,
      `${metric.safeRange[0]}-${metric.safeRange[1]} ${metric.unit}`,
      metric.status.toUpperCase()
    ]);
    
    autoTable(doc, {
      startY: 120,
      head: [['Metric', 'Current Value', 'Safe Range', 'Status']],
      body: metricsBody,
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        3: { 
          fontStyle: 'bold',
          fillColor: (cell) => {
            const status = cell.raw.toString();
            if (status === 'SAFE') return [46, 204, 113] as [number, number, number];
            if (status === 'WARNING') return [241, 196, 15] as [number, number, number];
            return [231, 76, 60] as [number, number, number];
          },
          textColor: [255, 255, 255]
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    if (selectedSource.diseases && selectedSource.diseases.length > 0) {
      const currentY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Potential Health Risks", 14, currentY);
      
      const diseasesBody = selectedSource.diseases.map(disease => [
        disease.name,
        disease.description,
        disease.riskLevel.toUpperCase()
      ]);
      
      autoTable(doc, {
        startY: currentY + 4,
        head: [['Health Risk', 'Description', 'Risk Level']],
        body: diseasesBody,
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold' 
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
          2: { 
            fontStyle: 'bold',
            fillColor: (cell) => {
              const risk = cell.raw.toString().toLowerCase();
              if (risk === 'low') return [46, 204, 113] as [number, number, number];
              if (risk === 'medium') return [241, 196, 15] as [number, number, number];
              return [231, 76, 60] as [number, number, number];
            },
            textColor: [255, 255, 255]
          }
        },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
    }
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      doc.text(
        'Blue Group Solutions (Pty) Ltd | Water Quality Monitoring System',
        pageSize.getWidth() / 2,
        pageHeight - 15,
        { align: 'center' }
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageSize.getWidth() - 20,
        pageHeight - 10
      );
      doc.text(
        'admin@bluegroupbw.com | +267 76953391',
        pageSize.getWidth() / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`${selectedSource.name.replace(/\s+/g, '_')}_water_quality_report.pdf`);
    
    toast({
      title: "Report Downloaded",
      description: `PDF report for ${selectedSource.name} has been generated successfully.`,
      duration: 3000,
    });
  };

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
                      <MapPin className="text-water-blue" />
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WaterSourceSelector 
                sources={waterSources}
                selectedSource={selectedSource}
                onSelectSource={setSelectedSource}
              />
              
              <div className="glass-panel p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-medium mb-4">Location Map</h2>
                <MapView source={selectedSource} />
              </div>
            </div>
            
            <QualityMetrics metrics={selectedSource.metrics} />
            
            <HealthRisks diseases={selectedSource.diseases} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
