import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forms-x-getting-started',
  standalone: true,
  imports: [CommonModule, CodeBlockComponent, RouterLink],
  templateUrl: './getting-started.html',
  styleUrl: './getting-started.scss',
})
export class FormsXGettingStartedComponent {
  installCmd = 'npm install @ng-spark/forms-x';

  quickStartCode = `import { Component, signal } from '@angular/core';
import { FormTracker, SignalArray, SparkAsyncValidator } from '@ng-spark/forms-x';

@Component({
  selector: 'app-user-form',
  template: \`
    <form>
      <input [debounceField]="username" [debounceTime]="300" />
      @if (usernameValidator.error()) {
        <span>{{ usernameValidator.error() }}</span>
      }
      <button [disabled]="!isDirty()">Save Changes</button>
    </form>
  \`
})
export class UserFormComponent {
  username = signal('');
  formModel = signal({ name: '', email: '', tags: [] });

  // Track form changes
  tracker = new FormTracker(this.formModel);
  isDirty = this.tracker.isDirty;

  // Async validation
  usernameValidator = new SparkAsyncValidator({
    source: this.username,
    validate: async (val) => {
      const exists = await this.checkUsername(val);
      return exists ? 'Username taken' : null;
    }
  });

  // Array management
  tags = SignalArray.from(this.formModel, 'tags');
}`;

  featuresCode = `// ✅ Reactive array management with familiar API
const todos = SignalArray.from(formSignal, 'todos');
todos.push({ id: 1, text: 'Learn Angular' });

// ✅ Track form dirty state automatically
const tracker = new FormTracker(formSignal);
console.log(tracker.isDirty()); // true/false

// ✅ Async validation with loading states
const validator = new SparkAsyncValidator({
  source: emailSignal,
  validate: (email) => this.api.checkEmail(email)
});

// ✅ Debounced two-way binding directive
<input [debounceField]="searchQuery" [debounceTime]="300" />`;
}
