import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';

@Component({
  selector: 'app-api-reference',
  standalone: true,
  imports: [CommonModule, CodeBlockComponent],
  templateUrl: './api-reference.html',
  styleUrl: './api-reference.scss',
})
export class ApiReferenceComponent {
  createTesterCode = `const tester = createSignalStoreTester(store, {
  autoDetectChanges: true, // default
  recordHistory: false     // default
});`;

  stateCode = `// Read
const count = tester.state.count;

// Set (Replace)
tester.setState({ count: 10 });

// Patch (Merge)
tester.patchState({ count: 5 });

// Assert Match
tester.expectState({ count: 5 });

// Assert Partial Contain
tester.expectStateToContain({ count: 5 });`;

  computedCode = `// Get value
const doubleCount = tester.getComputed('doubleCount');

// Assert value
tester.expectComputed('doubleCount', 20);`;

  methodCode = `// Call method
tester.callMethod('increment');

// Call with args
tester.callMethod('setCount', 10);`;

  asyncCode = `// Wait for state
await tester.waitForState({ isLoading: false });

// Wait for computed
await tester.waitForComputed('hasData', true);

// Wait with predicate
await tester.waitForState(state => state.items.length > 0);`;

  historyCode = `const history = tester.startRecording();

tester.patchState({ val: 1 });
tester.patchState({ val: 2 });

history.goBack(); // val is 1`;
}