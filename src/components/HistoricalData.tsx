
import { useState } from "react";
import { HistoricalData as HistoricalDataType, WaterQualityMetric } from "@/types/waterQuality";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

interface HistoricalDataProps {
  historicalData: HistoricalDataType[];
  metrics: WaterQualityMetric[];
}

const HistoricalData = ({ historicalData, metrics }: HistoricalDataProps) => {
  const [selectedMetric, setSelectedMetric] = useState<string>(
    historicalData.length > 0 ? historicalData[0].metricId : ""
  );

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
        <div className="flex flex-wrap gap-2 mb-4">
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
        
        {selectedData && (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
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
