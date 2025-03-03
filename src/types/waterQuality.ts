
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
  type: 'Lake' | 'River' | 'Well' | 'Reservoir' | 'Treatment Plant';
  metrics: WaterQualityMetric[];
  diseases: DiseasePrediction[];
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

export interface QualityPrediction {
  score: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  description: string;
  improvementSteps: string[];
}
