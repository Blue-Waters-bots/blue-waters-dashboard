
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import HistoricalData from "@/components/HistoricalData";
import { waterSources, historicalData } from "@/data/waterQualityData";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";

// Define types for jsPDF
interface PubSub {
  [key: string]: any;
}

// Update the jsPDF interface definition to include needed properties
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

const HistoricalTrends = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();
    
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Water Quality Report", 105, 20, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(selectedSource.name, 14, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 60);
    doc.text(`Location: ${selectedSource.location}`, 14, 66);
    doc.text(`Type: ${selectedSource.type}`, 14, 72);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Blue Group Solutions (Pty) Ltd", 14, 82);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Gaborone, Botswana", 14, 88);
    doc.text("Phone: +267 76953391 | Email: admin@bluegroupbw.com", 14, 94);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Current Water Quality Metrics", 14, 106);
    
    const metricsBody = selectedSource.metrics.map(metric => [
      metric.name,
      `${metric.value} ${metric.unit}`,
      `${metric.safeRange[0]}-${metric.safeRange[1]} ${metric.unit}`,
      metric.status.toUpperCase()
    ]);
    
    autoTable(doc, {
      startY: 110,
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
          textColor: [255, 255, 255] // Ensure text is white for visibility
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    const currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Historical Trends Data", 14, currentY);
    
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
        
        lastY = doc.lastAutoTable.finalY + 10;
      }
    });
    
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
