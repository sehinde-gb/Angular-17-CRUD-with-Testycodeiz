import { ResolveFn, Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { inject } from '@angular/core';
import { Post } from '../models/post';
import { catchError, of } from 'rxjs';

export const postListResolver: ResolveFn<Post[]> = () => {

  const postService = inject(PostService); 
  const router = inject(Router);
  
  return postService.getAll().pipe(
    catchError(() => {
      return of([] as Post[]);
    })
  );
};
