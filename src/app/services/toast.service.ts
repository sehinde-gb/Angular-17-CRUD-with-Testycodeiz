import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // 1. Property declaration
  currentToast = signal<Toast | null>(null);

  // 2. Public methods
  showSuccess(successMessage: string) {
    this.show(successMessage, 'success', 5000);
  }

  showError(errorMessage: string) {
    this.show(errorMessage, 'error', 5000);
  }

  // 3. The base method (Ensure this is INSIDE the last } of the class)
  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
    this.currentToast.set({ message, type });

    setTimeout(() => {
      const current = this.currentToast();
      if (current && current.message === message) {
        this.currentToast.set(null);
      }
    }, duration);
  }
} // <--- This MUST be the very last line of the file