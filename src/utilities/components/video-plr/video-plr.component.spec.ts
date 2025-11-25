import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoPlrComponent } from './video-plr.component';

describe('VideoPlrComponent', () => {
  let component: VideoPlrComponent;
  let fixture: ComponentFixture<VideoPlrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoPlrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoPlrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
