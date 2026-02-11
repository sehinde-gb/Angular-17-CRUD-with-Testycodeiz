import { Routes } from '@angular/router';
import { IndexComponent } from './post/index/index.component';
import { CreateComponent } from './post/create/create.component';
import { EditComponent } from './post/edit/edit.component';
import { ViewComponent } from './post/view/view.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'post/index', pathMatch: 'full' },

  { path: 'post', redirectTo: 'post/index', pathMatch: 'full' },

  {
    path: 'post/index',
    component: IndexComponent,
    canActivate: [authGuard]
  },
  {
    path: 'post/create',
    component: CreateComponent,
    canActivate: [authGuard]
  },
  {
    path: 'post/:postId/edit',
    component: EditComponent,
    canActivate: [authGuard]
  },
  {
    path: 'post/:postId/view',
    component: ViewComponent,
    canActivate: [authGuard]
  },

  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent)
  }
];

