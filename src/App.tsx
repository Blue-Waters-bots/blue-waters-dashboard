
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AlertProvider } from "@/contexts/AlertContext";
import Index from "./pages/Index";
import WaterQualityPrediction from "./pages/WaterQualityPrediction";
import HealthRiskAssessment from "./pages/HealthRiskAssessment";
import HistoricalTrends from "./pages/HistoricalTrends";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AlertProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/water-quality-prediction" element={<WaterQualityPrediction />} />
            <Route path="/health-risk-assessment" element={<HealthRiskAssessment />} />
            <Route path="/historical-trends" element={<HistoricalTrends />} />
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
