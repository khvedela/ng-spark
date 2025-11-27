import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTrackerComponent } from './form-tracker';

describe('FormTrackerComponent', () => {
  let component: FormTrackerComponent;
  let fixture: ComponentFixture<FormTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTrackerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
