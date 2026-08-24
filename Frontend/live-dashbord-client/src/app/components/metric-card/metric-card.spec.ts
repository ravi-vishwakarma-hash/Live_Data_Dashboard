import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricCard } from './metric-card';

describe('MetricCard', () => {
  let component: MetricCard;
  let fixture: ComponentFixture<MetricCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
