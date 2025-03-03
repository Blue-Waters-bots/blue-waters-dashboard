
import { useState } from "react";
import { HistoricalData as HistoricalDataType, WaterQualityMetric } from "@/types/waterQuality";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

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

  if (!historicalData.length) {
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
      <h2 className="text-lg font-medium mb-4">Historical Trends</h2>
      <div className="glass-panel rounded-lg p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {historicalData.map((data) => (
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

export default HistoricalData;
