import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { signal, Injector } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { SparkAsyncValidator, createAsyncValidator } from './async-validator';

describe('SparkAsyncValidator', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);
  });

  describe('Initialization', () => {
    it('should create validator instance', fakeAsync(() => {
      const source = signal('test');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of(null),
        injector
      });

      expect(validator).toBeTruthy();
      expect(validator.error).toBeDefined();
      expect(validator.isLoading).toBeDefined();
      expect(validator.status).toBeDefined();
    }));

    it('should use default debounce time of 300ms', fakeAsync(() => {
      const source = signal('test');
      const validateFn = jest.fn().mockReturnValue(of(null));

      new SparkAsyncValidator({
        source,
        validate: validateFn,
        injector
      });

      tick(300);
      flush();

      expect(validateFn).toHaveBeenCalled();
    }));

    it('should use custom debounce time', fakeAsync(() => {
      const source = signal('test');
      const validateFn = jest.fn().mockReturnValue(of(null));

      new SparkAsyncValidator({
        source,
        validate: validateFn,
        debounce: 500,
        injector
      });

      tick(300);
      expect(validateFn).not.toHaveBeenCalled();

      tick(200);
      flush();

      expect(validateFn).toHaveBeenCalled();
    }));
  });

  describe('Validation with Observable', () => {
    it('should validate with Observable returning null for valid value', fakeAsync(() => {
      const source = signal('valid');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of(null),
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toBeNull();
    }));

    it('should validate with Observable returning error for invalid value', fakeAsync(() => {
      const source = signal('invalid');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of('Error: Invalid value'),
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toBe('Error: Invalid value');
    }));

    it('should handle Observable with delay', fakeAsync(() => {
      const source = signal('test');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of('Delayed error').pipe(delay(100)),
        injector
      });

      tick(300);
      expect(validator.isLoading()).toBe(true);

      tick(100);
      flush();

      expect(validator.isLoading()).toBe(false);
      expect(validator.error()).toBe('Delayed error');
    }));
  });

  describe('Validation with Promise', () => {
    it('should validate with Promise returning null for valid value', fakeAsync(() => {
      const source = signal('valid');
      const validator = new SparkAsyncValidator({
        source,
        validate: async (val) => null,
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toBeNull();
    }));

    it('should validate with Promise returning error for invalid value', fakeAsync(() => {
      const source = signal('invalid');
      const validator = new SparkAsyncValidator({
        source,
        validate: async (val) => 'Error: Invalid value',
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toBe('Error: Invalid value');
    }));

    it('should handle Promise with delay', fakeAsync(() => {
      const source = signal('test');
      const validator = new SparkAsyncValidator({
        source,
        validate: async (val) => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'Delayed error';
        },
        injector
      });

      tick(300);
      expect(validator.isLoading()).toBe(true);

      tick(100);
      flush();

      expect(validator.isLoading()).toBe(false);
      expect(validator.error()).toBe('Delayed error');
    }));
  });

  describe('Debouncing Behavior', () => {
    it('should debounce rapid value changes', fakeAsync(() => {
      const source = signal('');
      const validateFn = jest.fn().mockReturnValue(of(null));

      new SparkAsyncValidator({
        source,
        validate: validateFn,
        debounce: 300,
        injector
      });

      source.set('a');
      tick(100);

      source.set('ab');
      tick(100);

      source.set('abc');
      tick(100);

      expect(validateFn).not.toHaveBeenCalled();

      tick(200);
      flush();

      expect(validateFn).toHaveBeenCalledTimes(1);
      expect(validateFn).toHaveBeenCalledWith('abc');
    }));

    it('should not trigger validation for duplicate values', fakeAsync(() => {
      const source = signal('test');
      const validateFn = jest.fn().mockReturnValue(of(null));

      new SparkAsyncValidator({
        source,
        validate: validateFn,
        injector
      });

      tick(300);
      flush();
      validateFn.mockClear();

      source.set('test');
      tick(300);
      flush();

      expect(validateFn).not.toHaveBeenCalled();
    }));

    it('should trigger validation after debounce for each unique value', fakeAsync(() => {
      const source = signal('first');
      const validateFn = jest.fn().mockReturnValue(of(null));

      new SparkAsyncValidator({
        source,
        validate: validateFn,
        debounce: 300,
        injector
      });

      tick(300);
      flush();

      expect(validateFn).toHaveBeenCalledWith('first');

      source.set('second');
      tick(300);
      flush();

      expect(validateFn).toHaveBeenCalledWith('second');
      expect(validateFn).toHaveBeenCalledTimes(2);
    }));
  });

  describe('Empty/Null/Undefined Values', () => {
    it('should return null for empty string', fakeAsync(() => {
      const source = signal('');
      const validateFn = jest.fn().mockReturnValue(of('Error'));

      const validator = new SparkAsyncValidator({
        source,
        validate: validateFn,
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toBeNull();
      expect(validateFn).not.toHaveBeenCalled();
    }));

    it('should return null for null value', fakeAsync(() => {
      const source = signal(null as any);
      const validateFn = jest.fn().mockReturnValue(of('Error'));

      const validator = new SparkAsyncValidator({
        source,
        validate: validateFn,
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toBeNull();
      expect(validateFn).not.toHaveBeenCalled();
    }));

    it('should return null for undefined value', fakeAsync(() => {
      const source = signal(undefined as any);
      const validateFn = jest.fn().mockReturnValue(of('Error'));

      const validator = new SparkAsyncValidator({
        source,
        validate: validateFn,
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toBeNull();
      expect(validateFn).not.toHaveBeenCalled();
    }));

    it('should validate after changing from empty to non-empty', fakeAsync(() => {
      const source = signal('');
      const validateFn = jest.fn().mockReturnValue(of('Error'));

      const validator = new SparkAsyncValidator({
        source,
        validate: validateFn,
        injector
      });

      tick(300);
      flush();

      expect(validateFn).not.toHaveBeenCalled();

      source.set('value');
      tick(300);
      flush();

      expect(validateFn).toHaveBeenCalledWith('value');
      expect(validator.error()).toBe('Error');
    }));
  });

  describe('Loading State', () => {
    it('should be true while validation is pending', fakeAsync(() => {
      const source = signal('test');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of(null).pipe(delay(100)),
        injector
      });

      tick(300);

      expect(validator.isLoading()).toBe(true);

      tick(100);
      flush();

      expect(validator.isLoading()).toBe(false);
    }));

    it('should be false after validation completes', fakeAsync(() => {
      const source = signal('test');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of(null),
        injector
      });

      tick(300);
      flush();

      expect(validator.isLoading()).toBe(false);
    }));

    it('should transition from false to true to false', fakeAsync(() => {
      const source = signal('test');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of(null).pipe(delay(100)),
        injector
      });

      expect(validator.isLoading()).toBe(false);

      tick(300);
      expect(validator.isLoading()).toBe(true);

      tick(100);
      flush();

      expect(validator.isLoading()).toBe(false);
    }));
  });

  describe('Error State', () => {
    it('should update error signal when validation fails', fakeAsync(() => {
      const source = signal('invalid');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of('Validation error'),
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toBe('Validation error');
    }));

    it('should clear error when validation passes', fakeAsync(() => {
      const source = signal('invalid');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of(val === 'valid' ? null : 'Error'),
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toBe('Error');

      source.set('valid');
      tick(300);
      flush();

      expect(validator.error()).toBeNull();
    }));

    it('should handle different error types', fakeAsync(() => {
      interface CustomError {
        field: string;
        message: string;
      }

      const source = signal('test');
      const validator = new SparkAsyncValidator<string, CustomError>({
        source,
        validate: (val) => of({ field: 'username', message: 'Already taken' }),
        injector
      });

      tick(300);
      flush();

      expect(validator.error()).toEqual({
        field: 'username',
        message: 'Already taken'
      });
    }));
  });

  describe('asValidator Method', () => {
    it('should return null when validation passes', fakeAsync(() => {
      const source = signal('valid');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of(null),
        injector
      });

      tick(300);
      flush();

      const validatorFn = validator.asValidator();
      expect(validatorFn()).toBeNull();
    }));

    it('should return error object when validation fails', fakeAsync(() => {
      const source = signal('invalid');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of('Validation error'),
        injector
      });

      tick(300);
      flush();

      const validatorFn = validator.asValidator();
      expect(validatorFn()).toEqual({ asyncError: 'Validation error' });
    }));

    it('should return null while loading', fakeAsync(() => {
      const source = signal('test');
      const validator = new SparkAsyncValidator({
        source,
        validate: (val) => of('Error').pipe(delay(100)),
        injector
      });

      tick(300);

      const validatorFn = validator.asValidator();
      expect(validatorFn()).toBeNull();

      tick(100);
      flush();

      expect(validatorFn()).toEqual({ asyncError: 'Error' });
    }));
  });

  describe('createAsyncValidator Factory Function', () => {
    it('should create a validator instance', fakeAsync(() => {
      const source = signal('test');
      const validator = createAsyncValidator({
        source,
        validate: (val) => of(null),
        injector
      });

      expect(validator).toBeInstanceOf(SparkAsyncValidator);
    }));

    it('should work with all configuration options', fakeAsync(() => {
      const source = signal('ab');
      const validator = createAsyncValidator({
        source,
        validate: (val) => of(val.length < 3 ? 'Too short' : null),
        debounce: 500,
        injector
      });

      tick(500);
      flush();

      expect(validator.error()).toBe('Too short');

      source.set('valid');
      tick(500);
      flush();

      expect(validator.error()).toBeNull();
    }));
  });

  describe('Real-world Scenarios', () => {
    it('should validate email uniqueness', fakeAsync(() => {
      const existingEmails = ['test@example.com', 'user@example.com'];
      const emailSignal = signal('');

      const validator = createAsyncValidator({
        source: emailSignal,
        validate: async (email) => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return existingEmails.includes(email) ? 'Email already exists' : null;
        },
        injector
      });

      emailSignal.set('test@example.com');
      tick(300);
      tick(50);
      flush();

      expect(validator.error()).toBe('Email already exists');

      emailSignal.set('new@example.com');
      tick(300);
      tick(50);
      flush();

      expect(validator.error()).toBeNull();
    }));

    it('should validate username availability with API simulation', fakeAsync(() => {
      const usernameSignal = signal('');

      const validator = createAsyncValidator({
        source: usernameSignal,
        validate: (username) => {
          return of(username).pipe(
            delay(100),
            map(u => u === 'taken' ? { available: false, message: 'Username taken' } : null)
          );
        },
        debounce: 400,
        injector
      });

      usernameSignal.set('taken');
      tick(400);
      tick(100);
      flush();

      expect(validator.error()).toEqual({
        available: false,
        message: 'Username taken'
      });

      usernameSignal.set('available');
      tick(400);
      tick(100);
      flush();

      expect(validator.error()).toBeNull();
    }));

    it('should handle rapid typing with debounce', fakeAsync(() => {
      const searchSignal = signal('');
      const validateFn = jest.fn().mockReturnValue(of(null));

      createAsyncValidator({
        source: searchSignal,
        validate: validateFn,
        debounce: 300,
        injector
      });

      'test query'.split('').forEach((char, index) => {
        searchSignal.update(val => val + char);
        tick(50);
      });

      expect(validateFn).not.toHaveBeenCalled();

      tick(300);
      flush();

      expect(validateFn).toHaveBeenCalledTimes(1);
      expect(validateFn).toHaveBeenCalledWith('test query');
    }));
  });
});

function map<T, R>(fn: (value: T) => R) {
  return (source: Observable<T>) => new Observable<R>(subscriber => {
    return source.subscribe({
      next: (value) => subscriber.next(fn(value)),
      error: (err) => subscriber.error(err),
      complete: () => subscriber.complete()
    });
  });
}
