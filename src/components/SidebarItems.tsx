
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Droplet, Activity, BarChart3, Shield, Home } from "lucide-react";
import UserInfo from "./UserInfo";
import LogoutButton from "./LogoutButton";

interface NavItemProps {
  href: string;
  title: string;
  icon: React.ReactNode;
}

const NavItem = ({ href, title, icon }: NavItemProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-100 text-blue-800"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      {icon}
      {title}
    </Link>
  );
};

const SidebarItems = () => {
  return (
    <div className="flex flex-col h-full">
      <UserInfo />
      
      <div className="px-3 py-2">
        <h2 className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Dashboard
        </h2>
        <div className="space-y-1">
          <NavItem href="/" title="Overview" icon={<Home size={18} />} />
          <NavItem
            href="/water-quality-prediction"
            title="Quality Prediction"
            icon={<Droplet size={18} />}
          />
          <NavItem
            href="/health-risk-assessment"
            title="Health Risks"
            icon={<Shield size={18} />}
          />
          <NavItem
            href="/historical-trends"
            title="Historical Trends"
            icon={<BarChart3 size={18} />}
          />
        </div>
      </div>
      
      <div className="mt-auto px-3 py-2">
        <LogoutButton />
      </div>
    </div>
  );
};

export default SidebarItems;
