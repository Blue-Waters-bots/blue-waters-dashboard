
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";
import { waterSources } from "@/data/waterQualityData";

const Header = () => {
  const handleDownloadReport = () => {
    // Create a new PDF document
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();
    const selectedSource = waterSources[0]; // Default to first source
    
    // Add header with title
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    // Add company name and title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Water Quality Dashboard Report", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Blue Group Solutions (Pty) Ltd", 105, 30, { align: "center" });
    
    // Add report information
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Water Quality Overview", 14, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Report Generated: ${dateGenerated}`, 14, 60);
    
    // Add company details
    doc.text("Blue Group Solutions (Pty) Ltd", 14, 70);
    doc.text("Plot 1234, Main Mall, Gaborone, Botswana", 14, 76);
    doc.text("Phone: +267 76953391 | Email: admin@bluegroupbw.com", 14, 82);
    
    // Create metrics section for all water sources
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Current Water Quality Status", 14, 96);
    
    let yPos = 100;
    
    // Create a summary table for all sources
    const allSourcesData = waterSources.map(source => {
      // Calculate average status
      const statusCounts = {safe: 0, warning: 0, danger: 0};
      source.metrics.forEach(metric => {
        statusCounts[metric.status]++;
      });
      
      const totalMetrics = source.metrics.length;
      const safePercentage = Math.round((statusCounts.safe / totalMetrics) * 100);
      const warningPercentage = Math.round((statusCounts.warning / totalMetrics) * 100);
      const dangerPercentage = Math.round((statusCounts.danger / totalMetrics) * 100);
      
      let overallStatus = "SAFE";
      if (statusCounts.danger > 0) overallStatus = "DANGER";
      else if (statusCounts.warning > 0) overallStatus = "WARNING";
      
      return [
        source.name,
        source.location,
        `${safePercentage}% Safe, ${warningPercentage}% Warning, ${dangerPercentage}% Danger`,
        overallStatus
      ];
    });
    
    autoTable(doc, {
      startY: yPos,
      head: [['Water Source', 'Location', 'Metrics Summary', 'Overall Status']],
      body: allSourcesData,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        3: {
          fontStyle: 'bold',
          fillColor: (cell, data) => {
            const status = String(cell.raw);
            if (status === 'SAFE') return [46, 204, 113];
            if (status === 'WARNING') return [241, 196, 15];
            return [231, 76, 60];
          },
          textColor: [255, 255, 255]
        }
      }
    });
    
    // Add footer
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      doc.text(
        'Blue Group Solutions (Pty) Ltd | Water Quality Monitoring System | Confidential',
        pageSize.getWidth() / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageSize.getWidth() - 20,
        pageHeight - 10
      );
    }
    
    // Save the PDF
    doc.save("water_quality_dashboard_report.pdf");
    
    toast({
      title: "Dashboard Report Downloaded",
      description: "PDF report has been generated successfully.",
      duration: 3000,
    });
  };
  
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between py-4">
        <div>
          <h2 className="text-2xl font-medium text-gray-800">Water Quality Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring and analysis of water quality metrics with health risk assessment
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
    </div>
  );
};

export default Header;
