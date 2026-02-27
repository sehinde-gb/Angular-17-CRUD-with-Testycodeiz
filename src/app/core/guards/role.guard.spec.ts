import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { roleGuard } from './role.guard';
import { TokenStorageService } from 'src/app/features/auth/services/token-storage.service';

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

  it('returns true when no roles are required (route.data.roles missing or empty)', () => {
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

  it('uses UrlTree to /forbidden with from=state.url when user lacks role', () => {
    // Get the role from the stored token (not allowed)
    storage.getRole.and.returnValue('user');

    // Fake the URL redirect
    const fakeTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(fakeTree);

    const stateUrl = '/admin?tab=users';

    // User Action opens admin with route config admin
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(makeRoute(['admin']), makeState(stateUrl))
    );

    // Ensure we are redirected
    expect(router.createUrlTree).toHaveBeenCalledTimes(1);

    // Inspect the user action
    const args = router.createUrlTree.calls.mostRecent().args;
    // Interrogate the URL and pluck out '/forbidden'
    const commands = args[0];
    // Interrogate the URL and pluck out '/admin?tab=users'
    const extras = args[1];

    // Verify that commands (args[0]) /forbidden has been plucked out
    expect(commands).toEqual(['/forbidden']);
    // verify that extras (args[1] stateUrl has been plucked out
    expect(extras).toEqual({ queryParams: { from: stateUrl}});
    expect(result).toBe(fakeTree);

    // Why do we use args[0] and args[1] createUrlTree is called with 2 parameters- the navigation commands and the
    // extras object and Jasmine stores them as an array
  });




  it('uses state.url in queryParams from when role is missing (redirect)', () => {
      // Arrange
      const route = makeRoute(['admin']);
      const state = makeState('/admin?tab=users');

      // user has no role not allowed
      storage.getRole.and.returnValue(null);

      const fakeTree = {} as UrlTree;
      router.createUrlTree.and.returnValue(fakeTree);

      // Action
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(route, state)
      );


      // Assert
      expect(router.createUrlTree).toHaveBeenCalledTimes(1);

      const args = router.createUrlTree.calls.mostRecent().args;
      const commands = args[0];
      const extras = args[1];

      expect(commands).toEqual(['/forbidden']);
      expect(extras).toEqual({ queryParams: { from: '/admin?tab=users' } });
      expect(result).toBe(fakeTree);
    });
});
