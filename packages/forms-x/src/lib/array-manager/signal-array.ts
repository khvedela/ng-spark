import { computed, Signal, WritableSignal } from '@angular/core';

/**
 * A reactive wrapper around a Signal<Array> that provides
 * familiar mutable-style methods (push, remove, etc.)
 * while maintaining immutable Signal state.
 */
export class SignalArray<T> {
  /**
   * Exposes the underlying array as a readonly signal.
   * Perfect for usage in @for loops: @for (item of array.value(); track item.id)
   */
  readonly value: Signal<T[]>;

  /**
   * Internal strategy to handle updates.
   * Abstraction allows us to support both standalone array signals
   * and nested property signals.
   */
  private readonly updateFn: (mutation: (current: T[]) => T[]) => void;

  private constructor(
    sourceSignal: Signal<T[]>,
    updateStrategy: (mutation: (current: T[]) => T[]) => void
  ) {
    this.value = sourceSignal;
    this.updateFn = updateStrategy;
  }

  /**
   * Creates a SignalArray from a parent signal and a key.
   * automatically handles the immutable spread of the parent object.
   * * @example
   * const users = SignalArray.from(this.formModel, 'users');
   */
  static from<Parent, K extends keyof Parent>(
    parent: WritableSignal<Parent>,
    key: K
  ): SignalArray<Parent[K] extends Array<infer Item> ? Item : never> {

    // Type guard: Ensure the selected key is actually an array
    type ArrayType = Parent[K] extends Array<any> ? Parent[K] : never;
    type ItemType = ArrayType extends Array<infer I> ? I : never;

    const source = computed(() => {
      const val = parent()[key];
      return Array.isArray(val) ? (val as unknown as ItemType[]) : [];
    });

    const updater = (mutation: (arr: ItemType[]) => ItemType[]) => {
      parent.update((prev) => ({
        ...prev,
        [key]: mutation(
          Array.isArray(prev[key]) ? (prev[key] as unknown as ItemType[]) : []
        ),
      }));
    };

    return new SignalArray<ItemType>(source, updater);
  }

  /**
   * Creates a SignalArray from a direct WritableSignal<T[]>.
   */
  static wrap<T>(signal: WritableSignal<T[]>): SignalArray<T> {
    return new SignalArray(signal, (fn) => signal.update(fn));
  }

  // ==========================================
  // Public Mutation API
  // ==========================================

  /**
   * Adds one or more elements to the end of the array.
   */
  push(...items: T[]): void {
    this.updateFn((arr) => [...arr, ...items]);
  }

  /**
   * Inserts an element at a specific index.
   */
  insert(index: number, item: T): void {
    this.updateFn((arr) => [
      ...arr.slice(0, index),
      item,
      ...arr.slice(index),
    ]);
  }

  /**
   * Removes the element at the specified index.
   */
  removeAt(index: number): void {
    this.updateFn((arr) => arr.filter((_, i) => i !== index));
  }

  /**
   * Removes elements that match the predicate.
   */
  removeBy(predicate: (item: T) => boolean): void {
    this.updateFn((arr) => arr.filter((item) => !predicate(item)));
  }

  /**
   * Updates the element at a specific index.
   */
  updateAt(index: number, updater: (item: T) => T): void {
    this.updateFn((arr) =>
      arr.map((item, i) => (i === index ? updater(item) : item))
    );
  }

  /**
   * Moves an item from one index to another (useful for drag-and-drop).
   */
  move(fromIndex: number, toIndex: number): void {
    this.updateFn((arr) => {
      if (fromIndex === toIndex) return arr;
      const newArr = [...arr];
      const [item] = newArr.splice(fromIndex, 1);
      newArr.splice(toIndex, 0, item);
      return newArr;
    });
  }

  /**
   * Replaces the entire array.
   */
  set(newArray: T[]): void {
    this.updateFn(() => newArray);
  }

  /**
   * Clears the array.
   */
  clear(): void {
    this.updateFn(() => []);
  }

  // ==========================================
  // Utility Getters
  // ==========================================

  /**
   * Returns a signal for the length of the array.
   */
  get length(): Signal<number> {
    return computed(() => this.value().length);
  }

  /**
   * Returns a signal for a specific item at an index.
   * Useful for binding to specific form fields in a loop.
   */
  at(index: number): Signal<T | undefined> {
    return computed(() => this.value()[index]);
  }
}

/**
 * Factory function shortcut (optional, for those who prefer functions over static classes)
 */
export const createSignalArray = SignalArray.from;