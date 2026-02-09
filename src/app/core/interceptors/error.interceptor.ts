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
          route.navigate(['/post/index']); // Force the move
          break;
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

