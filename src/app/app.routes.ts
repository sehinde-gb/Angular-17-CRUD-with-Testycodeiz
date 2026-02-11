import { Routes } from '@angular/router';
import { IndexComponent } from './post/index/index.component';
import { CreateComponent } from './post/create/create.component';
import { EditComponent } from './post/edit/edit.component';
import { ViewComponent } from './post/view/view.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'post/index', pathMatch: 'full' },

  { path: 'auth', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'post',
    canActivate: [authGuard],
    children: [
      { path: 'index', component: IndexComponent },
      { path: 'create', component: CreateComponent },
      { path: ':postId/edit', component: EditComponent },
      { path: ':postId/view', component: ViewComponent },
      { path: '', redirectTo: 'index', pathMatch: 'full' }
      ]
  },
  // 404
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component')
        .then(m => m.NotFoundComponent)
  }
];

