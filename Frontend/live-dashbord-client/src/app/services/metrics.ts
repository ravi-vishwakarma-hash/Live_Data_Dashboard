import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, finalize } from 'rxjs';
import { MetricData } from '../models/metric-data';
import { environment } from '../../environments/environment';
import { SignalrService } from './signalr';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private metricsMap = new Map<string, MetricData>();
  private metricsSubject = new BehaviorSubject<MetricData[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  public metrics$ = this.metricsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient, private signalr: SignalrService) {
    this.signalr.metric$.subscribe(metric => this.upsertMetric(metric));
  }

  public loadInitialSnapshot(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http
      .get<MetricData[]>(`${environment.apiBaseUrl}/api/metrics/snapshot`)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: initialData => {
          initialData.forEach(m => this.metricsMap.set(m.metricName, m));
          this.emitMetrics();
        },
        error: () => this.errorSubject.next('Unable to load the initial metrics snapshot.')
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