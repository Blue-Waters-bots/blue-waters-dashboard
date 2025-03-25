
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
import { FileText, ChevronRight, ChevronLeft, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const HistoricalTrends = () => {
  const [data, setData] = useState(historicalData);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeChartType, setActiveChartType] = useState<'line' | 'bar' | 'area' | 'pie'>('line');

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderChartByType = () => {
    switch (activeChartType) {
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="averageValue" fill="#3182ce" />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="averageValue" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      case 'pie':
        // Prepare data for pie chart
        const pieData = data.reduce((acc, curr) => {
          const existing = acc.find(item => item.status === curr.status);
          if (existing) {
            existing.value += 1;
          } else {
            acc.push({
              name: curr.status.charAt(0).toUpperCase() + curr.status.slice(1),
              value: 1,
              status: curr.status
            });
          }
          return acc;
        }, [] as { name: string; value: number; status: string }[]);

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.status === 'safe' 
                      ? '#10B981' 
                      : entry.status === 'warning'
                        ? '#F59E0B'
                        : '#EF4444'
                  } 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      case 'line':
      default:
        return (
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
        );
    }
  };

  return (
    <div className="flex">
      {/* Collapsible Sidebar */}
      <Collapsible
        open={!sidebarCollapsed}
        className="bg-white border-r border-gray-200 h-screen transition-all duration-300"
      >
        <div className={`flex flex-col h-full ${sidebarCollapsed ? 'w-0' : 'w-64'}`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className={`font-semibold text-lg ${sidebarCollapsed ? 'hidden' : 'block'}`}>
              Chart Options
            </h2>
            <CollapsibleTrigger asChild>
              <button 
                onClick={toggleSidebar} 
                className="p-1 rounded-md hover:bg-gray-100"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="p-4 space-y-4">
            <div>
              <h3 className="font-medium mb-2">Chart Type</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveChartType('line')}
                  className={`flex items-center gap-2 w-full p-2 rounded-md transition-colors ${
                    activeChartType === 'line' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <LineChartIcon size={18} />
                  <span>Line Chart</span>
                </button>
                <button
                  onClick={() => setActiveChartType('bar')}
                  className={`flex items-center gap-2 w-full p-2 rounded-md transition-colors ${
                    activeChartType === 'bar' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <BarChart2 size={18} />
                  <span>Bar Chart</span>
                </button>
                <button
                  onClick={() => setActiveChartType('area')}
                  className={`flex items-center gap-2 w-full p-2 rounded-md transition-colors ${
                    activeChartType === 'area' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <LineChartIcon size={18} />
                  <span>Area Chart</span>
                </button>
                <button
                  onClick={() => setActiveChartType('pie')}
                  className={`flex items-center gap-2 w-full p-2 rounded-md transition-colors ${
                    activeChartType === 'pie' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <PieChartIcon size={18} />
                  <span>Pie Chart</span>
                </button>
              </div>
            </div>
            <div>
              <button 
                onClick={generateHistoricalPDF}
                className="flex items-center gap-2 w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <FileText size={18} />
                <span>Download Report</span>
              </button>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Main Content */}
      <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Historical Water Quality Trends</h1>
            <p className="text-gray-600 mt-2">
              View historical data and trends to understand long-term water quality changes.
            </p>
          </div>
          {sidebarCollapsed && (
            <button 
              onClick={toggleSidebar}
              className="p-2 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-600"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{activeChartType.charAt(0).toUpperCase() + activeChartType.slice(1)} Chart: Monthly Water Quality</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {renderChartByType()}
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
    </div>
  );
};

export default HistoricalTrends;
