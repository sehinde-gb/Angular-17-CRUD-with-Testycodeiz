import { Injectable } from '@angular/core';

const TOKEN_KEY = 'access_token';
const ROLE_KEY = 'user_role';

@Injectable({
  providedIn: 'root'
})



export class TokenStorageService {
  setToken(token: string):void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken():string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  setRole(role: string): void {
    localStorage.setItem(ROLE_KEY, role);
  }

  getRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
  }

  clearAll(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  }
}
