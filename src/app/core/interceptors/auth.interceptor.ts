import { HttpInterceptorFn } from '@angular/common/http';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(TokenStorageService);
  const token = storage.getToken();

  if(!token) return next(req);

  const authReq = req.clone({
    setHeaders: {Authorization: `Bearer ${token}`}
  });
  
  return next(authReq);
};
