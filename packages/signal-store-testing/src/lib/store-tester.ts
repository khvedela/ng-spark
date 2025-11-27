/**
 * @ng-spark/signal-store-testing
 * Main SignalStoreTester implementation
 */

import { Signal, untracked, isSignal } from '@angular/core';
import { patchState } from '@ngrx/signals';

// Support both Jest and Vitest - expect is available globally in both environments
declare const expect: any;
import {
  SignalStoreTester,
  StoreState,
  ComputedSignalNames,
  MethodNames,
  MethodParameters,
  MethodReturnType,
  StoreTesterOptions,
  StateHistory,
  StateHistoryEntry,
  WaitCondition,
  WaitOptions,
} from './types';

/**
 * Default options for the store tester
 */
const DEFAULT_OPTIONS: Required<StoreTesterOptions> = {
  autoDetectChanges: true,
  recordHistory: false,
  errorMessages: {
    stateMatch: 'Expected state to match',
    computedMatch: 'Expected computed signal to match',
    methodCall: 'Error calling method',
  },
};

/**
 * Internal implementation of StateHistory
 */
class StateHistoryImpl<TState> implements StateHistory<TState> {
  private _states: StateHistoryEntry<TState>[] = [];
  private _currentIndex = 0;

  constructor(initialState: TState) {
    this._states.push({
      state: this.cloneState(initialState),
      timestamp: Date.now(),
      label: 'Initial state',
    });
  }

  get states(): ReadonlyArray<StateHistoryEntry<TState>> {
    return this._states;
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  get currentState(): TState {
    return this._states[this._currentIndex].state;
  }

  addState(state: TState, label?: string): void {
    // Remove any states after current index (branching)
    this._states = this._states.slice(0, this._currentIndex + 1);

    this._states.push({
      state: this.cloneState(state),
      timestamp: Date.now(),
      label,
    });

    this._currentIndex = this._states.length - 1;
  }

  goBack(): void {
    if (this._currentIndex > 0) {
      this._currentIndex--;
    }
  }

  goForward(): void {
    if (this._currentIndex < this._states.length - 1) {
      this._currentIndex++;
    }
  }

  goToIndex(index: number): void {
    if (index >= 0 && index < this._states.length) {
      this._currentIndex = index;
    }
  }

  reset(): void {
    this._currentIndex = 0;
  }

  clear(): void {
    const initial = this._states[0];
    this._states = [initial];
    this._currentIndex = 0;
  }

  private cloneState(state: TState): TState {
    return JSON.parse(JSON.stringify(state));
  }
}

/**
 * Main SignalStoreTester implementation
 */
class SignalStoreTesterImpl<TStore> implements SignalStoreTester<TStore> {
  private options: Required<StoreTesterOptions>;
  private history: StateHistoryImpl<StoreState<TStore>> | null = null;

  constructor(
    public readonly store: TStore,
    options?: StoreTesterOptions
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    if (this.options.recordHistory) {
      this.startRecording();
    }
  }

  get state(): StoreState<TStore> {
    const state: Record<string, unknown> = {};

    for (const key in this.store) {
      const value = this.store[key];

      // Use Angular's type guard to check if it's a signal
      if (isSignal(value)) {
        // Type-safe signal unwrapping
        state[key] = untracked(() => value());
      }
    }

    return state as StoreState<TStore>;
  }

  setState(state: Partial<StoreState<TStore>>): void {
    patchState(this.store as any, () => state as any);

    if (this.history) {
      this.history.addState(this.state, 'setState');
    }
  }

  patchState(partial: Partial<StoreState<TStore>>): void {
    patchState(this.store as any, partial as any);

    if (this.history) {
      this.history.addState(this.state, 'patchState');
    }
  }

  expectState(expected: Partial<StoreState<TStore>>): void {
    const actual = this.state;

    expect(actual).toMatchObject(expected);
  }

  expectStateToContain(expected: Partial<StoreState<TStore>>): void {
    const actual = this.state;

    expect(actual).toEqual(expect.objectContaining(expected));
  }

