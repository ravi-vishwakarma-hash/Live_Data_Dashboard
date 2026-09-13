import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveChartComponent } from './live-chart';

describe('LiveChartComponent', () => {
  let component: LiveChartComponent;
  let fixture: ComponentFixture<LiveChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
