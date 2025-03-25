
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HistoricalData from "@/components/HistoricalData";
import { waterSources, historicalData } from "@/data/waterQualityData";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";
import { 
  getStatusColorForCell, 
  addPdfFooter, 
  createMetricsTableData, 
  castDocToPDFWithAutoTable 
} from "@/utils/pdfUtils";

const HistoricalTrends = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

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
    doc.text("Water Quality Report", 105, 20, { align: "center" });
    
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
    
    // Add current metrics table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Current Water Quality Metrics", 14, 84);
    
    // Create table data for current metrics
    const metricsBody = createMetricsTableData(selectedSource.metrics);
    
    autoTable(doc, {
      startY: 88,
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
          fillColor: getStatusColorForCell,
          textColor: [255, 255, 255] // White text for good contrast
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Cast doc to jsPDFWithAutoTable to access lastAutoTable
    const docWithAutoTable = castDocToPDFWithAutoTable(doc);
    
    // Add historical data section
    const currentY = docWithAutoTable.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Historical Trends Data", 14, currentY);
    
    // Create historical data tables for each metric
    let lastY = currentY + 4;
    historicalData.forEach(history => {
      const metric = selectedSource.metrics.find(m => m.id === history.metricId);
      if (metric) {
        lastY += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${history.metricName} (${metric.unit})`, 14, lastY);
        
        const historyBody = history.data.map(point => {
          const date = new Date(point.date);
          const formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
          return [formattedDate, `${point.value} ${metric.unit}`];
        });
        
        autoTable(doc, {
          startY: lastY + 4,
          head: [['Date', 'Value']],
          body: historyBody,
          headStyles: { 
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: 'bold' 
          },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
        
        // Update lastY using the casted document
        lastY = castDocToPDFWithAutoTable(doc).lastAutoTable.finalY + 10;
      }
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

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">Historical Trends</h1>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 bg-water-blue hover:bg-water-blue/90 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
              >
                <FileText size={16} />
                <span>Download Report</span>
              </button>
            </div>
            
            <p className="text-muted-foreground max-w-3xl">
              Analyze historical water quality data to identify trends, patterns, and seasonal variations.
              Download detailed reports for compliance and record-keeping.
            </p>
              
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
