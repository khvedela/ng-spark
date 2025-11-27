import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebounceFieldComponent } from './debounce-field';

describe('DebounceFieldComponent', () => {
  let component: DebounceFieldComponent;
  let fixture: ComponentFixture<DebounceFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebounceFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DebounceFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
