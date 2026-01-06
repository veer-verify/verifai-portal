import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NvrComponent } from './nvr.component';

describe('NvrComponent', () => {
  let component: NvrComponent;
  let fixture: ComponentFixture<NvrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NvrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NvrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
