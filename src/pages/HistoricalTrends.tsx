
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { addPdfFooter, castDocToPDFWithAutoTable, getStatusColorForCell } from "@/utils/pdfUtils";
import { toast } from "@/components/ui/use-toast";
import { FileText } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";

interface HistoricalData {
  month: string;
  averageValue: number;
  anomalies: string;
  status: string;
}

const historicalData: HistoricalData[] = [
  { month: 'January', averageValue: 75, anomalies: 'None', status: 'safe' },
  { month: 'February', averageValue: 80, anomalies: 'Slight increase', status: 'warning' },
  { month: 'March', averageValue: 90, anomalies: 'Moderate increase', status: 'danger' },
  { month: 'April', averageValue: 85, anomalies: 'Slight decrease', status: 'warning' },
  { month: 'May', averageValue: 78, anomalies: 'None', status: 'safe' },
  { month: 'June', averageValue: 70, anomalies: 'None', status: 'safe' },
  { month: 'July', averageValue: 65, anomalies: 'None', status: 'safe' },
  { month: 'August', averageValue: 72, anomalies: 'None', status: 'safe' },
  { month: 'September', averageValue: 82, anomalies: 'Slight increase', status: 'warning' },
  { month: 'October', averageValue: 88, anomalies: 'Moderate increase', status: 'danger' },
  { month: 'November', averageValue: 80, anomalies: 'Slight decrease', status: 'warning' },
  { month: 'December', averageValue: 76, anomalies: 'None', status: 'safe' },
];

const HistoricalTrends = () => {
  const [data, setData] = useState(historicalData);

  useEffect(() => {
    setData(historicalData);
  }, []);

  // Function to generate PDF report
  const generateHistoricalPDF = () => {
    const doc = new jsPDF();
    const dateGenerated = new Date().toLocaleString();

    // Add header with logo and title
    doc.setFillColor(0, 102, 204); // Header background color
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Historical Water Quality Trends", 105, 20, { align: "center" });

    // Add report metadata
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated: ${dateGenerated}`, 14, 50);

    // Prepare table data
    const tableData = data.map(item => [
      item.month,
      item.averageValue,
      item.anomalies,
      item.status.charAt(0).toUpperCase() + item.status.slice(1)
    ]);

    // Use a properly typed function and context for PDF generation
    autoTable(doc, {
      startY: 94,
      head: [['Month', 'Average Value', 'Anomalies', 'Status']],
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
    addPdfFooter(castDocToPDFWithAutoTable(doc), 'Water Quality Monitoring System | Historical Trends Report');

    // Save the PDF
    doc.save('historical_water_quality_trends.pdf');

    toast({
      title: "Report Downloaded",
      description: "Historical trends report has been generated successfully.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <PageHeader
            title="Historical Water Quality Trends"
            description="View historical data and trends to understand long-term water quality changes."
            actions={
              <button
                onClick={generateHistoricalPDF}
                className="flex items-center gap-2 bg-water-blue hover:bg-water-blue/90 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
              >
                <FileText size={16} />
                <span>Download Report</span>
              </button>
            }
          />

          <div className="glass-panel rounded-xl p-6 shadow-card mt-8">
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="averageValue" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 glass-panel rounded-xl p-6 shadow-card">
            <h2 className="text-xl font-semibold mb-4">Historical Data Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Anomalies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.averageValue}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.anomalies}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrends;
