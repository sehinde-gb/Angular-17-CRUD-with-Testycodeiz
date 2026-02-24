import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../../shared/services/toast.service';
import { catchError, retry, throwError, timer } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(

    /*
    ---------------------------
    1. Retry logic (GET only)
    ---------------------------
    Retries network/server failures twice using backoff.
    */
    retry({
      count: 2,
      delay: (error, retryCount) => {
        const isRetryableStatus = error.status >= 500 || error.status === 0;
        const isGet = req.method === 'GET';

        if (isGet && isRetryableStatus) {
          return timer(1000 * retryCount);
        }

        return throwError(() => error);
      }
    }),

    /*
    ---------------------------
    2. Global error handling
    ---------------------------
    */
    catchError((error: HttpErrorResponse) => {

      // Validation errors handled locally by components
      if (error.status === 400 || error.status === 422) {
        return throwError(() => error);
      }

      let message = 'An unexpected error has occurred';

      switch (error.status) {
        case 0:
          message = 'Cannot connect to the server. Please check your connection.';
          break;

        case 401:
          message = 'Session expired. Please login again.';
          break;

        case 403:
          message = 'You do not have permission to access this page';
          break;

        case 404:
          message = error.error?.message || 'The requested resource was not found';
          break;

        case 500:
          message = 'Server error. Please try again later.';
          break;
      }

      toast.showError(message);

      // Re-throw so local component can react
      return throwError(() => error);
    })
  );
};