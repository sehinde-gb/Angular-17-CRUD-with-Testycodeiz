import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { catchError, retry, throwError, timer } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error, retryCount) => {
        // Checks to see server errors (errors more than 500) and whether it is a GET request
        const isRetryableStatus = error.status >= 500 || error.status === 0;
        const isGet = req.method === 'GET';
        // The system retries until the count goes to 2 and it then throws an error
        if (isGet && isRetryableStatus) {
          // This uses backoff and this means it will wait for longer ie use retry count to increase
          // the time in between retry attempts this reduces the load on the server itself.
          return timer(1000 * retryCount);
        }
        return throwError(() => error);
      }
    }),

    catchError((error: HttpErrorResponse) => {
      // Let components handle validation errors locally
      if (error.status === 400 || error.status === 422) {
        // this throws those errors to the local component.
        return throwError(() => error);
      }
      // This checks the error message and it then breaks and moves to the local component state
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
          message = 'Cannot connect to the server';
          break;
      }

      // Send the error message above to the toast show error function
      toast.showError(message);
      
      // This rethrows the error above back to the local component!
      return throwError(() => error);
    })
  );
};