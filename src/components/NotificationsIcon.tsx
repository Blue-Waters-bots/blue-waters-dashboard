
import React from "react";
import { BellRing } from "lucide-react";
import { useAlerts } from "@/contexts/AlertContext";
import { cn } from "@/lib/utils";

interface NotificationsIconProps {
  className?: string;
  onClick?: () => void;
}

const NotificationsIcon: React.FC<NotificationsIconProps> = ({ 
  className,
  onClick 
}) => {
  const { alerts } = useAlerts();
  
  // Count active (non-dismissed) alerts
  const activeAlerts = alerts.filter(alert => !alert.dismissed);
  const count = activeAlerts.length;
  
  // Don't show anything if there are no alerts
  if (count === 0) {
    return (
      <div 
        className={cn("relative cursor-pointer", className)}
        onClick={onClick}
      >
        <BellRing className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }
  
  // Determine the color based on alert severity
  const hasCritical = activeAlerts.some(alert => alert.level === "critical");
  const hasWarning = activeAlerts.some(alert => alert.level === "warning");
  
  const ringColor = hasCritical 
    ? "text-water-danger" 
    : hasWarning 
      ? "text-water-warning" 
      : "text-water-blue";
  
  const badgeColor = hasCritical 
    ? "bg-water-danger" 
    : hasWarning 
      ? "bg-water-warning" 
      : "bg-water-blue";
  
  return (
    <div 
      className={cn("relative cursor-pointer", className)}
      onClick={onClick}
    >
      <BellRing className={cn("h-6 w-6 animate-pulse", ringColor)} />
      <span className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center",
        "min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white",
        badgeColor
      )}>
        {count > 99 ? "99+" : count}
      </span>
    </div>
  );
};

export default NotificationsIcon;
