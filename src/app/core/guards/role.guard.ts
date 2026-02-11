import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';
import { inject } from '@angular/core';
import { UserRole } from '../../features/auth/models/auth.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);

  const required = (route.data?.['roles'] as UserRole[] | undefined) ?? [];
  const role = storage.getRole() as UserRole | null;

  if(required.length === 0) return true;
  if (role && required.includes(role)) return true;

  router.navigate(['/post/index']);


  return false;
};
