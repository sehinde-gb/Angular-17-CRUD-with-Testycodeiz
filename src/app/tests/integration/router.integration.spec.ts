// src/app/app.routes.integration.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { routes } from '../../app.routes';
import { PostService } from '../../features/posts/services/post.service';
import { TokenStorageService } from '../../features/auth/services/token-storage.service';
import { GlobalLoadingService } from '../../core/services/global-loading.service';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../features/auth/services/auth.service';


describe('Routes integration', () => {
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let storageSpy: jasmine.SpyObj<TokenStorageService>;

  beforeEach(async () => {
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['getAll', 'find']);
    storageSpy = jasmine.createSpyObj<TokenStorageService>('TokenStorageService', ['getToken', 'getRole']);

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

    it('if not logged in navigation succeeds and shows login page (guestGuard) ', async () => {
        // Arrange
        storageSpy.getToken.and.returnValue(null); // guestGuard allows login


      // Act open the login web page
      const harness = await RouterTestingHarness.create();
      const component = await harness.navigateByUrl('/auth/login');

      // Now assert based on rendered DOM (integration style)
      expect(harness.routeNativeElement?.textContent).toContain('Login');
    });

    it('redirects to login when opening "/" while logged out (guestGuard)', async () => {
          storageSpy.getToken.and.returnValue(null);

          const harness = await RouterTestingHarness.create();
          await harness.navigateByUrl('/');

          expect(harness.routeNativeElement?.textContent).toContain('Login');

    });

    it('authenticated: /auth/login redirects to /post/index (guestGuard)', async () => {
          // guestGuard should block auth routes when logged in
          // Arrange
          storageSpy.getToken.and.returnValue('token');

          // Index route resolved will run, so make it succeed
          postServiceSpy.getAll.and.returnValue(of([]));

          // Act
          const harness = await RouterTestingHarness.create();
          await harness.navigateByUrl('/auth/login');

          // Should land on Index page instead of Login
          expect(harness.routeNativeElement?.textContent).toContain('Angular 17 CRUD Application');
      });

    it('redirects to login when user tries to access protected route without token (guestGuard)', async () => {
            storageSpy.getToken.and.returnValue(null);

            const harness = await RouterTestingHarness.create();
            await harness.navigateByUrl('/post/index');

            expect(harness.routeNativeElement?.textContent).toContain('Login');
    });

    it('redirects logged-in user away from login page (guestGuard)', async() =>{
      storageSpy.getToken.and.returnValue('token');

      // Index route resolved will run, so make it succeed
      postServiceSpy.getAll.and.returnValue(of([]));

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/auth/login');

      expect(harness.routeNativeElement?.textContent)
        .toContain('Angular 17 CRUD Application');
    });

    it('navigating to /post/index runs resolver and shows Index page (authGuard)', async () => {
      storageSpy.getToken.and.returnValue('token'); // authGuard passes
      postServiceSpy.getAll.and.returnValue(of([{ id: 1, title: 'A', body: 'B' } as any]));

      const harness = await RouterTestingHarness.create();
      // Note that this is the equivalent of running fixture.detectChanges()
      const component = await harness.navigateByUrl('/post/index');

      // Now assert based on rendered DOM (integration style)
      expect(harness.routeNativeElement?.textContent).toContain('Angular 17 CRUD Application');
    });



    it('if logged in navigation redirects to /post/index page (authGuard)', async () => {
      // Arrange
      storageSpy.getToken.and.returnValue('token');
      postServiceSpy.getAll.and.returnValue(of([{ id: 1, title: 'A', body: 'B' } as any]));

      // Act open the login web page
      const harness = await RouterTestingHarness.create();
      const component = await harness.navigateByUrl('/auth/login');

      expect(harness.routeNativeElement?.textContent).toContain('Angular 17 CRUD Application');

    });

    it('navigating to /post/index shows error UI when resolver returns non-array, (null) (authGuard)', async () => {
        // Authguard passes
        storageSpy.getToken.and.returnValue('token');

        /*
        Simulate resolver delivering bad data easiest way: make getAll() throw, then your resolver catchError
        returns [] BUT your index component treats non-array as error.
        So we simulate route data via actual resolver path by forcing getAll to error
        */
        postServiceSpy.getAll.and.returnValue(
            throwError(() => new Error('boom')) as any
        );

        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/post/index');

        // expect the page to show the error state
        expect(harness.routeNativeElement?.textContent)
          .toContain("We couldn't load the posts...");
    });

    it('redirects "" to /post/index (authGuard)', async () => {
      storageSpy.getToken.and.returnValue('token');
      postServiceSpy.getAll.and.returnValue(of([]));

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/');

      expect(harness.routeNativeElement?.textContent)
        .toContain('Angular 17 CRUD Application');
    });


    it('when token is null navigate to /post/index should redirect and add returnUrl (authGuard)', async () => {
      storageSpy.getToken.and.returnValue(null);

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/post/index');

      expect(harness.routeNativeElement?.textContent)
        .toContain('Login');

      const router = TestBed.inject(Router);
      expect(router.url).toContain('returnUrl=%2Fpost%2Findex');
    });

    it('unauthenticated: /post/index redirects to /auth/login with returnUrl (authGuard)', async () => {
      // authGuard should fail ARRANGE
      storageSpy.getToken.and.returnValue(null);

      // ACT
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/post/index');

      // DOM Assertion (best integration signal)
      expect(harness.routeNativeElement?.textContent).toContain('Login');

      // Optional
      const router = TestBed.inject(Router);
      expect(router.url).toContain('/auth/login');
      expect(router.url).toContain('returnUrl=%2Fpost%2Findex');

    });


    // Error UI and Resolver tests
    it('loads posts page when resolver returns valid data', async () => {
      storageSpy.getToken.and.returnValue('token');

      postServiceSpy.getAll.and.returnValue(
        of([{ id: 1, title: 'A', body: 'B' } as any])
        );

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/post/index');

      expect(harness.routeNativeElement?.textContent)
      .toContain('Angular 17 CRUD Application');
    });


    it('shows error UI when resolver returns invalid data', async () => {
      storageSpy.getToken.and.returnValue('token');

      postServiceSpy.getAll.and.returnValue(of(null as any));

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/post/index');

      expect(harness.routeNativeElement?.textContent)
        .toContain("We couldn't load the posts");
    });

    // Role tests
    it('authenticated but not admin: /admin redirects to /forbidden with from=/admin', async() => {
      // Arrange
      // auth passes
      storageSpy.getToken.and.returnValue('token');

      // role fails
      storageSpy.getRole.and.returnValue('user');

      // Act
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/admin');

      // Forbidden page renders Assert
      expect(harness.routeNativeElement?.textContent).toContain('403');

      // Optional
      const router = TestBed.inject(Router);
      expect(router.url).toContain('/forbidden');
      expect(router.url).toContain('from=%2Fadmin');

    });

    it('redirects non-admin users from admin page', async () => {
      storageSpy.getToken.and.returnValue('token');
      storageSpy.getRole.and.returnValue('user');

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/admin');

      expect(harness.routeNativeElement?.textContent)
        .toContain('403');

    });

    it('deep linking to /post/1/view loads the post', async () => {
      storageSpy.getToken.and.returnValue('token');

      postServiceSpy.find.and.returnValue(
        of({ id: 1, title: "Hello", body: 'World'} as any)
      );

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/post/1/view');

      expect(harness.routeNativeElement?.textContent)
        .toContain('Hello');
    });

});
