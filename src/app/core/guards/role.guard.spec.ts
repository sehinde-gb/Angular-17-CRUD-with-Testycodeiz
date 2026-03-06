import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { roleGuard } from './role.guard';
import { TokenStorageService } from 'src/app/features/auth/services/token-storage.service';


/*
  Key contract
  if role !== admin -> redirect to /forbidden?from=<state.url>
  if role === admin -> allow true
*/

describe('roleGuard', () => {
  let storage: jasmine.SpyObj<TokenStorageService>;
  let router: jasmine.SpyObj<Router>;

  function makeRoute(roles?: string[]): ActivatedRouteSnapshot {
    return { data: roles ? { roles } : {} } as unknown as ActivatedRouteSnapshot;
  }

  function makeState(url: string): RouterStateSnapshot {
    return { url } as RouterStateSnapshot;
  }

  beforeEach(() => {
    storage = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', ['getRole']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStorageService, useValue: storage },
        { provide: Router, useValue: router },
      ],
    });
  });

  /*
    Edge case
    Tests that verify prevention or unusual situations
  */

  it('it returns true when roles missing (route.data.roles missing or empty)', () => {
    // User action opens the admin page
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(makeRoute(undefined), makeState('/admin'))
    );

    // Expect the page to open
    expect(result).toBeTrue();
    // It doesn't check the role
    expect(storage.getRole).not.toHaveBeenCalled();
    // It doesn't check the redirect
    expect(router.createUrlTree).not.toHaveBeenCalled()
  });

  it('returns true when user has required role', () => {
    storage.getRole.and.returnValue('admin');

    // User action opens the admin page
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(makeRoute(['admin']), makeState('/admin'))
    );

    expect(result).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });




  /*
    Error path
    Tests that verify error handling behaviour
  */

  it('redirects to /forbidden with from=state.url when user lacks required role', () => {
      // Arrange
      const route = makeRoute(['admin']);
      const state = makeState('/admin?tab=users');

      // user has no role not allowed
      storage.getRole.and.returnValue(null);

      // redirect injected
      const fakeTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(fakeTree);

      // Action
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, state)
      );

      // Assert
      expect(router.createUrlTree).toHaveBeenCalledTimes(1);
      expect(router.createUrlTree).toHaveBeenCalledWith(
      ['/forbidden'],
      { queryParams: { from: '/admin?tab=users' } }
      );
      expect(storage.getRole).toHaveBeenCalledTimes(1);
      expect(result).toBe(fakeTree);
    });
});
