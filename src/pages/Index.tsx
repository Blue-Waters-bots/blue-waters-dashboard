
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import QualityMetrics from "@/components/QualityMetrics";
import MapView from "@/components/MapView";
import AlertBanner from "@/components/AlertBanner";
import { waterSources } from "@/data/waterQualityData";
import { FileText, Droplet, MapPin, BarChart4 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAlerts } from "@/contexts/AlertContext";
import { 
  getStatusColorForCell, 
  addPdfFooter, 
  createMetricsTableData,
  castDocToPDFWithAutoTable,
  CellStyleFunction
} from "@/utils/pdfUtils";

const Index = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);
  const { checkSourceForAlerts } = useAlerts();

  // Check for alerts whenever the selected source changes
  useEffect(() => {
    checkSourceForAlerts(selectedSource);
  }, [selectedSource, checkSourceForAlerts]);

  const handleDownloadReport = () => {
    // Create a new PDF document
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();
    
    // Add header with logo and title
    doc.setFillColor(0, 102, 204); // Header background color
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Water Quality Summary Report", 105, 20, { align: "center" });
    
    // Add source information
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(selectedSource.name, 14, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 60);
    doc.text(`Location: ${selectedSource.location}`, 14, 66);
    doc.text(`Type: ${selectedSource.type}`, 14, 72);
    
    // Get overall status
    const metrics = selectedSource.metrics || [];
    const dangerCount = metrics.filter(m => m.status === "danger").length;
    const warningCount = metrics.filter(m => m.status === "warning").length;
    let overallStatus = "Good";
    if (dangerCount > 0) overallStatus = "Critical";
    else if (warningCount > 0) overallStatus = "Warning";
    
    // Add status summary
    doc.setFontSize(12);
    doc.text(`Overall Quality Status: `, 14, 78);
    
    // Set status color
    if (overallStatus === "Good") {
      doc.setTextColor(46, 204, 113); // Green
    } else if (overallStatus === "Warning") {
      doc.setTextColor(241, 196, 15); // Yellow
    } else {
      doc.setTextColor(231, 76, 60); // Red
    }
    
    doc.setFont("helvetica", "bold");
    doc.text(overallStatus, 64, 78);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    // Add current metrics table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Current Water Quality Metrics", 14, 90);
    
    // Create table data for current metrics
    const metricsBody = createMetricsTableData(selectedSource.metrics);
    
    // Define the fillColor function with the correct type
    const fillColorFn: CellStyleFunction = (cell) => getStatusColorForCell(cell);
    
    autoTable(doc, {
      startY: 94,
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
          fillColor: fillColorFn,
          textColor: [255, 255, 255] // White text for visibility
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add footer
    addPdfFooter(castDocToPDFWithAutoTable(doc), 'Water Quality Monitoring System | Confidential Report');
    
    // Save the PDF
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
          <div className="space-y-6">
            <div className="glass-panel rounded-xl p-6 shadow-card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-semibold text-gradient-blue mb-2">Water Quality Dashboard</h1>
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
                <div className="bg-white/80 rounded-lg p-4 shadow-soft border border-gray-100 card-hover">
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
                
                <div className="bg-white/80 rounded-lg p-4 shadow-soft border border-gray-100 card-hover">
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
                
                <div className="bg-white/80 rounded-lg p-4 shadow-soft border border-gray-100 card-hover">
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
                
                <div className="bg-white/80 rounded-lg p-4 shadow-soft border border-gray-100 card-hover">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full text-water-blue bg-water-blue/10">
                      <BarChart4 className="text-water-blue" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Metrics Tracked</p>
                      <p className="text-lg font-semibold">{selectedSource.metrics.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Alert Banner */}
            <AlertBanner />
            
            {/* Water Sources */}
            <WaterSourceSelector 
              sources={waterSources}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
            />
            
            {/* Map View */}
            <div className="glass-panel p-6 rounded-xl shadow-card">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-water-blue" />
                <span>Location Map</span>
              </h2>
              <MapView source={selectedSource} />
            </div>
            
            <QualityMetrics metrics={selectedSource.metrics} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
