import {
  Signal,
  ResourceStatus,
  computed,
  Injector,
} from '@angular/core';
import { toObservable, toSignal, rxResource } from '@angular/core/rxjs-interop';
import { Observable, of, from } from 'rxjs'; // <--- Import 'from'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Configuration interface for asynchronous validators.
 *
 * This interface defines the structure required to configure an asynchronous
 * validation process, including the source of the value to be validated,
 * the validation logic, and optional parameters to customize the behavior.
 *
 * @template T The type of the value being validated.
 * @template E The type of the validation error or result.
 */
export interface AsyncValidatorConfig<T, E> {
  source: Signal<T>;
  validate: (value: T) => Observable<E | null> | Promise<E | null>;
  debounce?: number;
  injector?: Injector;
}

/**
 * Represents an asynchronous validator class used to validate input data with configurable
 * debounce time and supports reactive programming concepts.
 *
 * This validator leverages signals and observables to monitor the validation process, manage
 * loading states, and handle errors. It allows easy integration into reactive workflows and
 * robust asynchronous validations.
 *
 * @template T The type of value being validated.
 * @template E The type of error object returned when validation fails (defaults to `unknown`).
 */
export class SparkAsyncValidator<T, E = unknown> {
  readonly error: Signal<E | null>;
  readonly isLoading: Signal<boolean>;
  readonly status: Signal<ResourceStatus>;

  constructor(private config: AsyncValidatorConfig<T, E>) {
    const injector = config.injector;

    const debouncedSource$ = toObservable(config.source, { injector }).pipe(
      debounceTime(config.debounce ?? 300),
      distinctUntilChanged()
    );

    const debouncedSignal = toSignal(debouncedSource$, {
      injector,
    });

    const resource = rxResource<E | null, T | undefined>({
      params: () => debouncedSignal(),
      stream: ({ params: value }) => {
        if (value === '' || value === null || value === undefined) {
          return of(null);
        }

        const result = config.validate(value);

        if (result instanceof Observable) {
          return result;
        }
        return from(result);
      },
      injector,
    });

    this.status = computed(() => resource.status());
    this.isLoading = computed(() => resource.isLoading());
    this.error = computed(() => resource.value() ?? null);
  }

  asValidator() {
    return () => {
      if (this.isLoading()) return null;
      const err = this.error();
      return err ? { asyncError: err } : null;
    };
  }
}

/**
 * Creates an instance of `SparkAsyncValidator` using the provided configuration.
 *
 * @param {AsyncValidatorConfig<T, E>} config - The configuration object for the async validator, specifying validation logic and other options.
 * @return {SparkAsyncValidator<T, E>} A new instance of `SparkAsyncValidator` configured with the provided parameters.
 */
export function createAsyncValidator<T, E = string>(
  config: AsyncValidatorConfig<T, E>
): SparkAsyncValidator<T, E> {
  return new SparkAsyncValidator(config);
}