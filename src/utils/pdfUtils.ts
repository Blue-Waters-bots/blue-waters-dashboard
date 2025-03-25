
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { WaterQualityMetric } from "@/types/waterQuality";

export type Color = [number, number, number];
export type CellStyleFunction = (cell: any, row?: any) => Color;

// Helper function to cast a jsPDF instance to be compatible with autoTable
export function castDocToPDFWithAutoTable(doc: jsPDF): any {
  return doc as unknown as any;
}

// Add a footer to PDF
export function addPdfFooter(doc: any, text: string) {
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.text(text, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10);
  }
}

// Convert status to color
export function getStatusColor(status: string): Color {
  switch (status.toLowerCase()) {
    case "safe":
      return [46, 204, 113]; // Green
    case "warning":
      return [241, 196, 15]; // Yellow
    case "danger":
      return [231, 76, 60]; // Red
    default:
      return [100, 100, 100]; // Gray
  }
}

// Get color for table cell based on status
export const getStatusColorForCell: CellStyleFunction = (cell) => {
  const status = cell?.raw?.toLowerCase?.() || "";
  
  if (status.includes("safe") || status.includes("good")) {
    return [46, 204, 113]; // Green
  } else if (status.includes("warning") || status.includes("moderate")) {
    return [241, 196, 15]; // Yellow
  } else if (status.includes("danger") || status.includes("critical")) {
    return [231, 76, 60]; // Red
  }
  
  return [100, 100, 100]; // Gray
};

// Create table data for metrics
export function createMetricsTableData(metrics: WaterQualityMetric[]) {
  return metrics.map(metric => [
    metric.name,
    metric.value + (metric.unit ? ` ${metric.unit}` : ""),
    `${metric.safeRange.min}${metric.unit ? ` ${metric.unit}` : ""} - ${metric.safeRange.max}${metric.unit ? ` ${metric.unit}` : ""}`,
    metric.status.charAt(0).toUpperCase() + metric.status.slice(1)
  ]);
}
