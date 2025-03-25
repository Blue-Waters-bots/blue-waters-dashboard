import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfFooter, castDocToPDFWithAutoTable, getStatusColorForCell } from '@/utils/pdfUtils';
import { WaterQualityStatus } from '@/types/waterQuality';

interface HistoricalDataEntry {
  date: string;
  value: number;
  change: number;
  status: WaterQualityStatus;
}

interface HistoricalDataProps {
  title: string;
  metric: string;
  period: string;
  data: HistoricalDataEntry[];
  isLoading: boolean;
}

const HistoricalData: React.FC<HistoricalDataProps> = ({ title, metric, period, data, isLoading }) => {
  const [tableData, setTableData] = useState<string[][]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map(item => [
        item.date,
        item.value.toString(),
        item.change.toString(),
        item.status.charAt(0).toUpperCase() + item.status.slice(1)
      ]);
      setTableData(formattedData);
    }
  }, [data]);

  // Add report generation with properly typed functions
  const generateReportPDF = (data: HistoricalDataEntry[], title: string, metric: string, period: string) => {
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();

    // Add header with logo and title
    doc.setFillColor(0, 102, 204); // Header background color
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`${title} Report`, 105, 20, { align: "center" });

    // Add metric information
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(metric, 14, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 60);
    doc.text(`Period: ${period}`, 14, 66);

    // Create table data for current metrics
    const tableData = data.map(item => [
      item.date,
      item.value.toString(),
      item.change.toString(),
      item.status.charAt(0).toUpperCase() + item.status.slice(1)
    ]);

    // Use properly typed function for cell styling
    autoTable(doc, {
      startY: 94,
      head: [['Date', 'Value', 'Change', 'Status']],
      body: tableData,
      headStyles: { 
        fillColor: [41, 128, 185] as any,
        textColor: [255, 255, 255],
        fontStyle: 'bold' 
      },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        3: { 
          fontStyle: 'bold',
          fillColor: getStatusColorForCell as any,
          textColor: [255, 255, 255]
        }
      },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });

    // Add footer
    addPdfFooter(castDocToPDFWithAutoTable(doc), 'Water Quality Monitoring System | Confidential Report');

    // Save the PDF
    doc.save(`${title.replace(/\s+/g, '_')}_report.pdf`);
  };

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Button variant="outline" size="icon" onClick={() => generateReportPDF(data, title, metric, period)}>
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableCaption>A list of your recent historical data.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.date}</TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>{item.change}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalData;
