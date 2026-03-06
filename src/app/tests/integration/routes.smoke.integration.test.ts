import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { routes } from '../../app.routes';
import { PostService } from '../../features/posts/services/post.service';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';
import { GlobalLoadingService } from '../../core/services/global-loading.service';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../features/auth/services/auth.service';

/* Smoke Tests prove the core navigation pipeline works end to end */

describe('Routes smoke', () => {
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let storageSpy: jasmine.SpyObj<TokenStorageService>;

  beforeEach(async () => {
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['getAll', 'find']);
    storageSpy = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', ['getToken', 'getRole']);
    postServiceSpy.getAll.and.returnValue(of([]));
    postServiceSpy.find.and.returnValue(of({ id: 1, title: 'X', body: 'Y' } as any));
    storageSpy.getRole.and.returnValue('user'); // default non-admin

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),

        { provide: PostService, useValue: postServiceSpy },
        { provide: TokenStorageService, useValue: storageSpy },

        // plus any other services injected by pages that will render
        { provide: GlobalLoadingService, useValue: { isLoading: () => false }},
        { provide: ToastService, useValue: { showSuccess: () => {}, showError: () => {} }},
        { provide: AuthService, useValue: { logout: () => {}, isAuthenticated: () => true }},
      ],
    }).compileComponents();
  });

   /*  async function nav(url: string) {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(url);
      return harness;
    } */

    it('logged out: /post/index redirects to login with returnUrl', async () => {
    // Arrange
    storageSpy.getToken.and.returnValue(null);

    // Act
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/post/index');

    // Assert
    expect(harness.routeNativeElement?.textContent).toContain('Login');

    const router = TestBed.inject(Router);
    expect(router.url).toContain('returnUrl=%2Fpost%2Findex');
  });

  it('logged in: /post/index loads index page', async () => {
    // Arrange
    storageSpy.getToken.and.returnValue('token');
    /* This is empty because smoke tests only care if the page loads
      it doesnt care what data is inside it.
    */
    postServiceSpy.getAll.and.returnValue(of([]));

    // Act
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/post/index');

    // Assert
    expect(harness.routeNativeElement?.textContent)
      .toContain('Angular 17 CRUD Application');
  });

  it('logged in non-admin: /admin redirects to forbidden', async () => {
    // Arrange
    storageSpy.getToken.and.returnValue('token');
    storageSpy.getRole.and.returnValue('user');

    // Act
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/admin');

    // Assert
    expect(harness.routeNativeElement?.textContent).toContain('403');

    const router = TestBed.inject(Router);
    expect(router.url).toContain('/forbidden');
  });

  it('logged in: deep link /post/1/view loads post', async () => {
    // Arrange
    storageSpy.getToken.and.returnValue('token');
    postServiceSpy.find.and.returnValue(of({ id: 1, title: 'Hello', body: 'World' } as any));

    // Act
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/post/1/view');

    // Assert
    expect(harness.routeNativeElement?.textContent).toContain('Hello');
  });
});
