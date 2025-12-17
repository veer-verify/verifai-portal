import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaDialogComponent } from './media-dialog.component';

describe('MediaDialogComponent', () => {
  let component: MediaDialogComponent;
  let fixture: ComponentFixture<MediaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
