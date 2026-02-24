import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { GlobalLoadingService } from '../services/global-loading.service';


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(GlobalLoadingService);

  // Increment active request counter
  loadingService.show();

  return next(req).pipe(
    // Always runs when request completes OR errors
    finalize(() => loadingService.hide())
  );
};