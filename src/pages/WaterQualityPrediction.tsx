
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  getStatusColorForCell, 
  addPdfFooter, 
  castDocToPDFWithAutoTable,
  Color,
} from "@/utils/pdfUtils";

// Constants
const parameters = [
  "pH", "Turbidity", "Dissolved Oxygen", "BOD", "Nitrates", "Phosphates",
  "Chlorides", "Total Dissolved Solids", "Fecal Coliform", "Metals (Lead, Mercury)"
];

const historicalData = [
  { period: "Last Month", quality: "Good", risk: "Low" },
  { period: "3 Months Ago", quality: "Warning", risk: "Moderate" },
  { period: "6 Months Ago", quality: "Danger", risk: "High" }
];

const bestPractices = [
  { practice: "Regular Monitoring", impact: "Safe", priority: "High" },
  { practice: "Source Protection", impact: "Safe", priority: "High" },
  { practice: "Treatment Optimization", impact: "Warning", priority: "Moderate" }
];

// Interfaces
interface PredictionInput {
  parameter: string;
  value: number;
}

interface PredictionResult {
  parameter: string;
  value: number;
  status: string;
}

interface HistoricalDataEntry {
  period: string;
  quality: string;
  risk: string;
}

interface BestPracticeEntry {
  practice: string;
  impact: string;
  priority: string;
}

