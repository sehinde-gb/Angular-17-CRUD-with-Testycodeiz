import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { ToastService } from './services/toast.service';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService); //Inject our new service
  
  return next(req).pipe(
    // 1. Retry logic
    retry({
      count: 2,
      delay: (error, retryCount) => {
        // Only retry on 500 errors or network failures
        if (error.status >= 500 || error.status === 0) {
          console.warn(`Retry attempt ${retryCount}...`);
          return timer(1000); // Wait 1 second before retrying
        }
        // Don't retry for 401/403/404
        throw error;
      }
    }),

    // 2. Error Handling logic
    catchError((error: HttpErrorResponse)=>{
      let message = 'An unexpected error has occurred';
      
      switch(error.status) {
        case 401:
          message = 'Session expired. Please login again.';
          // Optional: inject Router and navigate to /login
          break;
        case 403:
          message = 'Server side error. Our team has been notified';
          break;
         case 500:
          message = 'Cannot connect to the server';
          break;    
      }
      toast.showError(message);
      // The error listed below throws your error back to the local component
      return throwError(() => error);
    })
  );
};

