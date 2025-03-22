import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import QualityPredictor from "@/components/QualityPredictor";
import { qualityPredictions, waterSources } from "@/data/waterQualityData";
import WaterSourceSelector from "@/components/WaterSourceSelector";
import { AlertTriangle, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getStatusColor, getScoreColor, addPdfFooter, createMetricsTableData } from "@/utils/pdfUtils";

const WaterQualityPrediction = () => {
  const [selectedSource, setSelectedSource] = useState(waterSources[0]);

  const handleGenerateReport = () => {
    toast({
      title: "Generating Report",
      description: `Creating forecast report for ${selectedSource.name}...`,
      duration: 3000,
    });
    
    generatePdfReport();
  };

  const generatePdfReport = () => {
    // Create a new PDF document
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();
    const prediction = qualityPredictions[selectedSource.id];
    
    if (!prediction) {
      toast({
        title: "Error",
        description: "Could not generate report: prediction data not found",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // Add header with title
    doc.setFillColor(0, 102, 204); // Header background color
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Water Quality Forecast Report", 105, 20, { align: "center" });
    
    // Add source information
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(selectedSource.name, 14, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 60);
    doc.text(`Location: ${selectedSource.location}`, 14, 66);
    doc.text(`Type: ${selectedSource.type}`, 14, 72);
    
    // Add prediction summary section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Prediction Summary", 14, 84);
    
    // Create prediction summary table
    autoTable(doc, {
      startY: 88,
      head: [['Quality Score', 'Status', 'Description']],
      body: [[
        prediction.score,
        prediction.status,
        prediction.description
      ]],
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { 
          fontStyle: 'bold',
          fillColor: getScoreColor(prediction.score),
          textColor: [255, 255, 255]
        },
        1: {
          fontStyle: 'bold'
        }
      }
    });
    
    // Add improvement steps section
    const currentY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Recommended Improvement Steps", 14, currentY);
    
    // Create table for improvement steps
    const improvementStepsBody = prediction.improvementSteps.map((step, index) => [
      `${index + 1}`,
      step
    ]);
    
    autoTable(doc, {
      startY: currentY + 4,
      head: [['#', 'Recommendation']],
      body: improvementStepsBody,
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add 7-day forecast section
    const forecastY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("7-Day Quality Forecast", 14, forecastY);
    
    // Create synthetic forecast data based on the current score
    const forecastData = [
      { day: "Today", score: prediction.score },
      { day: "Tomorrow", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 10 - 5))).toFixed(1) },
      { day: "Day 3", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 15 - 7))).toFixed(1) },
      { day: "Day 4", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 20 - 10))).toFixed(1) },
      { day: "Day 5", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 25 - 12))).toFixed(1) },
      { day: "Day 6", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 30 - 15))).toFixed(1) },
      { day: "Day 7", score: Math.min(100, Math.max(0, prediction.score + (Math.random() * 35 - 17))).toFixed(1) },
    ];
    
    const forecastBody = forecastData.map(item => [
      item.day,
      item.score,
      getQualityStatus(Number(item.score))
    ]);
    
    autoTable(doc, {
      startY: forecastY + 4,
      head: [['Day', 'Predicted Score', 'Status']],
      body: forecastBody,
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        2: { 
          fontStyle: 'bold',
          fillColor: (cell, row) => {
            const score = parseFloat(row.cells[1].raw as string);
            return getScoreColor(score);
          },
          textColor: [255, 255, 255]
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add current water quality metrics table
    const metricsY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Current Water Quality Metrics", 14, metricsY);
    
    // Create table data for current metrics
    const metricsBody = createMetricsTableData(selectedSource.metrics);
    
    autoTable(doc, {
      startY: metricsY + 4,
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
            return getStatusColor(status);
          },
          textColor: [255, 255, 255]
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add footer to all pages
    addPdfFooter(doc, 'Water Quality Monitoring System | Forecast Report');
    
    // Save the PDF
    doc.save(`${selectedSource.name.replace(/\s+/g, '_')}_forecast_report.pdf`);
    
    toast({
      title: "Report Downloaded",
      description: `PDF forecast report for ${selectedSource.name} has been generated successfully.`,
      duration: 3000,
    });
  };
  
  // Helper function to determine status from score
  const getQualityStatus = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Poor";
    return "Critical";
  };

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[150%] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="glass-panel rounded-xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-800 mb-2">Water Quality Prediction</h1>
                  <p className="text-muted-foreground max-w-3xl">
                    Advanced AI-powered prediction of water quality parameters, helping you anticipate changes 
                    and take proactive measures to maintain safe water conditions.
                  </p>
                </div>
                
                <button
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2 bg-water-blue hover:bg-water-blue/90 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
                >
                  <FileText size={16} />
                  <span>Generate Forecast Report</span>
                </button>
              </div>
              
              {/* Info Alert */}
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Forecast Information</p>
                    <p className="text-sm text-blue-600">
                      Predictions are based on historical data, current conditions, and environmental factors.
                      Accuracy may vary based on unexpected environmental changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <WaterSourceSelector 
              sources={waterSources}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
            />
            
            <QualityPredictor prediction={qualityPredictions[selectedSource.id]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityPrediction;
