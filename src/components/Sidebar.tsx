
import { useState } from "react";
import { MenuIcon, Mail, Phone, Globe, X, LayoutDashboard, FlaskConical, ShieldAlert, ChartLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import NotificationsIcon from "./NotificationsIcon";
import { useAlerts } from "@/contexts/AlertContext";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const location = useLocation();
  const { alerts } = useAlerts();
  
  // Count active alerts
  const activeAlertsCount = alerts.filter(alert => !alert.dismissed).length;

  const navigationItems = [
    { 
      path: "/", 
      name: "Dashboard", 
      icon: <LayoutDashboard size={isCollapsed ? 20 : 18} />, 
      description: "Water quality metrics overview" 
    },
    { 
      path: "/water-quality-prediction", 
      name: "Water Quality Prediction", 
      icon: <FlaskConical size={isCollapsed ? 20 : 18} />, 
      description: "Future water quality forecasts" 
    },
    { 
      path: "/health-risk-assessment", 
      name: "Health Risk Assessment", 
      icon: <ShieldAlert size={isCollapsed ? 20 : 18} />, 
      description: "Health impacts and risks" 
    },
    { 
      path: "/historical-trends", 
      name: "Historical Trends", 
      icon: <ChartLine size={isCollapsed ? 20 : 18} />, 
      description: "Historical data and reporting" 
    },
  ];

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "h-screen bg-white/80 backdrop-blur-md border-r border-white/30 shadow-lg transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header with Logo */}
        <div className="p-4 border-b border-white/20 flex items-center gap-3">
          <div className={cn(
            "animate-float flex items-center",
            isCollapsed ? "justify-center w-full" : ""
          )}>
            {/* Replace the SVG with the logo image */}
            <img
              src="/public/logo.jpg" // Update with your actual logo path
              alt="Blue Waters Logo"
              width={isCollapsed ? 28 : 45} // Adjust the width based on the collapsed state
              height={isCollapsed ? 28 : 45} // Adjust the height based on the collapsed state
              className="text-water-blue"
            />
          </div>
          
          {!isCollapsed && (
            <div>
              <h1 className="text-2xl font-light tracking-tight bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
                Blue Waters
              </h1>
              <p className="text-xs text-muted-foreground">by Blue Group Solutions</p>
            </div>
          )}
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 py-6 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "group flex items-center px-2 py-3 rounded-md transition-all duration-200",
                    isActive 
                      ? "bg-water-blue/10 text-water-blue" 
                      : "text-muted-foreground hover:bg-white/60 hover:text-water-blue"
                  )}
                >
                  <div className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center w-full" : "gap-3"
                  )}>
                    <span className={cn(
                      "flex-shrink-0",
                      isActive ? "text-water-blue" : "text-muted-foreground group-hover:text-water-blue"
                    )}>
                      {item.icon}
                    </span>
                    
                    {!isCollapsed && (
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Notifications Icon */}
        <div className={cn(
          "px-4 py-3 border-t border-white/20",
          isCollapsed ? "flex justify-center" : "flex justify-start"
        )}>
          <NotificationsIcon 
            className="h-6 w-6" 
            onClick={() => activeAlertsCount > 0 && setShowAlertPanel(!showAlertPanel)}
          />
        </div>
        
        {/* Sidebar Footer with Contact Info */}
        <div className="p-4 border-t border-white/20">
          {!isCollapsed ? (
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a 
                href="https://bluegroupbw.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-water-blue transition-colors"
              >
                <Globe size={16} />
                bluegroupbw.com
              </a>
              <a 
                href="mailto:admin@bluegroupbw.com"
                className="flex items-center gap-1.5 hover:text-water-blue transition-colors"
              >
                <Mail size={16} />
                admin@bluegroupbw.com
              </a>
              <a 
                href="tel:+26776953381"
                className="flex items-center gap-1.5 hover:text-water-blue transition-colors"
              >
                <Phone size={16} />
                +267 76953381
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <a 
                href="https://bluegroupbw.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-water-blue transition-colors"
                title="Website"
              >
                <Globe size={16} />
              </a>
              <a 
                href="mailto:admin@bluegroupbw.com"
                className="hover:text-water-blue transition-colors"
                title="Email"
              >
                <Mail size={16} />
              </a>
              <a 
                href="tel:+26776953381"
                className="hover:text-water-blue transition-colors"
                title="Phone"
              >
                <Phone size={16} />
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-4 bg-white text-gray-600 rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors z-10"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <MenuIcon size={18} /> : <X size={18} />}
      </button>
    </div>
  );
};

export default Sidebar;
