
import { Droplet } from "lucide-react";

const Header = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Droplet size={32} className="text-water-blue animate-float" />
        <h1 className="text-3xl font-light tracking-tight">Water Quality Monitor</h1>
      </div>
      <p className="text-muted-foreground text-center max-w-lg">
        Real-time monitoring and analysis of water quality metrics with health risk assessment
      </p>
    </div>
  );
};

export default Header;
