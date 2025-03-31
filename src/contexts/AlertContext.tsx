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

  const fetchAlerts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/alerts");
      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }
      const data: Alert[] = await response.json();
  
      // Convert timestamp strings to Date objects
      const formattedData = data.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp), 
      }));
  
      setAlerts(formattedData);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };
  

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Fetch alerts every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, dismissed: true } : alert
      )
    );
  };
  
  const dismissAllAlerts = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, dismissed: true })));
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert: () => {}, dismissAlert, dismissAllAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};
