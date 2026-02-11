import { Injectable, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { Observable, of, throwError, delay } from 'rxjs';
import {LoginRequest, LoginResponse, UserRole } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // optional UI convenience
  isAuthenticated = signal<boolean>(false);

  constructor(private storage: TokenStorageService) {
    this.isAuthenticated.set(!!this.storage.getToken());
  }

  login(payload: LoginRequest): Observable<LoginResponse> {
    // Mock rule: any email/password works, admin if email contains 'admin'
    if(!payload.email || !payload.password) {
      return throwError(() => ({ status: 400, message: 'Email and password are required'}));
    }

    const role: UserRole = payload.email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const response: LoginResponse = {
      accessToken: 'mock-jwt-token',
      user: {
        email: payload.email,
        role: role
      }
      
    };

   // mimic network latency
    return of(response).pipe(delay(600));
       
  }
   handleLoginSuccess(res: LoginResponse): void {
      this.storage.setToken(res.accessToken);
      this.storage.setRole(res.user.role);
      this.isAuthenticated.set(true);
    }

    logout(): void {
      this.storage.clearAll();
      this.isAuthenticated.set(false);
    }
}
