
import { useState } from "react";
import { MenuIcon, Droplet, Mail, Phone, Globe, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "h-screen bg-white/80 backdrop-blur-md border-r border-white/30 shadow-lg transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20 flex items-center gap-3">
          <Droplet size={isCollapsed ? 28 : 32} className="text-water-blue animate-float" />
          {!isCollapsed && (
            <div>
              <h1 className="text-2xl font-light tracking-tight bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
                Blue Waters
              </h1>
              <p className="text-xs text-muted-foreground">by Blue Group Solutions</p>
            </div>
          )}
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* You can add more sidebar content here in the future */}
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
