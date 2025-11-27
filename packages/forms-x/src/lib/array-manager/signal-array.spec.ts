// packages/forms-x/src/lib/array-manager/signal-array.spec.ts
import { signal, WritableSignal } from '@angular/core';
import { SignalArray } from './signal-array';

describe('SignalArray.from', () => {
  /**
   * Test case: SignalArray properly wraps and reacts to changes in the parent signal's key.
   */
  it('should create a SignalArray from a parent signal and a key', () => {
    const initialUsers = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];

    // Create a mock WritableSignal for a parent object
    const parentSignal: WritableSignal<{ users: typeof initialUsers }> = signal({
      users: initialUsers
    });

    // Create a SignalArray from the parent signal and the key 'users'
    const usersSignalArray = SignalArray.from(parentSignal, 'users');

    // Check initial state of the SignalArray
    expect(usersSignalArray.value()).toEqual(initialUsers);

    // Update the parentSignal and check that SignalArray reacts to the change
    const newUsers = [
      { id: 3, name: 'Charlie' },
      { id: 4, name: 'Dana' }
    ];
    parentSignal.update((current) => ({ ...current, users: newUsers }));

    expect(usersSignalArray.value()).toEqual(newUsers);
  });

  /**
   * Test case: Modifications to the SignalArray should properly propagate back to the parent signal.
   */
  it('should propagate changes made through the SignalArray back to the parent signal', () => {
    const initialUsers = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];

    // Create a mock WritableSignal for a parent object
    const parentSignal: WritableSignal<{ users: typeof initialUsers }> = signal({
      users: initialUsers
    });

    // Create a SignalArray from the parent signal and the key 'users'
    const usersSignalArray = SignalArray.from(parentSignal, 'users');

    // Perform a mutation through the SignalArray (e.g., push)
    usersSignalArray.push({ id: 3, name: 'Charlie' });

    // Check that the parentSignal reflects the change
    expect(parentSignal().users).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' }
    ]);
  });

  /**
   * Test case: SignalArray should handle cases where the key is not an array gracefully.
   */
  it('should return an empty array if the key is not an array', () => {
    // Create a mock WritableSignal for a parent object
    const parentSignal: WritableSignal<{ notAnArray: string }> = signal({
      notAnArray: 'test'
    });

    // Create a SignalArray from the parent signal and the key 'notAnArray'
    const signalArray = SignalArray.from(parentSignal, 'notAnArray' as any);

    // Expect SignalArray to return an empty array
    expect(signalArray.value()).toEqual([]);
  });
});