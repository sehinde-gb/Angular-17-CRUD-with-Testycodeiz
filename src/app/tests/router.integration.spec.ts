// src/app/app.routes.integration.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { routes } from '../app.routes';
import { PostService } from '../features/posts/services/post.service';
import { TokenStorageService } from '../features/auth/services/token-storage.service';


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
        // GlobalLoadingService, ToastService, AuthService, etc.
      ],
    }).compileComponents();
  });

  it('navigating to /post/index runs resolver and shows Index page', async () => {
    storageSpy.getToken.and.returnValue('token'); // authGuard passes
    postServiceSpy.getAll.and.returnValue(of([{ id: 1, title: 'A', body: 'B' } as any]));

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/post/index');

    // Now assert based on rendered DOM (integration style)
    expect(harness.routeNativeElement?.textContent).toContain('Angular 17 CRUD Application');
  });

  it('if not logged in navigation succeeds and shows login page', async () => {
    // Arrange
    storageSpy.getToken.and.returnValue(null); // authGuard fails


     // Act open the login web page
     const harness = await RouterTestingHarness.create();
     await harness.navigateByUrl('/auth/login');

     // Now assert based on rendered DOM (integration style)
     expect(harness.routeNativeElement?.textContent).toContain('Login');
  });

  it('if logged in navigation redirects to /post/index page', async () => {
     // Arrange
     storageSpy.getToken.and.returnValue('token');
     postServiceSpy.getAll.and.returnValue(of([{ id: 1, title: 'A', body: 'B' } as any]));

     // Act open the login web page
     const harness = await RouterTestingHarness.create();
     await harness.navigateByUrl('/auth/login');

     expect(harness.routeNativeElement?.textContent).toContain('Angular 17 CRUD Application');

  });
});
