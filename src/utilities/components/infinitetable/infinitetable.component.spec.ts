import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfinitetableComponent } from './infinitetable.component';

describe('InfinitetableComponent', () => {
  let component: InfinitetableComponent;
  let fixture: ComponentFixture<InfinitetableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfinitetableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfinitetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
