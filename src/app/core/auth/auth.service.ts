import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, map, of, tap, throwError } from 'rxjs';
import { AuthSession, AuthUser, LoginCredentials } from './auth.models';

const STORAGE_KEY = 'insurehub.session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8h

const DEMO_USER: AuthUser = {
  id: 'usr-001',
  name: 'Yago Mateos',
  email: 'yago.mateos@insurehub.com',
  role: 'Gestor de pólizas',
  initials: 'YM',
};

const DEMO_PASSWORD = 'Insurehub2026';

/**
 * Encapsulates authentication state and the (simulated) JWT lifecycle.
 * UI components never touch tokens or localStorage directly — they only read signals
 * and call login()/logout(). This mirrors how AuthService will work against a real
 * API in the Angular 21 implementation (HttpClient + interceptor instead of the
 * setTimeout/of() simulation below).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<AuthSession | null>(this.restoreSession());

  readonly currentUser = computed<AuthUser | null>(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly token = computed(() => this.session()?.token ?? null);

  login(credentials: LoginCredentials): Observable<AuthUser> {
    const isValid =
      credentials.email.trim().toLowerCase() === DEMO_USER.email &&
      credentials.password === DEMO_PASSWORD;

    if (!isValid) {
      return throwError(() => ({
        status: 401,
        message: 'Correo electrónico o contraseña incorrectos.',
      })).pipe(delay(700));
    }

    const session: AuthSession = {
      token: this.buildFakeJwt(credentials.email),
      expiresAt: Date.now() + SESSION_TTL_MS,
      user: DEMO_USER,
    };

    return of(session).pipe(
      delay(700),
      tap((s) => this.persistSession(s, credentials.rememberMe)),
      map((s) => s.user),
    );
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  /** Called by the HTTP interceptor when the backend answers 401. */
  handleUnauthorized(): void {
    this.logout();
  }

  private persistSession(session: AuthSession, remember: boolean): void {
    this.session.set(session);
    const store = remember ? localStorage : sessionStorage;
    store.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private restoreSession(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as AuthSession;
      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private buildFakeJwt(email: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({ sub: email, iat: Date.now(), exp: Date.now() + SESSION_TTL_MS }),
    );
    const signature = btoa('insurehub-demo-signature');
    return `${header}.${payload}.${signature}`;
  }
}
