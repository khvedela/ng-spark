/**
 * @ng-spark/signal-store-testing
 * Tests for SignalStoreTester
 */

import { TestBed } from '@angular/core/testing';
import { createSignalStoreTester } from './store-tester';
import { CounterStore } from './test-fixtures/counter.store.fixture';

describe('SignalStoreTester', () => {
  let tester: ReturnType<typeof createSignalStoreTester<InstanceType<typeof CounterStore>>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CounterStore],
    });

    const store = TestBed.inject(CounterStore);
    tester = createSignalStoreTester(store);
  });

  describe('State Management', () => {
    it('should read initial state', () => {
      // State includes both state signals and computed signals
      expect(tester.state.count).toBe(0);
      expect(tester.state.incrementBy).toBe(1);
      expect(tester.state.label).toBe('Counter');
    });

    it('should patch state', () => {
      tester.patchState({ count: 5 });

      expect(tester.state.count).toBe(5);
      expect(tester.state.incrementBy).toBe(1); // unchanged
    });

    it('should set state (replace)', () => {
      tester.setState({ count: 10, incrementBy: 2 });

      expect(tester.state.count).toBe(10);
      expect(tester.state.incrementBy).toBe(2);
    });

    it('should handle multiple state updates', () => {
      tester.patchState({ count: 5 });
      tester.patchState({ incrementBy: 3 });
      tester.patchState({ label: 'Test Counter' });

      // Check individual state properties
      expect(tester.state.count).toBe(5);
      expect(tester.state.incrementBy).toBe(3);
      expect(tester.state.label).toBe('Test Counter');
    });
  });

  describe('State Assertions', () => {
    it('should assert state matches expected', () => {
      tester.patchState({ count: 42 });

      tester.expectState({ count: 42 });
    });

    it('should assert state contains expected fields', () => {
      tester.patchState({ count: 42, label: 'Test' });

      // Only checking count, ignoring other fields
      tester.expectStateToContain({ count: 42 });
    });

    it('should fail when state does not match', () => {
      tester.patchState({ count: 42 });

      expect(() => {
        tester.expectState({ count: 100 });
      }).toThrow();
    });
  });

  describe('Computed Signals', () => {
    it('should get computed signal value', () => {
      tester.patchState({ count: 5 });

      const doubleCount = tester.getComputed('doubleCount');
      expect(doubleCount).toBe(10);
    });

    it('should assert computed signal value', () => {
      tester.patchState({ count: 7 });

      tester.expectComputed('doubleCount', 14);
      tester.expectComputed('isPositive', true);
      tester.expectComputed('isEven', false);
    });

    it('should track computed changes when state changes', () => {
      tester.patchState({ count: 4 });
      tester.expectComputed('isEven', true);

      tester.patchState({ count: 5 });
      tester.expectComputed('isEven', false);
    });

    it('should compute nextValue correctly', () => {
      tester.patchState({ count: 10, incrementBy: 5 });

      tester.expectComputed('nextValue', 15);
    });

    it('should throw error for non-signal property', () => {
      expect(() => {
        // Trying to access a method as a computed signal
        // @ts-expect-error - Intentionally passing wrong type to test error handling
        tester.getComputed('increment');
      }).toThrow('is not a signal');
    });
  });

  describe('Method Calls', () => {
    it('should call increment method', () => {
      tester.callMethod('increment');

      expect(tester.state.count).toBe(1);
    });

    it('should call method with arguments', () => {
      tester.callMethod('setCount', 42);

      expect(tester.state.count).toBe(42);
    });

    it('should call method that returns a value', () => {
      const result = tester.callMethod('addValue', 10);

      expect(result).toBe(10);
      expect(tester.state.count).toBe(10);
    });

    it('should call multiple methods in sequence', () => {
      tester.callMethod('setCount', 10);
      tester.callMethod('increment');
      tester.callMethod('increment');

      expect(tester.state.count).toBe(12);
    });

    it('should call reset method', () => {
      tester.patchState({ count: 100, incrementBy: 5, label: 'Modified' });
      tester.callMethod('reset');

      tester.expectState({
        count: 0,
        incrementBy: 1,
        label: 'Counter',
      });
    });
  });

  describe('Async Wait Operations', () => {
    it('should wait for state condition (object)', async () => {
      setTimeout(() => {
        tester.patchState({ count: 42 });
      }, 100);

      await tester.waitForState({ count: 42 });

      expect(tester.state.count).toBe(42);
    });

    it('should wait for state condition (function)', async () => {
      setTimeout(() => {
        tester.patchState({ count: 100 });
      }, 100);

      await tester.waitForState((state: any) => state.count >= 100);

      expect(tester.state.count).toBe(100);
    });

    it('should wait for computed signal value', async () => {
      setTimeout(() => {
        tester.patchState({ count: 10 });
      }, 100);

      await tester.waitForComputed('doubleCount', 20);

      expect(tester.getComputed('doubleCount')).toBe(20);
    });

    it('should wait for computed signal condition function', async () => {
      setTimeout(() => {
        tester.patchState({ count: 15 });
      }, 100);

      await tester.waitForComputed('doubleCount', (value: any) => value > 25);

      expect(tester.getComputed('doubleCount')).toBeGreaterThan(25);
    });

    it('should timeout when condition is not met', async () => {
      await expect(
        tester.waitForState({ count: 999 }, { timeout: 200 })
      ).rejects.toThrow('Timeout waiting for state condition');
    });

    it('should timeout with custom message', async () => {
      await expect(
        tester.waitForState(
          { count: 999 },
          { timeout: 200, timeoutMessage: 'Custom timeout error' }
        )
      ).rejects.toThrow('Custom timeout error');
    });
  });

  describe('State History', () => {
    it('should start recording history', () => {
      const history = tester.startRecording();

      expect(history).toBeDefined();
      expect(history.states.length).toBe(1); // Initial state
      expect(history.currentIndex).toBe(0);
    });

    it('should record state changes', () => {
      const history = tester.startRecording();

      tester.patchState({ count: 5 });
      tester.patchState({ count: 10 });

      expect(history.states.length).toBe(3); // Initial + 2 changes
    });

    it('should navigate history back and forward', () => {
      const history = tester.startRecording();

      tester.patchState({ count: 5 });
      tester.patchState({ count: 10 });

      history.goBack();
      expect(history.currentState.count).toBe(5);

      history.goBack();
      expect(history.currentState.count).toBe(0);

      history.goForward();
      expect(history.currentState.count).toBe(5);
    });

    it('should reset to initial state', () => {
      const history = tester.startRecording();

      tester.patchState({ count: 5 });
      tester.patchState({ count: 10 });

      history.reset();
      expect(history.currentIndex).toBe(0);
      expect(history.currentState.count).toBe(0);
    });

    it('should clear all history except initial', () => {
      const history = tester.startRecording();

      tester.patchState({ count: 5 });
      tester.patchState({ count: 10 });

      history.clear();
      expect(history.states.length).toBe(1);
      expect(history.currentState.count).toBe(0);
    });

    it('should stop recording', () => {
      tester.startRecording();
      tester.stopRecording();

      expect(tester.getHistory()).toBeNull();
    });

    it('should record method calls in history', () => {
      const history = tester.startRecording();

      tester.callMethod('setCount', 42);

      expect(history.states.length).toBe(2);
      expect(history.states[1].label).toContain('callMethod');
    });
  });

  describe('Integration Tests', () => {
    it('should test complete user workflow', () => {
      // Initial state check
      tester.expectState({ count: 0, incrementBy: 1 });

      // Change increment step
      tester.callMethod('setIncrementBy', 5);
      tester.expectState({ incrementBy: 5 });

      // Increment multiple times
      tester.callMethod('increment');
      tester.callMethod('increment');
      tester.expectState({ count: 10 });

      // Check computed values
      tester.expectComputed('doubleCount', 20);
      tester.expectComputed('isEven', true);

      // Multiply
      tester.callMethod('multiply', 3);
      tester.expectState({ count: 30 });

      // Reset
      tester.callMethod('reset');
      tester.expectState({ count: 0, incrementBy: 1 });
    });

    it('should work with history recording enabled', () => {
      const store = TestBed.inject(CounterStore);
      const testerWithHistory = createSignalStoreTester(store, {
        recordHistory: true,
      });

      const history = testerWithHistory.getHistory();
      expect(history).not.toBeNull();

      testerWithHistory.patchState({ count: 10 });
      testerWithHistory.patchState({ count: 20 });

      expect(history!.states.length).toBe(3);
    });
  });
});