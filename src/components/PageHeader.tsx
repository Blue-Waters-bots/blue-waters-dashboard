
import React from "react";
import { Button } from "@/components/ui/button";
import NotificationsIcon from "@/components/NotificationsIcon";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description,
  actions
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-semibold text-gradient-blue mb-2">{title}</h1>
        {description && (
          <p className="text-muted-foreground max-w-3xl">
            {description}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationsIcon />
        {actions}
      </div>
    </div>
  );
};

export default PageHeader;
