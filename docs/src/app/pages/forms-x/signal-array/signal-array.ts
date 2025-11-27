import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';

@Component({
  selector: 'app-signal-array',
  standalone: true,
  imports: [CommonModule, CodeBlockComponent],
  templateUrl: './signal-array.html',
  styleUrl: './signal-array.scss',
})
export class SignalArrayComponent {
  basicUsageCode = `import { Component, signal } from '@angular/core';
import { SignalArray } from '@ng-spark/forms-x';

@Component({
  selector: 'app-todo-list',
  template: \`
    @for (todo of todos.value(); track todo.id) {
      <div>
        {{ todo.text }}
        <button (click)="todos.removeBy(t => t.id === todo.id)">Delete</button>
      </div>
    }
    <button (click)="addTodo()">Add Todo</button>
  \`
})
export class TodoListComponent {
  // Wrap a standalone signal
  todosSignal = signal([
    { id: 1, text: 'Learn Angular' },
    { id: 2, text: 'Build awesome app' }
  ]);

  todos = SignalArray.wrap(this.todosSignal);

  addTodo() {
    this.todos.push({
      id: Date.now(),
      text: 'New todo'
    });
  }
}`;

  fromParentCode = `interface FormModel {
  name: string;
  tags: string[];
  users: User[];
}

@Component({/* ... */})
export class FormComponent {
  formModel = signal<FormModel>({
    name: 'John',
    tags: ['angular', 'typescript'],
    users: []
  });

  // Create SignalArray from parent signal property
  tags = SignalArray.from(this.formModel, 'tags');
  users = SignalArray.from(this.formModel, 'users');

  addTag(tag: string) {
    // Automatically updates formModel.tags immutably
    this.tags.push(tag);
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  }
}`;

  methodsCode = `const items = SignalArray.wrap(signal(['a', 'b', 'c']));

// Add items
items.push('d');              // ['a', 'b', 'c', 'd']
items.insert(1, 'x');         // ['a', 'x', 'b', 'c', 'd']

// Remove items
items.removeAt(0);            // ['x', 'b', 'c', 'd']
items.removeBy(x => x === 'b'); // ['x', 'c', 'd']

// Update items
items.updateAt(0, x => x.toUpperCase()); // ['X', 'c', 'd']

// Reorder items
items.move(0, 2);             // ['c', 'd', 'X']

// Replace/clear
items.set(['new', 'array']);  // ['new', 'array']
items.clear();                // []`;

  reactiveCode = `@Component({
  template: \`
    <p>Total items: {{ items.length() }}</p>
    <p>First item: {{ items.at(0)() }}</p>

    @for (item of items.value(); track item.id) {
      <div>{{ item.name }}</div>
    }
  \`
})
export class ListComponent {
  items = SignalArray.wrap(signal([...]));

  // Reactive computed values
  totalItems = this.items.length;
  firstItem = this.items.at(0);
  allItems = this.items.value;
}`;

  dragDropCode = `import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SignalArray } from '@ng-spark/forms-x';

@Component({
  template: \`
    <div cdkDropList (cdkDropListDropped)="onDrop($event)">
      @for (item of items.value(); track item.id) {
        <div cdkDrag>{{ item.name }}</div>
      }
    </div>
  \`
})
export class DragDropComponent {
  items = SignalArray.wrap(signal([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ]));

  onDrop(event: CdkDragDrop<any>) {
    // Handles reordering automatically
    this.items.move(event.previousIndex, event.currentIndex);
  }
}`;

  dynamicFormsCode = `interface FormModel {
  name: string;
  phoneNumbers: { type: string; number: string }[];
}

@Component({
  template: \`
    <div>
      @for (phone of phones.value(); track $index) {
        <div>
          <input [debounceField]="phoneTypeSignal($index)" />
          <input [debounceField]="phoneNumberSignal($index)" />
          <button (click)="phones.removeAt($index)">Remove</button>
        </div>
      }
      <button (click)="addPhone()">Add Phone</button>
    </div>
  \`
})
export class ContactFormComponent {
  formModel = signal<FormModel>({
    name: 'John Doe',
    phoneNumbers: [
      { type: 'home', number: '555-1234' }
    ]
  });

  phones = SignalArray.from(this.formModel, 'phoneNumbers');

  addPhone() {
    this.phones.push({ type: 'mobile', number: '' });
  }
}`;

  bestPracticesCode = `// ✅ DO: Use with parent signal for form fields
const formModel = signal({ items: [] });
const items = SignalArray.from(formModel, 'items');

// ✅ DO: Use track function in templates
@for (item of items.value(); track item.id) { }

// ✅ DO: Access reactive length
@if (items.length() > 0) {
  <p>You have items!</p>
}

// ❌ DON'T: Mutate the signal directly
items.value().push(item); // Wrong! Won't trigger reactivity

// ❌ DON'T: Access length as property
items.length.value // Wrong! Use items.length()`;
}
