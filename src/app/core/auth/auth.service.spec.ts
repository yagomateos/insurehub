import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts with no active session', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('authenticates with the demo credentials and stores the session', (done) => {
    service
      .login({ email: 'yago.mateos@insurehub.com', password: 'Insurehub2026', rememberMe: true })
      .subscribe((user) => {
        expect(user.name).toBe('Yago Mateos');
        expect(service.isAuthenticated()).toBe(true);
        expect(service.token()).toBeTruthy();
        expect(localStorage.getItem('insurehub.session')).toBeTruthy();
        done();
      });
  });

  it('rejects invalid credentials without creating a session', (done) => {
    service.login({ email: 'yago.mateos@insurehub.com', password: 'wrong', rememberMe: true }).subscribe({
      next: () => fail('expected an error for invalid credentials'),
      error: (err: { status: number }) => {
        expect(err.status).toBe(401);
        expect(service.isAuthenticated()).toBe(false);
        done();
      },
    });
  });

  it('clears the session on logout', (done) => {
    service.login({ email: 'yago.mateos@insurehub.com', password: 'Insurehub2026', rememberMe: true }).subscribe(() => {
      service.logout();
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('insurehub.session')).toBeNull();
      done();
    });
  });
});
