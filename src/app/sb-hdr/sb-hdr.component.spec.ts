import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbHdrComponent } from './sb-hdr.component';

describe('SbHdrComponent', () => {
  let component: SbHdrComponent;
  let fixture: ComponentFixture<SbHdrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbHdrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbHdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
