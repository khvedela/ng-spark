/**
 * Test fixture: Counter Store
 * A simple Signal Store for testing purposes
 */

import { computed } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';

/**
 * Counter store state interface
 */
export interface CounterState {
  count: number;
  incrementBy: number;
  label: string;
}

/**
 * Initial state for the counter store
 */
const initialState: CounterState = {
  count: 0,
  incrementBy: 1,
  label: 'Counter',
};

/**
 * Counter Store - A simple store for testing
 * Demonstrates state, computed signals, and methods
 */
export const CounterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ count, incrementBy }) => ({
    // Computed: double the count
    doubleCount: computed(() => count() * 2),
    // Computed: next value after increment
    nextValue: computed(() => count() + incrementBy()),
    // Computed: display text
    displayText: computed(() => `${count()}`),
    // Computed: is positive
    isPositive: computed(() => count() > 0),
    // Computed: is even
    isEven: computed(() => count() % 2 === 0),
  })),
  withMethods((store) => ({
    // Increment count by incrementBy value
    increment(): void {
      patchState(store, (state) => ({
        count: state.count + state.incrementBy,
      }));
    },

    // Decrement count by incrementBy value
    decrement(): void {
      patchState(store, (state) => ({
        count: state.count - state.incrementBy,
      }));
    },

    // Set count to specific value
    setCount(value: number): void {
      patchState(store, { count: value });
    },

    // Set the increment step
    setIncrementBy(value: number): void {
      patchState(store, { incrementBy: value });
    },

    // Set the label
    setLabel(label: string): void {
      patchState(store, { label });
    },

    // Reset to initial state
    reset(): void {
      patchState(store, initialState);
    },

    // Add a specific value to count (returns new count)
    addValue(value: number): number {
      const newCount = store.count() + value;
      patchState(store, { count: newCount });
      return newCount;
    },

    // Multiply count by a factor
    multiply(factor: number): void {
      patchState(store, (state) => ({
        count: state.count * factor,
      }));
    },
  }))
);

/**
 * Type alias for the CounterStore instance type
 */
export type CounterStoreType = InstanceType<typeof CounterStore>;