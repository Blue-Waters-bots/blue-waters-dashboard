
import { DiseasePrediction } from "@/types/waterQuality";
import { cn } from "@/lib/utils";
import { AlertCircle, Shield, Users, Info, Heart } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface HealthRisksProps {
  diseases: DiseasePrediction[];
}

const HealthRisks = ({ diseases }: HealthRisksProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-water-safe bg-water-safe/10 border-water-safe/20";
      case "medium":
        return "text-water-warning bg-water-warning/10 border-water-warning/20";
      case "high":
        return "text-water-danger bg-water-danger/10 border-water-danger/20";
      default:
        return "text-water-blue bg-water-blue/10 border-water-blue/20";
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "low":
        return "Low Risk";
      case "medium":
        return "Medium Risk";
      case "high":
        return "High Risk";
      default:
        return "Unknown Risk";
    }
  };

  // Get preventive measures based on causes
  const getPreventiveMeasures = (causes: string[]) => {
    const measures: Record<string, string> = {
      "bacteria": "Regular chlorination and ultraviolet treatment of water",
      "parasites": "Fine-mesh filtration systems and boiling water before consumption",
      "lead": "Water filtration with activated carbon or reverse osmosis systems",
      "nitrate": "Ion exchange treatment and ensuring proper agricultural runoff management",
      "low chlorine": "Increase chlorination levels at treatment facilities",
      "pesticides": "Activated carbon filtration and regulation of agricultural practices"
    };
    
    return causes.map(cause => measures[cause] || "Regular water quality monitoring");
  };

  // Get population impact information
  const getPopulationImpact = (disease: string) => {
    const impacts: Record<string, { vulnerable: string[], symptoms: string[] }> = {
      "Gastrointestinal Illness": {
        vulnerable: ["Young children", "Elderly", "Immunocompromised individuals"],
        symptoms: ["Nausea", "Vomiting", "Diarrhea", "Abdominal pain"]
      },
      "Lead Poisoning": {
        vulnerable: ["Children under 6", "Pregnant women", "Developing fetuses"],
        symptoms: ["Developmental delays", "Learning difficulties", "Irritability", "Fatigue", "Abdominal pain"]
      },
      "Blue Baby Syndrome": {
        vulnerable: ["Infants under 6 months"],
        symptoms: ["Bluish skin discoloration", "Shortness of breath", "Fatigue"]
      },
      "Giardiasis": {
        vulnerable: ["Children", "Hikers", "Campers", "People with weakened immune systems"],
        symptoms: ["Diarrhea", "Abdominal cramps", "Nausea", "Weight loss"]
      }
    };
    
    return impacts[disease] || {
      vulnerable: ["General population"],
      symptoms: ["Various health effects"]
    };
  };

  if (!diseases.length) {
    return (
      <div className="w-full mb-8">
        <h2 className="text-lg font-medium mb-4">Health Risk Assessment</h2>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Health Risks Detected</AlertTitle>
          <AlertDescription>
            Current water quality parameters indicate no significant health risks for this water source.
            Continue regular monitoring to maintain water safety.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-lg font-medium mb-4">Health Risk Assessment</h2>
      <div className="grid grid-cols-1 gap-6">
        {diseases.map((disease) => {
          const impact = getPopulationImpact(disease.name);
          const preventiveMeasures = getPreventiveMeasures(disease.causedBy);
          
          return (
            <div
              key={disease.id}
              className="glass-panel rounded-lg p-6 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Heart 
                    className={cn("h-6 w-6", 
                      disease.riskLevel === "high" ? "text-water-danger" : 
                      disease.riskLevel === "medium" ? "text-water-warning" : "text-water-safe"
                    )} 
                  />
                  <h3 className="font-medium text-xl">{disease.name}</h3>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium border",
                  getRiskColor(disease.riskLevel)
                )}>
                  {getRiskLabel(disease.riskLevel)}
                </span>
              </div>
              
              <p className="text-muted-foreground mb-5">{disease.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="text-water-danger" />
                    <h4 className="font-medium">Caused by</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-6">
                    {disease.causedBy.map((cause, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-1 bg-secondary rounded-full"
                      >
                        {cause}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-water-blue" />
                    <h4 className="font-medium">Vulnerable Groups</h4>
                  </div>
                  <ul className="ml-6 text-sm">
                    {impact.vulnerable.map((group, index) => (
                      <li key={index} className="mb-1">{group}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Table className="mb-5">
                <TableHeader>
                  <TableRow>
                    <TableHead>Common Symptoms</TableHead>
                    <TableHead>Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {impact.symptoms.map((symptom, index) => (
                    <TableRow key={index}>
                      <TableCell>{symptom}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          getRiskColor(disease.riskLevel)
                        )}>
                          {index === 0 ? getRiskLabel(disease.riskLevel) : "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-water-safe" />
                  <h4 className="font-medium">Preventive Measures</h4>
                </div>
                <ul className="ml-6 text-sm">
                  {preventiveMeasures.map((measure, index) => (
                    <li key={index} className="mb-1 text-muted-foreground">{measure}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthRisks;
