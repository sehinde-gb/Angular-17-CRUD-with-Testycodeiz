import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);

  const requiredRoles = route.data?.['roles'] as string[] | undefined;
  if (!requiredRoles?.length) return true;

  const role = storage.getRole();
  if (role && requiredRoles.includes(role)) return true;

  return router.createUrlTree(['/forbidden'], {
    queryParams: { from: state.url }
  });
};