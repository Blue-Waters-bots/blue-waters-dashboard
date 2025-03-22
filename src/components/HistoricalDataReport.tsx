
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/use-toast";
import { WaterSourceMetric, HistoricalMetricData } from "@/types/waterQuality";

interface HistoricalDataReportProps {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  sourceLocation: string;
  metrics: WaterSourceMetric[];
  historicalData: HistoricalMetricData[];
}

export const generateHistoricalDataReport = ({
  sourceId,
  sourceName,
  sourceType,
  sourceLocation,
  metrics,
  historicalData
}: HistoricalDataReportProps) => {
  // Create a new PDF document
  const doc = new jsPDF();
  const dateGenerated = new Date().toLocaleString();
  
  // Add header with logo and title
  doc.setFillColor(0, 102, 204); // Header background color
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
  
  // Add company name and details
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Historical Water Quality Report", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("Blue Group Solutions (Pty) Ltd", 105, 30, { align: "center" });
  
  // Add source information
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(sourceName, 14, 50);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${dateGenerated}`, 14, 60);
  doc.text(`Location: ${sourceLocation}`, 14, 66);
  doc.text(`Type: ${sourceType}`, 14, 72);
  
  // Add company contact information
  doc.text("Blue Group Solutions (Pty) Ltd", 14, 82);
  doc.text("Plot 1234, Main Mall, Gaborone, Botswana", 14, 88);
  doc.text("Phone: +267 76953391 | Email: admin@bluegroupbw.com", 14, 94);
  
  // Add metrics table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Current Water Quality Metrics", 14, 104);
  
  // Create table data for metrics
  const metricsBody = metrics.map(metric => [
    metric.name,
    `${metric.value} ${metric.unit}`,
    `${metric.safeRange[0]}-${metric.safeRange[1]} ${metric.unit}`,
    metric.status.toUpperCase()
  ]);
  
  autoTable(doc, {
    startY: 108,
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
        fillColor: (cell, data) => {
          const status = String(cell.raw).toUpperCase();
          if (status === 'SAFE') return [46, 204, 113];
          if (status === 'WARNING') return [241, 196, 15];
          return [231, 76, 60];
        },
        textColor: [255, 255, 255]
      }
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Add historical data section
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Historical Trends Data", 14, finalY);
  
  // Create historical data tables for each metric
  let lastY = finalY + 4;
  historicalData.forEach(history => {
    const metric = metrics.find(m => m.id === history.metricId);
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
      
      lastY = (doc as any).lastAutoTable.finalY + 10;
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
      'Blue Group Solutions (Pty) Ltd | Water Quality Monitoring System | Confidential Report',
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
  doc.save(`${sourceName.replace(/\s+/g, '_')}_historical_report.pdf`);
  
  toast({
    title: "Historical Report Downloaded",
    description: `PDF report for ${sourceName} has been generated successfully.`,
    duration: 3000,
  });
};

export default generateHistoricalDataReport;
