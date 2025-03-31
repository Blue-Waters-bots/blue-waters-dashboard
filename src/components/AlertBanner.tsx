import React, { useState } from "react";
import { AlertTriangle, AlertCircle, X, ChevronDown, ChevronRight } from "lucide-react";
import { Alert, AlertLevel, useAlerts } from "@/contexts/AlertContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NotificationsIcon from "./NotificationsIcon";

export const AlertBanner = () => {
  const { alerts, dismissAlert, dismissAllAlerts } = useAlerts();
  const [expanded, setExpanded] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);

  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  
  if (activeAlerts.length === 0) {
    return null;
  }

  const criticalCount = activeAlerts.filter(a => a.level === "critical").length;
  const warningCount = activeAlerts.filter(a => a.level === "warning").length;
  const infoCount = activeAlerts.filter(a => a.level === "info").length;

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case "critical":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <NotificationsIcon />;
    }
  };

  const getAlertColor = (level: AlertLevel) => {
    switch (level) {
      case "critical":
        return "bg-water-danger/10 text-water-danger border-water-danger/30";
      case "warning":
        return "bg-water-warning/10 text-water-warning border-water-warning/30";
      case "info":
        return "bg-water-blue/10 text-water-blue border-water-blue/30";
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  return (
    <div className="w-full mb-6 animate-fade-in">
      <div className={cn(
        "rounded-lg border p-4 shadow-sm",
        criticalCount > 0 ? "bg-water-danger/5 border-water-danger/20" :
        warningCount > 0 ? "bg-water-warning/5 border-water-warning/20" :
        "bg-water-blue/5 border-water-blue/20"
      )}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {criticalCount > 0 ? (
              <AlertCircle className="h-5 w-5 text-water-danger" />
            ) : warningCount > 0 ? (
              <AlertTriangle className="h-5 w-5 text-water-warning" />
            ) : (
              <NotificationsIcon className="h-5 w-5 text-water-blue" />
            )}
            <span className="font-medium">
              {criticalCount > 0 
                ? `${criticalCount} Critical Alert${criticalCount > 1 ? 's' : ''}`
                : warningCount > 0 
                  ? `${warningCount} Warning${warningCount > 1 ? 's' : ''}`
                  : `${infoCount} Notification${infoCount > 1 ? 's' : ''}`
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="p-1 h-8 w-8"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {expanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissAllAlerts}
                className="text-xs h-8"
              >
                Dismiss All
              </Button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto">
            {activeAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={cn(
                  "rounded-md border p-3 flex flex-col cursor-pointer",
                  getAlertColor(alert.level)
                )}
                onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.level)}
                    <div className="font-medium">{alert.source}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                    className="p-1 h-7 w-7"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm mt-1">{alert.message}</p>
                <div className="text-xs opacity-70">{getTimeAgo(alert.timestamp)}</div>
                {selectedAlert === alert.id && (
                  <div className="mt-2 p-2 bg-gray-100 rounded-md text-sm">
                    <strong>Details:</strong> {alert.details || "No additional details available."}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
