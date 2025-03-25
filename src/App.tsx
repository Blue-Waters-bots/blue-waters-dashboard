
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AlertProvider } from "@/contexts/AlertContext";
import { AuthProvider } from "@/contexts/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import WaterQualityPrediction from "./pages/WaterQualityPrediction";
import HealthRiskAssessment from "./pages/HealthRiskAssessment";
import HistoricalTrends from "./pages/HistoricalTrends";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AlertProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <PrivateRoute>
                  <Index />
                </PrivateRoute>
              } />
              
              <Route path="/water-quality-prediction" element={
                <PrivateRoute>
                  <WaterQualityPrediction />
                </PrivateRoute>
              } />
              
              <Route path="/health-risk-assessment" element={
                <PrivateRoute>
                  <HealthRiskAssessment />
                </PrivateRoute>
              } />
              
              <Route path="/historical-trends" element={
                <PrivateRoute>
                  <HistoricalTrends />
                </PrivateRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AlertProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
