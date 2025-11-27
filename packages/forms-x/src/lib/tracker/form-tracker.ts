import { computed, Signal, signal, WritableSignal } from '@angular/core';

/**
 * Polyfill for structuredClone if not available (Node < 17 or older browsers)
 */
function deepClone<T>(obj: T): T {
  // Use native structuredClone if available
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj);
  }

  // Fallback for older environments
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}

/**
 * Utility to track the "Dirty" state of a signal model by comparing it
 * against a baseline "Pristine" snapshot.
 */
export class FormTracker<T extends object> {
  private readonly _baseline = signal<T | null>(null);
  private readonly _source: WritableSignal<T>;

  /**
   * @param source The writable signal that holds your form state.
   */
  constructor(source: WritableSignal<T>) {
    this._source = source;
    // Initialize baseline immediately
    this.commit();
  }

  /**
   * Returns true if the current source value differs from the baseline.
   */
  readonly isDirty: Signal<boolean> = computed(() => {
    const current = this._source();
    const base = this._baseline();
    return !this.isEqual(current, base);
  });

  /**
   * Returns an object containing ONLY the fields that have changed.
   * Useful for sending PATCH requests with only modified data.
   */
  readonly dirtyFields: Signal<Partial<T>> = computed(() => {
    return this.getDiff(this._baseline(), this._source());
  });

  /**
   * Updates the baseline snapshot to match the current signal value.
   * Call this after a successful API save or when loading initial data.
   */
  commit(): void {
    // Use deepClone to break references so mutations don't leak to the baseline.
    this._baseline.set(deepClone(this._source()));
  }

  /**
   * Reverts the source signal back to the baseline snapshot.
   */
  reset(): void {
    const base = this._baseline();
    if (base) {
      this._source.set(deepClone(base));
    }
  }

  // ==========================================
  // Internal Helpers (Simple Deep Equality)
  // ==========================================

  private isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return a === b;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!this.isEqual(a[key], b[key])) return false;
    }

    return true;
  }

  private getDiff(base: any, current: any): any {
    const diff: any = {};
    if (!base || !current) return diff;

    Object.keys(current).forEach(key => {
      const val1 = base[key];
      const val2 = current[key];

      if (!this.isEqual(val1, val2)) {
        // If it's an object/array, we could recurse,
        // but for form payloads, usually sending the whole nested object is safer.
        // You can expand recursion here if needed.
        diff[key] = val2;
      }
    });
    return diff;
  }
}