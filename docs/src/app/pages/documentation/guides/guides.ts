import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule, MatTabsModule, CodeBlockComponent],
  templateUrl: './guides.html',
  styleUrl: './guides.scss',
})
export class GuidesComponent {
  jestConfig = `// jest.config.ts
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};`;

  vitestConfig = `// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup-vitest.ts'],
  },
});`;

  spectatorExample = `import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { createSignalStoreTester } from '@ng-spark/signal-store-testing';
import { UserStore } from './user.store';

describe('UserStore with Spectator', () => {
  let spectator: SpectatorService<UserStore>;
  let tester: ReturnType<typeof createSignalStoreTester<UserStore>>;

  const createService = createServiceFactory(UserStore);

  beforeEach(() => {
    spectator = createService();
    tester = createSignalStoreTester(spectator.service);
  });

  it('should work with spectator', () => {
    tester.patchState({ users: [] });
    tester.expectState({ users: [] });
  });
});`;
}