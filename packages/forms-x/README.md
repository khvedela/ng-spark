# @ng-spark/forms-x

> Modern, signal-based form utilities for Angular that embrace reactivity and immutability

[![npm version](https://badge.fury.io/js/@ng-spark%2Fforms-x.svg)](https://www.npmjs.com/package/@ng-spark/forms-x)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 What's Inside?

Forms-X is a collection of lightweight, signal-based utilities designed to make form handling in Angular simpler, more reactive, and more maintainable:

- **[SignalArray](#signalarray)** - Reactive array management with familiar mutable-style API
- **[FormTracker](#formtracker)** - Automatic dirty state tracking for forms
- **[SparkAsyncValidator](#sparkasyncvalidator)** - Debounced async validation with loading states
- **[DebounceFieldDirective](#debouncefield-directive)** - Two-way binding with configurable debounce

## 🚀 Installation

```bash
npm install @ng-spark/forms-x
```

## 📖 Quick Start

```typescript
import { Component, signal } from '@angular/core';
import {
  FormTracker,
  SignalArray,
  SparkAsyncValidator,
  DebounceFieldDirective
} from '@ng-spark/forms-x';

@Component({
  selector: 'app-user-form',
  imports: [DebounceFieldDirective],
  template: `
    <form>
      <input [debounceField]="username" />
      @if (usernameValidator.error()) {
        <span>{{ usernameValidator.error() }}</span>
      }
      <button [disabled]="!tracker.isDirty()">Save</button>
    </form>
  `
})
export class UserFormComponent {
  formModel = signal({ name: '', tags: [] });
  username = signal('');

  // Track form dirty state
  tracker = new FormTracker(this.formModel);

  // Async validation with debouncing
  usernameValidator = new SparkAsyncValidator({
    source: this.username,
    validate: async (val) => {
      const exists = await this.checkUsername(val);
      return exists ? 'Username taken' : null;
    }
  });

  // Reactive array management
  tags = SignalArray.from(this.formModel, 'tags');
}
```

## 🔧 Features

### SignalArray

Reactive array management with familiar push, remove, and move operations:

```typescript
const todos = SignalArray.wrap(signal([
  { id: 1, text: 'Learn Angular' }
]));

// Familiar API, automatic reactivity
todos.push({ id: 2, text: 'Build app' });
todos.removeAt(0);
todos.move(0, 1);

// Use in templates
@for (todo of todos.value(); track todo.id) {
  <div>{{ todo.text }}</div>
}
```

**[→ Full SignalArray Documentation](https://khvedela.github.io/ng-spark/docs/forms-x/signal-array)**

### FormTracker

Automatic dirty state tracking with baseline comparison:

```typescript
const formModel = signal({ name: 'John', email: 'john@example.com' });
const tracker = new FormTracker(formModel);

// Reactive dirty state
console.log(tracker.isDirty()); // false

formModel.update(f => ({ ...f, name: 'Jane' }));
console.log(tracker.isDirty()); // true

// Get only changed fields
console.log(tracker.dirtyFields()); // { name: 'Jane' }

// After save
await api.save(formModel());
tracker.commit(); // Reset baseline
```

**[→ Full FormTracker Documentation](https://khvedela.github.io/ng-spark/docs/forms-x/form-tracker)**

### SparkAsyncValidator

Debounced async validation with built-in loading states:

```typescript
const email = signal('');

const emailValidator = new SparkAsyncValidator({
  source: email,
  validate: async (val) => {
    const exists = await api.checkEmail(val);
    return exists ? 'Email already registered' : null;
  },
  debounce: 400
});

// In template
@if (emailValidator.isLoading()) {
  <span>Checking...</span>
}
@if (emailValidator.error()) {
  <span>{{ emailValidator.error() }}</span>
}
```

**[→ Full SparkAsyncValidator Documentation](https://khvedela.github.io/ng-spark/docs/forms-x/async-validator)**

### DebounceField Directive

Two-way binding with configurable debounce:

```typescript
@Component({
  template: `
    <input
      [debounceField]="searchQuery"
      [debounceTime]="300"
      [transform]="trimAndLowercase"
    />
  `
})
export class SearchComponent {
  searchQuery = signal('');

  trimAndLowercase = (val: string) => val.trim().toLowerCase();
}
```

**[→ Full DebounceFieldDirective Documentation](https://khvedela.github.io/ng-spark/docs/forms-x/debounce-field)**

## 📚 Documentation

Comprehensive documentation with examples and best practices is available at:

**[https://khvedela.github.io/ng-spark/docs/forms-x](https://khvedela.github.io/ng-spark/docs/forms-x)**

## 🎯 Requirements

- Angular >= 19.0.0
- RxJS >= 7.0.0
- Node >= 18.0.0

## 💡 Why Forms-X?

✨ **Signal-Native** - Built from the ground up for Angular Signals

🎯 **Type-Safe** - Full TypeScript support with inference

🪶 **Lightweight** - Zero dependencies, tree-shakeable

🧪 **Well-Tested** - Comprehensive test coverage

⚡ **Performance** - Optimized for minimal re-renders

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guide](https://github.com/khvedela/ng-spark/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © [NgSpark Team](https://github.com/khvedela/ng-spark)

## 🔗 Links

- [Documentation](https://khvedela.github.io/ng-spark/docs/forms-x)
- [GitHub Repository](https://github.com/khvedela/ng-spark)
- [Issue Tracker](https://github.com/khvedela/ng-spark/issues)
- [Changelog](https://github.com/khvedela/ng-spark/blob/main/packages/forms-x/CHANGELOG.md)

---

Made with ❤️ by the NgSpark Team
