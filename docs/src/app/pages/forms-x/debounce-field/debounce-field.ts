import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';

@Component({
  selector: 'app-debounce-field',
  standalone: true,
  imports: [CommonModule, CodeBlockComponent],
  templateUrl: './debounce-field.html',
  styleUrl: './debounce-field.scss',
})
export class DebounceFieldComponent {
  basicUsageCode = `import { Component, signal } from '@angular/core';
import { DebounceFieldDirective } from '@ng-spark/forms-x';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [DebounceFieldDirective],
  template: \`
    <input
      type="text"
      [debounceField]="searchQuery"
      [debounceTime]="300"
      placeholder="Search..."
    />
    <p>Current query: {{ searchQuery() }}</p>
  \`
})
export class SearchComponent {
  searchQuery = signal('');

  // searchQuery updates 300ms after user stops typing
}`;

  twoWayBindingCode = `@Component({
  template: \`
    <input [debounceField]="username" />

    <!-- Signal automatically updates after debounce -->
    <p>Username: {{ username() }}</p>

    <!-- Programmatic updates sync back to input -->
    <button (click)="clearUsername()">Clear</button>
  \`
})
export class FormComponent {
  username = signal('');

  clearUsername() {
    this.username.set(''); // ← Input field updates immediately
  }
}`;

  transformCode = `@Component({
  template: \`
    <input
      [debounceField]="email"
      [transform]="trimAndLowercase"
    />
  \`
})
export class EmailInputComponent {
  email = signal('');

  // Transform function applied before updating signal
  trimAndLowercase = (value: string) => {
    return value.trim().toLowerCase();
  };
}

// User types: "  JOHN@EXAMPLE.COM  "
// Signal receives: "john@example.com"`;

  searchExampleCode = `import { effect } from '@angular/core';

@Component({
  template: \`
    <input
      [debounceField]="searchQuery"
      [debounceTime]="400"
      placeholder="Search users..."
    />

    @if (isSearching()) {
      <div class="spinner">Searching...</div>
    }

    @for (user of searchResults(); track user.id) {
      <div class="user-card">{{ user.name }}</div>
    }
  \`
})
export class UserSearchComponent {
  searchQuery = signal('');
  isSearching = signal(false);
  searchResults = signal<User[]>([]);

  constructor() {
    // React to search query changes
    effect(() => {
      const query = this.searchQuery();
      if (query) {
        this.performSearch(query);
      } else {
        this.searchResults.set([]);
      }
    });
  }

  async performSearch(query: string) {
    this.isSearching.set(true);
    try {
      const results = await this.api.searchUsers(query);
      this.searchResults.set(results);
    } finally {
      this.isSearching.set(false);
    }
  }
}`;

  autocompleteCode = `import { effect } from '@angular/core';

@Component({
  template: \`
    <div class="autocomplete">
      <input
        [debounceField]="query"
        [debounceTime]="200"
        (blur)="hideSuggestions()"
      />

      @if (showSuggestions() && suggestions().length > 0) {
        <ul class="suggestions">
          @for (item of suggestions(); track item.id) {
            <li (mousedown)="select(item)">
              {{ item.name }}
            </li>
          }
        </ul>
      }
    </div>
  \`
})
export class AutocompleteComponent {
  query = signal('');
  suggestions = signal<Item[]>([]);
  showSuggestions = signal(false);

  constructor() {
    effect(() => {
      const q = this.query();
      if (q.length >= 2) {
        this.loadSuggestions(q);
        this.showSuggestions.set(true);
      } else {
        this.suggestions.set([]);
        this.showSuggestions.set(false);
      }
    });
  }

  async loadSuggestions(query: string) {
    const results = await this.api.getSuggestions(query);
    this.suggestions.set(results);
  }

  select(item: Item) {
    this.query.set(item.name);
    this.showSuggestions.set(false);
  }

  hideSuggestions() {
    // Delay to allow click event to fire
    setTimeout(() => this.showSuggestions.set(false), 200);
  }
}`;

  blurBehaviorCode = `// Input events are debounced
<input [debounceField]="field" [debounceTime]="300" />

// Typing "hello"
// After 300ms → signal updates to "hello"

// User types "hello world" then immediately clicks away
// Blur event fires → signal updates IMMEDIATELY to "hello world"
// (Doesn't wait for debounce)`;

  textareaCode = `@Component({
  template: \`
    <textarea
      [debounceField]="description"
      [debounceTime]="500"
      rows="5"
    ></textarea>

    <p>Character count: {{ description().length }}</p>
  \`
})
export class TextareaComponent {
  description = signal('');
}`;

  bestPracticesCode = `// ✅ DO: Use appropriate debounce times
// - Search/Filter: 200-400ms
// - API calls: 400-600ms
// - Local operations: 150-300ms
<input [debounceField]="search" [debounceTime]="300" />

// ✅ DO: Transform user input when needed
<input
  [debounceField]="email"
  [transform]="trimAndLowercase"
/>

// ✅ DO: Combine with async validation
validator = new SparkAsyncValidator({
  source: this.email,
  validate: (val) => this.api.check(val)
});

// ✅ DO: Use signal reactivity
effect(() => {
  const query = this.searchQuery();
  this.performSearch(query);
});

// ❌ DON'T: Set debounce too low
<input [debounceField]="field" [debounceTime]="50" />
// Creates too many updates

// ❌ DON'T: Use with [(ngModel)]
<input
  [(ngModel)]="value"
  [debounceField]="signal"
/>
// Conflicts! Use one or the other`;
}