  getComputed<K extends ComputedSignalNames<TStore>>(
    name: K
  ): TStore[K] extends Signal<infer U> ? U : never {
    const signal = this.store[name];

    if (isSignal(signal)) {
      return untracked(() => signal()) as TStore[K] extends Signal<infer U> ? U : never;
    }

    throw new Error(`Property "${String(name)}" is not a signal`);
  }

  expectComputed<K extends ComputedSignalNames<TStore>>(
    name: K,
    expected: TStore[K] extends Signal<infer U> ? U : never
  ): void {
    const actual = this.getComputed(name);

    expect(actual).toEqual(expected);
  }

  callMethod<K extends MethodNames<TStore>>(
    name: K,
    ...args: MethodParameters<TStore, K>
  ): MethodReturnType<TStore, K> {
    const method = this.store[name];

    if (typeof method !== 'function') {
      throw new Error(`Property "${String(name)}" is not a method`);
    }

    try {
      const result = (method as any).apply(this.store, args);

      if (this.history) {
        this.history.addState(this.state, `callMethod: ${String(name)}`);
      }

      return result;
    } catch (error) {
      throw new Error(
        `${this.options.errorMessages.methodCall} "${String(name)}": ${error}`
      );
    }
  }

  async waitForState(
    condition: Partial<StoreState<TStore>> | WaitCondition<StoreState<TStore>>,
    options: WaitOptions = {}
  ): Promise<void> {
    const { timeout = 5000, interval = 50, timeoutMessage } = options;

    const startTime = Date.now();
    const conditionFn =
      typeof condition === 'function'
        ? condition
        : (state: StoreState<TStore>) => {
          return Object.entries(condition).every(
            ([key, value]) => state[key as keyof StoreState<TStore>] === value
          );
        };

    return new Promise((resolve, reject) => {
      const checkCondition = () => {
        const currentState = this.state;

        if (conditionFn(currentState)) {
          resolve();
          return;
        }

        if (Date.now() - startTime >= timeout) {
          reject(
            new Error(
              timeoutMessage ||
              `Timeout waiting for state condition after ${timeout}ms`
            )
          );
          return;
        }

        setTimeout(checkCondition, interval);
      };

      checkCondition();
    });
  }

  async waitForComputed<K extends ComputedSignalNames<TStore>>(
    name: K,
    condition:
      | (TStore[K] extends Signal<infer U> ? U : never)
      | WaitCondition<TStore[K] extends Signal<infer U> ? U : never>,
    options: WaitOptions = {}
  ): Promise<void> {
    const { timeout = 5000, interval = 50, timeoutMessage } = options;

    const startTime = Date.now();

    type ComputedValue = TStore[K] extends Signal<infer U> ? U : never;
    const conditionFn: WaitCondition<ComputedValue> =
      typeof condition === 'function'
        ? (condition as WaitCondition<ComputedValue>)
        : (value: ComputedValue) => value === condition;

    return new Promise((resolve, reject) => {
      const checkCondition = () => {
        const currentValue = this.getComputed(name);

        if (conditionFn(currentValue)) {
          resolve();
          return;
        }

        if (Date.now() - startTime >= timeout) {
          reject(
            new Error(
              timeoutMessage ||
              `Timeout waiting for computed "${String(name)}" after ${timeout}ms`
            )
          );
          return;
        }

        setTimeout(checkCondition, interval);
      };

      checkCondition();
    });
  }

  startRecording(): StateHistory<StoreState<TStore>> {
    if (!this.history) {
      this.history = new StateHistoryImpl(this.state);
    }
    return this.history;
  }

  stopRecording(): void {
    this.history = null;
  }

  getHistory(): StateHistory<StoreState<TStore>> | null {
    return this.history;
  }
}

/**
 * Create a Signal Store Tester instance
 *
 * @param store - The Signal Store instance to test
 * @param options - Optional configuration
 * @returns A SignalStoreTester instance
 *
 * @example
 * ```typescript
 * const store = TestBed.inject(UserStore);
 * const tester = createSignalStoreTester(store);
 *
 * tester.setState({ users: mockUsers });
 * tester.expectState({ loading: false });
 * ```
 */
export function createSignalStoreTester<TStore>(
  store: TStore,
  options?: StoreTesterOptions
): SignalStoreTester<TStore> {
  return new SignalStoreTesterImpl(store, options);
}