const WaterQualityPrediction = () => {
  const [predictionInputs, setPredictionInputs] = useState<PredictionInput[]>(
    parameters.map(param => ({ parameter: param, value: 0 }))
  );
  const [predictionResults, setPredictionResults] = useState<PredictionResult[]>([]);
  const [includeHistorical, setIncludeHistorical] = useState(true);
  const [includeBestPractices, setIncludeBestPractices] = useState(true);

  const handleInputChange = (parameter: string, value: number) => {
    setPredictionInputs(prevInputs =>
      prevInputs.map(input =>
        input.parameter === parameter ? { ...input, value } : input
      )
    );
  };

  const predictWaterQuality = () => {
    const newResults: PredictionResult[] = predictionInputs.map(input => {
      let status = "safe";
      if (input.value > 50) {
        status = "warning";
      } else if (input.value > 80) {
        status = "danger";
      }
      return { ...input, status };
    });
    setPredictionResults(newResults);
  };

  // Type safer implementation for fillColor function
  const getStatusFillColor = (cell: any, row: any) => {
    // Cast the result to any to satisfy the type constraints
    return getStatusColorForCell(cell) as any;
  };

  const generatePredictionPDF = () => {
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();

    // Header
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Water Quality Prediction Report", 105, 20, { align: "center" });

    // Report Generation Date
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 50);

    // Prediction Results Table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Prediction Results", 14, 70);

    const tableData = predictionResults.map(result => [
      result.parameter,
      result.value,
      result.status.charAt(0).toUpperCase() + result.status.slice(1)
    ]);
    
    // Use the updated function with correct typing
    autoTable(doc, {
      startY: 94,
      head: [['Parameter', 'Input Value', 'Status']],
      body: tableData,
      headStyles: { 
        fillColor: [41, 128, 185] as Color,
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        2: { 
          fontStyle: 'bold',
          fillColor: getStatusFillColor as any,
          textColor: [255, 255, 255]
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    let lastTableY = (doc as any).lastAutoTable.finalY || 10;

    // Historical Comparison Table (Conditional)
    if (includeHistorical) {
      generateComparisonPDF();
      lastTableY = (doc as any).lastAutoTable.finalY;
    }

    // Best Practices Table (Conditional)
    if (includeBestPractices) {
      addBestPracticesTable(doc);
      lastTableY = (doc as any).lastAutoTable.finalY;
    }

    addPdfFooter(castDocToPDFWithAutoTable(doc), 'Water Quality Prediction Report');

    doc.save('water_quality_prediction_report.pdf');

    toast({
      title: "Report Downloaded",
      description: "Water quality prediction report has been generated successfully.",
      duration: 3000,
    });
  };

  const generateComparisonPDF = () => {
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();

    // Header
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Historical Comparison Report", 105, 20, { align: "center" });

    // Report Generation Date
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 50);

    // Historical Comparison Table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Historical Comparison", 14, 210);

    const comparisonData = historicalData.map(item => [
      item.period,
      item.quality.charAt(0).toUpperCase() + item.quality.slice(1),
      item.risk.charAt(0).toUpperCase() + item.risk.slice(1)
    ]);
    
    autoTable(doc, {
      startY: 234,
      head: [['Time Period', 'Quality Status', 'Risk Level']],
      body: comparisonData,
      headStyles: { 
        fillColor: [41, 128, 185] as Color,
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        1: { 
          fontStyle: 'bold',
          fillColor: getStatusColorForCell as any,
          textColor: [255, 255, 255]
        },
        2: {
          fontStyle: 'bold',
          fillColor: (cell: any) => {
            const risk = cell.raw.toLowerCase();
            if (risk.includes('low')) return [46, 204, 113];
            if (risk.includes('moderate')) return [241, 196, 15];
            if (risk.includes('high')) return [231, 76, 60];
            return [100, 100, 100];
          } as any,
          textColor: [255, 255, 255]
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    addPdfFooter(castDocToPDFWithAutoTable(doc), 'Historical Comparison Report');

    doc.save('historical_comparison_report.pdf');

    toast({
      title: "Report Downloaded",
      description: "Historical comparison report has been generated successfully.",
      duration: 3000,
    });
  };

  const addBestPracticesTable = (doc: jsPDF) => {
    const dateGenerated = new Date().toLocaleString();

    // Header
    doc.setFillColor(0, 102, 204);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Best Practices Report", 105, 20, { align: "center" });

    // Report Generation Date
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 50);

    // Best Practices Table
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Recommended Best Practices", 14, 190);

    const bestPracticesData = bestPractices.map(item => [
      item.practice,
      item.impact.charAt(0).toUpperCase() + item.impact.slice(1),
      item.priority.charAt(0).toUpperCase() + item.priority.slice(1)
    ]);
    
    autoTable(castDocToPDFWithAutoTable(doc), {
      startY: 214,
      head: [['Best Practice', 'Impact', 'Priority']],
      body: bestPracticesData,
      headStyles: { 
        fillColor: [41, 128, 185] as Color,
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        2: { 
          fontStyle: 'bold',
          fillColor: getStatusColorForCell as any,
          textColor: [255, 255, 255]
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    addPdfFooter(castDocToPDFWithAutoTable(doc), 'Best Practices Report');

    doc.save('best_practices_report.pdf');

    toast({
      title: "Report Downloaded",
      description: "Best practices report has been generated successfully.",
      duration: 3000,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="glass-panel rounded-xl shadow-card">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-gradient-blue">
            Water Quality Prediction
          </CardTitle>
          <CardDescription>
            Enter the values for different water quality parameters to predict the overall quality.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parameters.map(parameter => (
              <div key={parameter} className="space-y-2">
                <Label htmlFor={parameter}>{parameter}</Label>
                <Input
                  type="number"
                  id={parameter}
                  placeholder={`Enter value for ${parameter}`}
                  value={predictionInputs.find(input => input.parameter === parameter)?.value || 0}
                  onChange={(e) => handleInputChange(parameter, parseFloat(e.target.value))}
                />
              </div>
            ))}
          </div>
          <Button onClick={predictWaterQuality}>Predict Water Quality</Button>
        </CardContent>
      </Card>

      {predictionResults.length > 0 && (
        <Card className="glass-panel mt-8 rounded-xl shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Prediction Results</CardTitle>
            <CardDescription>
              Here are the predicted water quality statuses based on your inputs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Predicted water quality statuses for each parameter.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Parameter</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {predictionResults.map(result => (
                  <TableRow key={result.parameter}>
                    <TableCell className="font-medium">{result.parameter}</TableCell>
                    <TableCell>{result.value}</TableCell>
                    <TableCell>{result.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="glass-panel mt-8 rounded-xl shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Report Options</CardTitle>
          <CardDescription>
            Customize your report with additional data and download it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-historical"
              checked={includeHistorical}
              onCheckedChange={(checked) => setIncludeHistorical(checked as boolean)}
            />
            <Label htmlFor="include-historical">Include Historical Comparison</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-best-practices"
              checked={includeBestPractices}
              onCheckedChange={(checked) => setIncludeBestPractices(checked as boolean)}
            />
            <Label htmlFor="include-best-practices">Include Best Practices</Label>
          </div>
          <Button onClick={generatePredictionPDF} className="bg-water-blue hover:bg-water-blue/90 text-white">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterQualityPrediction;
