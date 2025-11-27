import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebounceFieldDirective } from './debounce-field.directive';

@Component({
  template: `
    <input
      [debounceField]="testSignal"
      [debounceTime]="debounceMs"
      [transform]="transformFn"
    />
  `,
  standalone: true,
  imports: [DebounceFieldDirective]
})
class TestComponent {
  testSignal = signal<string>('');
  debounceMs = 300;
  transformFn?: (val: string) => string;
}

describe('DebounceFieldDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent]
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    inputElement = fixture.nativeElement.querySelector('input');
    fixture.detectChanges();
  });

  it('should create the directive', () => {
    expect(inputElement).toBeTruthy();
  });

  describe('Model to View Sync', () => {
    it('should update input value when signal changes', fakeAsync(() => {
      component.testSignal.set('new value');
      fixture.detectChanges();
      tick();

      expect(inputElement.value).toBe('new value');
    }));

    it('should handle null values', fakeAsync(() => {
      component.testSignal.set(null as any);
      fixture.detectChanges();
      tick();

      expect(inputElement.value).toBe('');
    }));

    it('should handle undefined values', fakeAsync(() => {
      component.testSignal.set(undefined as any);
      fixture.detectChanges();
      tick();

      expect(inputElement.value).toBe('');
    }));

    it('should not update input if value is the same', fakeAsync(() => {
      inputElement.value = 'same value';
      component.testSignal.set('same value');
      fixture.detectChanges();
      tick();

      expect(inputElement.value).toBe('same value');
    }));
  });

  describe('View to Model Sync (Debounced)', () => {
    it('should update signal after debounce time on input event', fakeAsync(() => {
      inputElement.value = 'typed value';
      inputElement.dispatchEvent(new Event('input'));

      expect(component.testSignal()).toBe('');

      tick(300);

      expect(component.testSignal()).toBe('typed value');
    }));

    it('should respect custom debounce time', fakeAsync(() => {
      // Need to set debounce time before fixture is created/initialized
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TestComponent]
      });

      const customFixture = TestBed.createComponent(TestComponent);
      const customComponent = customFixture.componentInstance;
      const customInput: HTMLInputElement = customFixture.nativeElement.querySelector('input');

      customComponent.debounceMs = 500;
      customFixture.detectChanges();

      customInput.value = 'custom debounce';
      customInput.dispatchEvent(new Event('input'));

      tick(300);
      expect(customComponent.testSignal()).toBe('');

      tick(200);
      expect(customComponent.testSignal()).toBe('custom debounce');
    }));

    it('should debounce multiple rapid inputs', fakeAsync(() => {
      inputElement.value = 'a';
      inputElement.dispatchEvent(new Event('input'));
      tick(100);

      inputElement.value = 'ab';
      inputElement.dispatchEvent(new Event('input'));
      tick(100);

      inputElement.value = 'abc';
      inputElement.dispatchEvent(new Event('input'));

      expect(component.testSignal()).toBe('');

      tick(300);

      expect(component.testSignal()).toBe('abc');
    }));

    it('should not update signal if value is the same', fakeAsync(() => {
      component.testSignal.set('existing');
      fixture.detectChanges();
      tick();

      inputElement.value = 'existing';
      inputElement.dispatchEvent(new Event('input'));

      tick(300);

      expect(component.testSignal()).toBe('existing');
    }));
  });

  describe('Blur Event Handling', () => {
    it('should update signal immediately on blur without debounce', fakeAsync(() => {
      inputElement.value = 'blur value';
      inputElement.dispatchEvent(new Event('blur'));

      expect(component.testSignal()).toBe('blur value');
    }));

    it('should flush pending debounced value on blur', fakeAsync(() => {
      inputElement.value = 'typing';
      inputElement.dispatchEvent(new Event('input'));

      tick(100);

      inputElement.value = 'final value';
      inputElement.dispatchEvent(new Event('blur'));

      expect(component.testSignal()).toBe('final value');
    }));
  });

  describe('Transform Function', () => {
    it('should apply transform function when provided', fakeAsync(() => {
      component.transformFn = (val: string) => val.toUpperCase();
      fixture.detectChanges();

      inputElement.value = 'lowercase';
      inputElement.dispatchEvent(new Event('input'));

      tick(300);

      expect(component.testSignal()).toBe('LOWERCASE');
    }));

    it('should trim whitespace with transform', fakeAsync(() => {
      component.transformFn = (val: string) => val.trim();
      fixture.detectChanges();

      inputElement.value = '  trimmed  ';
      inputElement.dispatchEvent(new Event('input'));

      tick(300);

      expect(component.testSignal()).toBe('trimmed');
    }));

    it('should work without transform function', fakeAsync(() => {
      inputElement.value = 'no transform';
      inputElement.dispatchEvent(new Event('input'));

      tick(300);

      expect(component.testSignal()).toBe('no transform');
    }));
  });

  describe('Textarea Support', () => {
    @Component({
      template: `
        <textarea [debounceField]="textareaSignal"></textarea>
      `,
      standalone: true,
      imports: [DebounceFieldDirective]
    })
    class TextareaTestComponent {
      textareaSignal = signal<string>('');
    }

    it('should work with textarea elements', fakeAsync(() => {
      const textareaFixture = TestBed.createComponent(TextareaTestComponent);
      const textareaComponent = textareaFixture.componentInstance;
      const textarea: HTMLTextAreaElement = textareaFixture.nativeElement.querySelector('textarea');

      textareaFixture.detectChanges();

      textarea.value = 'textarea content';
      textarea.dispatchEvent(new Event('input'));

      tick(300);

      expect(textareaComponent.textareaSignal()).toBe('textarea content');
    }));
  });

  describe('Cleanup', () => {
    it('should unsubscribe on destroy', fakeAsync(() => {
      inputElement.value = 'test';
      inputElement.dispatchEvent(new Event('input'));

      fixture.destroy();

      tick(300);

      expect(component.testSignal()).toBe('');
    }));
  });
});