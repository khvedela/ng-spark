import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormTracker } from './form-tracker';

interface TestForm {
  name: string;
  email: string;
  age: number;
}

interface NestedForm {
  user: {
    name: string;
    address: {
      city: string;
      zip: string;
    };
  };
  tags: string[];
}

describe('FormTracker', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('Initialization', () => {
    it('should initialize with baseline set to initial source value', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      expect(tracker.isDirty()).toBe(false);
    });

    it('should start with no dirty fields', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      expect(tracker.dirtyFields()).toEqual({});
    });
  });

  describe('isDirty Signal', () => {
    it('should be false when no changes are made', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      expect(tracker.isDirty()).toBe(false);
    });

    it('should be true when a field is modified', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'john@example.com', age: 30 });

      expect(tracker.isDirty()).toBe(true);
    });

    it('should be true when multiple fields are modified', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 25 });

      expect(tracker.isDirty()).toBe(true);
    });

    it('should be false after commit', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 25 });
      expect(tracker.isDirty()).toBe(true);

      tracker.commit();
      expect(tracker.isDirty()).toBe(false);
    });

    it('should be false after reset', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 25 });
      expect(tracker.isDirty()).toBe(true);

      tracker.reset();
      expect(tracker.isDirty()).toBe(false);
    });
  });

  describe('dirtyFields Signal', () => {
    it('should return empty object when no fields are dirty', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      expect(tracker.dirtyFields()).toEqual({});
    });

    it('should return only modified fields', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'john@example.com', age: 30 });

      expect(tracker.dirtyFields()).toEqual({ name: 'Jane' });
    });

    it('should track multiple modified fields', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 30 });

      expect(tracker.dirtyFields()).toEqual({
        name: 'Jane',
        email: 'jane@example.com'
      });
    });

    it('should clear dirty fields after commit', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'john@example.com', age: 30 });
      expect(tracker.dirtyFields()).toEqual({ name: 'Jane' });

      tracker.commit();
      expect(tracker.dirtyFields()).toEqual({});
    });
  });

  describe('commit Method', () => {
    it('should update baseline to current source value', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 25 });
      tracker.commit();

      source.set({ name: 'Bob', email: 'jane@example.com', age: 25 });

      expect(tracker.dirtyFields()).toEqual({ name: 'Bob' });
    });

    it('should make isDirty false after commit', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 25 });
      tracker.commit();

      expect(tracker.isDirty()).toBe(false);
    });

    it('should use structuredClone to prevent reference leaking', () => {
      const initial = { name: 'John', email: 'john@example.com', age: 30 };
      const source = signal<TestForm>(initial);
      const tracker = new FormTracker(source);

      source.update(val => {
        val.name = 'Modified';
        return val;
      });

      expect(tracker.isDirty()).toBe(true);
    });
  });

  describe('reset Method', () => {
    it('should revert source to baseline value', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 25 });
      tracker.reset();

      expect(source()).toEqual({ name: 'John', email: 'john@example.com', age: 30 });
    });

    it('should make isDirty false after reset', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 25 });
      tracker.reset();

      expect(tracker.isDirty()).toBe(false);
    });

    it('should clear dirty fields after reset', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 25 });
      tracker.reset();

      expect(tracker.dirtyFields()).toEqual({});
    });

    it('should use structuredClone to prevent reference leaking', () => {
      const source = signal<TestForm>({ name: 'John', email: 'john@example.com', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: 'Jane', email: 'jane@example.com', age: 25 });
      tracker.reset();

      const resetValue = source();
      resetValue.name = 'Modified';

      expect(source().name).toBe('Modified');
      tracker.reset();
      expect(source().name).toBe('John');
    });
  });

  describe('Nested Objects', () => {
    it('should detect changes in nested objects', () => {
      const source = signal<NestedForm>({
        user: {
          name: 'John',
          address: {
            city: 'NYC',
            zip: '10001'
          }
        },
        tags: ['tag1', 'tag2']
      });
      const tracker = new FormTracker(source);

      source.update(val => ({
        ...val,
        user: {
          ...val.user,
          address: {
            ...val.user.address,
            city: 'LA'
          }
        }
      }));

      expect(tracker.isDirty()).toBe(true);
      expect(tracker.dirtyFields().user).toBeDefined();
    });

    it('should handle nested object resets', () => {
      const initial: NestedForm = {
        user: {
          name: 'John',
          address: {
            city: 'NYC',
            zip: '10001'
          }
        },
        tags: ['tag1', 'tag2']
      };
      const source = signal<NestedForm>(initial);
      const tracker = new FormTracker(source);

      source.update(val => ({
        ...val,
        user: {
          ...val.user,
          name: 'Jane'
        }
      }));

      tracker.reset();

      expect(source().user.name).toBe('John');
    });
  });

  describe('Arrays', () => {
    it('should detect array changes', () => {
      const source = signal<NestedForm>({
        user: {
          name: 'John',
          address: {
            city: 'NYC',
            zip: '10001'
          }
        },
        tags: ['tag1', 'tag2']
      });
      const tracker = new FormTracker(source);

      source.update(val => ({
        ...val,
        tags: ['tag1', 'tag2', 'tag3']
      }));

      expect(tracker.isDirty()).toBe(true);
      expect(tracker.dirtyFields().tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should detect array element changes', () => {
      const source = signal<NestedForm>({
        user: {
          name: 'John',
          address: {
            city: 'NYC',
            zip: '10001'
          }
        },
        tags: ['tag1', 'tag2']
      });
      const tracker = new FormTracker(source);

      source.update(val => ({
        ...val,
        tags: ['tag1', 'modified']
      }));

      expect(tracker.isDirty()).toBe(true);
    });
  });

  describe('Date Objects', () => {
    interface FormWithDate {
      name: string;
      createdAt: Date;
    }

    it('should compare dates correctly', () => {
      const date = new Date('2024-01-01');
      const source = signal<FormWithDate>({ name: 'John', createdAt: date });
      const tracker = new FormTracker(source);

      expect(tracker.isDirty()).toBe(false);

      source.set({ name: 'John', createdAt: new Date('2024-01-02') });

      expect(tracker.isDirty()).toBe(true);
    });

    it('should not mark as dirty for same date values', () => {
      const source = signal<FormWithDate>({
        name: 'John',
        createdAt: new Date('2024-01-01')
      });
      const tracker = new FormTracker(source);

      source.set({
        name: 'John',
        createdAt: new Date('2024-01-01')
      });

      expect(tracker.isDirty()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      interface NullableForm {
        name: string | null;
        age: number | null;
      }

      const source = signal<NullableForm>({ name: 'John', age: 30 });
      const tracker = new FormTracker(source);

      source.set({ name: null, age: 30 });

      expect(tracker.isDirty()).toBe(true);
      expect(tracker.dirtyFields()).toEqual({ name: null });
    });

    it('should handle empty objects', () => {
      const source = signal<Record<string, unknown>>({});
      const tracker = new FormTracker(source);

      expect(tracker.isDirty()).toBe(false);
      expect(tracker.dirtyFields()).toEqual({});
    });

    it('should handle changes from null to object', () => {
      interface OptionalForm {
        data: { value: string } | null;
      }

      const source = signal<OptionalForm>({ data: null });
      const tracker = new FormTracker(source);

      source.set({ data: { value: 'test' } });

      expect(tracker.isDirty()).toBe(true);
    });
  });
});
