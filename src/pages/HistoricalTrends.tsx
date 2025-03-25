
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Historical Water Quality Trends</h1>
          <p className="text-gray-600 mt-2">
            View historical data and trends to understand long-term water quality changes.
          </p>
        </div>
        <button 
          onClick={generateHistoricalPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <FileText size={16} />
          <span>Download Report</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Monthly Water Quality Trends</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="averageValue" 
                stroke="#3182ce" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Historical Data Table</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y divide-gray-200">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.averageValue}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.anomalies}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'safe' 
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
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
  );
};

export default HistoricalTrends;
