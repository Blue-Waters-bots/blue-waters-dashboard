
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// Define the Color type for PDF styling
export type Color = [number, number, number];

export interface CellInfo {
  section: { [key: string]: any };
  row: { [key: string]: any };
  column: { [key: string]: any };
  cell: { [key: string]: any };
}

export type CellStyleFunction = (cell: any) => Color;

// Function to determine cell background color based on status
export const getStatusColorForCell = (cellInfo: CellInfo): Color => {
  const status = cellInfo.cell.raw;
  
  if (status === 'Safe' || status === 'safe') {
    return [46, 204, 113]; // Green
  } else if (status === 'Warning' || status === 'warning') {
    return [241, 196, 15]; // Yellow
  } else if (status === 'Critical' || status === 'Danger' || status === 'danger') {
    return [231, 76, 60]; // Red
  } else {
    return [255, 255, 255]; // White/Default
  }
};

// Create table data for metrics
export const createMetricsTableData = (metrics: any[]) => {
  return metrics.map(metric => [
    metric.name,
    metric.value + ' ' + metric.unit,
    metric.safeRange ? 
      (Array.isArray(metric.safeRange) ? 
        `${metric.safeRange[0]} - ${metric.safeRange[1]} ${metric.unit}` : 
        metric.safeRange) : 
      'N/A',
    metric.status.charAt(0).toUpperCase() + metric.status.slice(1) // Capitalize status
  ]);
};

// Helper function to add footer to PDF
export const addPdfFooter = (doc: any, text: string) => {
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageSize = doc.internal.pageSize;
    const pageWidth = pageSize.getWidth();
    doc.text(text, pageWidth / 2, pageSize.getHeight() - 10, { align: 'center' });
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageSize.getHeight() - 10);
  }
};

// Helper function for proper type casting with autoTable
export const castDocToPDFWithAutoTable = (doc: jsPDF) => {
  return doc as unknown as {
    autoTable: typeof autoTable
  } & jsPDF;
};
