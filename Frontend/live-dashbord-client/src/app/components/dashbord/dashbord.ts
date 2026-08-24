import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
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
  metrics = signal<MetricData[]>([]);
  connectionState: 'connected' | 'reconnecting' | 'disconnected' = 'disconnected';

  constructor(
    private metricsService: MetricsService,
    private signalrService: SignalrService
  ) {}

  ngOnInit(): void {
    this.signalrService.startConnection();
    this.metricsService.loadInitialSnapshot();

    this.metricsService.metrics$
    .subscribe(data => {
      // console.log('Received metrics update:', data);
      this.metrics.update(() => data);
    });

    this.signalrService.connectionState$
    .subscribe(state => {
      this.connectionState = state;
    });
  }

  ngOnDestroy(): void {
    this.signalrService.stopConnection();
  }
}
