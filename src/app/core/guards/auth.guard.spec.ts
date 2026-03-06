import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';

/* Key Contract
  If no token -> return UrlTree to /auth/login with returnUrl
  If token exists -> return true
*/
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



  it('returns UrlTree to /auth/login with returnUrl when not authenticated', () => {
    storage.getToken.and.returnValue(null);
    // Declare the spy arguments this includes the return url and the empty route.
    const route: any = {};
    const state: any = { url: '/post/index'};

    // Inject a fake UrlTree (redirect)
    const fakeTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(fakeTree);

    // Action opens the page at /post/index
    const result = TestBed.runInInjectionContext(() =>
      authGuard(route, state)
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/post/index'},
    });

    expect(result).toBe(fakeTree);

    /* // ✅ Read spy args safely (no destructuring from CallInfo)
    const args = router.createUrlTree.calls.mostRecent().args;
    // builds the redirect to '/auth/login'
    const commands = args[0];
    // include the original url called returnUrl this appears as /auth/login?returnUrl=/post/index
    const extras = args[1];

    expect(commands).toEqual(['/auth/login']);
    // state.url becomes the returnUrl listed below
    expect(extras).toEqual({ queryParams: { returnUrl: '/post/index' } });
    // expects the fakeTree redirect to be invoked
    expect(result).toBe(fakeTree); */
  });

  it('returns true when logged in', () => {
    // Retrieves the token
    storage.getToken.and.returnValue('token');

    // Action opens the page at /post/index
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/post/index'} as any)
    );

    expect(result).toBeTrue();

    // The guard allows navigation and does not redirect (Urltree)
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('uses state.url as returnUrl (not hard coded)', () => {
    storage.getToken.and.returnValue(null);

    const fakeTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(fakeTree);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/admin?tab=users'} as any)
    );

    const [, extras] = router.createUrlTree.calls.mostRecent().args;

    expect(extras).toEqual({queryParams: { returnUrl: '/admin?tab=users'}});
    expect(result).toBe(fakeTree);

  });



});
