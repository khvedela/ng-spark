/**
 * @ng-spark/signal-store-testing
 * Core type definitions for Signal Store testing utilities
 */

import { Signal } from '@angular/core';

/**
 * Extract the state type from a Signal Store instance
 * Maps all Signal properties to their unwrapped values
 */
export type StoreState<TStore> = {
  [K in keyof TStore]: TStore[K] extends Signal<infer U> ? U : never;
};

/**
 * Extract computed signal names from a store
 */
export type ComputedSignalNames<TStore> = {
  [K in keyof TStore]: TStore[K] extends Signal<any> ? K : never;
}[keyof TStore];

/**
 * Extract method names from a store
 */
export type MethodNames<TStore> = {
  [K in keyof TStore]: TStore[K] extends (...args: any[]) => any ? K : never;
}[keyof TStore];

/**
 * Extract the return type of a method
 */
export type MethodReturnType<TStore, TMethod extends MethodNames<TStore>> =
  TStore[TMethod] extends (...args: any[]) => infer R ? R : never;

/**
 * Extract the parameters of a method
 */
export type MethodParameters<TStore, TMethod extends MethodNames<TStore>> =
  TStore[TMethod] extends (...args: infer P) => any ? P : never;

/**
 * Configuration options for the store tester
 */
export interface StoreTesterOptions {
  /**
   * Whether to automatically detect and track state changes
   * @default true
   */
  autoDetectChanges?: boolean;

  /**
   * Whether to record state history for time travel debugging
   * @default false
   */
  recordHistory?: boolean;

  /**
   * Custom error messages
   */
  errorMessages?: {
    stateMatch?: string;
    computedMatch?: string;
    methodCall?: string;
  };
}

/**
 * State history entry for time travel debugging
 */
export interface StateHistoryEntry<TState> {
  /**
   * The state at this point in time
   */
  state: TState;

  /**
   * Timestamp when this state was recorded
   */
  timestamp: number;

  /**
   * Optional label for this state change
   */
  label?: string;
}

/**
 * Interface for the state history recorder
 */
export interface StateHistory<TState> {
  /**
   * All recorded states
   */
  readonly states: ReadonlyArray<StateHistoryEntry<TState>>;

  /**
   * Current state index
   */
  readonly currentIndex: number;

  /**
   * Current state
   */
  readonly currentState: TState;

  /**
   * Go back to previous state
   */
  goBack(): void;

  /**
   * Go forward to next state
   */
  goForward(): void;

  /**
   * Go to a specific state by index
   */
  goToIndex(index: number): void;

  /**
   * Reset to initial state
   */
  reset(): void;

  /**
   * Clear all history
   */
  clear(): void;
}

/**
 * Wait condition function type
 */
export type WaitCondition<T> = (value: T) => boolean;

/**
 * Options for wait operations
 */
export interface WaitOptions {
  /**
   * Timeout in milliseconds
   * @default 5000
   */
  timeout?: number;

  /**
   * Polling interval in milliseconds
   * @default 50
   */
  interval?: number;

  /**
   * Custom timeout error message
   */
  timeoutMessage?: string;
}

/**
 * Main interface for the Signal Store Tester
 */
export interface SignalStoreTester<TStore> {
  /**
   * The store instance being tested
   */
  readonly store: TStore;

  /**
   * Current state of the store
   */
  readonly state: StoreState<TStore>;

  /**
   * Set the entire state (replaces current state)
   */
  setState(state: Partial<StoreState<TStore>>): void;

  /**
   * Patch the state (merges with current state)
   */
  patchState(partial: Partial<StoreState<TStore>>): void;

  /**
   * Assert that the state matches the expected value
   */
  expectState(expected: Partial<StoreState<TStore>>): void;

  /**
   * Assert that the state contains the expected value (using jest.objectContaining)
   */
  expectStateToContain(expected: Partial<StoreState<TStore>>): void;

  /**
   * Get the value of a computed signal
   */
  getComputed<K extends ComputedSignalNames<TStore>>(
    name: K
  ): TStore[K] extends Signal<infer U> ? U : never;

  /**
   * Assert that a computed signal has the expected value
   */
  expectComputed<K extends ComputedSignalNames<TStore>>(
    name: K,
    expected: TStore[K] extends Signal<infer U> ? U : never
  ): void;

  /**
   * Call a store method
   */
  callMethod<K extends MethodNames<TStore>>(
    name: K,
    ...args: MethodParameters<TStore, K>
  ): MethodReturnType<TStore, K>;

  /**
   * Wait for the state to match a condition
   */
  waitForState(
    condition: Partial<StoreState<TStore>> | WaitCondition<StoreState<TStore>>,
    options?: WaitOptions
  ): Promise<void>;

  /**
   * Wait for a computed signal to match a condition
   */
  waitForComputed<K extends ComputedSignalNames<TStore>>(
    name: K,
    condition:
      | (TStore[K] extends Signal<infer U> ? U : never)
      | WaitCondition<TStore[K] extends Signal<infer U> ? U : never>,
    options?: WaitOptions
  ): Promise<void>;

  /**
   * Start recording state history
   */
  startRecording(): StateHistory<StoreState<TStore>>;

  /**
   * Stop recording state history
   */
  stopRecording(): void;

  /**
   * Get the current state history (if recording)
   */
  getHistory(): StateHistory<StoreState<TStore>> | null;
}