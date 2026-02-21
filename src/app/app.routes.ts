import { Routes } from '@angular/router';
import { IndexComponent } from './features/posts/pages/index/index.component';
import { CreateComponent } from './features/posts/pages/create/create.component';
import { EditComponent } from './features/posts/pages/edit/edit.component';
import { ViewComponent } from './features/posts/pages/view/view.component';
import { postResolver} from './features/posts/resolvers/post.resolver';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'post/index', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component')
            .then(m => m.LoginComponent),
      }
    ]
  },

  {
    path: 'post',
    canActivate: [authGuard],
    children: [
      { path: 'index', component: IndexComponent, title: 'Posts' },
      { path: 'create', component: CreateComponent, title: 'Create Posts' },
      { path: ':postId/edit', 
        component: EditComponent, 
        title: 'Edit Post',
        resolve: {post: postResolver},
        runGuardsAndResolvers: 'always'  
      },
      // This view uses the resolver to find the id
      { path: ':postId/view', 
        component: ViewComponent, 
        title: 'View Post',
        resolve: {post: postResolver},
        // makes retry on same URL work reliably
        runGuardsAndResolvers: 'always' 
      },
      { path: '', redirectTo: 'index', pathMatch: 'full' }
    ]
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./features/admin/pages/admin-dashboard/admin-dashboard.component')
        .then(m => m.AdminDashboardComponent),
  },

  {
    path: 'forbidden',
    loadComponent: () =>
      import('./shared/pages/forbidden/forbidden.component')
        .then(m => m.ForbiddenComponent),
  },

  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
  }
];