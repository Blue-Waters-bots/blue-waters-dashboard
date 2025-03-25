
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { WaterQualityMetric } from "@/types/waterQuality";

// Define a more specific type that works with jspdf-autotable
export type CellStyleFunction = (cell: any, data?: any) => [number, number, number];
export type Color = [number, number, number] | string | null;

// Convert RGB array to proper CSS RGB format for various uses
export const convertToTableColor = (rgbArray: [number, number, number]): string => {
  return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
};

// Cast jsPDF to include autoTable properties for proper typescript support
export const castDocToPDFWithAutoTable = (doc: jsPDF) => {
  return doc as unknown as jsPDF & {
    autoTable: typeof autoTable;
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      getNumberOfPages: () => number;
      pageSize: {
        getWidth: () => number;
        getHeight: () => number;
      }
    }
  };
};

// Get score color based on quality score
export const getScoreColor = (score: number): Color => {
  if (score >= 80) return [46, 204, 113]; // Green
  if (score >= 60) return [52, 152, 219]; // Blue
  if (score >= 40) return [241, 196, 15]; // Yellow
  return [231, 76, 60]; // Red
};

// Get score color for table cell
export const getScoreColorForCell = (cell: any, row?: any): Color => {
  if (!cell || !cell.raw) {
    return [220, 220, 220]; // Default gray
  }
  
  const score = parseFloat(cell.raw.toString());
  return getScoreColor(score);
};

// Get status color for table cell
export const getStatusColorForCell = (cell: any): Color => {
  if (!cell || !cell.raw) return [220, 220, 220]; // Default gray

  const status = cell.raw;
  if (status === "Safe" || status === "safe" || status === "Good" || status === "good") {
    return [46, 204, 113]; // Green
  } else if (status === "Warning" || status === "warning") {
    return [241, 196, 15]; // Yellow
  } else if (status === "Danger" || status === "danger" || status === "Critical" || status === "critical") {
    return [231, 76, 60]; // Red
  } else if (status === "Info" || status === "info") {
    return [52, 152, 219]; // Blue
  }
  
  return [220, 220, 220]; // Default gray for unknown statuses
};

// Add a footer to the PDF document
export const addPdfFooter = (doc: jsPDF & { autoTable: typeof autoTable, lastAutoTable: { finalY: number } }, text: string) => {
  const docWithPages = castDocToPDFWithAutoTable(doc);
  const pageCount = docWithPages.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageSize = doc.internal.pageSize;
    const pageWidth = pageSize.getWidth();
    
    // Add footer with page number
    doc.text(
      `${text} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
};

// Create table data for metrics
export const createMetricsTableData = (metrics: WaterQualityMetric[]) => {
  return metrics.map(metric => {
    const safeRangeText = `${metric.safeRange[0]} - ${metric.safeRange[1]} ${metric.unit}`;
    
    // Capitalize first letter of status
    const status = metric.status.charAt(0).toUpperCase() + metric.status.slice(1);
    
    return [
      metric.name,
      `${metric.value} ${metric.unit}`,
      safeRangeText,
      status
    ];
  });
};
