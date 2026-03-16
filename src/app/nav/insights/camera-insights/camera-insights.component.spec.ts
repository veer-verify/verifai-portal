import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraInsightsComponent } from './camera-insights.component';

describe('CameraInsightsComponent', () => {
  let component: CameraInsightsComponent;
  let fixture: ComponentFixture<CameraInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraInsightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
