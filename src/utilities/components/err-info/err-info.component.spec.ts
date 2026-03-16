import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrInfoComponent } from './err-info.component';

describe('ErrInfoComponent', () => {
  let component: ErrInfoComponent;
  let fixture: ComponentFixture<ErrInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrInfoComponent]
    });
    fixture = TestBed.createComponent(ErrInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
