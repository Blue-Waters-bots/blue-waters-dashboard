
export interface WaterQualityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  safeRange: [number, number];
  status: 'safe' | 'warning' | 'danger';
  icon: string;
}

export interface DiseasePrediction {
  id: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  causedBy: string[];
}

export interface WaterSource {
  id: string;
  name: string;
  location: string;
  type: 'Lake' | 'River' | 'Well' | 'Reservoir' | 'Treatment Plant'  | 'Dam';
  metrics: WaterQualityMetric[];
  diseases: DiseasePrediction[];
  overallStatus?: 'safe' | 'warning' | 'danger';
  lastUpdate?: string;
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
}

export interface HistoricalData {
  metricId: string;
  metricName: string;
  data: HistoricalDataPoint[];
}

export interface HistoricalMetricData extends HistoricalData {
  // Same as HistoricalData but with a different name for clarity
}

export interface WaterSourceMetric extends WaterQualityMetric {
  // Same as WaterQualityMetric but with a different name for clarity
}

export interface QualityPrediction {
  score: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  description: string;
  improvementSteps: string[];
}

// Add extra styling properties for the application
declare module '@/index.css' {
  interface CSSProperties {
    '--water-safe': string;
    '--water-warning': string;
    '--water-danger': string;
    '--water-blue': string;
  }
}
