export interface MetricData {
  metricName: string;
  value: number;
  timestamp: string;
  unit?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
}