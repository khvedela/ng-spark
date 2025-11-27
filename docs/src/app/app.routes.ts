import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { GettingStartedComponent } from './pages/documentation/getting-started/getting-started';
import { ApiReferenceComponent } from './pages/documentation/api-reference/api-reference';
import { GuidesComponent } from './pages/documentation/guides/guides';
import { RecipesComponent } from './pages/documentation/recipes/recipes';
import { FormsXGettingStartedComponent } from './pages/forms-x/getting-started/getting-started';
import { SignalArrayComponent } from './pages/forms-x/signal-array/signal-array';
import { FormTrackerComponent } from './pages/forms-x/form-tracker/form-tracker';
import { AsyncValidatorComponent } from './pages/forms-x/async-validator/async-validator';
import { DebounceFieldComponent } from './pages/forms-x/debounce-field/debounce-field';

export const appRoutes: Route[] = [
  { path: '', component: HomeComponent },
  {
    path: 'docs/signal-store-testing',
    children: [
      { path: 'getting-started', component: GettingStartedComponent },
      { path: 'api-reference', component: ApiReferenceComponent },
      { path: 'guides', component: GuidesComponent },
      { path: 'recipes', component: RecipesComponent },
      { path: '', redirectTo: 'getting-started', pathMatch: 'full' }
    ]
  },
  {
    path: 'docs/forms-x',
    children: [
      { path: 'getting-started', component: FormsXGettingStartedComponent },
      { path: 'signal-array', component: SignalArrayComponent },
      { path: 'form-tracker', component: FormTrackerComponent },
      { path: 'async-validator', component: AsyncValidatorComponent },
      { path: 'debounce-field', component: DebounceFieldComponent },
      { path: '', redirectTo: 'getting-started', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];