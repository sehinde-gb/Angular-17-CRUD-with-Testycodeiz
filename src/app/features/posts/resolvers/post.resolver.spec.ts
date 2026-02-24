import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { postResolver } from './post.resolver';
import { PostService } from '../services/post.service';
import { Post } from '../models/post'; // <-- adjust path if needed

describe('postResolver', () => {
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let routerSpy: jasmine.SpyObj<Router>; // Added router

  // Set up the route to use the postId from the Activated route this is a mocked route
  function makeRoute(postId: any): ActivatedRouteSnapshot {
    return {
      paramMap: convertToParamMap({ postId})
    } as unknown as ActivatedRouteSnapshot;
  }

  beforeEach(() => {
    postServiceSpy = jasmine.createSpyObj<PostService>('PostService', ['find']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']); // set up router

    // important: navigateByUrl returns Promise<boolean>
    routerSpy.navigateByUrl.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy},
      ],
    });
  });

  it('returns a Post when find succeeds', async () => {
    // Create the mock post and assign these values
    const mock: Post = { id: 1, title: 'A', body: 'B' } as Post;
    
    // Use the postService find method with the mock created above
    postServiceSpy.find.and.returnValue(of(mock));

    // Inject the resolver and Pretend the URL has an ID of 1
    const result$ = TestBed.runInInjectionContext(() =>
      postResolver(makeRoute('1'), {} as any)
    );

    
    // Wait and check the value emitted from the result
    const value = await firstValueFrom(result$ as any);
    
    // Assert that the value is equal to the mock
    expect(value).toEqual(mock);

    // Check to see if the post service has been called with the value from result$
    expect(postServiceSpy.find).toHaveBeenCalledWith(1);

    /* Specifically, it confirms that the resolver took the string '1' 
   from the route (result$), converted it (if necessary), and passed it to the postService.find() method. */
    expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    
  });

  it('returns null when postId is invalid (and navigates away)', async() => {
    // set up the route to be an invalid route
    const result$ = TestBed.runInInjectionContext(() => 
      postResolver(makeRoute('abc'), {} as any)  
    );

   // Since the resolver will emit either the post or null we need to wait for it
   // that is why we are using firstValueFrom.
   const value = await firstValueFrom(result$ as any);
   // Check to see if the value is null.
   expect(value).toBeNull();
   // Check to see if the post service has NOT been called.
   expect(postServiceSpy.find).not.toHaveBeenCalled();
   // Check for the navigation away to the index page
   expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/post/index');
  });

  it('returns null when find fails', async () => {
    // The find fails and it produces an error status of 500
    postServiceSpy.find.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    // Inject the resolver and Pretend the URL has an ID of 1
    const result$ = TestBed.runInInjectionContext(() => 
      postResolver(makeRoute('1'), {} as any)
    );
    
    // The postresolver will emit the value null
    const value = await firstValueFrom(result$ as any);
    
    // Check to see if it is null (it should be null as this was emitted)
    expect(value).toBeNull();

   /* Specifically, it confirms that the resolver took the string '1' 
   from the route (result$), converted it (if necessary), and passed it to the postService.find() method. */
    expect(postServiceSpy.find).toHaveBeenCalledWith(1);
    

  });

  
});