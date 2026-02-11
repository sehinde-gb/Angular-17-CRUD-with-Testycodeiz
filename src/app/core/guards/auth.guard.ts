import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);

  if (storage.getToken()) return true;

  router.navigate(['/auth/login'],{
    queryParams: { returnUrl: state.url}
  });
  
  return false;

};
