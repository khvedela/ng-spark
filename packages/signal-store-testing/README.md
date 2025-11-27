# @ng-spark/signal-store-testing

A type-safe testing utility library for NgRx Signal Store. Test your Signal Stores with ease using intuitive APIs for state management, computed signals, and method calls.

[![npm version](https://badge.fury.io/js/%40ng-spark%2Fsignal-store-testing.svg)](https://www.npmjs.com/package/@ng-spark/signal-store-testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **State Management** - Read and manipulate Signal Store state with ease
✅ **Computed Signals** - Test computed signal values
✅ **Method Calls** - Invoke store methods in tests
✅ **Async Waiting** - Wait for state or computed signal conditions
✅ **State History** - Record and navigate state changes (time travel debugging)
✅ **Type-Safe** - Full TypeScript support with automatic type inference
✅ **Jest & Vitest Support** - Works with both Jest and Vitest testing frameworks

## Installation

```bash
npm install @ng-spark/signal-store-testing --save-dev
```

## Requirements

- Angular 19+ or 20+
- NgRx Signals 19+ or 20+
- **Testing Framework:** Jest 29+ OR Vitest 1.0+
- TypeScript 5.9+

## Quick Start

```typescript
import { TestBed } from '@angular/core/testing';
import { createSignalStoreTester } from '@ng-spark/signal-store-testing';
import { MyStore } from './my.store';

describe('MyStore', () => {
  let tester: ReturnType<typeof createSignalStoreTester<InstanceType<typeof MyStore>>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyStore],
    });

    const store = TestBed.inject(MyStore);
    tester = createSignalStoreTester(store);
  });

  it('should manage state', () => {
    // Read state
    expect(tester.state.count).toBe(0);

    // Update state
    tester.patchState({ count: 5 });
    expect(tester.state.count).toBe(5);

    // Assert state
    tester.expectState({ count: 5 });
  });

  it('should test computed signals', () => {
    tester.patchState({ count: 10 });
    tester.expectComputed('doubleCount', 20);
  });

  it('should call methods', () => {
    tester.callMethod('increment');
    expect(tester.state.count).toBe(1);
  });

  it('should wait for async conditions', async () => {
    setTimeout(() => tester.patchState({ count: 42 }), 100);

    await tester.waitForState({ count: 42 });
    expect(tester.state.count).toBe(42);
  });
});
```

## API Reference

### Creating a Tester

#### `createSignalStoreTester(store, options?)`

Creates a tester instance for a Signal Store.

**Parameters:**
- `store: TStore` - The Signal Store instance to test
- `options?: StoreTesterOptions` - Optional configuration
  - `autoDetectChanges?: boolean` - Auto-detect state changes (default: `true`)
  - `recordHistory?: boolean` - Enable state history recording (default: `false`)
  - `errorMessages?: object` - Custom error messages

**Returns:** `SignalStoreTester<TStore>`

**Example:**
```typescript
const store = TestBed.inject(CounterStore);
const tester = createSignalStoreTester(store, {
  recordHistory: true
});
```

### State Management

#### `tester.state`

Read-only property that returns the current state of all signals.

**Returns:** Object containing all signal values (both state and computed)

**Example:**
```typescript
expect(tester.state.count).toBe(0);
expect(tester.state.incrementBy).toBe(1);
```

#### `tester.setState(state)`

Replace the entire state with new values.

**Parameters:**
- `state: Partial<StoreState<TStore>>` - New state values

**Example:**
```typescript
tester.setState({ count: 10, incrementBy: 2 });
```

#### `tester.patchState(partial)`

Merge partial state update with current state.

**Parameters:**
- `partial: Partial<StoreState<TStore>>` - Partial state to merge

**Example:**
```typescript
tester.patchState({ count: 5 }); // Only updates count
```

#### `tester.expectState(expected)`

Assert that the state matches the expected values using Jest's `toMatchObject`.

**Parameters:**
- `expected: Partial<StoreState<TStore>>` - Expected state values

**Example:**
```typescript
tester.expectState({ count: 42, label: 'Test' });
```

#### `tester.expectStateToContain(expected)`

Assert that the state contains the expected fields using Jest's `objectContaining`.

**Parameters:**
- `expected: Partial<StoreState<TStore>>` - Expected state values

**Example:**
```typescript
// Only checks count, ignores other fields
tester.expectStateToContain({ count: 42 });
```

### Computed Signals

#### `tester.getComputed(name)`

Get the current value of a computed signal.

**Parameters:**
- `name: ComputedSignalNames<TStore>` - Name of the computed signal

**Returns:** The unwrapped signal value

**Example:**
```typescript
const doubleCount = tester.getComputed('doubleCount');
expect(doubleCount).toBe(20);
```

#### `tester.expectComputed(name, expected)`

Assert that a computed signal has the expected value.

**Parameters:**
- `name: ComputedSignalNames<TStore>` - Name of the computed signal
- `expected: T` - Expected value

**Example:**
```typescript
tester.expectComputed('doubleCount', 20);
tester.expectComputed('isPositive', true);
```

### Method Calls

#### `tester.callMethod(name, ...args)`

Call a store method with optional arguments.

**Parameters:**
- `name: MethodNames<TStore>` - Name of the method
- `...args` - Method arguments (type-safe)

**Returns:** The method's return value

**Example:**
```typescript
tester.callMethod('increment');
tester.callMethod('setCount', 42);
const result = tester.callMethod('addValue', 10);
```

### Async Operations

#### `tester.waitForState(condition, options?)`

Wait for the state to match a condition.

**Parameters:**
- `condition: Partial<StoreState<TStore>> | WaitCondition<StoreState<TStore>>` - State to wait for or condition function
- `options?: WaitOptions` - Wait options
  - `timeout?: number` - Timeout in ms (default: `5000`)
  - `interval?: number` - Polling interval in ms (default: `50`)
  - `timeoutMessage?: string` - Custom timeout error message

**Returns:** `Promise<void>`

**Examples:**
```typescript
// Wait for specific state
await tester.waitForState({ count: 42 });

// Wait using condition function
await tester.waitForState(state => state.count > 100);

// With custom timeout
await tester.waitForState({ loading: false }, { timeout: 10000 });
```

#### `tester.waitForComputed(name, condition, options?)`

Wait for a computed signal to match a condition.

**Parameters:**
- `name: ComputedSignalNames<TStore>` - Name of the computed signal
- `condition: T | WaitCondition<T>` - Value to wait for or condition function
- `options?: WaitOptions` - Wait options

**Returns:** `Promise<void>`

**Examples:**
```typescript
// Wait for specific value
await tester.waitForComputed('doubleCount', 20);

// Wait using condition function
await tester.waitForComputed('doubleCount', value => value > 25);
```

### State History (Time Travel)

#### `tester.startRecording()`

Start recording state history for time travel debugging.

**Returns:** `StateHistory<StoreState<TStore>>`

**Example:**
```typescript
const history = tester.startRecording();
```

#### `tester.stopRecording()`

Stop recording state history.

**Example:**
```typescript
tester.stopRecording();
```

#### `tester.getHistory()`

Get the current state history (if recording).

**Returns:** `StateHistory<StoreState<TStore>> | null`

**Example:**
```typescript
const history = tester.getHistory();
if (history) {
  console.log(history.states.length);
}
```

### StateHistory API

When recording is enabled, you get a `StateHistory` object with these methods:

#### `history.states`

Read-only array of all recorded state entries.

**Type:** `ReadonlyArray<StateHistoryEntry<TState>>`

#### `history.currentIndex`

Current position in the history.

**Type:** `number`

#### `history.currentState`

The state at the current history index.

**Type:** `TState`

#### `history.goBack()`

Navigate to the previous state in history.

**Example:**
```typescript
history.goBack();
expect(history.currentState.count).toBe(5);
```

#### `history.goForward()`

Navigate to the next state in history.

**Example:**
```typescript
history.goForward();
expect(history.currentState.count).toBe(10);
```

#### `history.goToIndex(index)`

Jump to a specific state by index.

**Parameters:**
- `index: number` - Target index

**Example:**
```typescript
history.goToIndex(0); // Go to initial state
```

#### `history.reset()`

Reset to the initial state (index 0).

**Example:**
```typescript
history.reset();
expect(history.currentIndex).toBe(0);
```

#### `history.clear()`

Clear all history except the initial state.

**Example:**
```typescript
history.clear();
expect(history.states.length).toBe(1);
```

## Complete Example

```typescript
import { TestBed } from '@angular/core/testing';
import { createSignalStoreTester } from '@ng-spark/signal-store-testing';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';

// Define your store
const CounterStore = signalStore(
  { providedIn: 'root' },
  withState({ count: 0, incrementBy: 1 }),
  withComputed(({ count }) => ({
    doubleCount: computed(() => count() * 2),
    isEven: computed(() => count() % 2 === 0),
  })),
  withMethods((store) => ({
    increment(): void {
      patchState(store, (state) => ({ count: state.count + state.incrementBy }));
    },
    setCount(value: number): void {
      patchState(store, { count: value });
    },
  }))
);

// Test it
describe('CounterStore', () => {
  let tester: ReturnType<typeof createSignalStoreTester<InstanceType<typeof CounterStore>>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CounterStore],
    });

    const store = TestBed.inject(CounterStore);
    tester = createSignalStoreTester(store);
  });

  it('should test complete workflow', async () => {
    // Initial state
    expect(tester.state.count).toBe(0);
    tester.expectComputed('doubleCount', 0);
    tester.expectComputed('isEven', true);

    // Update state
    tester.patchState({ count: 5 });
    tester.expectState({ count: 5 });
    tester.expectComputed('isEven', false);

    // Call methods
    tester.callMethod('increment');
    expect(tester.state.count).toBe(6);

    // Wait for async
    setTimeout(() => tester.callMethod('setCount', 100), 100);
    await tester.waitForState({ count: 100 });

    // Time travel
    const history = tester.startRecording();
    tester.patchState({ count: 10 });
    tester.patchState({ count: 20 });

    history.goBack();
    expect(history.currentState.count).toBe(10);
  });
});
```

## TypeScript Support

The library is fully typed and provides excellent type inference:

```typescript
// Automatic type inference for store
const tester = createSignalStoreTester(store);

// State is typed
tester.state.count; // ✅ Type: number
tester.state.unknown; // ❌ TypeScript error

// Method calls are type-safe
tester.callMethod('setCount', 42); // ✅ Correct
tester.callMethod('setCount', 'invalid'); // ❌ TypeScript error
tester.callMethod('unknownMethod'); // ❌ TypeScript error

// Computed signals are type-safe
tester.getComputed('doubleCount'); // ✅ Returns: number
tester.expectComputed('isEven', true); // ✅ Type-safe
```

## Testing Framework Support

This library works with both **Jest** and **Vitest**. The API is identical for both frameworks.

### Jest Setup
```typescript
// jest.config.ts
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};
```

### Vitest Setup
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-vitest.ts'],
  },
});
```

Both frameworks provide the `expect` API that this library uses for assertions.

## Best Practices

1. **Type Your Tester Variable**
   ```typescript
   let tester: ReturnType<typeof createSignalStoreTester<InstanceType<typeof MyStore>>>;
   ```

2. **Use Specific Assertions**
   - Use `expectState` for partial state matching
   - Use `expectStateToContain` for loose matching
   - Use direct property access for single values

3. **Enable History Recording for Complex Tests**
   ```typescript
   const tester = createSignalStoreTester(store, { recordHistory: true });
   ```

4. **Use Async Waiting for Side Effects**
   ```typescript
   await tester.waitForState(state => state.loading === false);
   ```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

---

Made with ❤️ by @ng-spark
