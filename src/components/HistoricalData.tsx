
import { useState } from "react";
import { HistoricalData as HistoricalDataType, WaterQualityMetric } from "@/types/waterQuality";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
  AreaChart, Area, ComposedChart, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { Download, BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon, 
  AreaChart as AreaChartIcon, Combine, CircleDot, ArrowRightLeft } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface HistoricalDataProps {
  historicalData: HistoricalDataType[];
  metrics: WaterQualityMetric[];
}

type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'bubble' | 'composed';

const chartTypes: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: 'line', label: 'Line', icon: <LineChartIcon size={16} /> },
  { type: 'bar', label: 'Bar', icon: <BarChartIcon size={16} /> },
  { type: 'area', label: 'Area', icon: <AreaChartIcon size={16} /> },
  { type: 'pie', label: 'Pie', icon: <PieChartIcon size={16} /> },
  { type: 'scatter', label: 'Scatter', icon: <CircleDot size={16} /> },
  { type: 'bubble', label: 'Bubble', icon: <CircleDot size={16} /> },
  { type: 'composed', label: 'Composed', icon: <Combine size={16} /> },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const HistoricalData = ({ historicalData, metrics }: HistoricalDataProps) => {
  const [selectedMetric, setSelectedMetric] = useState<string>(
    historicalData.length > 0 ? historicalData[0].metricId : ""
  );
  const [chartType, setChartType] = useState<ChartType>('line');

  const selectedData = historicalData.find((d) => d.metricId === selectedMetric);
  const selectedMetricInfo = metrics.find((m) => m.id === selectedMetric);

  const getLineColor = (metricId: string) => {
    const metric = metrics.find((m) => m.id === metricId);
    if (!metric) return "#0EA5E9";
    
    switch (metric.status) {
      case "safe":
        return "#34D399";
      case "warning":
        return "#FBBF24";
      case "danger":
        return "#F87171";
      default:
        return "#0EA5E9";
    }
  };

  // Create missing historical data for metrics that don't have it
  const allMetricsData = metrics.map(metric => {
    const existingData = historicalData.find(d => d.metricId === metric.id);
    
    if (existingData) return existingData;
    
    // Create placeholder data if this metric doesn't have historical data
    return {
      metricId: metric.id,
      metricName: metric.name,
      data: [
        { date: "2023-01", value: metric.value * 0.95 },
        { date: "2023-02", value: metric.value * 0.98 },
        { date: "2023-03", value: metric.value * 1.02 },
        { date: "2023-04", value: metric.value * 0.97 },
        { date: "2023-05", value: metric.value * 1.01 },
        { date: "2023-06", value: metric.value }
      ]
    };
  });

  // Function to prepare data for pie chart
  const preparePieData = (data: { date: string; value: number }[]) => {
    return data.map(item => ({
      name: new Date(item.date).toLocaleString('default', { month: 'short' }),
      value: item.value
    }));
  };

  // Function to prepare bubble chart data
  const prepareBubbleData = (data: { date: string; value: number }[]) => {
    return data.map((item, index) => ({
      x: index,
      y: item.value,
      z: Math.max(5, Math.abs(item.value) * 0.5), // Size based on value
      name: new Date(item.date).toLocaleString('default', { month: 'short' })
    }));
  };

  if (!allMetricsData.length) {
    return (
      <div className="w-full mb-8">
        <h2 className="text-lg font-medium mb-4">Historical Trends</h2>
        <div className="glass-panel rounded-lg p-6 text-center">
          <p className="text-muted-foreground">No historical data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Historical Trends</h2>
        <button 
          onClick={() => generateReport(metrics, allMetricsData)}
          className="flex items-center gap-1 px-3 py-1.5 bg-water-blue text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          <Download size={16} />
          <span>Download Report</span>
        </button>
      </div>
      <div className="glass-panel rounded-lg p-4">
        <div className="grid gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {allMetricsData.map((data) => (
              <button
                key={data.metricId}
                className={cn(
                  "px-3 py-1 text-sm rounded-full transition-all",
                  selectedMetric === data.metricId
                    ? "bg-water-blue text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
                onClick={() => setSelectedMetric(data.metricId)}
              >
                {data.metricName}
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">Chart Type:</span>
            <ToggleGroup type="single" value={chartType} onValueChange={(value: ChartType) => value && setChartType(value)}>
              {chartTypes.map((chart) => (
                <ToggleGroupItem key={chart.type} value={chart.type} aria-label={chart.label}>
                  {chart.icon}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        
        {selectedData && (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' && (
                <LineChart
                  data={selectedData.data}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                    }}
                  />
                  <YAxis 
                    domain={[
                      (dataMin: number) => Math.floor(dataMin * 0.9),
                      (dataMax: number) => Math.ceil(dataMax * 1.1)
                    ]} 
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      `${value} ${selectedMetricInfo?.unit || ''}`,
                      selectedData.metricName
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={getLineColor(selectedMetric)}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}

              {chartType === 'bar' && (
                <BarChart
                  data={selectedData.data}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                    }}
                  />
                  <YAxis
                    domain={[
                      (dataMin: number) => Math.floor(dataMin * 0.9),
                      (dataMax: number) => Math.ceil(dataMax * 1.1)
                    ]}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} ${selectedMetricInfo?.unit || ''}`,
                      selectedData.metricName
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={getLineColor(selectedMetric)}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}

              {chartType === 'area' && (
                <AreaChart
                  data={selectedData.data}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                    }}
                  />
                  <YAxis
                    domain={[
                      (dataMin: number) => Math.floor(dataMin * 0.9),
                      (dataMax: number) => Math.ceil(dataMax * 1.1)
                    ]}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} ${selectedMetricInfo?.unit || ''}`,
                      selectedData.metricName
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={getLineColor(selectedMetric)}
                    fill={getLineColor(selectedMetric)}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              )}

              {chartType === 'pie' && (
                <PieChart>
                  <Pie
                    data={preparePieData(selectedData.data)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {preparePieData(selectedData.data).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} ${selectedMetricInfo?.unit || ''}`,
                      selectedData.metricName
                    ]}
                  />
                </PieChart>
              )}

              {chartType === 'scatter' && (
                <ScatterChart
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    type="category"
                    name="Month"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                    }}
                  />
                  <YAxis 
                    dataKey="value"
                    name="Value"
                    domain={[
                      (dataMin: number) => Math.floor(dataMin * 0.9),
                      (dataMax: number) => Math.ceil(dataMax * 1.1)
                    ]}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      `${value} ${selectedMetricInfo?.unit || ''}`,
                      selectedData.metricName
                    ]}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter 
                    name={selectedData.metricName} 
                    data={selectedData.data} 
                    fill={getLineColor(selectedMetric)}
                  />
                </ScatterChart>
              )}

              {chartType === 'bubble' && (
                <ScatterChart
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="x" 
                    type="number"
                    name="Index"
                    tickFormatter={(value) => {
                      const date = new Date(selectedData.data[value]?.date || "");
                      return date instanceof Date && !isNaN(date.getTime()) ? 
                        `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}` : value;
                    }}
                  />
                  <YAxis 
                    dataKey="y"
                    name="Value"
                    domain={[
                      (dataMin: number) => Math.floor(dataMin * 0.9),
                      (dataMax: number) => Math.ceil(dataMax * 1.1)
                    ]}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <ZAxis 
                    dataKey="z" 
                    range={[60, 400]} 
                    name="Size" 
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === "Size") return [`${value}`, "Size"];
                      return [`${value} ${selectedMetricInfo?.unit || ''}`, selectedData.metricName];
                    }}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter 
                    name={selectedData.metricName} 
                    data={prepareBubbleData(selectedData.data)} 
                    fill={getLineColor(selectedMetric)}
                  />
                </ScatterChart>
              )}

              {chartType === 'composed' && (
                <ComposedChart
                  data={selectedData.data}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                    }}
                  />
                  <YAxis
                    domain={[
                      (dataMin: number) => Math.floor(dataMin * 0.9),
                      (dataMax: number) => Math.ceil(dataMax * 1.1)
                    ]}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} ${selectedMetricInfo?.unit || ''}`,
                      selectedData.metricName
                    ]}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill={COLORS[1]} name="Monthly Value" barSize={20} />
                  <Line type="monotone" dataKey="value" stroke={COLORS[0]} name="Trend" />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
        
        {selectedMetricInfo && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Safe Range: </span>
              <span className="font-medium">
                {selectedMetricInfo.safeRange[0]} - {selectedMetricInfo.safeRange[1]} {selectedMetricInfo.unit}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Current: </span>
              <span className={cn(
                "font-medium",
                selectedMetricInfo.status === "safe" ? "text-water-safe" :
                selectedMetricInfo.status === "warning" ? "text-water-warning" :
                "text-water-danger"
              )}>
                {selectedMetricInfo.value} {selectedMetricInfo.unit}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Function to generate and download water quality report
const generateReport = (metrics: WaterQualityMetric[], historicalData: HistoricalDataType[]) => {
  const currentDate = new Date().toLocaleDateString();
  
  // Create report content
  let reportContent = `WATER QUALITY REPORT - ${currentDate}\n\n`;
  reportContent += "CURRENT WATER QUALITY METRICS:\n";
  reportContent += "============================\n\n";
  
  metrics.forEach(metric => {
    const status = metric.status === "safe" ? "SAFE" : 
                  metric.status === "warning" ? "WARNING" : "DANGER";
    
    reportContent += `${metric.name}: ${metric.value} ${metric.unit}\n`;
    reportContent += `Safe Range: ${metric.safeRange[0]} - ${metric.safeRange[1]} ${metric.unit}\n`;
    reportContent += `Status: ${status}\n\n`;
  });
  
  reportContent += "\nHISTORICAL DATA:\n";
  reportContent += "===============\n\n";
  
  historicalData.forEach(data => {
    reportContent += `${data.metricName}:\n`;
    data.data.forEach(point => {
      const date = new Date(point.date);
      const formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      reportContent += `  ${formattedDate}: ${point.value}\n`;
    });
    reportContent += "\n";
  });
  
  // Create blob and download link
  const blob = new Blob([reportContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `water_quality_report_${currentDate.replace(/\//g, "-")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default HistoricalData;
