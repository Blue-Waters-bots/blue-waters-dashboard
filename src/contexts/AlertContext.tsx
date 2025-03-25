
import React, { createContext, useContext, useState, useEffect } from "react";
import { WaterQualityMetric, WaterSource } from "@/types/waterQuality";
import { toast } from "@/components/ui/use-toast";

export type AlertLevel = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  message: string;
  source: string;
  level: AlertLevel;
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
  dismissed?: boolean;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, "id" | "timestamp">) => void;
  dismissAlert: (id: string) => void;
  dismissAllAlerts: () => void;
  checkSourceForAlerts: (source: WaterSource) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (alert: Omit<Alert, "id" | "timestamp">) => {
    const id = Date.now().toString();
    const newAlert = {
      ...alert,
      id,
      timestamp: new Date(),
      dismissed: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);

    // Show toast notification for new alerts
    toast({
      title: `${alert.level === "critical" ? "Critical Alert" : alert.level === "warning" ? "Warning" : "Information"}`,
      description: alert.message,
      variant: alert.level === "critical" ? "destructive" : "default",
      duration: alert.level === "critical" ? 6000 : 4000,
    });
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => 
      prev.map((alert) => 
        alert.id === id ? { ...alert, dismissed: true } : alert
      )
    );
  };

  const dismissAllAlerts = () => {
    setAlerts((prev) => 
      prev.map((alert) => ({ ...alert, dismissed: true }))
    );
  };

  const checkMetricForAlert = (metric: WaterQualityMetric, sourceName: string): Alert | null => {
    // Don't create alerts for safe metrics
    if (metric.status === "safe") return null;
    
    const [min, max] = metric.safeRange;
    let message = "";
    let level: AlertLevel = "info";

    if (metric.status === "danger") {
      level = "critical";
      if (metric.value > max) {
        message = `${metric.name} is ${metric.value} ${metric.unit}, which exceeds the maximum safe level of ${max} ${metric.unit}`;
      } else if (metric.value < min) {
        message = `${metric.name} is ${metric.value} ${metric.unit}, which is below the minimum safe level of ${min} ${metric.unit}`;
      }
    } else if (metric.status === "warning") {
      level = "warning";
      // For warning, the value is approaching but not exceeding limits
      const threshold = metric.value > max * 0.8 ? max : min * 1.2;
      message = `${metric.name} is ${metric.value} ${metric.unit}, which is approaching the safe threshold of ${threshold} ${metric.unit}`;
    }

    if (!message) return null;

    return {
      id: "",  // Will be set in addAlert
      message,
      source: sourceName,
      level,
      metric: metric.name,
      value: metric.value,
      unit: metric.unit,
      timestamp: new Date(),
    };
  };

  const checkSourceForAlerts = (source: WaterSource) => {
    // Check each metric for potential alerts
    source.metrics.forEach(metric => {
      const potentialAlert = checkMetricForAlert(metric, source.name);
      if (potentialAlert) {
        // Check if we already have a similar active alert to avoid duplicates
        const alertExists = alerts.some(
          a => !a.dismissed && 
               a.source === source.name && 
               a.metric === metric.name && 
               a.level === potentialAlert.level
        );
        
        if (!alertExists) {
          addAlert(potentialAlert);
        }
      }
    });
  };

  // Clean up old alerts (older than 24 hours)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      setAlerts(prev => 
        prev.filter(alert => 
          !alert.dismissed || alert.timestamp > yesterday
        )
      );
    }, 3600000); // Check every hour
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, dismissAlert, dismissAllAlerts, checkSourceForAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};
