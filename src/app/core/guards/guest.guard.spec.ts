import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { guestGuard } from './guest.guard';
import { TokenStorageService } from 'src/app/features/auth/services/token-storage.service';

/* Key Contract
If token exists -> redirect to. /post/index
if no token -> allow (true)
*/
describe('guestGuard', () => {
  let storageSpy: jasmine.SpyObj<TokenStorageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', ['getToken']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: TokenStorageService, useValue: storageSpy},
        { provide: Router, useValue: routerSpy},
      ],
    });
  });


  /*
    Allow navigation
  */

  it('redirects to /post/index when logged in', () => {
    // Arrange
    storageSpy.getToken.and.returnValue('token');

    // Add redirect fake
    const fakeTree = { tree: true} as any;
    routerSpy.createUrlTree.and.returnValue(fakeTree);

    // Act
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, {} as any)
    );

    // Assert
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/post/index']);
    expect(result).toBe(fakeTree);
  });

  it('returns true when logged out (can view login/register)', () => {
    storageSpy.getToken.and.returnValue(null);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, {} as any)
      );

      expect(result).toBeTrue();

  });



})
