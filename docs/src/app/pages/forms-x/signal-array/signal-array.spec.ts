import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalArrayComponent } from './signal-array';

describe('SignalArrayComponent', () => {
  let component: SignalArrayComponent;
  let fixture: ComponentFixture<SignalArrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalArrayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
