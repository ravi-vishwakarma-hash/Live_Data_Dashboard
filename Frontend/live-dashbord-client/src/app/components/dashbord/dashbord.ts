import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { LiveChartComponent } from '../live-chart/live-chart';
import { MetricCard } from '../metric-card/metric-card';
import { MetricData } from '../../models/metric-data';
import { MetricsService } from '../../services/metrics';
import { SignalrService } from '../../services/signalr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MetricCard, LiveChartComponent],
  templateUrl: './dashbord.html',
  styleUrls: ['./dashbord.scss']
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly historyStorageKey = 'live-dashboard-metric-history';
  private readonly maxStoredPoints = 120;
  metrics = signal<MetricData[]>([]);
  metricHistory = signal<Record<string, number[]>>({});
  searchTerm = signal('');
  sortBy = signal<'name' | 'value' | 'updated'>('name');
  historyPoints = signal(30);
  isLoading = false;
  errorMessage: string | null = null;
  connectionState: 'connected' | 'reconnecting' | 'disconnected' = 'disconnected';
  private readonly previousValues = new Map<string, number>();
  private readonly lastValues = new Map<string, number>();

  filteredMetrics = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const filtered = this.metrics().filter(metric =>
      metric.metricName.toLowerCase().includes(searchTerm)
    );

    return [...filtered].sort((first, second) => {
      switch (this.sortBy()) {
        case 'value':
          return second.value - first.value;
        case 'updated':
          return new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime();
        default:
          return first.metricName.localeCompare(second.metricName);
      }
    });
  });

  activeAlerts = computed(() => this.metrics().filter(metric =>
    (metric.criticalThreshold !== undefined && metric.value >= metric.criticalThreshold) ||
    (metric.warningThreshold !== undefined && metric.value >= metric.warningThreshold)
  ));

  constructor(
    private metricsService: MetricsService,
    private signalrService: SignalrService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
    this.signalrService.startConnection();
    this.metricsService.loadInitialSnapshot();

    this.metricsService.metrics$
    .subscribe(data => {
      data.forEach(metric => {
        this.appendHistory(metric);
        const previousValue = this.lastValues.get(metric.metricName);
        if (previousValue !== undefined && previousValue !== metric.value) {
          this.previousValues.set(metric.metricName, previousValue);
        }
        this.lastValues.set(metric.metricName, metric.value);
      });
      this.metrics.update(() => data);
    });

    this.metricsService.loading$.subscribe(isLoading => this.isLoading = isLoading);
    this.metricsService.error$.subscribe(error => this.errorMessage = error);

    this.signalrService.connectionState$
    .subscribe(state => {
      this.connectionState = state;
    });
  }

  ngOnDestroy(): void {
    this.signalrService.stopConnection();
  }

  getPreviousValue(metricName: string): number | null {
    return this.previousValues.get(metricName) ?? null;
  }

  retry(): void {
    this.errorMessage = null;
    this.signalrService.reconnect();
    this.metricsService.loadInitialSnapshot();
  }

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  updateSort(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as 'name' | 'value' | 'updated');
  }

  updateHistory(event: Event): void {
    this.historyPoints.set(Number((event.target as HTMLSelectElement).value));
  }

  getHistory(metricName: string): number[] {
    return this.metricHistory()[metricName] ?? [];
  }

  getAverage(metricName: string): number | null {
    const values = this.getHistory(metricName);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  getMinimum(metricName: string): number | null {
    const values = this.getHistory(metricName);
    return values.length ? Math.min(...values) : null;
  }

  getMaximum(metricName: string): number | null {
    const values = this.getHistory(metricName);
    return values.length ? Math.max(...values) : null;
  }

  exportCsv(): void {
    const rows = this.filteredMetrics().map(metric => [
      metric.metricName,
      metric.value.toString(),
      metric.unit ?? '',
      metric.timestamp,
      this.getMinimum(metric.metricName)?.toString() ?? '',
      this.getMaximum(metric.metricName)?.toString() ?? '',
      this.getAverage(metric.metricName)?.toFixed(2) ?? ''
    ]);
    const csv = [
      ['Metric', 'Value', 'Unit', 'Updated', 'Minimum', 'Maximum', 'Average'],
      ...rows
    ].map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metrics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private appendHistory(metric: MetricData): void {
    const history = { ...this.metricHistory() };
    history[metric.metricName] = [
      ...(history[metric.metricName] ?? []),
      metric.value
    ].slice(-this.maxStoredPoints);
    this.metricHistory.set(history);
    localStorage.setItem(this.historyStorageKey, JSON.stringify(history));
  }

  private loadHistory(): void {
    try {
      const savedHistory = localStorage.getItem(this.historyStorageKey);
      if (savedHistory) {
        this.metricHistory.set(JSON.parse(savedHistory) as Record<string, number[]>);
      }
    } catch {
      localStorage.removeItem(this.historyStorageKey);
    }
  }
}
