import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metric-card.html',
  styleUrls: ['./metric-card.scss']
})
export class MetricCard {
  @Input() name = '';
  @Input() value = 0;
  @Input() timestamp = '';
  @Input() unit = '';
  @Input() previousValue: number | null = null;
  @Input() minimum: number | null = null;
  @Input() maximum: number | null = null;
  @Input() average: number | null = null;
  @Input() warningThreshold?: number;
  @Input() criticalThreshold?: number;

  get trendPercent(): number | null {
    if (this.previousValue === null || this.previousValue === 0) {
      return null;
    }
    return ((this.value - this.previousValue) / Math.abs(this.previousValue)) * 100;
  }

  get status(): 'normal' | 'warning' | 'critical' {
    if (this.criticalThreshold !== undefined && this.value >= this.criticalThreshold) {
      return 'critical';
    }
    if (this.warningThreshold !== undefined && this.value >= this.warningThreshold) {
      return 'warning';
    }
    return 'normal';
  }
}
