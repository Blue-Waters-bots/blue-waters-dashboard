
import jsPDF from "jspdf";
import autoTable, { Color } from "jspdf-autotable";
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
    // Add other internal properties to match jsPDF's internal interface
    events: any;
    scaleFactor: number;
    pages: any[];
    getEncryptor: (objectId: number) => (data: string) => string;
  };
}

// Type-safe function to get color for statuses (returns a fixed Color type)
export const getStatusColor = (status: string): Color => {
  if (status === 'SAFE') return [46, 204, 113]; // Brighter green
  if (status === 'WARNING') return [241, 196, 15]; // Brighter yellow
  return [231, 76, 60]; // Brighter red
};

// Type-safe function to get color for score (returns a fixed Color type)
export const getScoreColor = (score: number): Color => {
  if (score >= 80) return [16, 185, 129]; // safe/good
  if (score >= 60) return [59, 130, 246]; // blue/moderate
  if (score >= 40) return [245, 158, 11]; // warning
  return [239, 68, 68]; // danger
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
export const getContrastTextColor = (bgColor: Color): Color => {
  // Use white text on dark backgrounds, black text on light backgrounds
  const [r, g, b] = bgColor;
  // Calculate relative luminance using the formula for perceived brightness
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? [0, 0, 0] : [255, 255, 255];
};
