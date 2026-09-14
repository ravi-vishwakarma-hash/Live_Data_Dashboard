import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { LiveChartComponent } from '../live-chart/live-chart';
import { MetricCard } from '../metric-card/metric-card';
import { MetricData } from '../../models/metric-data';
import { MetricsService } from '../../services/metrics';
import { SignalrService } from '../../services/signalr';

interface AlertRecord {
  metricName: string;
  value: number;
  severity: 'warning' | 'critical';
  timestamp: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MetricCard, LiveChartComponent],
  templateUrl: './dashbord.html',
  styleUrls: ['./dashbord.scss']
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly historyStorageKey = 'live-dashboard-metric-history';
  private readonly alertStorageKey = 'live-dashboard-alert-history';
  private readonly layoutStorageKey = 'live-dashboard-hidden-metrics';
  private readonly themeStorageKey = 'live-dashboard-theme';
  private readonly maxStoredPoints = 120;
  private readonly previousValues = new Map<string, number>();
  private readonly lastValues = new Map<string, number>();

  metrics = signal<MetricData[]>([]);
  metricHistory = signal<Record<string, number[]>>({});
  alertHistory = signal<AlertRecord[]>([]);
  hiddenMetrics = signal<string[]>([]);
  selectedMetric = signal<MetricData | null>(null);
  isCustomizing = signal(false);
  theme = signal<'dark' | 'light'>('dark');
  searchTerm = signal('');
  sortBy = signal<'name' | 'value' | 'updated'>('name');
  historyPoints = signal(30);
  isLoading = false;
  errorMessage: string | null = null;
  connectionState: 'connected' | 'reconnecting' | 'disconnected' = 'disconnected';

  filteredMetrics = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const filtered = this.metrics().filter(metric =>
      !this.hiddenMetrics().includes(metric.metricName) &&
      metric.metricName.toLowerCase().includes(searchTerm)
    );

    return [...filtered].sort((first, second) => {
      switch (this.sortBy()) {
        case 'value': return second.value - first.value;
        case 'updated': return new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime();
        default: return first.metricName.localeCompare(second.metricName);
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
    this.loadPreferences();
    this.signalrService.startConnection();
    this.metricsService.loadInitialSnapshot();

    this.metricsService.metrics$.subscribe(data => {
      data.forEach(metric => {
        this.appendHistory(metric);
        const previousValue = this.lastValues.get(metric.metricName);
        if (previousValue !== undefined && previousValue !== metric.value) {
          this.previousValues.set(metric.metricName, previousValue);
        }
        this.trackAlert(metric);
        this.lastValues.set(metric.metricName, metric.value);
      });
      this.metrics.set(data);
    });
    this.metricsService.loading$.subscribe(isLoading => this.isLoading = isLoading);
    this.metricsService.error$.subscribe(error => this.errorMessage = error);
    this.signalrService.connectionState$.subscribe(state => this.connectionState = state);
  }

  ngOnDestroy(): void {
    this.signalrService.stopConnection();
  }

  getPreviousValue(metricName: string): number | null { return this.previousValues.get(metricName) ?? null; }

  retry(): void {
    this.errorMessage = null;
    this.signalrService.reconnect();
    this.metricsService.loadInitialSnapshot();
  }

  updateSearch(event: Event): void { this.searchTerm.set((event.target as HTMLInputElement).value); }

  updateSort(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as 'name' | 'value' | 'updated');
  }

  updateHistory(event: Event): void { this.historyPoints.set(Number((event.target as HTMLSelectElement).value)); }

  getHistory(metricName: string): number[] { return this.metricHistory()[metricName] ?? []; }

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

  openDetails(metric: MetricData): void { this.selectedMetric.set(metric); }

  closeDetails(): void { this.selectedMetric.set(null); }

  toggleCustomization(): void { this.isCustomizing.update(value => !value); }

  toggleMetricVisibility(metricName: string): void {
    const hidden = this.hiddenMetrics().includes(metricName)
      ? this.hiddenMetrics().filter(name => name !== metricName)
      : [...this.hiddenMetrics(), metricName];
    this.hiddenMetrics.set(hidden);
    localStorage.setItem(this.layoutStorageKey, JSON.stringify(hidden));
  }

  toggleTheme(): void {
    const nextTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(nextTheme);
    localStorage.setItem(this.themeStorageKey, nextTheme);
  }

  requestNotifications(): void {
    if ('Notification' in window) Notification.requestPermission();
  }

  exportCsv(): void {
    const rows = this.filteredMetrics().map(metric => [
      metric.metricName, metric.value.toString(), metric.unit ?? '', metric.timestamp,
      this.getMinimum(metric.metricName)?.toString() ?? '',
      this.getMaximum(metric.metricName)?.toString() ?? '',
      this.getAverage(metric.metricName)?.toFixed(2) ?? ''
    ]);
    const csv = [['Metric', 'Value', 'Unit', 'Updated', 'Minimum', 'Maximum', 'Average'], ...rows]
      .map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `metrics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private appendHistory(metric: MetricData): void {
    const history = { ...this.metricHistory() };
    history[metric.metricName] = [...(history[metric.metricName] ?? []), metric.value].slice(-this.maxStoredPoints);
    this.metricHistory.set(history);
    localStorage.setItem(this.historyStorageKey, JSON.stringify(history));
  }

  private trackAlert(metric: MetricData): void {
    const severity = metric.criticalThreshold !== undefined && metric.value >= metric.criticalThreshold
      ? 'critical'
      : metric.warningThreshold !== undefined && metric.value >= metric.warningThreshold ? 'warning' : null;
    if (!severity) return;
    const lastAlert = this.alertHistory().find(alert => alert.metricName === metric.metricName);
    if (lastAlert?.severity === severity && lastAlert.value === metric.value) return;

    const alert: AlertRecord = { metricName: metric.metricName, value: metric.value, severity, timestamp: metric.timestamp };
    const history = [alert, ...this.alertHistory()].slice(0, 20);
    this.alertHistory.set(history);
    localStorage.setItem(this.alertStorageKey, JSON.stringify(history));
    if (severity === 'critical' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`Critical alert: ${metric.metricName}`, {
        body: `${metric.value}${metric.unit ? ` ${metric.unit}` : ''} exceeded the critical threshold.`
      });
    }
  }

  private loadHistory(): void {
    try {
      const savedHistory = localStorage.getItem(this.historyStorageKey);
      if (savedHistory) this.metricHistory.set(JSON.parse(savedHistory) as Record<string, number[]>);
    } catch { localStorage.removeItem(this.historyStorageKey); }
  }

  private loadPreferences(): void {
    try {
      const savedAlerts = localStorage.getItem(this.alertStorageKey);
      const savedHiddenMetrics = localStorage.getItem(this.layoutStorageKey);
      const savedTheme = localStorage.getItem(this.themeStorageKey);
      if (savedAlerts) this.alertHistory.set(JSON.parse(savedAlerts) as AlertRecord[]);
      if (savedHiddenMetrics) this.hiddenMetrics.set(JSON.parse(savedHiddenMetrics) as string[]);
      if (savedTheme === 'light' || savedTheme === 'dark') this.theme.set(savedTheme);
    } catch {
      localStorage.removeItem(this.alertStorageKey);
      localStorage.removeItem(this.layoutStorageKey);
      localStorage.removeItem(this.themeStorageKey);
    }
  }
}