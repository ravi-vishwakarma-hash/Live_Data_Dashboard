import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { MetricData } from '../models/metric-data';
import { environment } from '../../environments/environment';
import { SignalrService } from './signalr';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private metricsMap = new Map<string, MetricData>();
  private metricsSubject = new BehaviorSubject<MetricData[]>([]);

  public metrics$ = this.metricsSubject.asObservable();

  constructor(private http: HttpClient, private signalr: SignalrService) {
    this.signalr.metric$.subscribe(metric => this.upsertMetric(metric));
  }

  public loadInitialSnapshot(): void {
    this.http
      .get<MetricData[]>(`${environment.apiBaseUrl}/api/metrics/snapshot`)
      .subscribe(initialData => {
        initialData.forEach(m => this.metricsMap.set(m.metricName, m));
        this.emitMetrics();
      });
  }

  private upsertMetric(metric: MetricData): void {
    this.metricsMap.set(metric.metricName, metric);
    this.emitMetrics();
  }

  private emitMetrics(): void {
    this.metricsSubject.next(Array.from(this.metricsMap.values()));
  }
}