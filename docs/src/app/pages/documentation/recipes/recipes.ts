import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, CodeBlockComponent],
  templateUrl: './recipes.html',
  styleUrl: './recipes.scss',
})
export class RecipesComponent {
  // CRUD Example
  crudStoreCode = `export const UserStore = signalStore(
  withState({ 
    users: [] as User[], 
    isLoading: false, 
    error: null as string | null 
  }),
  withMethods((store, usersService = inject(UsersService)) => ({
    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        exhaustMap(() => 
          usersService.getAll().pipe(
            tapResponse({
              next: (users) => patchState(store, { users, isLoading: false }),
              error: (err: any) => patchState(store, { error: err.message, isLoading: false }),
            })
          )
        )
      )
    )
  }))
);`;

  crudTestCode = `it('should load users successfully', async () => {
  // Mock the service response
  mockUsersService.getAll.and.returnValue(of(mockUsers));

  // Trigger the load
  tester.callMethod('loadUsers');

  // Check loading state immediately
  tester.expectState({ isLoading: true });

  // Wait for async operation to complete
  await tester.waitForState({ isLoading: false });

  // Verify final state
  tester.expectState({ 
    users: mockUsers, 
    error: null 
  });
});

it('should handle errors', async () => {
  mockUsersService.getAll.and.returnValue(throwError(() => new Error('Failed')));

  tester.callMethod('loadUsers');
  await tester.waitForState({ isLoading: false });

  tester.expectState({ 
    users: [], 
    error: 'Failed' 
  });
});`;

  // Auth Example
  authStoreCode = `export const AuthStore = signalStore(
  withState({ user: null as User | null, token: null as string | null }),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
    isAdmin: computed(() => user()?.role === 'admin'),
  })),
  withMethods((store) => ({
    login(user: User, token: string) {
      patchState(store, { user, token });
      localStorage.setItem('token', token);
    },
    logout() {
      patchState(store, { user: null, token: null });
      localStorage.removeItem('token');
    }
  }))
);`;

  authTestCode = `it('should login and update computed signals', () => {
  tester.callMethod('login', mockUser, 'fake-token');

  tester.expectState({ 
    user: mockUser, 
    token: 'fake-token' 
  });
  
  // Check computed signals
  tester.expectComputed('isAuthenticated', true);
  tester.expectComputed('isAdmin', true);
});

it('should logout and clear state', () => {
  // Setup initial state
  tester.patchState({ user: mockUser, token: 'fake-token' });

  tester.callMethod('logout');

  tester.expectState({ user: null, token: null });
  tester.expectComputed('isAuthenticated', false);
});`;

  // Search Example
  searchStoreCode = `export const SearchStore = signalStore(
  withState({ query: '', results: [] }),
  withMethods((store, searchService = inject(SearchService)) => ({
    updateQuery: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => patchState(store, { query })),
        switchMap((query) => searchService.search(query).pipe(
           tapResponse({
             next: (results) => patchState(store, { results }),
             error: console.error
           })
        ))
      )
    )
  }))
);`;

  searchTestCode = `it('should debounce search query', async () => {
  jest.useFakeTimers();
  
  // 1. Initial call
  tester.callMethod('updateQuery', 'a');
  jest.advanceTimersByTime(100);
  
  // 2. Rapid second call
  tester.callMethod('updateQuery', 'ab');
  jest.advanceTimersByTime(300); // Advance past debounce

  // Should only process 'ab'
  expect(searchService.search).toHaveBeenCalledTimes(1);
  expect(searchService.search).toHaveBeenCalledWith('ab');
  
  jest.useRealTimers();
});`;
}