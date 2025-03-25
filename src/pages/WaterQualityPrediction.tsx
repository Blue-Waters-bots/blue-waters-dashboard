import React from 'react';
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "@/components/ui/use-toast";
import { 
  getStatusColorForCell, 
  addPdfFooter, 
  castDocToPDFWithAutoTable,
  Color
} from "@/utils/pdfUtils";

const WaterQualityPrediction = () => {
  const generateComparisonData = () => {
    // Dummy data for comparison
    return Array.from({ length: 5 }, (_, i) => {
      const currentValue = Math.floor(Math.random() * 40) + 60; // Random between 60-100
      const predictedValue = currentValue + (Math.floor(Math.random() * 10) - 5); // +/- 5
      const change = predictedValue - currentValue;
      const status = change > 0 ? 'warning' : 'safe'; // Example status logic

      return {
        parameter: `Parameter ${i + 1}`,
        currentValue: currentValue.toFixed(2),
        predictedValue: predictedValue.toFixed(2),
        change: change.toFixed(2),
        status: status,
      };
    });
  };

  const generateComparisonPDF = () => {
    const comparisonData = generateComparisonData();
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();

    // Add header with logo and title
    doc.setFillColor(0, 102, 204); // Header background color
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Water Quality Prediction Report", 105, 20, { align: "center" });
    
    // Add report information
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Water Quality Prediction", 14, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 60);
    
    // Add current metrics table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Predicted vs Current Metrics", 14, 90);

    const comparisonTableData = comparisonData.map(item => [
      item.parameter,
      item.currentValue,
      item.predictedValue,
      item.change,
      item.status.charAt(0).toUpperCase() + item.status.slice(1)
    ]);
    
    // Use the properly typed function
    const pdfDoc = castDocToPDFWithAutoTable(doc);

    autoTable(pdfDoc, {
      startY: 94,
      head: [['Parameter', 'Current Value', 'Predicted Value', 'Change', 'Status']],
      body: comparisonTableData,
      headStyles: { 
        fillColor: [41, 128, 185] as Color,
        textColor: [255, 255, 255] as Color,
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        4: { 
          fontStyle: 'bold',
          fillColor: getStatusColorForCell as unknown as Color,
          textColor: [255, 255, 255] as Color
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] as Color }
    });

    addPdfFooter(pdfDoc, 'Water Quality Monitoring System | Prediction Report');

    doc.save('water_quality_prediction_report.pdf');
    toast({
      title: "Report Downloaded",
      description: "Water Quality Prediction report has been generated successfully.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <PageHeader
            title="Water Quality Prediction"
            description="Here you can view the predicted water quality metrics based on historical data."
            actions={
              <Button
                onClick={generateComparisonPDF}
                className="flex items-center gap-2 bg-water-blue hover:bg-water-blue/90 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
              >
                <FileText size={16} />
                <span>Download Prediction Report</span>
              </Button>
            }
          />

          <div className="glass-panel rounded-xl p-6 shadow-card mt-8">
            <h2 className="text-xl font-medium mb-4">Water Quality Prediction Overview</h2>
            <p className="text-muted-foreground mb-4">
              This panel shows predictions about water quality metrics over time. The system uses 
              historical data to forecast future water quality trends.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
              <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">How predictions work</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Our AI-powered system analyzes historical trends, environmental factors, 
                and treatment protocols to predict water quality metrics for the coming days.
                Download the prediction report for detailed analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityPrediction;
