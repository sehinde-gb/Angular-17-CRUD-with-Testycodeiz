import { TestBed } from '@angular/core/testing';
import { postListResolver } from './postList.resolver';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';
import { first, firstValueFrom, isObservable, Observable, of, throwError } from 'rxjs';


describe('postListResolver', () => {
  let postServiceSpy: jasmine.SpyObj<PostService>;

  beforeEach(() => {
    postServiceSpy = jasmine.createSpyObj('PostService', ['getAll']);

    TestBed.configureTestingModule({
      providers: [
        { provide: PostService, useValue: postServiceSpy },
      ],
    });
  });



  function asObservable<T>(x: any): Observable<T> {
    if (!isObservable(x)) {
      throw new Error('Expected resolver to return an Observable');
    }
    return x as Observable<T>;
  }

  it('returns posts when PostService.getAll succeeds', async() => {
    // Arrange
    const mockPosts: Post[] = [
      { id: 1, title: 'First Post', body: 'First Body'} as Post,
      { id: 2, title: 'Second Post', body: 'Second Body'} as Post,
    ];

    // Tell the spy to return our mock data
    postServiceSpy.getAll.and.returnValue(of(mockPosts));

    // Execute the resolver
   const result$ = TestBed.runInInjectionContext(() =>
    // HERE
      postListResolver({} as any, {} as any)
    );

    // ResolveFn expects Post[] | Observable<Post[] | null> | Promise<Post[] | null>
    // We expect an observable so narrow the ResolveFn union safely
    expect(isObservable(result$)).toBeTrue
    /* Cast the result (casting uses the word as) as Post or Null
     previously it wasn't defined and it caused typing errors */
    const value = await firstValueFrom(asObservable<Post[] | null>(result$));

    // Assert
    expect(postServiceSpy.getAll).toHaveBeenCalledTimes(1);
    expect(value).toEqual(mockPosts);

    });

    it('returns null when PostService.getAll errors', async () => {

      // Arrange
      postServiceSpy.getAll.and.returnValue(throwError(() => new Error('boom')));

      // Act
      const result = TestBed.runInInjectionContext(() =>
        postListResolver({} as any, {} as any)
      );

      // Narrow
      expect(isObservable(result)).toBeTrue();
      const value = await firstValueFrom(asObservable<Post | null>(result));

      // Assert
      expect(postServiceSpy.getAll).toHaveBeenCalledTimes(1);
      expect(value).toBeNull();

    });


  });
