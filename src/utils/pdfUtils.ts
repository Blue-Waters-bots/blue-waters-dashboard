
import jsPDF from "jspdf";
import autoTable, { RowInput, CellInput } from "jspdf-autotable";
import { WaterQualityMetric } from "@/types/waterQuality";

// Define a proper interface extension for jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
  internal: {
    pageSize: {
      width: number;
      height: number;
      getWidth: () => number;
      getHeight: () => number;
    };
    getNumberOfPages: () => number;
    events: any;
    scaleFactor: number;
    pages: any[];
    getEncryptor: (objectId: number) => (data: string) => string;
  };
}

// Using RGB tuple type for colors
export type RGBColor = [number, number, number];

// Define styled cells type for jspdf-autotable
export type CellStyleFunction = (cell: any, row?: any) => RGBColor;

// Fixed color getter functions that return RGBColor
export const getStatusColor = (status: string): RGBColor => {
  if (status === 'SAFE') return [46, 204, 113]; // Brighter green
  if (status === 'WARNING') return [241, 196, 15]; // Brighter yellow
  return [231, 76, 60]; // Brighter red
};

// Fixed score color function
export const getScoreColor = (score: number): RGBColor => {
  if (score >= 80) return [16, 185, 129]; // safe/good
  if (score >= 60) return [59, 130, 246]; // blue/moderate
  if (score >= 40) return [245, 158, 11]; // warning
  return [239, 68, 68]; // danger
};

// Helper function to convert RGB tuple to color array for jspdf-autotable
export const convertToTableColor = (color: RGBColor): number[] => {
  return color;
};

// Updated helper function to get status color for cells
export const getStatusColorForCell = (data: any): number[] => {
  // Handle both cell objects and direct values
  const status = typeof data === 'object' && data?.raw 
    ? data.raw.toString().toUpperCase() 
    : typeof data === 'string'
      ? data.toUpperCase()
      : '';
  
  return convertToTableColor(getStatusColor(status));
};

// Updated helper function to get score color for cells
export const getScoreColorForCell = (data: any, row: any): number[] => {
  // Handle score from cell or row
  let score = 0;
  
  if (row && typeof row === 'object') {
    // Try to get score from row.cells[1]
    if (row.cells && Array.isArray(row.cells) && row.cells[1]) {
      const rawValue = row.cells[1].raw;
      score = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue?.toString() || '0');
    }
  }
  
  // If we couldn't get from row, try from cell directly
  if (score === 0 && typeof data === 'object' && data?.raw !== undefined) {
    score = typeof data.raw === 'number' ? data.raw : parseFloat(data.raw?.toString() || '0');
  }
  
  return convertToTableColor(getScoreColor(score));
};

// Helper function for creating PDF footer
export const addPdfFooter = (doc: jsPDFWithAutoTable, footerText: string) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black text for maximum visibility
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.getHeight();
    doc.text(
      footerText,
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
};

// Create metrics table data
export const createMetricsTableData = (metrics: WaterQualityMetric[]) => {
  return metrics.map(metric => [
    metric.name,
    `${metric.value} ${metric.unit}`,
    `${metric.safeRange[0]}-${metric.safeRange[1]} ${metric.unit}`,
    metric.status.toUpperCase()
  ]);
};

// Helper function to cast a jsPDF instance to jsPDFWithAutoTable
export const castDocToPDFWithAutoTable = (doc: jsPDF): jsPDFWithAutoTable => {
  return doc as unknown as jsPDFWithAutoTable;
};

// Get text color for overlaying on background color - ensures text visibility
export const getContrastTextColor = (bgColor: RGBColor): RGBColor => {
  // Use white text on dark backgrounds, black text on light backgrounds
  const [r, g, b] = bgColor;
  // Calculate relative luminance using the formula for perceived brightness
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? [0, 0, 0] : [255, 255, 255];
};
