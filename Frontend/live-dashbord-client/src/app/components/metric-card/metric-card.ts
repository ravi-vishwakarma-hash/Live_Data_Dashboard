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
}
