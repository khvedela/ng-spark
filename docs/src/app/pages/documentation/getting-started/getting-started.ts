import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';

@Component({
  selector: 'app-getting-started',
  standalone: true,
  imports: [CommonModule, CodeBlockComponent],
  templateUrl: './getting-started.html',
  styleUrl: './getting-started.scss',
})
export class GettingStartedComponent {
  installCmd = 'npm install @ng-spark/signal-store-testing --save-dev';
  
  quickStartCode = `import { TestBed } from '@angular/core/testing';
import { createSignalStoreTester } from '@ng-spark/signal-store-testing';
import { MyStore } from './my.store';

describe('MyStore', () => {
  let tester: ReturnType<typeof createSignalStoreTester<InstanceType<typeof MyStore>>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyStore],
    });

    const store = TestBed.inject(MyStore);
    tester = createSignalStoreTester(store);
  });

  it('should manage state', () => {
    // Read state
    expect(tester.state.count).toBe(0);

    // Update state
    tester.patchState({ count: 5 });

    // Assert state
    tester.expectState({ count: 5 });
  });
});`;
}