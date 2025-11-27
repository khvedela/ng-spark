# NgSpark

> Modern, signal-based utilities for Angular - Embrace reactivity, immutability, and type safety

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Nx](https://img.shields.io/badge/Built%20with-Nx-143055.svg)](https://nx.dev)

## Overview

NgSpark is a collection of lightweight, production-ready libraries designed to enhance your Angular development experience with modern signal-based patterns. Built from the ground up for Angular 19+, these libraries embrace reactivity, type safety, and developer ergonomics.

## Packages

### [@ng-spark/forms-x](./packages/forms-x)

Modern, signal-based form utilities that make form handling simpler, more reactive, and more maintainable.

```bash
npm install @ng-spark/forms-x
```

**Features:**
- **SignalArray** - Reactive array management with familiar mutable-style API
- **FormTracker** - Automatic dirty state tracking for forms
- **SparkAsyncValidator** - Debounced async validation with loading states
- **DebounceFieldDirective** - Two-way binding with configurable debounce

```typescript
import { SignalArray, FormTracker, SparkAsyncValidator } from '@ng-spark/forms-x';

// Reactive array management
const todos = SignalArray.wrap(signal([{ id: 1, text: 'Learn Angular' }]));
todos.push({ id: 2, text: 'Build app' });

// Automatic dirty tracking
const formModel = signal({ name: 'John', email: 'john@example.com' });
const tracker = new FormTracker(formModel);
console.log(tracker.isDirty()); // false

// Async validation with debouncing
const emailValidator = new SparkAsyncValidator({
  source: email,
  validate: async (val) => {
    const exists = await api.checkEmail(val);
    return exists ? 'Email already registered' : null;
  }
});
```

**[→ Full @ng-spark/forms-x Documentation](https://khvedela.github.io/ng-spark/docs/forms-x)**

---

### [@ng-spark/signal-store-testing](./packages/signal-store-testing)

Type-safe testing utilities for NgRx Signal Store. Test your Signal Stores with intuitive APIs for state management, computed signals, and method calls.

```bash
npm install @ng-spark/signal-store-testing --save-dev
```

**Features:**
- **State Management** - Read and manipulate Signal Store state with ease
- **Computed Signals** - Test computed signal values
- **Method Calls** - Invoke store methods in tests
- **Async Waiting** - Wait for state or computed signal conditions
- **State History** - Record and navigate state changes (time travel debugging)
- **Type-Safe** - Full TypeScript support with automatic type inference

```typescript
import { createSignalStoreTester } from '@ng-spark/signal-store-testing';

const store = TestBed.inject(CounterStore);
const tester = createSignalStoreTester(store);

// Test state
expect(tester.state.count).toBe(0);
tester.patchState({ count: 5 });
tester.expectState({ count: 5 });

// Test computed signals
tester.expectComputed('doubleCount', 10);

// Call methods
tester.callMethod('increment');
expect(tester.state.count).toBe(6);

// Wait for async operations
await tester.waitForState({ loading: false });

// Time travel debugging
const history = tester.startRecording();
tester.patchState({ count: 10 });
history.goBack();
```

**[→ Full @ng-spark/signal-store-testing Documentation](./packages/signal-store-testing/README.md)**

---

## Why NgSpark?

### Signal-Native
Built from the ground up for Angular Signals, not retrofitted from older patterns. Every utility embraces Angular's modern reactive primitives.

### Type-Safe
Full TypeScript support with excellent type inference. Catch errors at compile time, not runtime.

### Lightweight
Zero external dependencies (except peer dependencies), tree-shakeable, and optimized for minimal bundle size impact.

### Well-Tested
Comprehensive test coverage ensures reliability in production environments.

### Performance Optimized
Designed for minimal re-renders and optimal performance in large-scale applications.

### Developer Experience
Intuitive APIs that feel natural and reduce boilerplate while maintaining flexibility.

## Requirements

- **Angular**: >= 19.0.0
- **Node.js**: >= 18.0.0
- **TypeScript**: >= 5.9.0

### Additional Requirements by Package

**@ng-spark/forms-x:**
- RxJS >= 7.0.0
- @angular/forms >= 19.0.0

**@ng-spark/signal-store-testing:**
- @ngrx/signals >= 19.0.0
- Jest >= 29.0.0 OR Vitest >= 1.0.0

## Installation

Install the packages you need:

```bash
# For form utilities
npm install @ng-spark/forms-x

# For Signal Store testing utilities (dev dependency)
npm install @ng-spark/signal-store-testing --save-dev
```

## Quick Start

### Forms-X Example

```typescript
import { Component, signal } from '@angular/core';
import { FormTracker, SignalArray, SparkAsyncValidator } from '@ng-spark/forms-x';

@Component({
  selector: 'app-user-form',
  template: `
    <form>
      <input [debounceField]="username" />
      @if (usernameValidator.error()) {
        <span class="error">{{ usernameValidator.error() }}</span>
      }
      <button [disabled]="!tracker.isDirty()">Save Changes</button>
    </form>
  `
})
export class UserFormComponent {
  formModel = signal({ name: '', email: '', tags: [] });
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

  addTag(tag: string) {
    this.tags.push(tag);
  }
}
```

### Signal Store Testing Example

```typescript
import { TestBed } from '@angular/core/testing';
import { createSignalStoreTester } from '@ng-spark/signal-store-testing';
import { CounterStore } from './counter.store';

describe('CounterStore', () => {
  let tester: ReturnType<typeof createSignalStoreTester<InstanceType<typeof CounterStore>>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CounterStore],
    });

    const store = TestBed.inject(CounterStore);
    tester = createSignalStoreTester(store);
  });

  it('should manage counter state', async () => {
    // Initial state
    expect(tester.state.count).toBe(0);
    tester.expectComputed('doubleCount', 0);

    // Update state
    tester.patchState({ count: 5 });
    tester.expectState({ count: 5 });
    tester.expectComputed('doubleCount', 10);

    // Call methods
    tester.callMethod('increment');
    expect(tester.state.count).toBe(6);

    // Wait for async operations
    setTimeout(() => tester.callMethod('setCount', 100), 100);
    await tester.waitForState({ count: 100 });
  });
});
```

## Documentation

Comprehensive documentation with examples, best practices, and API references:

- **[NgSpark Documentation](https://khvedela.github.io/ng-spark/)**
- **[Forms-X Documentation](https://khvedela.github.io/ng-spark/docs/forms-x)**
- **[Signal Store Testing Documentation](./packages/signal-store-testing/README.md)**

## Development

This repository uses [Nx](https://nx.dev) for monorepo management.

### Getting Started

```bash
# Clone the repository
git clone https://github.com/khvedela/ng-spark.git
cd ng-spark

# Install dependencies
npm install
```

### Common Commands

```bash
# Build all packages
npx nx run-many -t build

# Build specific package
npx nx build forms-x
npx nx build signal-store-testing

# Run tests
npx nx run-many -t test

# Test specific package
npx nx test forms-x
npx nx test signal-store-testing

# Lint
npx nx run-many -t lint

# Deploy documentation
npm run deploy:docs

# Visualize project graph
npx nx graph
```

### Versioning and Releasing

To version and release the libraries:

```bash
# Dry run (preview changes)
npx nx release --dry-run

# Publish release
npx nx release
```

[Learn more about Nx release](https://nx.dev/features/manage-releases)

## Contributing

Contributions are welcome! We appreciate your interest in making NgSpark better.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and add tests
4. **Ensure tests pass** (`npx nx run-many -t test`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features and bug fixes
- Update documentation as needed
- Keep commits atomic and write clear commit messages
- Ensure all tests pass before submitting PR

### Reporting Issues

Found a bug or have a feature request? Please open an issue on GitHub:

**[Report an Issue](https://github.com/khvedela/ng-spark/issues)**

## License

MIT © [NgSpark Team](https://github.com/khvedela/ng-spark)

See [LICENSE](./LICENSE) for more information.

## Acknowledgments

Built with:
- [Angular](https://angular.dev) - The modern web developer's platform
- [Nx](https://nx.dev) - Smart monorepos, fast CI
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [NgRx Signals](https://ngrx.io/guide/signals) - Reactive state management

---

**Made with ❤️ by the NgSpark Team**