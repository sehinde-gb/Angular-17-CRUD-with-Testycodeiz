import { TestBed } from '@angular/core/testing';
import { ResolveFn, Router } from '@angular/router';

import { postListResolver } from './postList.resolver';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';
import { firstValueFrom, isObservable, Observable, of } from 'rxjs';
import { resourceLimits } from 'node:worker_threads';

describe('postListResolver', () => {
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let routerSpy: jasmine.SpyObj<Router>;

  
  beforeEach(() => {
    postServiceSpy = jasmine.createSpyObj('PostService', ['getAll']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);


    TestBed.configureTestingModule({
      providers: [
        { provide: PostService, useValue: postServiceSpy },
        { provide: Router, useValue: routerSpy},
      ],
    });
  });
    
  it('should resolve all posts from the PostService', async() => {
    // Arrange
    const mockPosts: Post[] = [
      { id: 1, title: 'First Post', body: 'First Body'} as Post,
      { id: 2, title: 'Second Post', body: 'Second Body'} as Post,
    ];

    // Tell the spy to return our mock data
    postServiceSpy.getAll.and.returnValue(of(mockPosts));

    // Execute the resolver
   const result$ = TestBed.runInInjectionContext(() =>
      postListResolver({} as any, {} as any)
      ) as unknown as import('rxjs').Observable<Post[]>;



    const value = await firstValueFrom(result$);
    expect(value).toEqual(mockPosts);
    expect(value.length).toBe(2);
    expect(postServiceSpy.getAll).toHaveBeenCalledTimes(1);
    
    });

  });
