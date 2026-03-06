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

  /* Guest Guard Behaviour */
    it('logged out: /auth/login loads login page', async () => {
      // Arrange
      storageSpy.getToken.and.returnValue(null);


      // Act open the login web page
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/auth/login');

      // Now assert based on rendered DOM (integration style)
      expect(harness.routeNativeElement?.textContent).toContain('Login');

    });

    it('logged out: redirect "/" loads /auth/login page', async () => {
          storageSpy.getToken.and.returnValue(null);

          const harness = await RouterTestingHarness.create();
          await harness.navigateByUrl('/');

          expect(harness.routeNativeElement?.textContent).toContain('Login');

    });

    it('logged in: /auth/login redirects to /posts/index', async () => {
          // guestGuard should block auth routes when logged in
          // Arrange
          storageSpy.getToken.and.returnValue('token');

          // postservice spy is injected in before each
          //postServiceSpy.getAll.and.returnValue(of([]));

          // Act
          const harness = await RouterTestingHarness.create();
          await harness.navigateByUrl('/auth/login');

          // Should land on Index page instead of Login
          expect(harness.routeNativeElement?.textContent).toContain('Angular 17 CRUD Application');
      });


    /* Auth Guard Behaviour */

    it('logged in: /post/index shows error UI when resolver returns null', async () => {
        // Authguard passes
        storageSpy.getToken.and.returnValue('token');

        /*
          Simulate HTTP failure: service throws -> resolver catchError returns null
          -> Index shows error UI
        */
        postServiceSpy.getAll.and.returnValue(
            throwError(() => new Error('boom')) as any
        );

        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/post/index');


        expect(harness.routeNativeElement?.textContent)
         .toContain("We couldn't load the posts..."); // or whatever your empty state is
    });

    it('logged in: / redirects to /post/index', async () => {
      storageSpy.getToken.and.returnValue('token');


      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/');

      expect(harness.routeNativeElement?.textContent)
        .toContain('Angular 17 CRUD Application');
    });


    /* Role Guard Behaviour */

    it('logged in admin: /admin loads dashboard', async () => {
       storageSpy.getToken.and.returnValue('token'); // auth passes
       storageSpy.getRole.and.returnValue('admin');  // role passes

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/admin');

      // assert something unique on the admin dashboard
      expect(harness.routeNativeElement?.textContent).toContain('Admin Dashboard');
      // ^ replace with a real heading/text from your admin page
    });



});
