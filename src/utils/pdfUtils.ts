
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { WaterQualityMetric } from "@/types/waterQuality";

// Extend the jsPDF type to include the properties from autoTable
declare module "jspdf" {
  interface jsPDF {
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
    };
  }
}

// Type-safe function to get color for statuses
export const getStatusColor = (status: string): [number, number, number] => {
  if (status === 'SAFE') return [46, 204, 113];
  if (status === 'WARNING') return [241, 196, 15];
  return [231, 76, 60];
};

// Type-safe function to get color for score
export const getScoreColor = (score: number): [number, number, number] => {
  if (score >= 80) return [16, 185, 129]; // safe/good
  if (score >= 60) return [59, 130, 246]; // blue/moderate
  if (score >= 40) return [245, 158, 11]; // warning
  return [239, 68, 68]; // danger
};

// Helper function for creating PDF footer
export const addPdfFooter = (doc: jsPDF, footerText: string) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
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
