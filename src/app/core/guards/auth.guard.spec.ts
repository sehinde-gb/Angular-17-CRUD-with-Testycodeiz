import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';

describe('authGuard', () => {
  let storage: jasmine.SpyObj<TokenStorageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    storage = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', ['getToken']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStorageService, useValue: storage },
        { provide: Router, useValue: router},
      ],
    });
  });

  it('returns true when token exists', () => {
    storage.getToken.and.returnValue('token');

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/post/index'} as any)
    );

    expect(result).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('returns UrlTree to /auth/login with returnUrl when not authenticated', () => {
    storage.getToken.and.returnValue(null);

    const fakeTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(fakeTree);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/post/index' } as any)
    );

    // ✅ Read spy args safely (no destructuring from CallInfo)
    const args = router.createUrlTree.calls.mostRecent().args;
    const commands = args[0];
    const extras = args[1];

    expect(commands).toEqual(['/auth/login']);
    expect(extras).toEqual({ queryParams: { returnUrl: '/post/index' } });
    expect(result).toBe(fakeTree);
  });  
  
});
