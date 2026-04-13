import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveAiComponent } from './live-ai.component';

describe('LiveAiComponent', () => {
  let component: LiveAiComponent;
  let fixture: ComponentFixture<LiveAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveAiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
