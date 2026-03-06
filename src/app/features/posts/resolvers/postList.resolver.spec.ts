import { TestBed } from '@angular/core/testing';
import { postListResolver } from './postList.resolver';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';
import { firstValueFrom, isObservable, Observable, of, throwError } from 'rxjs';


describe('postListResolver', () => {
  // Test variables
  let postServiceSpy: jasmine.SpyObj<PostService>;

  // TestBed setup runs before each test
  beforeEach(() => {
    postServiceSpy = jasmine.createSpyObj('PostService', ['getAll']);

    TestBed.configureTestingModule({
      providers: [
        { provide: PostService, useValue: postServiceSpy },
      ],
    });
  });

  // ResolveFn can return a value, Promise, or Observable.
  // This helper safely narrows the result to an Observable for firstValueFrom.
  function asObservable<T>(x: unknown): Observable<T> {
    if (!isObservable(x)) {
      throw new Error('Expected resolver to return an Observable');
    }
    return x as Observable<T>;
  }

  /*
    Success paths
    Tests that verify normal user behaviour works
  */

  it('returns posts when PostService.getAll succeeds', async () => {
    // Arrange
    const mockPosts: Post[] = [
      { id: 1, title: 'First Post', body: 'First Body' } as Post,
      { id: 2, title: 'Second Post', body: 'Second Body' } as Post,
    ];
    postServiceSpy.getAll.and.returnValue(of(mockPosts));

    // Act
    const result = TestBed.runInInjectionContext(() =>
      postListResolver({} as any, {} as any)
    );

    // Assert (narrow)
    expect(isObservable(result)).toBeTrue();
    const value = await firstValueFrom(asObservable<Post[] | null>(result));

    expect(postServiceSpy.getAll).toHaveBeenCalledTimes(1);
    expect(value).toEqual(mockPosts);
  });

  /*
    Error paths
    Tests that verify error handling behaviour
  */


  it('returns null when PostService.getAll errors', async () => {
    // Arrange
    postServiceSpy.getAll.and.returnValue(throwError(() => new Error('boom')));

    // Act
    const result = TestBed.runInInjectionContext(() =>
      postListResolver({} as any, {} as any)
    );

    // Assert
    expect(isObservable(result)).toBeTrue();
    const value = await firstValueFrom(asObservable<Post[] | null>(result));

    expect(postServiceSpy.getAll).toHaveBeenCalledTimes(1);
    expect(value).toBeNull();
  });
});
