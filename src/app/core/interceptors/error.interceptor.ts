import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService); //Inject our new service
  const route = inject(Router);
  
  
  return next(req).pipe(
    // 1. Retry logic
    retry({
      count: 2,
      delay: (error, retryCount) => {
        // Only retry on 500 errors or network failures and apply to GET request only
        const isRetryableStatus = error.status >= 500 || error.status === 0;
        const isGet = req.method === 'GET';
        
        if (isGet && isRetryableStatus) {
          console.warn(`Retry attempt ${retryCount}...`);
          return timer(1000 * retryCount);
        }
        // Don't retry for 401/403/404 and move on to 2. Error Handling Logic
        return throwError(() => error);
        
      }
    }),

    // 2. Error Handling logic
    catchError((error: HttpErrorResponse)=>{
      let message = 'An unexpected error has occurred';
      
      switch(error.status) {
        case 0:
          message = 'Cannot connect to the server. Please check your connection.';
          break;
        case 400:
        // Validation errors are handled locally by the component    
        case 401:
          message = 'Session expired. Please login again.';
          // Optional: inject Router and navigate to /login
          //route.navigate(['/post/index']); // Force the move
          break;
        case 422:
          // Validation errors are handled locally by the component
          return throwError(() => error);  
        case 403:
          message = 'You do not have permission to access this page';
          break;
          // --- ADDED 404 CASE ---
        case 404:
          message = error.error?.message || 'The requested resource was not found';
          break;
        // ----------------------
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

