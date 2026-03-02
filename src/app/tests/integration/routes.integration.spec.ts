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

  /* Guest Guard Coverage */
    it('it is logged out and can view login page ', async () => {
      // Arrange
      storageSpy.getToken.and.returnValue(null); // guestGuard allows login


      // Act open the login web page
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/auth/login');

      // Now assert based on rendered DOM (integration style)
      expect(harness.routeNativeElement?.textContent).toContain('Login');
      console.log(TestBed.inject(Router).url);
    });

    it('it is logged out and going to "/" shows login page', async () => {
          storageSpy.getToken.and.returnValue(null);

          const harness = await RouterTestingHarness.create();
          await harness.navigateByUrl('/');

          expect(harness.routeNativeElement?.textContent).toContain('Login');

    });

    it('it is logged in and going to "/" redirects away to index', async () => {
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


/* Auth Guard Coverage */

    it('it is logged in and going to "/" runs resolver and loads posts', async () => {
      storageSpy.getToken.and.returnValue('token'); // authGuard passes
      postServiceSpy.getAll.and.returnValue(of([{ id: 1, title: 'A', body: 'B' } as any]));

      const harness = await RouterTestingHarness.create();
      // Note that this is the equivalent of running fixture.detectChanges()
      const component = await harness.navigateByUrl('/post/index');

      // Now assert based on rendered DOM (integration style)
      expect(harness.routeNativeElement?.textContent).toContain('Angular 17 CRUD Application');
    });


    it('it is logged in and going to "/" the service fails, resolver returns null and error UI', async () => {
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

    it('it is logged in and going to "/" redirects to post/index', async () => {
      storageSpy.getToken.and.returnValue('token');
      //postServiceSpy.getAll.and.returnValue(of([]));

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/');

      expect(harness.routeNativeElement?.textContent)
        .toContain('Angular 17 CRUD Application');
    });


    it('it is logged out and going to "/" redirects to login and includes return URL', async () => {
      storageSpy.getToken.and.returnValue(null);

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/post/index');

      expect(harness.routeNativeElement?.textContent)
        .toContain('Login');

      const router = TestBed.inject(Router);
      expect(router.url).toContain('returnUrl=%2Fpost%2Findex');
    });




    /* Role Guard Coverage */

    it('it is logged in as user going to /admin redirects to forbidden with from=/admin', async() => {
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

    it('it is logged in as admin and going to "/admin" loads admin dashboard', async () => {
       storageSpy.getToken.and.returnValue('token'); // auth passes
       storageSpy.getRole.and.returnValue('admin');  // role passes

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/admin');

      // assert something unique on the admin dashboard
      expect(harness.routeNativeElement?.textContent).toContain('Admin Dashboard');
      // ^ replace with a real heading/text from your admin page
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
