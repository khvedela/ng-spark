import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';

@Component({
  selector: 'app-async-validator',
  standalone: true,
  imports: [CommonModule, CodeBlockComponent],
  templateUrl: './async-validator.html',
  styleUrl: './async-validator.scss',
})
export class AsyncValidatorComponent {
  basicUsageCode = `import { Component, signal, inject } from '@angular/core';
import { SparkAsyncValidator } from '@ng-spark/forms-x';

@Component({
  selector: 'app-username-input',
  template: \`
    <div>
      <input [debounceField]="username" />

      @if (validator.isLoading()) {
        <span class="text-gray-500">
          Checking availability...
        </span>
      }

      @if (validator.error()) {
        <span class="text-red-500">
          {{ validator.error() }}
        </span>
      }

      @if (!validator.isLoading() && !validator.error()) {
        <span class="text-green-500">
          ✓ Available
        </span>
      }
    </div>
  \`
})
export class UsernameInputComponent {
  username = signal('');
  private api = inject(UserApiService);

  validator = new SparkAsyncValidator({
    source: this.username,
    validate: async (username) => {
      const available = await this.api.checkUsername(username);
      return available ? null : 'Username is taken';
    },
    debounce: 400 // Wait 400ms after typing stops
  });
}`;

  observableCode = `import { SparkAsyncValidator } from '@ng-spark/forms-x';
import { of, delay } from 'rxjs';

validator = new SparkAsyncValidator({
  source: this.email,

  // Return Observable
  validate: (email) => {
    return this.api.checkEmail(email).pipe(
      map(exists => exists ? 'Email already registered' : null)
    );
  },

  debounce: 300
});`;

  promiseCode = `validator = new SparkAsyncValidator({
  source: this.email,

  // Return Promise
  validate: async (email) => {
    const exists = await this.api.checkEmail(email);
    return exists ? 'Email already registered' : null;
  },

  debounce: 300
});`;

  customErrorCode = `interface ValidationError {
  field: string;
  message: string;
  code: string;
}

validator = new SparkAsyncValidator<string, ValidationError>({
  source: this.email,

  validate: async (email) => {
    const result = await this.api.validateEmail(email);
    if (!result.valid) {
      return {
        field: 'email',
        message: result.message,
        code: result.errorCode
      };
    }
    return null;
  }
});

// In template
@if (validator.error(); as error) {
  <span>{{ error.message }} (Code: {{ error.code }})</span>
}`;

  loadingStateCode = `@Component({
  template: \`
    <input [debounceField]="username" />

    @switch (validator.status()) {
      @case ('idle') {
        <span>Enter a username</span>
      }
      @case ('loading') {
        <spinner /> Validating...
      }
      @case ('error') {
        <span class="error">{{ validator.error() }}</span>
      }
      @case ('loaded') {
        @if (!validator.error()) {
          <span class="success">✓ Valid</span>
        }
      }
    }
  \`
})
export class ValidatedInputComponent {
  username = signal('');

  validator = new SparkAsyncValidator({
    source: this.username,
    validate: (username) => this.api.check(username)
  });

  // Access individual signals
  isLoading = this.validator.isLoading; // Signal<boolean>
  error = this.validator.error;         // Signal<Error | null>
  status = this.validator.status;       // Signal<ResourceStatus>
}`;

  reactiveFormsCode = `import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({/* ... */})
export class ReactiveFormComponent {
  emailControl = new FormControl('');

  // Convert FormControl value to signal
  emailSignal = toSignal(
    this.emailControl.valueChanges,
    { initialValue: '' }
  );

  // Use with SparkAsyncValidator
  emailValidator = new SparkAsyncValidator({
    source: this.emailSignal,
    validate: (email) => this.api.checkEmail(email)
  });

  // Use as validator function
  ngOnInit() {
    this.emailControl.setAsyncValidators(
      this.emailValidator.asValidator()
    );
  }
}`;

  multiFieldCode = `@Component({/* ... */})
export class MultiValidationComponent {
  username = signal('');
  email = signal('');
  website = signal('');

  // Validate username
  usernameValidator = new SparkAsyncValidator({
    source: this.username,
    validate: (val) => this.api.checkUsername(val),
    debounce: 400
  });

  // Validate email
  emailValidator = new SparkAsyncValidator({
    source: this.email,
    validate: (val) => this.api.checkEmail(val),
    debounce: 300
  });

  // Validate website URL
  websiteValidator = new SparkAsyncValidator({
    source: this.website,
    validate: async (url) => {
      const reachable = await this.api.pingUrl(url);
      return reachable ? null : 'Website not reachable';
    },
    debounce: 500
  });

  // Combined validation state
  isFormValid = computed(() =>
    !this.usernameValidator.error() &&
    !this.emailValidator.error() &&
    !this.websiteValidator.error() &&
    !this.usernameValidator.isLoading() &&
    !this.emailValidator.isLoading() &&
    !this.websiteValidator.isLoading()
  );
}`;

  bestPracticesCode = `// ✅ DO: Use appropriate debounce times
new SparkAsyncValidator({
  source: this.username,
  validate: (val) => this.api.check(val),
  debounce: 400 // Good for user input
});

// ✅ DO: Return null for valid values
validate: async (email) => {
  const valid = await this.api.check(email);
  return valid ? null : 'Invalid email';
}

// ✅ DO: Handle empty values in your validate function
validate: async (value) => {
  if (!value) return null; // Skip validation for empty
  return await this.api.check(value);
}

// ✅ DO: Use loading state in UI
<button [disabled]="validator.isLoading()">Submit</button>

// ❌ DON'T: Set debounce too low (creates too many API calls)
debounce: 50 // Too aggressive!

// ❌ DON'T: Forget to handle the loading state
// Users need feedback while validation is in progress`;
}
