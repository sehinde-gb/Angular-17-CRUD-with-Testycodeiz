import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { firstValueFrom, isObservable, Observable, of, throwError } from 'rxjs';
import { postResolver } from './post.resolver';
import { PostService } from '../services/post.service';
import { Post } from '../models/post'; // <-- adjust path if needed

/* Key Contract
  invalid id (Nan/<=0) -> navigates /post/index and resolves of(null)
  valid id -> calls postService.find(id) and returns post
  service error -> returns null (and does not navigate)
*/


describe('postResolver', () => {
  // Test variables
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // TestBed setup runs before each test
  beforeEach(() => {
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['find']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    // important: navigateByUrl returns Promise<boolean>
    routerSpy.navigateByUrl.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy},
      ],
    });
  });


  function asObservable<T>(x: unknown): Observable<T> {
    if (!isObservable(x)) {
      throw new Error('Expected resolver to return an Observable');
    }
    return x as Observable<T>;
  }

   // Set up the route to use the postId from the Activated route this is a mocked route
    function createRoute(id: string | null): ActivatedRouteSnapshot {
      return {
        paramMap: {
          get: () => id
        }
      } as any;
    }



  /*
    Error paths
    Tests that verify error handling behaviour
  */
  it('valid postId: returns null when PostService.find errors (swallows error)', async () => {
    // Arrange
    const route = createRoute('1');

    // The find fails and it produces an error status of 500
    postServiceSpy.find.and.returnValue(
      throwError(() => new Error('boom'))
    );
    // Act
    // Inject the resolver and Pretend the URL has an ID of 1
    const result$ = TestBed.runInInjectionContext(() =>
      postResolver(route, {} as any)
    );

    // The postresolver will emit the value null
    expect(isObservable(result$)).toBeTrue();
    const value = await firstValueFrom(asObservable<Post | null>(result$));

    // Check to see if it is null (it should be null as this was emitted)
    expect(value).toBeNull();

   /* Specifically, it confirms that the resolver took the string '1'
   from the route (result$), converted it (if necessary), and passed it to the postService.find() method. */
    expect(postServiceSpy.find).toHaveBeenCalledWith(1);
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();


  });

  /*
    Success paths
    Tests that verify normal user behaviour works
  */

  it('returns post when PostService.find succeeds', async () => {

    // Arrange (remember observables have $ added to them)
    // Create the mock post and assign these values
    const mock: Post = { id: 1, title: 'Hello', body: 'World' } as Post;

    // Use the postService find method with the mock created above
    postServiceSpy.find.and.returnValue(of(mock));

    const route = createRoute('1');

    // Inject the resolver and Pretend the URL has an ID of 1
    const result$ = TestBed.runInInjectionContext(() =>
      postResolver(route, {} as any)
    );

    expect(isObservable(result$)).toBeTrue();

    // Wait and check the value emitted from the result
    const value = await firstValueFrom(asObservable<Post | null>(result$));

    // Check to see if the post service has been called with the value from result$
    expect(postServiceSpy.find).toHaveBeenCalledWith(1);

    // Assert that the value is equal to the mock
    expect(value).toEqual(mock);


  });

/*
  Edge cases
  Tests that verify invalid or boundary route inputs
*/
   it('returns null when id is invalid and navigates to /post/index', async () => {
    // Arrange: invalid id
    const route = createRoute('abc');

    // set up the route to be an invalid route
    const result = TestBed.runInInjectionContext(() => postResolver(route, {} as any));

    expect(isObservable(result)).toBeTrue();

   // Since the resolver will emit either the post or null we need to wait for it
   // that is why we are using firstValueFrom.
   const value = await firstValueFrom(asObservable<Post | null>(result));

   // Check for the navigation away to the index page
   expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/index');

   // Check to see if the value is null.
   expect(value).toBeNull();

   // Check to see if the post service has NOT been called.
   expect(postServiceSpy.find).not.toHaveBeenCalled();

  });


});
