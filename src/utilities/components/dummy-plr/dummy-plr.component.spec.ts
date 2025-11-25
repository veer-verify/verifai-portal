import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DummyPlrComponent } from './dummy-plr.component';

describe('DummyPlrComponent', () => {
  let component: DummyPlrComponent;
  let fixture: ComponentFixture<DummyPlrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DummyPlrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DummyPlrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
