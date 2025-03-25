
import { useState } from "react";
import { WaterSource } from "@/types/waterQuality";
import { cn } from "@/lib/utils";
import { Droplet, Activity } from "lucide-react";

interface WaterSourceSelectorProps {
  sources: WaterSource[];
  selectedSource: WaterSource;
  onSelectSource: (source: WaterSource) => void;
}

const WaterSourceSelector = ({
  sources,
  selectedSource,
  onSelectSource,
}: WaterSourceSelectorProps) => {
  return (
    <div className="w-full glass-panel p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-medium mb-4">Water Sources</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((source) => {
          // Calculate overall status
          const metrics = source.metrics || [];
          const warningCount = metrics.filter(m => m.status === "warning").length;
          const dangerCount = metrics.filter(m => m.status === "danger").length;
          
          let statusColor = "bg-water-safe";
          let statusText = "Safe";
          
          if (dangerCount > 0) {
            statusColor = "bg-water-danger";
            statusText = "Critical";
          } else if (warningCount > 0) {
            statusColor = "bg-water-warning";
            statusText = "Warning";
          }
          
          return (
            <div
              key={source.id}
              onClick={() => onSelectSource(source)}
              className={cn(
                "bg-white/80 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md",
                selectedSource.id === source.id 
                  ? "ring-2 ring-water-blue ring-opacity-80" 
                  : "hover:ring-1 hover:ring-water-blue hover:ring-opacity-50"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{source.name}</h3>
                  <p className="text-sm text-muted-foreground">{source.type}</p>
                </div>
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full text-white flex items-center gap-1",
                  statusColor
                )}>
                  <Activity size={12} />
                  <span>{statusText}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{source.location}</p>
              
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Droplet size={14} />
                <span>{metrics.length} metrics</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WaterSourceSelector;
