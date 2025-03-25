
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MenuIcon, X, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarItems from "./SidebarItems";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile sidebar toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-40",
          isMobile
            ? isOpen
              ? "fixed inset-0 w-72 transform translate-x-0"
              : "fixed inset-0 w-72 transform -translate-x-full"
            : "w-64 sticky top-0"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="flex h-14 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <Droplet className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-lg">Blue Waters</span>
            </div>
          </div>
          
          <SidebarItems />
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
