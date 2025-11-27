import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsXGettingStartedComponent } from './getting-started';

describe('FormsXGettingStartedComponent', () => {
  let component: FormsXGettingStartedComponent;
  let fixture: ComponentFixture<FormsXGettingStartedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsXGettingStartedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormsXGettingStartedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
