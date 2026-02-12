import { Routes } from '@angular/router';
import {IndexComponent } from './features/posts/pages/index/index.component'
import { CreateComponent } from './features/posts/pages/create/create.component';
import { EditComponent } from './features/posts/pages/edit/edit.component';
import { ViewComponent } from './features/posts/pages/view/view.component';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'post/index', pathMatch: 'full' },

  { path: 'auth', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'auth/login',
    canActivate: [guestGuard],
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

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./features/admin/pages/admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent)
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/pages/forbidden/forbidden.component')
        .then(m => m.ForbiddenComponent)
  },
  // 404
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component')
        .then(m => m.NotFoundComponent)
  }
];

