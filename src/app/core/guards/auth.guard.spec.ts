import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';

describe('authGuard', () => {
  let router: Router;
  const route = {} as import('@angular/router').ActivatedRouteSnapshot;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { createUrlTree: (commands: unknown[], extras: unknown) => ({ commands, extras }) } }],
    });
    router = TestBed.inject(Router);
  });

  it('allows navigation when a session is active', (done) => {
    const auth = TestBed.inject(AuthService);
    auth.login({ email: 'yago.mateos@insurehub.com', password: 'Insurehub2026', rememberMe: true }).subscribe(() => {
      const state = { url: '/dashboard' } as import('@angular/router').RouterStateSnapshot;
      const result = TestBed.runInInjectionContext(() => authGuard(route, state));
      expect(result).toBe(true);
      done();
    });
  });

  it('redirects to /login with the attempted URL when there is no session', () => {
    const state = { url: '/customers/CUS-1000' } as import('@angular/router').RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toEqual(router.createUrlTree(['/login'], { queryParams: { redirectTo: '/customers/CUS-1000' } }));
  });

  it('guestGuard blocks an authenticated user from returning to /login', (done) => {
    const auth = TestBed.inject(AuthService);
    auth.login({ email: 'yago.mateos@insurehub.com', password: 'Insurehub2026', rememberMe: true }).subscribe(() => {
      const state = { url: '/login' } as import('@angular/router').RouterStateSnapshot;
      const result = TestBed.runInInjectionContext(() => guestGuard(route, state));
      expect(result).toEqual(router.createUrlTree(['/dashboard']));
      done();
    });
  });
});
