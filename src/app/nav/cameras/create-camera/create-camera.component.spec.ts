import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCameraComponent } from './create-camera.component';

describe('CreateCameraComponent', () => {
  let component: CreateCameraComponent;
  let fixture: ComponentFixture<CreateCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCameraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
