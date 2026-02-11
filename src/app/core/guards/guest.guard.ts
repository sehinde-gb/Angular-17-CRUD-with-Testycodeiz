import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = () => {
  const storage = inject(TokenStorageService);
  const router = inject(Router);

  if(storage.getToken()) {
    router.navigate(['/post/index']);
    return false;
  }

  return true;
};
