
import { WaterQualityMetric } from "@/types/waterQuality";
import { cn } from "@/lib/utils";
import { AlertCircle, Beaker, Bug, Droplet, Info } from "lucide-react";

interface QualityMetricsProps {
  metrics: WaterQualityMetric[];
}

const QualityMetrics = ({ metrics }: QualityMetricsProps) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "beaker":
        return <Beaker className="h-5 w-5" />;
      case "droplet":
        return <Droplet className="h-5 w-5" />;
      case "bug":
        return <Bug className="h-5 w-5" />;
      case "alert-circle":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "text-water-safe";
      case "warning":
        return "text-water-warning";
      case "danger":
        return "text-water-danger";
      default:
        return "text-water-blue";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-water-safe";
      case "warning":
        return "bg-water-warning";
      case "danger":
        return "bg-water-danger";
      default:
        return "bg-water-blue";
    }
  };

  const calculatePercentage = (metric: WaterQualityMetric) => {
    const [min, max] = metric.safeRange;
    const range = max - min;
    
    // Handle special case for pH which has a preferred middle range
    if (metric.id === "ph") {
      const middle = (min + max) / 2;
      const distance = Math.abs(metric.value - middle);
      const maxDistance = (max - min) / 2;
      return 100 - (distance / maxDistance * 100);
    }
    
    // For most metrics, closer to min is better (e.g., bacteria, lead)
    if (["bacteria", "lead", "turbidity", "nitrate"].includes(metric.id)) {
      return 100 - Math.min(100, (metric.value / max) * 100);
    }
    
    // For chlorine, calculate based on range
    return Math.min(100, ((metric.value - min) / range) * 100);
  };

  return (
    <div className="w-full mb-8">
      <h2 className="text-lg font-medium mb-4">Water Quality Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="glass-panel rounded-lg p-4 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("p-2 rounded-full", getStatusColor(metric.status))}>
                {getIcon(metric.icon)}
              </div>
              <div>
                <h3 className="font-medium">{metric.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Safe range: {metric.safeRange[0]} - {metric.safeRange[1]} {metric.unit}
                </p>
              </div>
            </div>
            
            <div className="mb-2">
              <span className={cn("text-2xl font-semibold", getStatusColor(metric.status))}>
                {metric.value}
              </span>
              <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
            </div>
            
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <div
                className={cn("h-full rounded-full", getProgressColor(metric.status))}
                style={{ width: `${calculatePercentage(metric)}%` }}
              ></div>
            </div>

            <div className="text-right">
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full inline-block",
                metric.status === "safe" ? "bg-water-safe/20 text-water-safe" : 
                metric.status === "warning" ? "bg-water-warning/20 text-water-warning" : 
                "bg-water-danger/20 text-water-danger"
              )}>
                {metric.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QualityMetrics;
