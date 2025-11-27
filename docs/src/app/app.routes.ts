import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { GettingStartedComponent } from './pages/documentation/getting-started/getting-started';
import { ApiReferenceComponent } from './pages/documentation/api-reference/api-reference';
import { GuidesComponent } from './pages/documentation/guides/guides';
import { RecipesComponent } from './pages/documentation/recipes/recipes';

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
  { path: '**', redirectTo: '' }
];