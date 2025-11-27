import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsyncValidatorComponent } from './async-validator';

describe('AsyncValidatorComponent', () => {
  let component: AsyncValidatorComponent;
  let fixture: ComponentFixture<AsyncValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsyncValidatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AsyncValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
