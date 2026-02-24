export type UserRole = 'user' | 'admin' | 'moderator';
export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthUser {
    email: string;
    role: UserRole;
}

export interface LoginResponse {
    accessToken: string;
    user: AuthUser;
}