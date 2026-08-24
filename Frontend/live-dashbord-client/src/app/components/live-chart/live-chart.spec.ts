import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveChart } from './live-chart';

describe('LiveChart', () => {
  let component: LiveChart;
  let fixture: ComponentFixture<LiveChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveChart],
    }).compileComponents();

    fixture = TestBed.createComponent(LiveChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
