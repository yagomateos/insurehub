export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthSession {
  token: string;
  expiresAt: number; // epoch ms
  user: AuthUser;
}
