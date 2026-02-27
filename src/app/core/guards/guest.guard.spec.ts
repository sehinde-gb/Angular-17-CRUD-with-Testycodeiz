import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { guestGuard } from './guest.guard';
import { TokenStorageService } from 'src/app/features/auth/services/token-storage.service';

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

  it('returns true when NOT authenticated (no token)', () => {
    // Arrange and retrieve a null token
    storageSpy.getToken.and.returnValue(null);

    // Act open the login web page
    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, { url: '/auth/login'} as any));

    // Assert expect it to be true
    expect(result).toBeTrue();

    // Assert that the redirect has NOT been called
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();

  });

  it('returns UrlTree redirect when authenticated (token exists)', () => {
    // Arrange
    storageSpy.getToken.and.returnValue('token');

    // Add redirect fake
    const fakeTree = {} as any;
    routerSpy.createUrlTree.and.returnValue(fakeTree);

    // Act open the login web page
    const result = TestBed.runInInjectionContext(() => guestGuard({} as any, { url: '/auth/login'} as any));


    // read spy args safely, and builds the URL
    const args = routerSpy.createUrlTree.calls.mostRecent().args;
    const commands = args[0];
    const extras = args[1]; // may be undefined depending on your guard

    // ✅ update this if your guard redirects elsewhere
    expect(commands).toEqual(['/post/index']);

    // If your guard does NOT pass extras, keep this:
    expect(extras).toBeUndefined();

    expect(result).toBe(fakeTree);

  });

  it('allows access when user is logged in', () => {
    storageSpy.getToken.and.returnValue(null);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, {} as any)
      );

      expect(result).toBeTrue();

  });


  it('redirects to posts when logged in', () => {
    // Arrange
    storageSpy.getToken.and.returnValue('token');

    // Add redirect fake
    const fakeTree = {} as any;
    routerSpy.createUrlTree.and.returnValue(fakeTree);

    // Act
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, {} as any)
    );

    // Assert
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/post/index']);
    expect(result).toBe(fakeTree);
  });
})
