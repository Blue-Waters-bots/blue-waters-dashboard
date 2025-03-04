
import { Droplet, Mail, Phone, Globe } from "lucide-react";

const Header = () => {
  return (
    <div className="w-full mb-8">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="flex items-center gap-3 mb-2">
          <Droplet size={40} className="text-water-blue animate-float" />
          <div>
            <h1 className="text-4xl font-light tracking-tight bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
              Blue Waters
            </h1>
            <p className="text-sm text-muted-foreground">by Blue Group Solutions</p>
          </div>
        </div>
        <p className="text-muted-foreground text-center max-w-lg mb-6">
          Real-time monitoring and analysis of water quality metrics with health risk assessment
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
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
      </div>
    </div>
  );
};

export default Header;
