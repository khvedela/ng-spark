import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  WritableSignal,
  effect,
  inject,
  Renderer2
} from '@angular/core';
import { Subscription, fromEvent, merge } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

@Directive({
  selector: 'input[debounceField], textarea[debounceField]',
  standalone: true
})
export class DebounceFieldDirective<T = unknown> implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private sub?: Subscription;

  /**
   * The Source of Truth: The signal to bind to.
   */
  @Input({ required: true, alias: 'debounceField' })
  field!: WritableSignal<T>;

  /**
   * Debounce duration in milliseconds.
   * @default 300
   */
  @Input()
  debounceTime = 300;

  /**
   * Optional: Transform value before writing to signal (e.g., trim strings)
   */
  @Input()
  transform?: (val: string) => T;

  constructor() {
    // 1. Model -> View (One-way sync)
    // When the signal changes programmatically (or from server), update the input.
    effect(() => {
      const val = this.field();
      const currentInputValue = this.el.nativeElement.value;

      // Only write to DOM if values differ to avoid cursor jumping
      // or infinite loops during typing.
      // We convert both to string for comparison safety.
      if (String(val ?? '') !== currentInputValue) {
        this.renderer.setProperty(this.el.nativeElement, 'value', val ?? '');
      }
    });
  }

  ngOnInit() {
    const input$ = fromEvent(this.el.nativeElement, 'input').pipe(
      map((e: any) => e.target.value)
    );

    const blur$ = fromEvent(this.el.nativeElement, 'blur').pipe(
      map((e: any) => e.target.value)
    );

    // 2. View -> Model (Debounced write)
    this.sub = merge(
      // Strategy A: Input events are debounced
      input$.pipe(debounceTime(this.debounceTime)),
      // Strategy B: Blur events trigger IMMEDIATE update (flush)
      // This prevents "click save before debounce finishes" bugs
      blur$
    ).pipe(
      // Optimization: Don't write if the signal already has this value
      // (This prevents cyclic updates if the effect runs shortly after)
      filter(newValue => String(this.field() ?? '') !== newValue)
    ).subscribe(newValue => {
      this.writeToSignal(newValue);
    });
  }

  private writeToSignal(rawValue: string) {
    const finalValue = this.transform
      ? this.transform(rawValue)
      : (rawValue as unknown as T);

    this.field.set(finalValue);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}