import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';

@Component({
  selector: 'app-form-tracker',
  standalone: true,
  imports: [CommonModule, CodeBlockComponent],
  templateUrl: './form-tracker.html',
  styleUrl: './form-tracker.scss',
})
export class FormTrackerComponent {
  basicUsageCode = `import { Component, signal } from '@angular/core';
import { FormTracker } from '@ng-spark/forms-x';

interface UserForm {
  name: string;
  email: string;
  age: number;
}

@Component({
  selector: 'app-user-form',
  template: \`
    <form>
      <input [debounceField]="nameSignal" />
      <input [debounceField]="emailSignal" />
      <input [debounceField]="ageSignal" />

      @if (tracker.isDirty()) {
        <p>You have unsaved changes</p>
      }

      <button
        (click)="save()"
        [disabled]="!tracker.isDirty()"
      >
        Save
      </button>

      <button
        (click)="tracker.reset()"
        [disabled]="!tracker.isDirty()"
      >
        Discard Changes
      </button>
    </form>
  \`
})
export class UserFormComponent {
  formModel = signal<UserForm>({
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  });

  // Create tracker - automatically captures initial baseline
  tracker = new FormTracker(this.formModel);

  async save() {
    await this.api.saveUser(this.formModel());
    // Commit the new baseline after successful save
    this.tracker.commit();
  }
}`;

  dirtyFieldsCode = `@Component({
  template: \`
    @if (tracker.isDirty()) {
      <div>
        <p>Changed fields:</p>
        <pre>{{ tracker.dirtyFields() | json }}</pre>

        <!-- Send only changed fields to API -->
        <button (click)="saveChanges()">Save Changes</button>
      </div>
    }
  \`
})
export class PatchUpdateComponent {
  formModel = signal({
    name: 'John',
    email: 'john@example.com',
    age: 30
  });

  tracker = new FormTracker(this.formModel);

  async saveChanges() {
    // Send only the fields that changed
    const changes = this.tracker.dirtyFields();
    // { email: 'newemail@example.com' } - only changed fields

    await this.api.patchUser(this.userId, changes);
    this.tracker.commit();
  }
}`;

  nestedObjectsCode = `interface FormModel {
  user: {
    name: string;
    address: {
      city: string;
      zip: string;
    };
  };
  tags: string[];
}

@Component({/* ... */})
export class NestedFormComponent {
  formModel = signal<FormModel>({
    user: {
      name: 'John',
      address: {
        city: 'NYC',
        zip: '10001'
      }
    },
    tags: ['angular', 'typescript']
  });

  tracker = new FormTracker(this.formModel);

  updateCity() {
    this.formModel.update(form => ({
      ...form,
      user: {
        ...form.user,
        address: {
          ...form.user.address,
          city: 'Los Angeles'
        }
      }
    }));

    // tracker.isDirty() is now true
    // tracker.dirtyFields() contains the updated user object
  }
}`;

  apiPatternCode = `@Component({/* ... */})
export class EditFormComponent {
  formModel = signal<User>({
    id: 1,
    name: '',
    email: ''
  });

  tracker = new FormTracker(this.formModel);

  ngOnInit() {
    this.loadUser();
  }

  async loadUser() {
    const user = await this.api.getUser(this.userId);
    this.formModel.set(user);

    // Reset baseline after loading data
    this.tracker.commit();
  }

  async save() {
    try {
      await this.api.updateUser(this.formModel());
      this.tracker.commit(); // New baseline after successful save
      this.showSuccess('Changes saved!');
    } catch (error) {
      // Don't commit on error - keep dirty state
      this.showError('Save failed');
    }
  }

  cancel() {
    if (this.tracker.isDirty()) {
      if (confirm('Discard unsaved changes?')) {
        this.tracker.reset(); // Revert to baseline
      }
    }
  }
}`;

  navigationGuardCode = `import { CanDeactivateFn } from '@angular/router';

export const unsavedChangesGuard: CanDeactivateFn<ComponentWithTracker> = (component) => {
  if (component.tracker.isDirty()) {
    return confirm('You have unsaved changes. Do you want to leave?');
  }
  return true;
};

// In routes
{
  path: 'edit/:id',
  component: EditFormComponent,
  canDeactivate: [unsavedChangesGuard]
}

// Component interface
interface ComponentWithTracker {
  tracker: FormTracker<any>;
}`;

  bestPracticesCode = `// ✅ DO: Commit after successful API calls
async save() {
  await this.api.save(this.formModel());
  this.tracker.commit(); // Set new baseline
}

// ✅ DO: Commit after loading initial data
ngOnInit() {
  this.loadData().then(() => {
    this.tracker.commit(); // Reset baseline to loaded data
  });
}

// ✅ DO: Check isDirty before expensive operations
if (this.tracker.isDirty()) {
  await this.api.save(this.tracker.dirtyFields());
}

// ✅ DO: Use reset() to discard changes
this.tracker.reset(); // Reverts to baseline

// ❌ DON'T: Commit on API errors
try {
  await this.api.save();
  this.tracker.commit(); // ✓
} catch (error) {
  this.tracker.commit(); // ✗ Don't commit on error!
}`;
}
