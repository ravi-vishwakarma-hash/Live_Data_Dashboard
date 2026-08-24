import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js/auto';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-live-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './live-chart.html',
  styleUrls: ['./live-chart.scss']
})
export class LiveChartComponent implements OnChanges {
  @Input() label = '';
  @Input() value = 0;
  @Input() timestamp = '';

  private readonly maxPoints = 30;

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: this.label,
        borderColor: '#3f8cff',
        backgroundColor: 'rgba(63, 140, 255, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 0
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    animation: { duration: 300 },
    scales: {
      x: { display: false },
      y: { beginAtZero: false }
    },
    plugins: {
      legend: { display: false }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !changes['value'].firstChange) {
      this.addDataPoint();
    } else if (changes['value'] && changes['value'].firstChange) {
      this.addDataPoint();
    }
  }

  private addDataPoint(): void {
    const labels = this.lineChartData.labels as string[];
    const dataset = this.lineChartData.datasets[0].data as number[];

    labels.push(new Date(this.timestamp).toLocaleTimeString());
    dataset.push(this.value);

    if (labels.length > this.maxPoints) {
      labels.shift();
      dataset.shift();
    }

    // Reassign to trigger change detection in ng2-charts
    this.lineChartData = {
      ...this.lineChartData,
      labels: [...labels],
      datasets: [{ ...this.lineChartData.datasets[0], data: [...dataset] }]
    };
  }
}
